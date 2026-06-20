'use strict';

const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const pool    = require('../config/db');
const { sendPasswordResetEmail } = require('../utils/mailer');
const { sendOtp }                = require('../utils/smsProvider');

const SALT_ROUNDS = 12;
const JWT_SECRET  = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set');
  process.exit(1);
}

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function validatePasswordStrength(password) {
  if (!password || password.length < 8)
    throw makeError('Password must be at least 8 characters', 400);
  if (!/[A-Z]/.test(password))
    throw makeError('Password must contain at least one uppercase letter', 400);
  if (!/[a-z]/.test(password))
    throw makeError('Password must contain at least one lowercase letter', 400);
  if (!/[0-9]/.test(password))
    throw makeError('Password must contain at least one number', 400);
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password))
    throw makeError('Password must contain at least one special character', 400);
}

function detectInputType(value) {
  if (!value) return null;
  const v = value.trim();
  if (v.includes('@'))       return 'email';
  if (/^\d{10}$/.test(v))   return 'mobile';
  return null;
}

function generateOtp() {
  // crypto.randomInt is available in Node 14.10+
  return String(crypto.randomInt(100000, 999999));
}

// ─── Login ────────────────────────────────────────────────────────────────────

async function login({ username, password }) {
  const type = detectInputType(username);
  if (!type) {
    throw makeError('Enter a valid email address or 10-digit mobile number', 400);
  }

  const column = type === 'email' ? 'email' : 'mobile_number';
  const value  = type === 'email'
    ? username.trim().toLowerCase()
    : username.trim();

  const { rows } = await pool.query(
    `SELECT id, name, email, mobile_number, password_hash, role, is_active, is_deleted
     FROM users WHERE ${column} = $1`,
    [value]
  );

  const user = rows[0];
  if (!user) throw makeError('Invalid credentials', 401);
  if (user.is_deleted) throw makeError('This account has been deleted.', 403);
  if (!user.is_active) throw makeError('Account is deactivated. Please contact support.', 403);

  if (!user.password_hash) {
    throw makeError(
      'No password set for this account. Use Forgot Password to set one.',
      400
    );
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw makeError('Invalid credentials', 401);

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email, mobile: user.mobile_number },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  console.log(`[Auth] Login — ${user.role} ${user.id} via ${type}`);

  return {
    token,
    user: {
      id:            user.id,
      name:          user.name,
      email:         user.email,
      role:          user.role,
      mobile_number: user.mobile_number,
    },
  };
}

// ─── Register ─────────────────────────────────────────────────────────────────

async function register({
  name, mobileNumber, email, password, role,
  address, city, state, pincode, latitude, longitude,
}) {
  if (!name?.trim()) throw makeError('Name is required', 400);
  if (!mobileNumber || !/^\d{10}$/.test(String(mobileNumber).trim())) {
    throw makeError('A valid 10-digit mobile number is required', 400);
  }

  validatePasswordStrength(password);

  const ALLOWED_ROLES = ['CUSTOMER', 'CATERER'];
  const userRole = role && ALLOWED_ROLES.includes(String(role).toUpperCase())
    ? String(role).toUpperCase()
    : 'CUSTOMER';

  const mobile = String(mobileNumber).trim();

  const { rows: mobileRows } = await pool.query(
    'SELECT id FROM users WHERE mobile_number = $1', [mobile]
  );
  if (mobileRows.length) throw makeError('Mobile number is already registered', 409);

  const cleanEmail = email?.trim().toLowerCase() || null;
  if (cleanEmail) {
    const { rows: emailRows } = await pool.query(
      'SELECT id FROM users WHERE email = $1', [cleanEmail]
    );
    if (emailRows.length) throw makeError('Email address is already registered', 409);
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const cleanAddress = address?.trim() || null;
  const cleanCity    = city?.trim()    || null;
  const cleanState   = state?.trim()   || null;
  const cleanPincode = pincode?.trim() || null;
  const lat          = latitude  ? Number(latitude)  : null;
  const lng          = longitude ? Number(longitude) : null;

  const { rows } = await pool.query(
    `INSERT INTO users
       (name, email, mobile_number, password_hash, role, address, city, state, pincode, latitude, longitude)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING id, name, email, mobile_number, role, address, city, state, pincode, latitude, longitude`,
    [name.trim(), cleanEmail, mobile, password_hash, userRole,
     cleanAddress, cleanCity, cleanState, cleanPincode, lat, lng]
  );

  const newUser = rows[0];

  if (cleanAddress && cleanCity && cleanState && cleanPincode) {
    await pool.query(
      `INSERT INTO user_addresses
         (user_id, full_name, mobile, house_no, street, city, state, pincode, latitude, longitude, is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,TRUE)`,
      [newUser.id, name.trim(), mobile, cleanAddress, cleanAddress,
       cleanCity, cleanState, cleanPincode, lat, lng]
    );
  }

  console.log(`[Auth] New ${userRole} registered — mobile: ${mobile}`);
  return { success: true, user: newUser };
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

async function forgotPassword({ identifier }) {
  const type = detectInputType(identifier);
  if (!type) {
    throw makeError('Enter a valid email address or 10-digit mobile number', 400);
  }

  const column = type === 'email' ? 'email' : 'mobile_number';
  const value  = type === 'email'
    ? identifier.trim().toLowerCase()
    : identifier.trim();

  const { rows } = await pool.query(
    `SELECT id, name, email, mobile_number FROM users
     WHERE ${column} = $1 AND is_active = TRUE`,
    [value]
  );

  // Always return the same generic message — never reveal account existence
  const GENERIC_MSG = 'If an account exists with this information, reset instructions will be sent.';

  if (!rows.length) {
    return { success: true, method: type, message: GENERIC_MSG };
  }

  const user = rows[0];

  // Invalidate all pending tokens for this user before issuing new one
  await pool.query(
    `UPDATE password_reset_tokens SET used = TRUE
     WHERE user_id = $1 AND used = FALSE`,
    [user.id]
  );

  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

  if (type === 'email') {
    const token     = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, token, expiresAt]
    );

    const resetUrl = `${frontendUrl}/#/reset-password?token=${token}`;
    await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl });
    console.log(`[Auth] Reset email queued for user ${user.id}`);

  } else {
    const otp       = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, otp, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, otp, expiresAt]
    );

    await sendOtp({ mobile: user.mobile_number, otp, name: user.name });
    console.log(`[Auth] OTP queued for user ${user.id}`);
  }

  return { success: true, method: type, message: GENERIC_MSG };
}

// ─── Verify OTP ──────────────────────────────────────────────────────────────

async function verifyOtp({ identifier, otp }) {
  if (!identifier || !otp) throw makeError('Mobile number and OTP are required', 400);
  if (!/^\d{6}$/.test(String(otp))) throw makeError('Enter a valid 6-digit OTP', 400);

  const mobile = identifier.trim();
  if (!/^\d{10}$/.test(mobile)) throw makeError('Enter a valid 10-digit mobile number', 400);

  const { rows: userRows } = await pool.query(
    `SELECT id, name FROM users
     WHERE mobile_number = $1 AND is_active = TRUE`,
    [mobile]
  );
  if (!userRows.length) throw makeError('Incorrect OTP.', 400);
  const user = userRows[0];

  // Find latest valid OTP row for this user
  const { rows } = await pool.query(
    `SELECT id, otp, expires_at, attempts
     FROM password_reset_tokens
     WHERE user_id = $1 AND otp IS NOT NULL AND used = FALSE
     ORDER BY created_at DESC LIMIT 1`,
    [user.id]
  );

  if (!rows.length) throw makeError('No active OTP found. Please request a new one.', 400);
  const record = rows[0];

  // Check expiry
  if (new Date() > new Date(record.expires_at)) {
    await pool.query(
      `UPDATE password_reset_tokens SET used = TRUE WHERE id = $1`, [record.id]
    );
    throw makeError('OTP has expired. Please request a new one.', 400);
  }

  // Check max attempts
  if (record.attempts >= 5) {
    await pool.query(
      `UPDATE password_reset_tokens SET used = TRUE WHERE id = $1`, [record.id]
    );
    throw makeError('Too many incorrect attempts. Please request a new OTP.', 429);
  }

  // Verify OTP value
  if (record.otp !== String(otp)) {
    const { rows: updated } = await pool.query(
      `UPDATE password_reset_tokens SET attempts = attempts + 1
       WHERE id = $1 RETURNING attempts`,
      [record.id]
    );
    const remaining = Math.max(0, 5 - (updated[0]?.attempts || 1));
    throw makeError(
      `Incorrect OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      400
    );
  }

  // OTP correct — mark used, issue a short-lived reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiresAt  = new Date(Date.now() + 15 * 60 * 1000); // 15 min to complete reset

  await pool.query(
    `UPDATE password_reset_tokens SET used = TRUE WHERE id = $1`, [record.id]
  );
  await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [user.id, resetToken, expiresAt]
  );

  console.log(`[Auth] OTP verified for user ${user.id}`);
  return { success: true, resetToken };
}

// ─── Reset Password ───────────────────────────────────────────────────────────

async function resetPassword({ token, newPassword }) {
  if (!token) {
    throw makeError('Invalid or expired reset link. Please request a new one.', 400);
  }

  validatePasswordStrength(newPassword);

  const { rows } = await pool.query(
    `SELECT id, user_id, expires_at, used
     FROM password_reset_tokens
     WHERE token = $1 AND otp IS NULL`,
    [token]
  );

  if (!rows.length || rows[0].used) {
    throw makeError('Invalid or expired reset link. Please request a new one.', 400);
  }

  const record = rows[0];
  if (new Date() > new Date(record.expires_at)) {
    throw makeError('Reset link has expired. Please request a new one.', 400);
  }

  const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // Update password + set password_changed_at to invalidate all existing sessions
  await pool.query(
    `UPDATE users
     SET password_hash = $1, password_changed_at = NOW(), updated_at = NOW()
     WHERE id = $2`,
    [password_hash, record.user_id]
  );

  // Invalidate ALL pending tokens for this user
  await pool.query(
    `UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1`,
    [record.user_id]
  );

  console.log(`[Auth] Password reset for user ${record.user_id}`);
  return {
    success: true,
    message: 'Password updated successfully. Please login again.',
  };
}

// ─── Change Password (authenticated) ─────────────────────────────────────────

async function changePassword({ userId, currentPassword, newPassword }) {
  const { rows } = await pool.query(
    `SELECT id, password_hash FROM users WHERE id = $1 AND is_active = TRUE`,
    [userId]
  );
  if (!rows.length) throw makeError('User not found', 404);
  const user = rows[0];

  if (!user.password_hash) {
    throw makeError('No password set. Use Forgot Password to set one.', 400);
  }

  const currentMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!currentMatch) throw makeError('Current password is incorrect', 400);

  const sameAsOld = await bcrypt.compare(newPassword, user.password_hash);
  if (sameAsOld) throw makeError('New password must be different from your current password', 400);

  validatePasswordStrength(newPassword);

  const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await pool.query(
    `UPDATE users
     SET password_hash = $1, password_changed_at = NOW(), updated_at = NOW()
     WHERE id = $2`,
    [password_hash, userId]
  );

  console.log(`[Auth] Password changed for user ${userId}`);
  return {
    success: true,
    message: 'Password updated successfully. Please login again.',
  };
}

module.exports = {
  login,
  register,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,
};
