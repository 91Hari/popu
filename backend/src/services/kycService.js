'use strict';

const pool = require('../config/db');

async function upsertCatererKyc(catererId, { pan_number, pan_url, gst_number, business_type }) {
  const { rows } = await pool.query(
    `INSERT INTO caterer_kyc (caterer_id, pan_number, pan_url, gst_number, business_type, kyc_status)
     VALUES ($1, $2, $3, $4, $5, 'SUBMITTED')
     ON CONFLICT (caterer_id) DO UPDATE SET
       pan_number    = COALESCE(EXCLUDED.pan_number, caterer_kyc.pan_number),
       pan_url       = COALESCE(EXCLUDED.pan_url, caterer_kyc.pan_url),
       gst_number    = COALESCE(EXCLUDED.gst_number, caterer_kyc.gst_number),
       business_type = COALESCE(EXCLUDED.business_type, caterer_kyc.business_type),
       kyc_status    = CASE WHEN caterer_kyc.kyc_status = 'APPROVED' THEN 'APPROVED' ELSE 'SUBMITTED' END,
       updated_at    = NOW()
     RETURNING *`,
    [catererId, pan_number || null, pan_url || null, gst_number || null, business_type || null]
  );
  return rows[0];
}

async function getKycForCaterer(catererId) {
  const { rows } = await pool.query(
    `SELECT k.*, array_agg(
       json_build_object(
         'id', b.id, 'bank_name', b.bank_name, 'account_holder', b.account_holder,
         'account_number', b.account_number, 'ifsc_code', b.ifsc_code,
         'is_primary', b.is_primary, 'is_verified', b.is_verified
       ) ORDER BY b.is_primary DESC
     ) FILTER (WHERE b.id IS NOT NULL) AS bank_accounts
     FROM caterer_kyc k
     LEFT JOIN caterer_bank_accounts b ON b.caterer_id = k.caterer_id
     WHERE k.caterer_id = $1
     GROUP BY k.id`,
    [catererId]
  );
  return rows[0] || null;
}

async function adminListKyc({ status = 'all', page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const where = status !== 'all' ? `WHERE k.kyc_status = '${status.toUpperCase()}'` : '';

  const [dataRes, countRes] = await Promise.all([
    pool.query(
      `SELECT k.*, u.name AS caterer_name, u.email, u.phone, u.created_at AS registered_at
       FROM caterer_kyc k
       JOIN users u ON u.id = k.caterer_id
       ${where}
       ORDER BY k.updated_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    ),
    pool.query(`SELECT COUNT(*) FROM caterer_kyc k ${where}`)
  ]);

  return { items: dataRes.rows, total: parseInt(countRes.rows[0].count), page, limit };
}

async function adminReviewKyc(kycId, adminId, { approved, rejection_reason }) {
  const status = approved ? 'APPROVED' : 'REJECTED';
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE caterer_kyc SET
         kyc_status       = $1,
         rejection_reason = $2,
         kyc_reviewed_by  = $3,
         kyc_reviewed_at  = NOW(),
         updated_at       = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, rejection_reason || null, adminId, kycId]
    );
    if (approved && rows[0]) {
      await client.query(
        `UPDATE users SET is_kyc_verified = TRUE, kyc_verified_at = NOW() WHERE id = $1`,
        [rows[0].caterer_id]
      );
    }
    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function addBankAccount(catererId, { account_holder, bank_name, account_number, ifsc_code, account_type, make_primary }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (make_primary) {
      await client.query(`UPDATE caterer_bank_accounts SET is_primary = FALSE WHERE caterer_id = $1`, [catererId]);
    }
    const { rows } = await client.query(
      `INSERT INTO caterer_bank_accounts (caterer_id, account_holder, bank_name, account_number, ifsc_code, account_type, is_primary)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [catererId, account_holder, bank_name, account_number, ifsc_code, account_type || 'SAVINGS', !!make_primary]
    );
    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { upsertCatererKyc, getKycForCaterer, adminListKyc, adminReviewKyc, addBankAccount };
