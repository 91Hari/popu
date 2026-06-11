'use strict';

const pool = require('../config/db');
const { notifyUser, NOTIFICATION_TYPES } = require('./notificationService');

const CATERER_ORDER_WITH_ITEMS = `
  SELECT
    co.*,
    u.name                AS caterer_name,
    u.business_name       AS caterer_business_name,
    u.upi_id,
    u.payment_name,
    u.qr_code_image_url,
    u.bank_account_name,
    json_agg(
      json_build_object(
        'id',           coi.id,
        'food_item_id', coi.food_item_id,
        'food_name',    f.food_name,
        'quantity',     coi.quantity,
        'unit_price',   coi.unit_price,
        'total_price',  coi.total_price
      ) ORDER BY coi.id
    ) AS items
  FROM caterer_orders co
  JOIN users u ON u.id = co.caterer_id
  JOIN caterer_order_items coi ON coi.caterer_order_id = co.id
  JOIN food_items f ON f.id = coi.food_item_id
  WHERE co.master_order_id = $1
  GROUP BY co.id, u.name, u.business_name, u.upi_id, u.payment_name, u.qr_code_image_url, u.bank_account_name
  ORDER BY co.created_at ASC
`;

async function createSplitOrder({ customer_id, items, customer_lat, customer_lng, payment_proofs = [] }) {
  if (!items || items.length === 0) {
    const err = new Error('Order must contain at least one item');
    err.status = 400;
    throw err;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const foodIds = items.map((i) => i.food_item_id);
    const { rows: foods } = await client.query(
      `SELECT f.id, f.price, f.is_available, f.preparation_time_minutes,
              f.food_name, f.caterer_id,
              u.availability_status
       FROM food_items f
       JOIN users u ON u.id = f.caterer_id
       WHERE f.id = ANY($1::uuid[])`,
      [foodIds]
    );
    const foodMap = new Map(foods.map((f) => [f.id, f]));

    const lineItems = [];
    for (const item of items) {
      const food = foodMap.get(item.food_item_id);
      if (!food) {
        const err = new Error(`Food item ${item.food_item_id} not found`);
        err.status = 404; throw err;
      }
      if (!food.is_available) {
        const err = new Error(`Food item "${food.food_name}" is not available`);
        err.status = 400; throw err;
      }
      if (food.availability_status === 'NOT_READY') {
        const err = new Error('A caterer in your cart is not accepting orders right now');
        err.status = 400; throw err;
      }
      lineItems.push({
        food_item_id: food.id,
        quantity:     item.quantity,
        unit_price:   parseFloat(food.price),
        total_price:  parseFloat(food.price) * item.quantity,
        caterer_id:   food.caterer_id,
        food_name:    food.food_name,
      });
    }

    const total_amount = lineItems.reduce((s, l) => s + l.total_price, 0);
    const cLat = parseFloat(customer_lat);
    const cLng = parseFloat(customer_lng);
    const storedLat = !isNaN(cLat) ? cLat : null;
    const storedLng = !isNaN(cLng) ? cLng : null;

    const { rows: moRows } = await client.query(
      `INSERT INTO master_orders (customer_id, total_amount, customer_lat, customer_lng)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [customer_id, total_amount, storedLat, storedLng]
    );
    const masterOrder = moRows[0];

    // Group line items by caterer
    const catererGroups = new Map();
    for (const line of lineItems) {
      if (!catererGroups.has(line.caterer_id)) catererGroups.set(line.caterer_id, []);
      catererGroups.get(line.caterer_id).push(line);
    }

    const createdCatererOrders = [];
    for (const [caterer_id, lines] of catererGroups) {
      const subtotal = lines.reduce((s, l) => s + l.total_price, 0);
      const { rows: coRows } = await client.query(
        `INSERT INTO caterer_orders (master_order_id, caterer_id, subtotal)
         VALUES ($1, $2, $3) RETURNING *`,
        [masterOrder.id, caterer_id, subtotal]
      );
      const catererOrder = coRows[0];

      for (const line of lines) {
        await client.query(
          `INSERT INTO caterer_order_items (caterer_order_id, food_item_id, quantity, unit_price, total_price)
           VALUES ($1, $2, $3, $4, $5)`,
          [catererOrder.id, line.food_item_id, line.quantity, line.unit_price, line.total_price]
        );
      }

      // Submit payment proof if provided at checkout
      const proof = (payment_proofs || []).find((p) => p.caterer_id === caterer_id);
      if (proof && proof.payment_screenshot_url) {
        await client.query(
          `INSERT INTO payment_proofs
             (master_order_id, caterer_order_id, customer_id, caterer_id, amount,
              payment_screenshot_url, upi_reference, payment_status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING_REVIEW')`,
          [masterOrder.id, catererOrder.id, customer_id, caterer_id,
           subtotal, proof.payment_screenshot_url, proof.upi_reference || null]
        );
        await client.query(
          `UPDATE caterer_orders SET payment_status = 'PROOF_SUBMITTED' WHERE id = $1`,
          [catererOrder.id]
        );
      }

      createdCatererOrders.push({ caterer_id, caterer_order_id: catererOrder.id, lines });
    }

    await client.query('COMMIT');

    // Notify caterers asynchronously
    const shortId = masterOrder.id.slice(0, 8).toUpperCase();
    setImmediate(async () => {
      for (const { caterer_id, lines } of createdCatererOrders) {
        try {
          const firstFood = lines[0]?.food_name || 'a food item';
          await notifyUser(caterer_id, {
            notification_type: NOTIFICATION_TYPES.NEW_ORDER,
            title:        'New Order Received',
            message:      `Order #${shortId} placed for ${firstFood}.`,
            reference_id: masterOrder.id,
          });
        } catch (err) {
          console.error('[MasterOrderService] Caterer notification failed:', err.message);
        }
      }
    });

    return { ...masterOrder, caterer_orders_count: createdCatererOrders.length };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getMasterOrders(user) {
  const where  = user.role === 'ADMIN' ? '' : 'WHERE mo.customer_id = $1';
  const params = user.role === 'ADMIN' ? [] : [user.id];

  const { rows } = await pool.query(
    `SELECT
       mo.*,
       u.name  AS customer_name,
       u.email AS customer_email,
       (
         SELECT json_agg(
           json_build_object(
             'id',             co.id,
             'caterer_id',     co.caterer_id,
             'caterer_name',   cu.name,
             'status',         co.status,
             'subtotal',       co.subtotal,
             'payment_status', co.payment_status,
             'created_at',     co.created_at,
             'items', (
               SELECT json_agg(
                 json_build_object(
                   'id',          coi.id,
                   'food_name',   f.food_name,
                   'quantity',    coi.quantity,
                   'unit_price',  coi.unit_price,
                   'total_price', coi.total_price
                 ) ORDER BY coi.id
               )
               FROM caterer_order_items coi
               JOIN food_items f ON f.id = coi.food_item_id
               WHERE coi.caterer_order_id = co.id
             )
           ) ORDER BY co.created_at
         )
         FROM caterer_orders co
         JOIN users cu ON cu.id = co.caterer_id
         WHERE co.master_order_id = mo.id
       ) AS caterer_orders
     FROM master_orders mo
     JOIN users u ON u.id = mo.customer_id
     ${where}
     ORDER BY mo.created_at DESC`,
    params
  );
  return rows;
}

async function getMasterOrderById(id, user) {
  const { rows: moRows } = await pool.query(
    `SELECT mo.*, u.name AS customer_name, u.email AS customer_email
     FROM master_orders mo
     JOIN users u ON u.id = mo.customer_id
     WHERE mo.id = $1`,
    [id]
  );
  const masterOrder = moRows[0];
  if (!masterOrder) { const e = new Error('Master order not found'); e.status = 404; throw e; }
  if (user.role === 'CUSTOMER' && masterOrder.customer_id !== user.id) {
    const e = new Error('Forbidden'); e.status = 403; throw e;
  }

  const { rows: catererOrders } = await pool.query(CATERER_ORDER_WITH_ITEMS, [id]);

  // Attach payment proof to each caterer order
  const { rows: proofs } = await pool.query(
    `SELECT * FROM payment_proofs WHERE master_order_id = $1`,
    [id]
  );
  const proofMap = new Map(proofs.map((p) => [p.caterer_order_id, p]));
  const catererOrdersWithProofs = catererOrders.map((co) => ({
    ...co,
    payment_proof: proofMap.get(co.id) || null,
  }));

  return { ...masterOrder, caterer_orders: catererOrdersWithProofs };
}

async function getCatererSubOrders(caterer_id) {
  const { rows } = await pool.query(
    `SELECT
       co.*,
       mo.id       AS master_order_id,
       mo.customer_id,
       u.name      AS customer_name,
       u.email     AS customer_email,
       json_agg(
         json_build_object(
           'id',           coi.id,
           'food_item_id', coi.food_item_id,
           'food_name',    f.food_name,
           'quantity',     coi.quantity,
           'unit_price',   coi.unit_price,
           'total_price',  coi.total_price
         ) ORDER BY coi.id
       ) AS items
     FROM caterer_orders co
     JOIN master_orders mo ON mo.id = co.master_order_id
     JOIN users u ON u.id = mo.customer_id
     JOIN caterer_order_items coi ON coi.caterer_order_id = co.id
     JOIN food_items f ON f.id = coi.food_item_id
     WHERE co.caterer_id = $1
     GROUP BY co.id, mo.id, mo.customer_id, u.name, u.email
     ORDER BY co.created_at DESC`,
    [caterer_id]
  );
  return rows;
}

const CATERER_VALID_TRANSITIONS = {
  PLACED:    ['ACCEPTED', 'CANCELLED'],
  ACCEPTED:  ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY:     ['DELIVERED'],
};

async function updateCatererOrderStatus(id, status, user) {
  const { rows } = await pool.query(
    `SELECT co.*, mo.customer_id
     FROM caterer_orders co
     JOIN master_orders mo ON mo.id = co.master_order_id
     WHERE co.id = $1`,
    [id]
  );
  const catererOrder = rows[0];
  if (!catererOrder) { const e = new Error('Caterer order not found'); e.status = 404; throw e; }
  if (catererOrder.caterer_id !== user.id) { const e = new Error('Forbidden'); e.status = 403; throw e; }

  const allowed = CATERER_VALID_TRANSITIONS[catererOrder.status] || [];
  if (!allowed.includes(status)) {
    const e = new Error(`Cannot transition from ${catererOrder.status} to ${status}`);
    e.status = 400; throw e;
  }

  const timestampCols = {
    ACCEPTED:  'accepted_at  = NOW()',
    PREPARING: 'preparing_at = NOW()',
    READY:     'ready_at     = NOW()',
    DELIVERED: 'delivered_at = NOW()',
    CANCELLED: 'cancelled_at = NOW()',
  };
  const extra = timestampCols[status] ? `, ${timestampCols[status]}` : '';

  const { rows: updated } = await pool.query(
    `UPDATE caterer_orders SET status = $1${extra} WHERE id = $2 RETURNING *`,
    [status, id]
  );

  const shortId = id.slice(0, 8).toUpperCase();
  const notifMessages = {
    ACCEPTED:  { title: 'Order Accepted',        message: `Your sub-order #${shortId} has been accepted.` },
    PREPARING: { title: 'Order Being Prepared',  message: `Your sub-order #${shortId} is now being prepared.` },
    READY:     { title: 'Order Ready',           message: `Your sub-order #${shortId} is ready and out for delivery!` },
    DELIVERED: { title: 'Order Delivered',       message: `Your sub-order #${shortId} has been delivered!` },
    CANCELLED: { title: 'Order Cancelled',       message: `Your sub-order #${shortId} has been cancelled by the caterer.` },
  };
  const notifCfg = notifMessages[status];
  if (notifCfg) {
    setImmediate(async () => {
      try {
        await notifyUser(catererOrder.customer_id, {
          notification_type: `ORDER_${status}`,
          title:        notifCfg.title,
          message:      notifCfg.message,
          reference_id: catererOrder.master_order_id,
        });
      } catch (err) {
        console.error('[MasterOrderService] Customer notification failed:', err.message);
      }
    });
  }

  return updated[0];
}

async function cancelCatererOrder(id, user, cancel_reason) {
  const { rows } = await pool.query(
    `SELECT co.*, mo.customer_id
     FROM caterer_orders co
     JOIN master_orders mo ON mo.id = co.master_order_id
     WHERE co.id = $1`,
    [id]
  );
  const catererOrder = rows[0];
  if (!catererOrder) { const e = new Error('Caterer order not found'); e.status = 404; throw e; }

  if (user.role === 'CUSTOMER' && catererOrder.customer_id !== user.id) {
    const e = new Error('Forbidden'); e.status = 403; throw e;
  }
  if (['DELIVERED', 'CANCELLED'].includes(catererOrder.status)) {
    const e = new Error(`Cannot cancel order with status ${catererOrder.status}`);
    e.status = 400; throw e;
  }
  if (user.role === 'CUSTOMER' && !['PLACED', 'ACCEPTED'].includes(catererOrder.status)) {
    const e = new Error('Cannot cancel order once preparation has started');
    e.status = 400; throw e;
  }

  const { rows: updated } = await pool.query(
    `UPDATE caterer_orders SET status = 'CANCELLED', cancelled_at = NOW(), cancel_reason = $1 WHERE id = $2 RETURNING *`,
    [cancel_reason || null, id]
  );
  return updated[0];
}

module.exports = {
  createSplitOrder,
  getMasterOrders,
  getMasterOrderById,
  getCatererSubOrders,
  updateCatererOrderStatus,
  cancelCatererOrder,
};
