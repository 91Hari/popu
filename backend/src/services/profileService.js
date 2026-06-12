'use strict';

const pool = require('../config/db');

// ─── Profile settings ────────────────────────────────────────────────────────

async function getProfile(userId) {
  const { rows } = await pool.query(
    `SELECT id, name, email, phone, date_of_birth, gender, role, created_at
     FROM users WHERE id = $1`,
    [userId]
  );
  if (!rows[0]) throw Object.assign(new Error('User not found'), { status: 404 });
  return rows[0];
}

async function updateProfile(userId, { name, phone, date_of_birth, gender }) {
  const { rows } = await pool.query(
    `UPDATE users
     SET name          = COALESCE(NULLIF($1,''), name),
         phone         = COALESCE(NULLIF($2,''), phone),
         date_of_birth = $3,
         gender        = NULLIF($4,''),
         updated_at    = NOW()
     WHERE id = $5
     RETURNING id, name, email, phone, date_of_birth, gender`,
    [name || null, phone || null, date_of_birth || null, gender || null, userId]
  );
  return rows[0];
}

// ─── Addresses ───────────────────────────────────────────────────────────────

async function getAddresses(userId) {
  const { rows } = await pool.query(
    `SELECT * FROM user_addresses
     WHERE user_id = $1
     ORDER BY is_default DESC, created_at DESC`,
    [userId]
  );
  return rows;
}

async function createAddress(userId, data) {
  const { full_name, mobile, house_no, street, landmark, city, state, pincode, latitude, longitude, is_default } = data;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (is_default) {
      await client.query(
        `UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1`,
        [userId]
      );
    }
    const { rows } = await client.query(
      `INSERT INTO user_addresses
         (user_id, full_name, mobile, house_no, street, landmark, city, state, pincode, latitude, longitude, is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [userId, full_name, mobile, house_no, street, landmark || null, city, state, pincode,
       latitude || null, longitude || null, is_default || false]
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

async function updateAddress(userId, addressId, data) {
  const { full_name, mobile, house_no, street, landmark, city, state, pincode, latitude, longitude, is_default } = data;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (is_default) {
      await client.query(
        `UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1 AND id != $2`,
        [userId, addressId]
      );
    }
    const { rows } = await client.query(
      `UPDATE user_addresses
       SET full_name  = $1, mobile    = $2, house_no   = $3, street    = $4,
           landmark   = $5, city      = $6, state      = $7, pincode   = $8,
           latitude   = $9, longitude = $10, is_default = $11, updated_at = NOW()
       WHERE id = $12 AND user_id = $13
       RETURNING *`,
      [full_name, mobile, house_no, street, landmark || null, city, state, pincode,
       latitude || null, longitude || null, is_default || false, addressId, userId]
    );
    if (!rows[0]) throw Object.assign(new Error('Address not found'), { status: 404 });
    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function deleteAddress(userId, addressId) {
  const { rowCount } = await pool.query(
    `DELETE FROM user_addresses WHERE id = $1 AND user_id = $2`,
    [addressId, userId]
  );
  if (rowCount === 0) throw Object.assign(new Error('Address not found'), { status: 404 });
}

async function setDefaultAddress(userId, addressId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1`,
      [userId]
    );
    const { rows } = await client.query(
      `UPDATE user_addresses SET is_default = TRUE, updated_at = NOW()
       WHERE id = $1 AND user_id = $2 RETURNING *`,
      [addressId, userId]
    );
    if (!rows[0]) throw Object.assign(new Error('Address not found'), { status: 404 });
    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ─── Payment methods ─────────────────────────────────────────────────────────

function validateUpi(id) {
  return /^[\w.\-]+@[\w]+$/.test(id);
}

async function getPaymentMethods(userId) {
  const { rows } = await pool.query(
    `SELECT * FROM user_payment_methods WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

async function savePaymentMethod(userId, { payment_type = 'phonepe', phonepe_id }) {
  if (payment_type === 'phonepe') {
    if (!phonepe_id) throw Object.assign(new Error('PhonePe ID is required'), { status: 400 });
    if (!validateUpi(phonepe_id)) throw Object.assign(new Error('Invalid PhonePe UPI ID format'), { status: 400 });
  }

  // UPSERT — one record per payment_type per user
  const { rows } = await pool.query(
    `INSERT INTO user_payment_methods (user_id, payment_type, phonepe_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, payment_type)
     DO UPDATE SET phonepe_id = EXCLUDED.phonepe_id, updated_at = NOW()
     RETURNING *`,
    [userId, payment_type, phonepe_id || null]
  );
  return rows[0];
}

async function updatePaymentMethod(userId, methodId, data) {
  const { phonepe_id, payment_type } = data;
  if (payment_type === 'phonepe' && phonepe_id && !validateUpi(phonepe_id)) {
    throw Object.assign(new Error('Invalid PhonePe UPI ID format'), { status: 400 });
  }
  const { rows } = await pool.query(
    `UPDATE user_payment_methods
     SET phonepe_id = COALESCE($1, phonepe_id), updated_at = NOW()
     WHERE id = $2 AND user_id = $3 RETURNING *`,
    [phonepe_id || null, methodId, userId]
  );
  if (!rows[0]) throw Object.assign(new Error('Payment method not found'), { status: 404 });
  return rows[0];
}

async function deletePaymentMethod(userId, methodId) {
  const { rowCount } = await pool.query(
    `DELETE FROM user_payment_methods WHERE id = $1 AND user_id = $2`,
    [methodId, userId]
  );
  if (rowCount === 0) throw Object.assign(new Error('Payment method not found'), { status: 404 });
}

module.exports = {
  getProfile, updateProfile,
  getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress,
  getPaymentMethods, savePaymentMethod, updatePaymentMethod, deletePaymentMethod,
};
