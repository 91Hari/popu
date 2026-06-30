'use strict';

const pool = require('../config/db');

const VALID_CATEGORIES = ['FOOD_QUALITY', 'WRONG_ORDER', 'LATE_DELIVERY', 'REFUND', 'PAYMENT', 'RIDER_BEHAVIOUR', 'OTHER'];
const VALID_STATUSES   = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED'];

async function submitGrievance(userId, { order_ref_id, category, description }) {
  if (!VALID_CATEGORIES.includes(category)) throw Object.assign(new Error('Invalid category'), { status: 400 });
  if (!description?.trim()) throw Object.assign(new Error('Description is required'), { status: 400 });

  const { rows } = await pool.query(
    `INSERT INTO grievances (user_id, order_ref_id, category, description)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, order_ref_id || null, category, description.trim()]
  );
  return rows[0];
}

async function getMyGrievances(userId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const [dataRes, countRes] = await Promise.all([
    pool.query(
      `SELECT g.*, mo.order_number
       FROM grievances g
       LEFT JOIN master_orders mo ON mo.id = g.order_ref_id
       WHERE g.user_id = $1
       ORDER BY g.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    ),
    pool.query(`SELECT COUNT(*) FROM grievances WHERE user_id = $1`, [userId])
  ]);
  return { items: dataRes.rows, total: parseInt(countRes.rows[0].count) };
}

async function adminListGrievances({ status = 'all', page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const where = status !== 'all' ? `WHERE g.status = '${status.toUpperCase()}'` : '';

  const [dataRes, countRes] = await Promise.all([
    pool.query(
      `SELECT g.*, u.name AS user_name, u.email, u.phone, mo.order_number,
              a.name AS assigned_to_name
       FROM grievances g
       JOIN users u ON u.id = g.user_id
       LEFT JOIN master_orders mo ON mo.id = g.order_ref_id
       LEFT JOIN users a ON a.id = g.assigned_to
       ${where}
       ORDER BY
         CASE g.status WHEN 'ESCALATED' THEN 0 WHEN 'OPEN' THEN 1 WHEN 'IN_PROGRESS' THEN 2 ELSE 3 END,
         g.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    ),
    pool.query(`SELECT COUNT(*) FROM grievances g ${where}`)
  ]);

  return { items: dataRes.rows, total: parseInt(countRes.rows[0].count) };
}

async function adminUpdateGrievance(grievanceId, adminId, { status, resolution, assigned_to }) {
  if (status && !VALID_STATUSES.includes(status)) throw Object.assign(new Error('Invalid status'), { status: 400 });

  const sets = ['updated_at = NOW()'];
  const vals = [];
  let i = 1;

  if (status) {
    sets.push(`status = $${i++}`); vals.push(status);
    if (status === 'RESOLVED') { sets.push(`resolved_at = NOW()`); }
    if (status === 'ESCALATED') { sets.push(`escalated_at = NOW()`); }
  }
  if (resolution !== undefined) { sets.push(`resolution = $${i++}`); vals.push(resolution); }
  if (assigned_to !== undefined) { sets.push(`assigned_to = $${i++}`); vals.push(assigned_to); }

  vals.push(grievanceId);
  const { rows } = await pool.query(
    `UPDATE grievances SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
    vals
  );
  return rows[0];
}

async function getGrievanceSummary() {
  const { rows } = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'OPEN')        AS open_count,
       COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') AS in_progress_count,
       COUNT(*) FILTER (WHERE status = 'ESCALATED')   AS escalated_count,
       COUNT(*) FILTER (WHERE status = 'RESOLVED'
         AND resolved_at >= NOW() - INTERVAL '7 days') AS resolved_this_week,
       COUNT(*) AS total
     FROM grievances`
  );
  return rows[0];
}

module.exports = { submitGrievance, getMyGrievances, adminListGrievances, adminUpdateGrievance, getGrievanceSummary };
