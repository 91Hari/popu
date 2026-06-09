'use strict';

const pool = require('../config/db');
const { notifyUser, NOTIFICATION_TYPES } = require('./notificationService');
const { orderETA } = require('./locationService');

const STATUS_NOTIFICATIONS = {
  CANCELLED: { title: 'Order Cancelled',      message: (id) => `Your order #${id.slice(0,8).toUpperCase()} has been cancelled by the caterer.` },
  ACCEPTED:  { title: 'Order Accepted',       message: (id) => `Your order #${id.slice(0,8).toUpperCase()} has been accepted. Preparation will begin shortly.` },
  PREPARING: { title: 'Order Being Prepared', message: (id) => `Your order #${id.slice(0,8).toUpperCase()} is now being prepared.` },
  READY:     { title: 'Order Ready',          message: (id) => `Your order #${id.slice(0,8).toUpperCase()} is ready and out for delivery!` },
  DELIVERED: { title: 'Order Delivered',      message: (id) => `Your order #${id.slice(0,8).toUpperCase()} has been delivered. Enjoy your meal!` },
};

async function _recordHistory(client_or_pool, order_id, status, updated_by, notes) {
  await client_or_pool.query(
    `INSERT INTO order_status_history (order_id, status, updated_by, notes) VALUES ($1, $2, $3, $4)`,
    [order_id, status, updated_by || null, notes || null]
  );
}

const ORDER_WITH_ITEMS = `
  SELECT o.*,
    json_agg(
      json_build_object(
        'id',           oi.id,
        'food_item_id', oi.food_item_id,
        'food_name',    f.food_name,
        'quantity',     oi.quantity,
        'unit_price',   oi.unit_price,
        'total_price',  oi.total_price
      ) ORDER BY oi.id
    ) AS items
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN food_items  f  ON f.id = oi.food_item_id
  WHERE o.id = $1
  GROUP BY o.id
`;

async function createOrder({ customer_id, items, customer_lat, customer_lng }) {
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
              u.availability_status,
              u.latitude AS caterer_lat, u.longitude AS caterer_lng
       FROM food_items f
       JOIN users u ON u.id = f.caterer_id
       WHERE f.id = ANY($1::uuid[])`,
      [foodIds]
    );
    const foodMap = new Map(foods.map((f) => [f.id, f]));

    let total_amount = 0;
    const lineItems = [];

    for (const item of items) {
      const food = foodMap.get(item.food_item_id);
      if (!food) {
        const err = new Error(`Food item ${item.food_item_id} not found`);
        err.status = 404; throw err;
      }
      if (!food.is_available) {
        const err = new Error(`Food item ${item.food_item_id} is not available`);
        err.status = 400; throw err;
      }
      if (food.availability_status === 'NOT_READY') {
        const err = new Error('Caterer is not accepting orders right now');
        err.status = 400; throw err;
      }
      const unit_price  = parseFloat(food.price);
      const total_price = unit_price * item.quantity;
      total_amount += total_price;
      lineItems.push({
        food_item_id:             food.id,
        quantity:                 item.quantity,
        unit_price,
        total_price,
        preparation_time_minutes: food.preparation_time_minutes || 20,
        caterer_id:               food.caterer_id,
        food_name:                food.food_name,
        caterer_lat:              food.caterer_lat,
        caterer_lng:              food.caterer_lng,
      });
    }

    // Store coords on order — ETA is calculated when caterer accepts, not now
    const cLat = parseFloat(customer_lat);
    const cLng = parseFloat(customer_lng);
    const storedLat = !isNaN(cLat) ? cLat : null;
    const storedLng = !isNaN(cLng) ? cLng : null;

    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (customer_id, total_amount, customer_lat, customer_lng)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [customer_id, total_amount, storedLat, storedLng]
    );
    const order = orderRows[0];

    for (const line of lineItems) {
      await client.query(
        `INSERT INTO order_items (order_id, food_item_id, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, line.food_item_id, line.quantity, line.unit_price, line.total_price]
      );
    }

    await _recordHistory(client, order.id, 'PLACED', customer_id, null);
    await client.query('COMMIT');

    // Fire-and-forget: notify each unique caterer that an order arrived
    const orderId     = order.id;
    const shortId     = orderId.slice(0, 8).toUpperCase();
    const firstFood   = lineItems[0]?.food_name || 'your food item';
    const catererIds  = [...new Set(lineItems.map((l) => l.caterer_id).filter(Boolean))];
    setImmediate(async () => {
      for (const catId of catererIds) {
        try {
          await notifyUser(catId, {
            notification_type: NOTIFICATION_TYPES.NEW_ORDER,
            title:        'New Order Received',
            message:      `Order #${shortId} has been placed for ${firstFood}.`,
            reference_id: orderId,
          });
        } catch (err) {
          console.error('[OrderService] Caterer notification failed:', err.message);
        }
      }
    });

    const { rows: full } = await pool.query(ORDER_WITH_ITEMS, [order.id]);
    return full[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getOrders(user) {
  let query, params;
  const base = `
    SELECT o.*,
      json_agg(
        json_build_object(
          'id',           oi.id,
          'food_item_id', oi.food_item_id,
          'food_name',    f.food_name,
          'quantity',     oi.quantity,
          'unit_price',   oi.unit_price,
          'total_price',  oi.total_price
        ) ORDER BY oi.id
      ) AS items
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN food_items  f  ON f.id = oi.food_item_id`;

  if (user.role === 'CATERER') {
    query  = base + ` WHERE f.caterer_id = $1 GROUP BY o.id ORDER BY o.created_at DESC`;
    params = [user.id];
  } else {
    query  = base + ` WHERE o.customer_id = $1 GROUP BY o.id ORDER BY o.created_at DESC`;
    params = [user.id];
  }

  const { rows } = await pool.query(query, params);
  return rows;
}

async function getOrderById(id, user) {
  const { rows } = await pool.query(ORDER_WITH_ITEMS, [id]);
  const order = rows[0];
  if (!order) { const e = new Error('Order not found'); e.status = 404; throw e; }
  if (user.role === 'CUSTOMER' && order.customer_id !== user.id) {
    const e = new Error('Forbidden'); e.status = 403; throw e;
  }
  return order;
}

const VALID_TRANSITIONS = {
  CATERER: {
    PLACED:    ['ACCEPTED',  'CANCELLED'],
    ACCEPTED:  ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY',     'CANCELLED'],
    READY:     ['DELIVERED'],
  },
  CUSTOMER: {
    PLACED:   ['CANCELLED'],
    ACCEPTED: ['CANCELLED'],
  },
};

async function updateOrderStatus(id, status, user) {
  const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
  const order = rows[0];
  if (!order) { const e = new Error('Order not found'); e.status = 404; throw e; }
  if (user.role === 'CUSTOMER' && order.customer_id !== user.id) {
    const e = new Error('Forbidden'); e.status = 403; throw e;
  }
  const allowed = (VALID_TRANSITIONS[user.role] || {})[order.status] || [];
  if (!allowed.includes(status)) {
    const e = new Error(`Cannot transition from ${order.status} to ${status}`);
    e.status = 400; throw e;
  }

  let extra = '';
  const extraParams = [];

  if (status === 'CANCELLED') {
    extra = ', cancelled_at = NOW()';
  }

  if (status === 'ACCEPTED') {
    extra = ', accepted_at = NOW()';
  }

  // Always set ETA when caterer starts preparing. Use GPS-based calculation if
  // coords are available; fall back to 30-minute default so ETA is never null.
  if (status === 'PREPARING' && user.role === 'CATERER') {
    const cLat = order.customer_lat != null ? parseFloat(order.customer_lat) : null;
    const cLng = order.customer_lng != null ? parseFloat(order.customer_lng) : null;

    let etaMin = 30; // MVP default — no GPS required

    if (cLat != null && cLng != null) {
      const { rows: foodRows } = await pool.query(
        `SELECT f.preparation_time_minutes, u.latitude AS caterer_lat, u.longitude AS caterer_lng
         FROM order_items oi
         JOIN food_items f ON f.id = oi.food_item_id
         JOIN users u ON u.id = f.caterer_id
         WHERE oi.order_id = $1`,
        [id]
      );
      const calculated = orderETA(cLat, cLng, foodRows.map((r) => ({
        caterer_lat:              r.caterer_lat,
        caterer_lng:              r.caterer_lng,
        preparation_time_minutes: r.preparation_time_minutes || 20,
      })));
      if (calculated) etaMin = calculated;
    }

    const { rows: updated } = await pool.query(
      `UPDATE orders
       SET status = 'PREPARING',
           preparation_started_at = NOW(),
           eta_minutes = $1,
           expected_arrival_at = NOW() + make_interval(mins => $1)
       WHERE id = $2
       RETURNING *`,
      [etaMin, id]
    );
    await _recordHistory(pool, id, status, user.id, null);

    setImmediate(async () => {
      try {
        const etaText    = `${etaMin} mins`;
        const arrivalStr = new Date(updated[0].expected_arrival_at)
          .toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        await notifyUser(updated[0].customer_id, {
          notification_type: 'ORDER_PREPARING',
          title:   'Order Being Prepared',
          message: `Your order #${id.slice(0,8).toUpperCase()} is now being prepared. Estimated delivery: ${etaText}. Expected arrival: ${arrivalStr}.`,
        });
      } catch (err) {
        console.error('[OrderService] Notification failed:', err.message);
      }
    });

    return updated[0];
  }

  const { rows: updated } = await pool.query(
    `UPDATE orders SET status = $1${extra} WHERE id = $2 RETURNING *`,
    [status, id, ...extraParams]
  );
  const updatedOrder = updated[0];
  await _recordHistory(pool, id, status, user.id, null);

  if (user.role === 'CATERER') {
    const notifCfg = STATUS_NOTIFICATIONS[status];
    if (notifCfg) {
      setImmediate(async () => {
        try {
          await notifyUser(updatedOrder.customer_id, {
            notification_type: NOTIFICATION_TYPES[`ORDER_${status}`] || status,
            title:   notifCfg.title,
            message: notifCfg.message(id),
          });
        } catch (err) {
          console.error('[OrderService] Customer notification failed:', err.message);
        }
      });
    }
  }

  return updatedOrder;
}

async function cancelOrder(id, customer_id, cancel_reason) {
  const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
  const order = rows[0];
  if (!order) { const e = new Error('Order not found'); e.status = 404; throw e; }
  if (order.customer_id !== customer_id) { const e = new Error('Forbidden'); e.status = 403; throw e; }
  if (!['PLACED', 'ACCEPTED'].includes(order.status)) {
    const e = new Error(`Cannot cancel order with status ${order.status}`);
    e.status = 400; throw e;
  }

  const { rows: updated } = await pool.query(
    `UPDATE orders
     SET status = 'CANCELLED', cancelled_at = NOW(), cancel_reason = $1
     WHERE id = $2
     RETURNING *`,
    [cancel_reason || null, id]
  );
  await _recordHistory(pool, id, 'CANCELLED', customer_id, cancel_reason || null);
  return updated[0];
}

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus, cancelOrder };
