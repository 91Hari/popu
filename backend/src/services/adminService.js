'use strict';

const pool = require('../config/db');
const { notifyAllCustomers, notifyUser, NOTIFICATION_TYPES } = require('./notificationService');

async function getDashboardStats() {
  const [customers, caterers, foods, orderStats, financials, codStats, orderSummary] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM users WHERE role = 'CUSTOMER' AND is_active = TRUE`),
    pool.query(`SELECT COUNT(*) FROM users WHERE role = 'CATERER'  AND is_active = TRUE`),
    pool.query(`SELECT COUNT(*) FROM food_items WHERE is_available = TRUE`),
    pool.query(`
      SELECT
        COUNT(DISTINCT mo.id)                             AS total,
        COUNT(CASE WHEN co.status = 'PLACED' THEN 1 END) AS pending
      FROM master_orders mo
      LEFT JOIN caterer_orders co ON co.master_order_id = mo.id
    `),
    pool.query(`
      SELECT
        COALESCE(SUM(mo.total_amount),      0) AS total_order_value,
        COALESCE(SUM(co.commission_amount), 0) AS total_commission,
        COALESCE(SUM(co.platform_fee),      0) AS total_platform_fees,
        COALESCE(SUM(co.caterer_payout),    0) AS total_caterer_payout
      FROM caterer_orders co
      JOIN master_orders mo ON mo.id = co.master_order_id
      WHERE co.status = 'DELIVERED'
    `),
    pool.query(`
      SELECT
        COUNT(*)                                                   AS cod_orders,
        COALESCE(SUM(co.subtotal), 0)                             AS cod_revenue,
        COUNT(CASE WHEN co.payment_status = 'PENDING' THEN 1 END) AS cod_pending,
        COUNT(CASE WHEN co.payment_status = 'PAID'    THEN 1 END) AS cod_collected
      FROM caterer_orders co
      WHERE co.payment_method = 'COD'
        AND co.status NOT IN ('CANCELLED', 'AUTO_CANCELLED')
    `),
    pool.query(`
      SELECT
        COUNT(CASE WHEN co.status IN ('ACCEPTED','PREPARING','READY','DELIVERED','COLLECTED') THEN co.id END)::int AS total_accepted,
        COUNT(CASE WHEN co.status IN ('DELIVERED','COLLECTED')                                THEN co.id END)::int AS total_delivered,
        COUNT(CASE WHEN co.status IN ('CANCELLED','AUTO_CANCELLED')                          THEN co.id END)::int AS total_cancelled
      FROM caterer_orders co
    `),
  ]);

  const o  = orderStats.rows[0];
  const f  = financials.rows[0];
  const c  = codStats.rows[0];
  const os = orderSummary.rows[0];
  return {
    totalCustomers:      Number(customers.rows[0].count),
    totalCaterers:       Number(caterers.rows[0].count),
    totalFoods:          Number(foods.rows[0].count),
    totalOrders:         Number(o.total),
    pendingOrders:       Number(o.pending),
    revenue:             parseFloat(f.total_order_value || 0).toFixed(2),
    totalOrderValue:     parseFloat(f.total_order_value    || 0).toFixed(2),
    totalCommission:     parseFloat(f.total_commission     || 0).toFixed(2),
    totalPlatformFees:   parseFloat(f.total_platform_fees  || 0).toFixed(2),
    totalCatererPayout:  parseFloat(f.total_caterer_payout || 0).toFixed(2),
    codOrders:           Number(c.cod_orders),
    codRevenue:          parseFloat(c.cod_revenue || 0).toFixed(2),
    codPending:          Number(c.cod_pending),
    codCollected:        Number(c.cod_collected),
    platformOrdersAccepted:  Number(os.total_accepted),
    platformOrdersDelivered: Number(os.total_delivered),
    platformOrdersCancelled: Number(os.total_cancelled),
  };
}

async function getCustomers({ search, date_from, date_to, sort = 'created_at', page = 1, limit = 20 } = {}) {
  // User filter (used for both COUNT and main query)
  const searchParams = [];
  let si = 1;
  const userConds = [`u.role = 'CUSTOMER'`];
  if (search) { userConds.push(`(u.name ILIKE $${si} OR u.email ILIKE $${si})`); searchParams.push(`%${search}%`); si++; }
  const userWhere = userConds.join(' AND ');

  const { rows: cnt } = await pool.query(`SELECT COUNT(*) FROM users u WHERE ${userWhere}`, searchParams);
  const total  = Number(cnt[0].count);
  const offset = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit));

  // Main query params: search + date + pagination
  const params = [...searchParams];
  let idx = si;

  // Date filter applied to the caterer_orders JOIN (not WHERE) so users with
  // zero orders in that range still appear with 0 counts
  const dateConds = [];
  if (date_from) { dateConds.push(`co.created_at >= $${idx}::date`);                           params.push(date_from); idx++; }
  if (date_to)   { dateConds.push(`co.created_at <  $${idx}::date + INTERVAL '1 day'`);       params.push(date_to);   idx++; }
  const coJoin = dateConds.length ? ` AND ${dateConds.join(' AND ')}` : '';

  const SORT = {
    orders_accepted:  'orders_accepted  DESC NULLS LAST, u.name ASC',
    orders_delivered: 'orders_delivered DESC NULLS LAST, u.name ASC',
    orders_cancelled: 'orders_cancelled DESC NULLS LAST, u.name ASC',
  };
  const orderBy = SORT[sort] || 'u.created_at DESC';

  params.push(Number(limit), offset);
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.is_active, u.created_at,
            COUNT(CASE WHEN co.status IN ('ACCEPTED','PREPARING','READY','DELIVERED','COLLECTED') THEN co.id END)::int AS orders_accepted,
            COUNT(CASE WHEN co.status IN ('DELIVERED','COLLECTED')                                THEN co.id END)::int AS orders_delivered,
            COUNT(CASE WHEN co.status IN ('CANCELLED','AUTO_CANCELLED')                          THEN co.id END)::int AS orders_cancelled
     FROM users u
     LEFT JOIN master_orders  mo ON mo.customer_id      = u.id
     LEFT JOIN caterer_orders co ON co.master_order_id  = mo.id${coJoin}
     WHERE ${userWhere}
     GROUP BY u.id
     ORDER BY ${orderBy}
     LIMIT $${idx++} OFFSET $${idx}`,
    params
  );
  return { customers: rows, total, page: Number(page), limit: Number(limit) };
}

async function getCaterers({ search, date_from, date_to, sort = 'created_at', page = 1, limit = 20 } = {}) {
  const searchParams = [];
  let si = 1;
  const userConds = [`u.role = 'CATERER'`];
  if (search) { userConds.push(`(u.name ILIKE $${si} OR u.email ILIKE $${si} OR u.business_name ILIKE $${si})`); searchParams.push(`%${search}%`); si++; }
  const userWhere = userConds.join(' AND ');

  const { rows: cnt } = await pool.query(`SELECT COUNT(*) FROM users u WHERE ${userWhere}`, searchParams);
  const total  = Number(cnt[0].count);
  const offset = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit));

  const params = [...searchParams];
  let idx = si;

  const dateConds = [];
  if (date_from) { dateConds.push(`co.created_at >= $${idx}::date`);                        params.push(date_from); idx++; }
  if (date_to)   { dateConds.push(`co.created_at <  $${idx}::date + INTERVAL '1 day'`);    params.push(date_to);   idx++; }
  const coJoin = dateConds.length ? ` AND ${dateConds.join(' AND ')}` : '';

  const SORT = {
    orders_accepted:  'orders_accepted  DESC NULLS LAST, u.name ASC',
    orders_delivered: 'orders_delivered DESC NULLS LAST, u.name ASC',
    orders_cancelled: 'orders_cancelled DESC NULLS LAST, u.name ASC',
  };
  const orderBy = SORT[sort] || 'u.created_at DESC';

  params.push(Number(limit), offset);
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.business_name, u.location,
            u.availability_status, u.is_active, u.created_at,
            ROUND(AVG(DISTINCT r.rating)::numeric, 1)      AS avg_rating,
            COUNT(DISTINCT r.id)::int                       AS review_count,
            COUNT(CASE WHEN co.status IN ('ACCEPTED','PREPARING','READY','DELIVERED','COLLECTED') THEN co.id END)::int AS orders_accepted,
            COUNT(CASE WHEN co.status IN ('DELIVERED','COLLECTED')                                THEN co.id END)::int AS orders_delivered,
            COUNT(CASE WHEN co.status IN ('CANCELLED','AUTO_CANCELLED')                          THEN co.id END)::int AS orders_cancelled
     FROM users u
     LEFT JOIN reviews r       ON r.subject_type = 'caterer' AND r.subject_id = u.id
     LEFT JOIN caterer_orders co ON co.caterer_id = u.id${coJoin}
     WHERE ${userWhere}
     GROUP BY u.id
     ORDER BY ${orderBy}
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
            u.name AS caterer_name,
            ROUND(AVG(r.rating)::numeric, 1) AS avg_rating,
            COUNT(r.id)::int AS review_count
     FROM food_items f
     JOIN users u ON u.id = f.caterer_id
     LEFT JOIN reviews r ON r.subject_type = 'food' AND r.subject_id = f.id
     ${where}
     GROUP BY f.id, u.name
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
  if (status) { conds.push(`co.status = $${idx++}`); params.push(status.toUpperCase()); }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const { rows: cnt } = await pool.query(
    `SELECT COUNT(DISTINCT co.id) FROM caterer_orders co ${where}`,
    params
  );
  const total  = Number(cnt[0].count);
  const offset = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit));
  params.push(Number(limit), offset);
  const { rows } = await pool.query(
    `SELECT co.id,
            co.status,
            co.subtotal        AS total_amount,
            co.payment_method,
            co.payment_status,
            co.master_order_id,
            co.created_at,
            uc.name            AS customer_name,
            uc.email           AS customer_email,
            ucat.name          AS caterer_name
     FROM caterer_orders co
     JOIN master_orders mo  ON mo.id   = co.master_order_id
     JOIN users uc          ON uc.id   = mo.customer_id
     JOIN users ucat        ON ucat.id = co.caterer_id
     ${where}
     ORDER BY co.created_at DESC
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
  const valid = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'ASSIGNED_TO_RIDER', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
  if (!valid.includes(status)) {
    const e = new Error('Invalid status'); e.status = 400; throw e;
  }
  const { rows } = await pool.query(
    `UPDATE caterer_orders SET status = $1 WHERE id = $2 RETURNING *`,
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

async function createUser({ name, email, password, role, phone, business_name, address, caterer_id, vehicle_type, vehicle_number }) {
  const bcrypt = require('bcrypt');
  const upperRole = (role || '').toUpperCase();
  const validRoles = ['CUSTOMER', 'CATERER', 'RIDER'];
  if (!name || !email || !password || !role) {
    const e = new Error('name, email, password, and role are required'); e.status = 400; throw e;
  }
  if (!validRoles.includes(upperRole)) {
    const e = new Error('role must be CUSTOMER, CATERER, or RIDER'); e.status = 400; throw e;
  }
  const { rows: existing } = await pool.query(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase()]);
  if (existing[0]) { const e = new Error('Email already in use'); e.status = 409; throw e; }

  const hash = await bcrypt.hash(password, 12);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO users (name, email, password_hash, role, phone, business_name, address, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
       RETURNING id, name, email, role, is_active, created_at`,
      [name, email.toLowerCase(), hash, upperRole, phone || null, business_name || null, address || null]
    );
    const user = rows[0];
    if (upperRole === 'RIDER') {
      await client.query(
        `INSERT INTO rider_profiles (user_id, caterer_id, vehicle_type, vehicle_number)
         VALUES ($1, $2, $3, $4)`,
        [user.id, caterer_id || null, vehicle_type || null, vehicle_number || null]
      );
    }
    await client.query('COMMIT');
    return user;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function deleteUser(id) {
  const { rows } = await pool.query(`SELECT id, role FROM users WHERE id = $1`, [id]);
  if (!rows[0]) { const e = new Error('User not found'); e.status = 404; throw e; }
  if (rows[0].role === 'ADMIN') { const e = new Error('Cannot delete admin users'); e.status = 403; throw e; }
  await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
  return { ok: true };
}

async function getCateringBookings({ page = 1, limit = 20, status } = {}) {
  const cateringService = require('./cateringService');
  return cateringService.getAllCateringBookings({ page, limit, status });
}

async function getAllRiders({ search, page = 1, limit = 20 } = {}) {
  const riderService = require('./riderService');
  return riderService.getAllRiders({ search, page, limit });
}

module.exports = {
  getDashboardStats, getCustomers, getCaterers, getFoods, getOrders,
  setUserStatus, setFoodStatus, updateOrderStatus, broadcastNotification,
  createUser, deleteUser, getCateringBookings, getAllRiders,
};
