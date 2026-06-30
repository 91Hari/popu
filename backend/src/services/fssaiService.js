'use strict';

const pool = require('../config/db');

async function upsertFssai(catererId, { fssai_number, license_type, issue_date, expiry_date, certificate_url }) {
  const { rows } = await pool.query(
    `INSERT INTO fssai_details (caterer_id, fssai_number, license_type, issue_date, expiry_date, certificate_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (caterer_id) DO UPDATE SET
       fssai_number    = EXCLUDED.fssai_number,
       license_type    = EXCLUDED.license_type,
       issue_date      = EXCLUDED.issue_date,
       expiry_date     = EXCLUDED.expiry_date,
       certificate_url = COALESCE(EXCLUDED.certificate_url, fssai_details.certificate_url),
       verified        = FALSE,
       verified_by     = NULL,
       verified_at     = NULL,
       rejection_reason = NULL,
       updated_at      = NOW()
     RETURNING *`,
    [catererId, fssai_number, license_type || null, issue_date || null, expiry_date, certificate_url || null]
  );
  return rows[0];
}

async function getFssaiForCaterer(catererId) {
  const { rows } = await pool.query(
    `SELECT * FROM fssai_details WHERE caterer_id = $1`,
    [catererId]
  );
  return rows[0] || null;
}

async function adminListFssai({ status = 'all', page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  let where = '';
  if (status === 'pending')  where = `WHERE f.verified = FALSE AND f.rejection_reason IS NULL`;
  if (status === 'verified') where = `WHERE f.verified = TRUE`;
  if (status === 'rejected') where = `WHERE f.rejection_reason IS NOT NULL`;
  if (status === 'expiring') where = `WHERE f.verified = TRUE AND f.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '60 days'`;
  if (status === 'expired')  where = `WHERE f.expiry_date < CURRENT_DATE`;

  const [dataRes, countRes] = await Promise.all([
    pool.query(
      `SELECT f.*, u.name AS caterer_name, u.email AS caterer_email, u.phone
       FROM fssai_details f
       JOIN users u ON u.id = f.caterer_id
       ${where}
       ORDER BY f.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    ),
    pool.query(`SELECT COUNT(*) FROM fssai_details f JOIN users u ON u.id = f.caterer_id ${where}`)
  ]);

  return { items: dataRes.rows, total: parseInt(countRes.rows[0].count), page, limit };
}

async function adminVerifyFssai(fssaiId, adminId, { approved, rejection_reason }) {
  const { rows } = await pool.query(
    `UPDATE fssai_details SET
       verified         = $1,
       verified_by      = $2,
       verified_at      = CASE WHEN $1 THEN NOW() ELSE NULL END,
       rejection_reason = $3,
       updated_at       = NOW()
     WHERE id = $4
     RETURNING *`,
    [approved, adminId, rejection_reason || null, fssaiId]
  );
  return rows[0];
}

async function getExpiringFssai(daysAhead = 60) {
  const { rows } = await pool.query(
    `SELECT f.*, u.name AS caterer_name, u.email AS caterer_email, u.phone
     FROM fssai_details f
     JOIN users u ON u.id = f.caterer_id
     WHERE f.verified = TRUE
       AND f.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + ($1 || ' days')::INTERVAL
     ORDER BY f.expiry_date ASC`,
    [daysAhead]
  );
  return rows;
}

module.exports = { upsertFssai, getFssaiForCaterer, adminListFssai, adminVerifyFssai, getExpiringFssai };
