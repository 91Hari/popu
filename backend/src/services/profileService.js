'use strict';

const pool = require('../config/db');
const jwt  = require('jsonwebtoken');

const JWT_SECRET  = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

// ─── Profile settings ────────────────────────────────────────────────────────

async function getProfile(userId) {
  const { rows } = await pool.query(
    `SELECT id, name, email, phone, mobile_number, date_of_birth, gender, role, created_at,
            address, city, state, pincode, latitude, longitude
     FROM users WHERE id = $1`,
    [userId]
  );
  if (!rows[0]) throw Object.assign(new Error('User not found'), { status: 404 });
  return rows[0];
}

async function updateProfile(userId, {
  name, phone, date_of_birth, gender,
  address, city, state, pincode, latitude, longitude,
}) {
  const { rows } = await pool.query(
    `UPDATE users
     SET name          = COALESCE(NULLIF($1,''), name),
         phone         = COALESCE(NULLIF($2,''), phone),
         date_of_birth = $3,
         gender        = NULLIF($4,''),
         address       = COALESCE(NULLIF($5,''), address),
         city          = COALESCE(NULLIF($6,''), city),
         state         = COALESCE(NULLIF($7,''), state),
         pincode       = COALESCE(NULLIF($8,''), pincode),
         latitude      = COALESCE($9,  latitude),
         longitude     = COALESCE($10, longitude),
         updated_at    = NOW()
     WHERE id = $11
     RETURNING id, name, email, phone, mobile_number, date_of_birth, gender,
               address, city, state, pincode, latitude, longitude`,
    [name   || null, phone  || null, date_of_birth || null, gender  || null,
     address || null, city  || null, state         || null, pincode || null,
     latitude  != null ? Number(latitude)  : null,
     longitude != null ? Number(longitude) : null,
     userId]
  );
  return rows[0];
}

// ─── Mobile number update ─────────────────────────────────────────────────────
//
// Dedicated endpoint so we can:
//   1. Enforce uniqueness before touching the row
//   2. Write an audit record atomically
//   3. Return a fresh JWT so the client's session reflects the new mobile

async function updateMobile(userId, newMobile) {
  if (!newMobile || !/^\d{10}$/.test(String(newMobile).trim())) {
    throw Object.assign(
      new Error('A valid 10-digit mobile number is required'),
      { status: 400 }
    );
  }

  const mobile = String(newMobile).trim();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Fetch current row — needed for audit log and JWT refresh
    const { rows: current } = await client.query(
      'SELECT id, name, email, mobile_number, role FROM users WHERE id = $1 FOR UPDATE',
      [userId]
    );
    if (!current[0]) throw Object.assign(new Error('User not found'), { status: 404 });

    const user = current[0];

    // No-op if same number is being "saved" again
    if (user.mobile_number === mobile) {
      await client.query('ROLLBACK');
      return { success: true, message: 'Mobile number is already set to this value.' };
    }

    // Uniqueness check — exclude the current user
    const { rows: dup } = await client.query(
      'SELECT id FROM users WHERE mobile_number = $1 AND id != $2',
      [mobile, userId]
    );
    if (dup.length) {
      throw Object.assign(
        new Error('This mobile number is already registered.'),
        { status: 409 }
      );
    }

    // Update mobile_number
    await client.query(
      'UPDATE users SET mobile_number = $1, updated_at = NOW() WHERE id = $2',
      [mobile, userId]
    );

    // Audit record
    await client.query(
      'INSERT INTO user_mobile_audit (user_id, old_mobile, new_mobile) VALUES ($1, $2, $3)',
      [userId, user.mobile_number || null, mobile]
    );

    await client.query('COMMIT');

    console.log(
      `[Audit] Mobile update — user ${userId}: ` +
      `${user.mobile_number || 'none'} → ${mobile}`
    );

    // Issue a fresh JWT so the client's token reflects the new mobile immediately
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email, mobile: mobile },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    return {
      success: true,
      message: 'Mobile number updated successfully.',
      token,
      user: { ...user, mobile_number: mobile },
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
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

// ─── UPI VPA live lookup ──────────────────────────────────────────────────────

const UPI_FORMAT = /^[\w.\-]+@[\w]+$/;

async function lookupVpa(upi) {
  if (!UPI_FORMAT.test((upi || '').trim())) {
    return { valid: false, reason: 'format' };
  }
  return { valid: true };
}

// ─── Payment methods ─────────────────────────────────────────────────────────

function validateUpi(id) {
  return UPI_FORMAT.test(id);
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
  getProfile, updateProfile, updateMobile,
  getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress,
  getPaymentMethods, savePaymentMethod, updatePaymentMethod, deletePaymentMethod,
  lookupVpa,
};
