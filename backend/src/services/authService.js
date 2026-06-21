'use strict';

const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const pool    = require('../config/db');
const { sendPasswordResetEmail } = require('./emailService');

const SALT_ROUNDS = 12;
const JWT_SECRET  = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set');
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

// ── Login ─────────────────────────────────────────────────────────────────────

async function login({ username, password }) {
  if (!username) throw makeError('Email or mobile number is required', 400);

  const v = username.trim();
  const isEmail  = v.includes('@');
  const isMobile = /^\d{10}$/.test(v);

  if (!isEmail && !isMobile)
    throw makeError('Enter a valid email address or 10-digit mobile number', 400);

  const column = isEmail ? 'email' : 'mobile_number';
  const value  = isEmail ? v.toLowerCase() : v;

  const { rows } = await pool.query(
    `SELECT id, name, email, mobile_number, password_hash, role, is_active, is_deleted
     FROM users WHERE ${column} = $1`,
    [value]
  );

  const user = rows[0];
  if (!user)            throw makeError('Invalid credentials', 401);
  if (user.is_deleted)  throw makeError('This account has been deleted.', 403);
  if (!user.is_active)  throw makeError('Account is deactivated. Please contact support.', 403);
  if (!user.password_hash)
    throw makeError('No password set. Use Forgot Password to set one.', 400);

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw makeError('Invalid credentials', 401);

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email, mobile: user.mobile_number },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  console.log(`[Auth] Login — ${user.role} ${user.id} via ${isEmail ? 'email' : 'mobile'}`);

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

// ── Register ──────────────────────────────────────────────────────────────────

async function register({
  name, mobileNumber, email, password, role,
  address, city, state, pincode, latitude, longitude,
}) {
  if (!name?.trim()) throw makeError('Name is required', 400);
  if (!mobileNumber || !/^\d{10}$/.test(String(mobileNumber).trim()))
    throw makeError('A valid 10-digit mobile number is required', 400);

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

// ── Forgot Password (email-only) ──────────────────────────────────────────────

async function forgotPassword({ email }) {
  // Always return the same message — never reveal whether the account exists
  const GENERIC_MSG = 'If an account exists with this email address, password reset instructions have been sent.';

  if (!email || !email.trim().includes('@'))
    throw makeError('Enter a valid email address', 400);

  const cleanEmail = email.trim().toLowerCase();

  const { rows } = await pool.query(
    `SELECT id, name, email FROM users
     WHERE email = $1 AND is_active = TRUE AND is_deleted = FALSE`,
    [cleanEmail]
  );

  if (!rows.length) {
    // Do not reveal that account doesn't exist
    console.log(`[Auth] Forgot password: no account for ${cleanEmail}`);
    return { success: true, message: GENERIC_MSG };
  }

  const user = rows[0];

  // Invalidate all pending tokens for this user before issuing a new one
  await pool.query(
    `UPDATE password_reset_tokens SET used = TRUE
     WHERE user_id = $1 AND used = FALSE`,
    [user.id]
  );

  // Generate raw token (sent in email) and store only the SHA-256 hash
  const rawToken   = crypto.randomBytes(32).toString('hex');
  const tokenHash  = hashToken(rawToken);
  const expiresAt  = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [user.id, tokenHash, expiresAt]
  );

  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  const resetUrl    = `${frontendUrl}/#/reset-password?token=${rawToken}`;

  // Fire and forget — email failure must not crash this endpoint
  sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl })
    .catch((err) => console.error('[Auth] Unexpected email error:', err.message));

  console.log(`[Auth] Password reset email queued for user ${user.id}`);
  return { success: true, message: GENERIC_MSG };
}

// ── Reset Password ────────────────────────────────────────────────────────────

async function resetPassword({ token, newPassword }) {
  if (!token)
    throw makeError('Invalid or expired reset link. Please request a new one.', 400);

  validatePasswordStrength(newPassword);

  const tokenHash = hashToken(token);

  const { rows } = await pool.query(
    `SELECT id, user_id, expires_at, used
     FROM password_reset_tokens
     WHERE token_hash = $1`,
    [tokenHash]
  );

  if (!rows.length || rows[0].used)
    throw makeError('Invalid or expired reset link. Please request a new one.', 400);

  if (new Date() > new Date(rows[0].expires_at))
    throw makeError('This reset link has expired. Please request a new one.', 400);

  const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // Update password + set password_changed_at to invalidate all existing sessions
  await pool.query(
    `UPDATE users
     SET password_hash = $1, password_changed_at = NOW(), updated_at = NOW()
     WHERE id = $2`,
    [password_hash, rows[0].user_id]
  );

  // Mark token as used (single-use)
  await pool.query(
    `UPDATE password_reset_tokens SET used = TRUE WHERE id = $1`,
    [rows[0].id]
  );

  // Invalidate all other pending tokens for this user
  await pool.query(
    `UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1`,
    [rows[0].user_id]
  );

  console.log(`[Auth] Password reset completed for user ${rows[0].user_id}`);
  return {
    success: true,
    message: 'Password updated successfully. Please login with your new password.',
  };
}

// ── Change Password (authenticated) ──────────────────────────────────────────

async function changePassword({ userId, currentPassword, newPassword }) {
  const { rows } = await pool.query(
    `SELECT id, password_hash FROM users WHERE id = $1 AND is_active = TRUE`,
    [userId]
  );
  if (!rows.length) throw makeError('User not found', 404);

  if (!rows[0].password_hash)
    throw makeError('No password set. Use Forgot Password to set one.', 400);

  const currentMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!currentMatch) throw makeError('Current password is incorrect', 400);

  const sameAsOld = await bcrypt.compare(newPassword, rows[0].password_hash);
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

module.exports = { login, register, forgotPassword, resetPassword, changePassword };
