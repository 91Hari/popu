'use strict';

const pool   = require('../config/db');
const bcrypt = require('bcrypt');
const { notifyUser } = require('./notificationService');

const SALT_ROUNDS = 12;

async function createRider(caterer_id, { name, email, password, phone, vehicle_type, vehicle_number }) {
  if (!name || !email || !password) {
    const e = new Error('name, email, and password are required'); e.status = 400; throw e;
  }
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: existing } = await client.query(
      `SELECT id FROM users WHERE email = $1`, [email.toLowerCase()]
    );
    if (existing[0]) { const e = new Error('Email already in use'); e.status = 409; throw e; }

    const { rows: userRows } = await client.query(
      `INSERT INTO users (name, email, password_hash, role, phone, is_active)
       VALUES ($1, $2, $3, 'RIDER', $4, TRUE)
       RETURNING id, name, email, role`,
      [name, email.toLowerCase(), password_hash, phone || null]
    );
    const user = userRows[0];

    const { rows: profileRows } = await client.query(
      `INSERT INTO rider_profiles (user_id, caterer_id, vehicle_type, vehicle_number)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user.id, caterer_id, vehicle_type || null, vehicle_number || null]
    );
    await client.query('COMMIT');
    return { ...user, profile: profileRows[0] };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getRidersByCaterer(caterer_id) {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.is_active,
            rp.vehicle_type, rp.vehicle_number, rp.created_at AS joined_at
     FROM users u
     JOIN rider_profiles rp ON rp.user_id = u.id
     WHERE rp.caterer_id = $1
     ORDER BY u.name ASC`,
    [caterer_id]
  );
  return rows;
}

async function deleteRider(rider_id, caterer_id) {
  const { rows } = await pool.query(
    `SELECT user_id FROM rider_profiles WHERE user_id = $1 AND caterer_id = $2`,
    [rider_id, caterer_id]
  );
  if (!rows[0]) { const e = new Error('Rider not found or not owned by you'); e.status = 404; throw e; }
  await pool.query(`DELETE FROM users WHERE id = $1`, [rider_id]);
  return { ok: true };
}

async function pushLocation(rider_id, { latitude, longitude }) {
  await pool.query(
    `INSERT INTO rider_locations (rider_id, latitude, longitude) VALUES ($1, $2, $3)`,
    [rider_id, latitude, longitude]
  );
}

async function getLatestLocation(rider_id) {
  const { rows } = await pool.query(
    `SELECT latitude, longitude, created_at
     FROM rider_locations WHERE rider_id = $1
     ORDER BY created_at DESC LIMIT 1`,
    [rider_id]
  );
  return rows[0] || null;
}

async function getAssignedDeliveries(rider_id) {
  const { rows } = await pool.query(
    `SELECT co.id, co.status, co.subtotal, co.delivery_confirmation_code,
            mo.customer_id,
            u.name  AS customer_name,
            u.email AS customer_email,
            json_agg(
              json_build_object(
                'food_name',  f.food_name,
                'quantity',   coi.quantity,
                'unit_price', coi.unit_price
              ) ORDER BY coi.id
            ) AS items
     FROM caterer_orders co
     JOIN master_orders mo ON mo.id = co.master_order_id
     JOIN users u ON u.id = mo.customer_id
     JOIN caterer_order_items coi ON coi.caterer_order_id = co.id
     JOIN food_items f ON f.id = coi.food_item_id
     WHERE co.rider_id = $1
       AND co.status IN ('ASSIGNED_TO_RIDER', 'OUT_FOR_DELIVERY')
     GROUP BY co.id, mo.customer_id, u.name, u.email
     ORDER BY co.created_at DESC`,
    [rider_id]
  );
  return rows;
}

async function lookupOrderForRider(caterer_order_id, rider_id) {
  const { rows: riderRows } = await pool.query(
    `SELECT caterer_id FROM rider_profiles WHERE user_id = $1`,
    [rider_id]
  );
  const caterer_id = riderRows[0]?.caterer_id;

  const { rows } = await pool.query(
    `SELECT co.id, co.status, co.subtotal, co.delivery_confirmation_code, co.rider_id,
            mo.customer_id,
            u.name  AS customer_name,
            u.email AS customer_email,
            u.phone AS customer_phone,
            json_agg(
              json_build_object(
                'food_name',   f.food_name,
                'quantity',    coi.quantity,
                'unit_price',  coi.unit_price,
                'total_price', coi.total_price
              ) ORDER BY coi.id
            ) AS items
     FROM caterer_orders co
     JOIN master_orders mo ON mo.id = co.master_order_id
     JOIN users u ON u.id = mo.customer_id
     JOIN caterer_order_items coi ON coi.caterer_order_id = co.id
     JOIN food_items f ON f.id = coi.food_item_id
     WHERE co.id = $1
       AND (co.caterer_id = $2 OR co.rider_id = $3)
     GROUP BY co.id, mo.customer_id, u.name, u.email, u.phone`,
    [caterer_order_id, caterer_id, rider_id]
  );
  if (!rows[0]) { const e = new Error('Order not found'); e.status = 404; throw e; }
  return rows[0];
}

async function startDelivery(caterer_order_id, rider_id) {
  const { rows } = await pool.query(
    `SELECT co.*, mo.customer_id
     FROM caterer_orders co
     JOIN master_orders mo ON mo.id = co.master_order_id
     WHERE co.id = $1 AND co.rider_id = $2 AND co.status = 'ASSIGNED_TO_RIDER'`,
    [caterer_order_id, rider_id]
  );
  if (!rows[0]) { const e = new Error('Order not found or not assigned to you'); e.status = 404; throw e; }
  const order = rows[0];

  const { rows: updated } = await pool.query(
    `UPDATE caterer_orders SET status = 'OUT_FOR_DELIVERY', delivery_started_at = NOW()
     WHERE id = $1 RETURNING *`,
    [caterer_order_id]
  );

  setImmediate(async () => {
    try {
      const shortId = caterer_order_id.slice(0, 8).toUpperCase();
      await notifyUser(order.customer_id, {
        notification_type: 'ORDER_OUT_FOR_DELIVERY',
        title:        'Out for Delivery',
        message:      `Your order #${shortId} is out for delivery!`,
        reference_id: order.master_order_id,
      });
    } catch (err) {
      console.error('[RiderService] startDelivery notification failed:', err.message);
    }
  });

  return updated[0];
}

async function confirmDelivery(caterer_order_id, rider_id, code) {
  const { rows } = await pool.query(
    `SELECT co.*, mo.customer_id
     FROM caterer_orders co
     JOIN master_orders mo ON mo.id = co.master_order_id
     WHERE co.id = $1 AND co.rider_id = $2 AND co.status = 'OUT_FOR_DELIVERY'`,
    [caterer_order_id, rider_id]
  );
  if (!rows[0]) { const e = new Error('Order not found or not out for delivery'); e.status = 404; throw e; }
  const order = rows[0];

  if (!order.delivery_confirmation_code || order.delivery_confirmation_code !== String(code)) {
    const e = new Error('Invalid confirmation code'); e.status = 400; throw e;
  }

  const { rows: updated } = await pool.query(
    `UPDATE caterer_orders SET status = 'DELIVERED', delivered_at = NOW()
     WHERE id = $1 RETURNING *`,
    [caterer_order_id]
  );

  setImmediate(async () => {
    try {
      const shortId = caterer_order_id.slice(0, 8).toUpperCase();
      await notifyUser(order.customer_id, {
        notification_type: 'ORDER_DELIVERED',
        title:        'Order Delivered',
        message:      `Your order #${shortId} has been delivered!`,
        reference_id: order.master_order_id,
      });
      await notifyUser(order.caterer_id, {
        notification_type: 'ORDER_DELIVERED',
        title:        'Order Delivered',
        message:      `Order #${shortId} has been delivered by your rider.`,
        reference_id: order.master_order_id,
      });
    } catch (err) {
      console.error('[RiderService] confirmDelivery notification failed:', err.message);
    }
  });

  return updated[0];
}

async function assignRiderToOrder(caterer_order_id, rider_id, caterer_id) {
  const { rows: profileRows } = await pool.query(
    `SELECT user_id FROM rider_profiles WHERE user_id = $1 AND caterer_id = $2`,
    [rider_id, caterer_id]
  );
  if (!profileRows[0]) { const e = new Error('Rider not found or not owned by you'); e.status = 404; throw e; }

  const { rows } = await pool.query(
    `SELECT co.*, mo.customer_id
     FROM caterer_orders co
     JOIN master_orders mo ON mo.id = co.master_order_id
     WHERE co.id = $1 AND co.caterer_id = $2 AND co.status = 'READY'`,
    [caterer_order_id, caterer_id]
  );
  if (!rows[0]) { const e = new Error('Order not found or not ready for assignment'); e.status = 404; throw e; }
  const order = rows[0];

  let code = order.delivery_confirmation_code;
  if (!code) {
    code = String(Math.floor(100000 + Math.random() * 900000));
    await pool.query(
      `UPDATE caterer_orders SET delivery_confirmation_code = $1 WHERE id = $2`,
      [code, caterer_order_id]
    );
  }

  const { rows: updated } = await pool.query(
    `UPDATE caterer_orders SET rider_id = $1, status = 'ASSIGNED_TO_RIDER'
     WHERE id = $2 RETURNING *`,
    [rider_id, caterer_order_id]
  );

  setImmediate(async () => {
    try {
      const shortId = caterer_order_id.slice(0, 8).toUpperCase();
      await notifyUser(rider_id, {
        notification_type: 'ORDER_ASSIGNED',
        title:        'Delivery Assigned',
        message:      `You have been assigned order #${shortId} for delivery.`,
        reference_id: caterer_order_id,
      });
      await notifyUser(order.customer_id, {
        notification_type: 'ORDER_ASSIGNED_TO_RIDER',
        title:        'Rider Assigned',
        message:      `A rider has been assigned to deliver your order #${shortId}.`,
        reference_id: order.master_order_id,
      });
    } catch (err) {
      console.error('[RiderService] assignRider notification failed:', err.message);
    }
  });

  return { ...updated[0], delivery_confirmation_code: code };
}

async function getAllRiders({ search, page = 1, limit = 20 } = {}) {
  const params = [];
  let idx = 1;
  const conds = [`u.role = 'RIDER'`];
  if (search) { conds.push(`(u.name ILIKE $${idx} OR u.email ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
  const where = conds.join(' AND ');
  const { rows: cnt } = await pool.query(`SELECT COUNT(*) FROM users u WHERE ${where}`, params);
  const total  = Number(cnt[0].count);
  const offset = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit));
  params.push(Number(limit), offset);
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.is_active,
            rp.vehicle_type, rp.vehicle_number, rp.caterer_id,
            uc.name AS caterer_name,
            ROUND(AVG(rv.rating)::numeric, 1) AS avg_rating,
            COUNT(rv.id)::int AS review_count
     FROM users u
     LEFT JOIN rider_profiles rp ON rp.user_id = u.id
     LEFT JOIN users uc ON uc.id = rp.caterer_id
     LEFT JOIN reviews rv ON rv.subject_type = 'rider' AND rv.subject_id = u.id
     WHERE ${where}
     GROUP BY u.id, rp.vehicle_type, rp.vehicle_number, rp.caterer_id, uc.name
     ORDER BY u.created_at DESC
     LIMIT $${idx++} OFFSET $${idx}`,
    params
  );
  return { riders: rows, total, page: Number(page), limit: Number(limit) };
}

module.exports = {
  createRider,
  getRidersByCaterer,
  deleteRider,
  pushLocation,
  getLatestLocation,
  getAssignedDeliveries,
  lookupOrderForRider,
  startDelivery,
  confirmDelivery,
  assignRiderToOrder,
  getAllRiders,
};
