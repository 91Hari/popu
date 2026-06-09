'use strict';

const pool = require('../config/db');
const { notifyAllCustomers, notifyUser, NOTIFICATION_TYPES } = require('./notificationService');

async function getDashboardStats() {
  const [customers, caterers, foods, orders] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM users WHERE role = 'CUSTOMER' AND is_active = TRUE`),
    pool.query(`SELECT COUNT(*) FROM users WHERE role = 'CATERER' AND is_active = TRUE`),
    pool.query(`SELECT COUNT(*) FROM food_items WHERE is_available = TRUE`),
    pool.query(`SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'PLACED'    THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status = 'DELIVERED' THEN total_amount ELSE 0 END) AS revenue
    FROM orders`),
  ]);

  const o = orders.rows[0];
  return {
    totalCustomers: Number(customers.rows[0].count),
    totalCaterers:  Number(caterers.rows[0].count),
    totalFoods:     Number(foods.rows[0].count),
    totalOrders:    Number(o.total),
    pendingOrders:  Number(o.pending),
    revenue:        parseFloat(o.revenue || 0).toFixed(2),
  };
}

async function getCustomers({ search, page = 1, limit = 20 } = {}) {
  const params = [];
  let idx = 1;
  const conds = [`role = 'CUSTOMER'`];
  if (search) { conds.push(`(name ILIKE $${idx} OR email ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
  const where = conds.join(' AND ');
  const { rows: cnt } = await pool.query(`SELECT COUNT(*) FROM users WHERE ${where}`, params);
  const total   = Number(cnt[0].count);
  const offset  = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit));
  params.push(Number(limit), offset);
  const { rows } = await pool.query(
    `SELECT id, name, email, is_active, created_at
     FROM users WHERE ${where}
     ORDER BY created_at DESC
     LIMIT $${idx++} OFFSET $${idx}`,
    params
  );
  return { customers: rows, total, page: Number(page), limit: Number(limit) };
}

async function getCaterers({ search, page = 1, limit = 20 } = {}) {
  const params = [];
  let idx = 1;
  const conds = [`role = 'CATERER'`];
  if (search) { conds.push(`(name ILIKE $${idx} OR email ILIKE $${idx} OR business_name ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
  const where = conds.join(' AND ');
  const { rows: cnt } = await pool.query(`SELECT COUNT(*) FROM users WHERE ${where}`, params);
  const total   = Number(cnt[0].count);
  const offset  = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit));
  params.push(Number(limit), offset);
  const { rows } = await pool.query(
    `SELECT id, name, email, business_name, location, availability_status, is_active, created_at
     FROM users WHERE ${where}
     ORDER BY created_at DESC
     LIMIT $${idx++} OFFSET $${idx}`,
    params
  );
  return { caterers: rows, total, page: Number(page), limit: Number(limit) };
}

async function getFoods({ search, page = 1, limit = 20 } = {}) {
  const params = [];
  let idx = 1;
  const conds = [];
  if (search) { conds.push(`(f.food_name ILIKE $${idx} OR f.category ILIKE $${idx} OR u.name ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const { rows: cnt } = await pool.query(`SELECT COUNT(*) FROM food_items f JOIN users u ON u.id = f.caterer_id ${where}`, params);
  const total   = Number(cnt[0].count);
  const offset  = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit));
  params.push(Number(limit), offset);
  const { rows } = await pool.query(
    `SELECT f.id, f.food_name, f.price, f.category, f.is_available, f.created_at,
            u.name AS caterer_name
     FROM food_items f JOIN users u ON u.id = f.caterer_id
     ${where}
     ORDER BY f.created_at DESC
     LIMIT $${idx++} OFFSET $${idx}`,
    params
  );
  return { foods: rows, total, page: Number(page), limit: Number(limit) };
}

async function getOrders({ status, page = 1, limit = 20 } = {}) {
  const params = [];
  let idx = 1;
  const conds = [];
  if (status) { conds.push(`o.status = $${idx++}`); params.push(status.toUpperCase()); }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const { rows: cnt } = await pool.query(
    `SELECT COUNT(DISTINCT o.id) FROM orders o ${where}`,
    params
  );
  const total  = Number(cnt[0].count);
  const offset = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit));
  params.push(Number(limit), offset);
  const { rows } = await pool.query(
    `SELECT o.id, o.status, o.total_amount, o.eta_minutes, o.accepted_at,
            o.expected_arrival_at, o.created_at,
            uc.name AS customer_name, uc.email AS customer_email
     FROM orders o
     JOIN users uc ON uc.id = o.customer_id
     ${where}
     ORDER BY o.created_at DESC
     LIMIT $${idx++} OFFSET $${idx}`,
    params
  );
  return { orders: rows, total, page: Number(page), limit: Number(limit) };
}

async function setUserStatus(id, is_active) {
  const { rows } = await pool.query(
    `UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, name, email, role, is_active`,
    [is_active, id]
  );
  if (!rows[0]) { const e = new Error('User not found'); e.status = 404; throw e; }
  return rows[0];
}

async function setFoodStatus(id, is_available) {
  const { rows } = await pool.query(
    `UPDATE food_items SET is_available = $1 WHERE id = $2 RETURNING id, food_name, is_available`,
    [is_available, id]
  );
  if (!rows[0]) { const e = new Error('Food not found'); e.status = 404; throw e; }
  return rows[0];
}

async function updateOrderStatus(id, status) {
  const valid = ['PLACED', 'ACCEPTED', 'PREPARING', 'DELIVERED', 'CANCELLED'];
  if (!valid.includes(status)) {
    const e = new Error('Invalid status'); e.status = 400; throw e;
  }
  const { rows } = await pool.query(
    `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  if (!rows[0]) { const e = new Error('Order not found'); e.status = 404; throw e; }
  return rows[0];
}

async function broadcastNotification({ title, message, target_role, admin_id }) {
  await pool.query(
    `INSERT INTO system_notifications (title, message, target_role, created_by) VALUES ($1, $2, $3, $4)`,
    [title, message, target_role || 'ALL', admin_id]
  );

  const role = (target_role || 'ALL').toUpperCase();
  if (role === 'CUSTOMER' || role === 'ALL') {
    await notifyAllCustomers({
      notification_type: NOTIFICATION_TYPES.SYSTEM_MESSAGE || 'SYSTEM_MESSAGE',
      title,
      message,
    });
  }
  if (role === 'CATERER' || role === 'ALL') {
    const { rows } = await pool.query(`SELECT id FROM users WHERE role = 'CATERER' AND is_active = TRUE`);
    await Promise.allSettled(
      rows.map((r) => notifyUser(r.id, {
        notification_type: 'SYSTEM_MESSAGE',
        title,
        message,
      }))
    );
  }
  return { ok: true };
}

module.exports = {
  getDashboardStats, getCustomers, getCaterers, getFoods, getOrders,
  setUserStatus, setFoodStatus, updateOrderStatus, broadcastNotification,
};
