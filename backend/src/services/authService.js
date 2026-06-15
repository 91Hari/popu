'use strict';

const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const pool   = require('../config/db');

const SALT_ROUNDS = 12;
const JWT_SECRET  = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set');
  process.exit(1);
}

// In-memory password reset tokens — single instance only.
// Multi-instance deployments: move to a database table with expiry.
const resetTokens = new Map();

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
}

function detectInputType(username) {
  if (!username) return null;
  const trimmed = username.trim();
  if (trimmed.includes('@')) return 'email';
  if (/^\d{10}$/.test(trimmed)) return 'mobile';
  return null;
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
    `SELECT id, name, email, mobile_number, password_hash, role, is_active
     FROM users WHERE ${column} = $1`,
    [value]
  );

  const user = rows[0];
  if (!user) throw makeError('Invalid credentials', 401);

  if (!user.is_active) {
    throw makeError('Account is deactivated. Please contact support.', 403);
  }

  if (!user.password_hash) {
    throw makeError(
      'No password is set for this account. Use Forgot Password to set one.',
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

async function register({ name, mobileNumber, email, password }) {
  if (!name?.trim()) throw makeError('Name is required', 400);
  if (!mobileNumber || !/^\d{10}$/.test(String(mobileNumber).trim())) {
    throw makeError('A valid 10-digit mobile number is required', 400);
  }

  validatePasswordStrength(password);

  const mobile = String(mobileNumber).trim();

  const { rows: mobileRows } = await pool.query(
    'SELECT id FROM users WHERE mobile_number = $1',
    [mobile]
  );
  if (mobileRows.length) throw makeError('Mobile number is already registered', 409);

  const cleanEmail = email?.trim().toLowerCase() || null;
  if (cleanEmail) {
    const { rows: emailRows } = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [cleanEmail]
    );
    if (emailRows.length) throw makeError('Email address is already registered', 409);
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const { rows } = await pool.query(
    `INSERT INTO users (name, email, mobile_number, password_hash, role)
     VALUES ($1, $2, $3, $4, 'CUSTOMER')
     RETURNING id, name, email, mobile_number, role`,
    [name.trim(), cleanEmail, mobile, password_hash]
  );

  console.log(`[Auth] New CUSTOMER registered — mobile: ${mobile}`);
  return { success: true, user: rows[0] };
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

async function forgotPassword({ username }) {
  const type = detectInputType(username);
  if (!type) throw makeError('Enter a valid email address or 10-digit mobile number', 400);

  const column = type === 'email' ? 'email' : 'mobile_number';
  const value  = type === 'email'
    ? username.trim().toLowerCase()
    : username.trim();

  const { rows } = await pool.query(
    `SELECT id, name, email, mobile_number FROM users WHERE ${column} = $1`,
    [value]
  );

  // Always succeed — do not reveal whether the account exists
  if (!rows.length) {
    return { success: true, message: 'If an account exists, a reset link has been sent.' };
  }

  const user      = rows[0];
  const token     = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
  resetTokens.set(token, { userId: user.id, expiresAt });

  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  const resetUrl    = `${frontendUrl}/reset-password?token=${token}`;

  // Log to console — replace with email/SMS delivery in production
  console.log('\n🔑 [Password Reset]');
  console.log(`   User     : ${user.name} (${user.email || user.mobile_number})`);
  console.log(`   Reset URL: ${resetUrl}`);
  console.log(`   Expires  : ${new Date(expiresAt).toISOString()}\n`);

  return { success: true, message: 'If an account exists, a reset link has been sent.' };
}

// ─── Reset Password ───────────────────────────────────────────────────────────

async function resetPassword({ token, newPassword }) {
  const record = resetTokens.get(token);
  if (!record || Date.now() > record.expiresAt) {
    throw makeError('Invalid or expired reset link. Please request a new one.', 400);
  }

  validatePasswordStrength(newPassword);

  const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await pool.query(
    'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [password_hash, record.userId]
  );

  resetTokens.delete(token);
  console.log(`[Auth] Password reset for user ${record.userId}`);

  return { success: true, message: 'Password reset successfully. Please log in.' };
}

module.exports = { login, register, forgotPassword, resetPassword };
