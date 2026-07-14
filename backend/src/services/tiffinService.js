'use strict';

const pool = require('../config/db');
const { notifyUser } = require('./notificationService');

const BOX_SLOTS = { ONE_CARRIAGE: 1, TWO_CARRIAGE: 2, THREE_CARRIAGE: 3 };
const BOX_LABELS = { ONE_CARRIAGE: '1 Carriage Box', TWO_CARRIAGE: '2 Carriage Box', THREE_CARRIAGE: '3 Carriage Box' };
const VALID_DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];

const TIFFIN_DELIVERY_CHARGE = 30; // ₹30 flat for home delivery

function generatePickupCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ─── Caterer discovery ───────────────────────────────────────────────────────

async function getTiffinCaterers() {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.latitude, u.longitude, u.availability_status,
            tbs.one_carriage_price, tbs.two_carriage_price, tbs.three_carriage_price
     FROM users u
     JOIN tiffin_box_settings tbs ON tbs.caterer_id = u.id
     WHERE u.role = 'CATERER'
       AND u.is_active = TRUE
       AND tbs.tiffin_enabled = TRUE
     ORDER BY u.name`
  );
  return rows;
}

async function getCatererTiffinSettings(caterer_id) {
  const { rows } = await pool.query(
    `SELECT * FROM tiffin_box_settings WHERE caterer_id = $1`,
    [caterer_id]
  );
  return rows[0] || {
    caterer_id,
    tiffin_enabled:       false,
    one_carriage_price:   80,
    two_carriage_price:   120,
    three_carriage_price: 180,
  };
}

async function getTiffinFoods(caterer_id) {
  const { rows } = await pool.query(
    `SELECT f.id, f.food_name, f.description, f.price, f.is_available,
            f.image_url AS "imageUrl", f.food_category, f.serves_count,
            COALESCE(tm.available_for_tiffin, TRUE) AS available_for_tiffin
     FROM food_items f
     LEFT JOIN tiffin_food_mapping tm
            ON tm.food_item_id = f.id AND tm.caterer_id = $1
     WHERE f.caterer_id = $1
     ORDER BY f.food_name`,
    [caterer_id]
  );
  return rows.filter((r) => r.available_for_tiffin);
}

// ─── Caterer settings management ────────────────────────────────────────────

async function saveTiffinSettings(caterer_id, {
  tiffin_enabled,
  one_carriage_price,
  two_carriage_price,
  three_carriage_price,
}) {
  await pool.query(
    `INSERT INTO tiffin_box_settings
       (caterer_id, tiffin_enabled, one_carriage_price, two_carriage_price, three_carriage_price)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (caterer_id) DO UPDATE SET
       tiffin_enabled       = EXCLUDED.tiffin_enabled,
       one_carriage_price   = EXCLUDED.one_carriage_price,
       two_carriage_price   = EXCLUDED.two_carriage_price,
       three_carriage_price = EXCLUDED.three_carriage_price,
       updated_at           = NOW()`,
    [
      caterer_id,
      tiffin_enabled       ?? false,
      one_carriage_price   ?? 80,
      two_carriage_price   ?? 120,
      three_carriage_price ?? 180,
    ]
  );
  return getCatererTiffinSettings(caterer_id);
}

async function getAllCatererFoodsForMapping(caterer_id) {
  const { rows } = await pool.query(
    `SELECT f.id, f.food_name, f.description, f.price, f.is_available,
            f.image_url AS "imageUrl", f.food_category, f.serves_count,
            COALESCE(tm.available_for_tiffin, TRUE) AS available_for_tiffin
     FROM food_items f
     LEFT JOIN tiffin_food_mapping tm
            ON tm.food_item_id = f.id AND tm.caterer_id = $1
     WHERE f.caterer_id = $1
     ORDER BY f.food_name`,
    [caterer_id]
  );
  return rows;
}

async function saveTiffinFoodMapping(caterer_id, mappings) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM tiffin_food_mapping WHERE caterer_id = $1', [caterer_id]);
    for (const m of mappings) {
      await client.query(
        `INSERT INTO tiffin_food_mapping (caterer_id, food_item_id, available_for_tiffin)
         VALUES ($1, $2, $3)`,
        [caterer_id, m.food_item_id, m.available_for_tiffin ?? true]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ─── Order creation ──────────────────────────────────────────────────────────

async function createTiffinOrder({
  customer_id, caterer_id, service_type, box_type, days, items,
  fulfillment_type     = 'DELIVERY',
  payment_method       = 'COD',
  razorpay_order_id    = null,
  razorpay_payment_id  = null,
}) {
  const slots = BOX_SLOTS[box_type];
  if (!slots) {
    const e = new Error('Invalid box type'); e.status = 400; throw e;
  }
  if (!['TODAY', 'DAILY'].includes(service_type)) {
    const e = new Error('Invalid service type'); e.status = 400; throw e;
  }
  if (service_type === 'DAILY') {
    if (!Array.isArray(days) || days.length === 0) {
      const e = new Error('At least one day required for daily subscription'); e.status = 400; throw e;
    }
    const bad = days.find((d) => !VALID_DAYS.includes(d));
    if (bad) { const e = new Error(`Invalid day: ${bad}`); e.status = 400; throw e; }
  }
  if (!Array.isArray(items) || items.length !== slots) {
    const e = new Error(`${BOX_LABELS[box_type]} requires exactly ${slots} food item(s)`);
    e.status = 400; throw e;
  }

  if (!['DELIVERY', 'SELF_PICKUP'].includes(fulfillment_type)) {
    const e = new Error('fulfillment_type must be DELIVERY or SELF_PICKUP'); e.status = 400; throw e;
  }
  if (!['COD', 'RAZORPAY', 'ONLINE'].includes(payment_method)) {
    const e = new Error('payment_method must be COD, RAZORPAY, or ONLINE'); e.status = 400; throw e;
  }
  if (fulfillment_type === 'SELF_PICKUP' && payment_method === 'COD') {
    const e = new Error('Self Pickup requires advance payment. COD is not available for pickup orders.');
    e.status = 400; throw e;
  }
  if (payment_method === 'RAZORPAY' && !razorpay_order_id) {
    const e = new Error('razorpay_order_id is required for Razorpay payments'); e.status = 400; throw e;
  }

  const settings = await getCatererTiffinSettings(caterer_id);
  if (!settings.tiffin_enabled) {
    const e = new Error('This caterer does not offer Lunch Box service'); e.status = 400; throw e;
  }

  const priceByType = {
    ONE_CARRIAGE:   Number(settings.one_carriage_price),
    TWO_CARRIAGE:   Number(settings.two_carriage_price),
    THREE_CARRIAGE: Number(settings.three_carriage_price),
  };
  const boxPrice   = priceByType[box_type];
  const daysCount  = (service_type === 'DAILY' && Array.isArray(days)) ? days.length : 1;
  const delivery_charge = fulfillment_type === 'DELIVERY' ? TIFFIN_DELIVERY_CHARGE : 0;
  const pickup_saving   = fulfillment_type === 'SELF_PICKUP' ? TIFFIN_DELIVERY_CHARGE : 0;
  const total_amount    = (boxPrice * daysCount) + delivery_charge;
  const pickup_code     = fulfillment_type === 'SELF_PICKUP' ? generatePickupCode() : null;

  const foodIds = items.map((i) => i.food_item_id);
  const { rows: foodRows } = await pool.query(
    `SELECT f.id, f.food_name, f.price, f.is_available,
            COALESCE(tm.available_for_tiffin, TRUE) AS available_for_tiffin
     FROM food_items f
     LEFT JOIN tiffin_food_mapping tm ON tm.food_item_id = f.id AND tm.caterer_id = $2
     WHERE f.id = ANY($1::uuid[]) AND f.caterer_id = $2`,
    [foodIds, caterer_id]
  );
  if (foodRows.length !== items.length) {
    const e = new Error('One or more food items not found for this caterer'); e.status = 400; throw e;
  }
  const notAvail = foodRows.find((f) => !f.is_available || !f.available_for_tiffin);
  if (notAvail) {
    const e = new Error(`"${notAvail.food_name}" is not available for Lunch Box`); e.status = 400; throw e;
  }
  const foodMap = new Map(foodRows.map((f) => [f.id, f]));

  // Fetch caterer address for self-pickup directions
  const { rows: [catererUser] } = await pool.query(
    'SELECT address, latitude, longitude FROM users WHERE id = $1',
    [caterer_id]
  );

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const paymentStatus = payment_method === 'RAZORPAY' ? 'SUCCESS' : 'PENDING';

    const { rows: [order] } = await client.query(
      `INSERT INTO tiffin_orders (
         customer_id, caterer_id, service_type, box_type, total_amount,
         fulfillment_type, payment_method, razorpay_order_id, razorpay_payment_id,
         delivery_charge, pickup_saving, pickup_code,
         caterer_address, caterer_lat, caterer_lng, payment_status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [
        customer_id, caterer_id, service_type, box_type, total_amount,
        fulfillment_type, payment_method, razorpay_order_id, razorpay_payment_id,
        delivery_charge, pickup_saving, pickup_code,
        catererUser?.address || null,
        catererUser?.latitude || null,
        catererUser?.longitude || null,
        paymentStatus,
      ]
    );

    if (service_type === 'DAILY' && Array.isArray(days)) {
      for (const day of days) {
        await client.query(
          `INSERT INTO tiffin_order_days (tiffin_order_id, day_of_week) VALUES ($1, $2)`,
          [order.id, day]
        );
      }
    }

    for (const item of items) {
      const food = foodMap.get(item.food_item_id);
      await client.query(
        `INSERT INTO tiffin_order_items (tiffin_order_id, food_item_id, food_name, food_price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.food_item_id, food.food_name, food.price]
      );
    }

    // Record Razorpay payment in payments table
    if (payment_method === 'RAZORPAY' && razorpay_order_id) {
      await client.query(
        `INSERT INTO payments (
           customer_id, merchant_transaction_id, amount, payment_status,
           payment_method, payment_gateway, service_type,
           razorpay_order_id, razorpay_payment_id,
           delivery_charge, pickup_saving, tiffin_order_id, cart_snapshot
         ) VALUES ($1, $2, $3, 'SUCCESS', 'RAZORPAY', 'RAZORPAY', 'LUNCH_BOX', $4, $5, $6, $7, $8, $9)`,
        [
          customer_id,
          razorpay_order_id,
          total_amount,
          razorpay_order_id,
          razorpay_payment_id || null,
          delivery_charge,
          pickup_saving,
          order.id,
          JSON.stringify({ service: 'LUNCH_BOX', box_type, caterer_id, items_count: items.length }),
        ]
      );
    }

    await client.query('COMMIT');

    setImmediate(async () => {
      try {
        const fulfillLabel = fulfillment_type === 'SELF_PICKUP' ? 'Self Pickup' : 'Home Delivery';
        await Promise.all([
          notifyUser(caterer_id, {
            notification_type: 'TIFFIN_ORDER',
            title:       'New Lunch Box Order',
            message:     `A new ${BOX_LABELS[box_type]} order (${fulfillLabel}) has been placed.`,
            reference_id: order.id,
          }),
          notifyUser(customer_id, {
            notification_type: 'TIFFIN_ORDER',
            title:       'Lunch Box Order Placed!',
            message:     pickup_code
              ? `Your Lunch Box is confirmed! Pickup code: ${pickup_code}`
              : `Your ${BOX_LABELS[box_type]} Lunch Box order was placed successfully.`,
            reference_id: order.id,
          }),
        ]);
      } catch (err) {
        console.error('[TiffinService] Notification failed:', err.message);
      }
    });

    return _enrichOrder(order);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ─── Order queries ───────────────────────────────────────────────────────────

async function _enrichOrder(order) {
  const [{ rows: items }, { rows: days }] = await Promise.all([
    pool.query('SELECT * FROM tiffin_order_items WHERE tiffin_order_id = $1 ORDER BY id', [order.id]),
    pool.query('SELECT day_of_week FROM tiffin_order_days WHERE tiffin_order_id = $1', [order.id]),
  ]);
  return { ...order, items, days: days.map((d) => d.day_of_week) };
}

async function getMyTiffinOrders(customer_id) {
  const { rows: orders } = await pool.query(
    `SELECT t.*, u.name AS caterer_name
     FROM tiffin_orders t
     JOIN users u ON u.id = t.caterer_id
     WHERE t.customer_id = $1
     ORDER BY t.created_at DESC`,
    [customer_id]
  );
  return Promise.all(orders.map(_enrichOrder));
}

async function getTiffinOrderById(id) {
  const { rows } = await pool.query(
    `SELECT t.*, u.name AS caterer_name
     FROM tiffin_orders t
     JOIN users u ON u.id = t.caterer_id
     WHERE t.id = $1`,
    [id]
  );
  if (!rows[0]) { const e = new Error('Not found'); e.status = 404; throw e; }
  return _enrichOrder(rows[0]);
}

// ─── Admin metrics ───────────────────────────────────────────────────────────

async function getTiffinMetrics() {
  const today = new Date().toISOString().split('T')[0];
  const [
    { rows: [totals] },
    { rows: [todayRow] },
    { rows: [activeCats] },
  ] = await Promise.all([
    pool.query(
      `SELECT COUNT(*)                                               AS total_orders,
              COALESCE(SUM(total_amount), 0)                        AS revenue,
              COUNT(*) FILTER (WHERE service_type = 'DAILY')        AS daily_subs
       FROM tiffin_orders`
    ),
    pool.query(
      `SELECT COUNT(*) AS today_orders FROM tiffin_orders WHERE DATE(created_at) = $1`,
      [today]
    ),
    pool.query(
      `SELECT COUNT(*) AS active_caterers FROM tiffin_box_settings WHERE tiffin_enabled = TRUE`
    ),
  ]);
  return {
    totalOrders:    parseInt(totals.total_orders,       10),
    revenue:        parseFloat(totals.revenue),
    dailySubs:      parseInt(totals.daily_subs,         10),
    todayOrders:    parseInt(todayRow.today_orders,     10),
    activeCaterers: parseInt(activeCats.active_caterers, 10),
  };
}

module.exports = {
  getTiffinCaterers,
  getCatererTiffinSettings,
  getTiffinFoods,
  saveTiffinSettings,
  getAllCatererFoodsForMapping,
  saveTiffinFoodMapping,
  createTiffinOrder,
  getMyTiffinOrders,
  getTiffinOrderById,
  getTiffinMetrics,
};
