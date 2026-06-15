'use strict';

const bcrypt            = require('bcrypt');
const jwt               = require('jsonwebtoken');
const pool              = require('../config/db');
const otpSvc            = require('./otpService');
const notificationService = require('./notificationService');

const SALT_ROUNDS = 12;
const JWT_SECRET  = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set');
  process.exit(1);
}

const UPI_REGEX = /^[\w.\-]+@[\w]+$/;

// ─── Legacy email/password (kept for backwards compatibility) ────────────────

async function register({ name, email, password, role, phone, business_name, location, address, latitude, longitude, upi_id, upi_name, qr_code_image_url }) {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const upperRole  = role.toUpperCase();
  const isCaterer  = upperRole === 'CATERER';

  const cleanUpiId = upi_id ? upi_id.trim() : null;
  if (cleanUpiId && !UPI_REGEX.test(cleanUpiId)) {
    const err = new Error('Invalid UPI ID format (expected format: name@bank)');
    err.status = 400;
    throw err;
  }

  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, phone, business_name, location, address, latitude, longitude, upi_id, payment_name, qr_code_image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING id, name, email, role, is_active, created_at`,
    [
      name, email, password_hash, upperRole,
      phone || null,
      isCaterer ? (business_name || null) : null,
      isCaterer ? (location || address || null) : null,
      isCaterer ? (address || null) : null,
      latitude  != null ? latitude  : null,
      longitude != null ? longitude : null,
      isCaterer ? (cleanUpiId || null)        : null,
      isCaterer ? (upi_name?.trim() || null)  : null,
      isCaterer ? (qr_code_image_url || null) : null,
    ]
  );

  return rows[0];
}

async function login({ email, password }) {
  const { rows } = await pool.query(
    'SELECT id, name, email, password_hash, role, is_active, latitude, longitude FROM users WHERE email = $1',
    [email]
  );

  const user = rows[0];
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  if (!user.is_active) {
    const err = new Error('Account is deactivated');
    err.status = 403;
    throw err;
  }

  if (!user.password_hash) {
    const err = new Error('This account uses mobile OTP login. Please use the mobile number login flow.');
    err.status = 400;
    throw err;
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  return {
    token,
    user: {
      id: user.id, name: user.name, email: user.email, role: user.role,
      latitude: user.latitude, longitude: user.longitude,
    },
  };
}

// ─── Mobile OTP authentication ───────────────────────────────────────────────

async function sendOtp(mobileNumber) {
  // Rate-limit: max MAX_RESENDS_PER_HOUR sends per number per hour
  const { rows: rateRows } = await pool.query(
    `SELECT COUNT(*) AS cnt FROM otp_verifications
     WHERE mobile_number = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
    [mobileNumber]
  );
  if (parseInt(rateRows[0].cnt, 10) >= otpSvc.MAX_RESENDS_PER_HOUR) {
    const err = new Error('Too many OTP requests. Please wait before requesting again.');
    err.status = 429;
    throw err;
  }

  // Invalidate any previously un-verified OTPs for this number
  await pool.query(
    `UPDATE otp_verifications SET is_verified = TRUE
     WHERE mobile_number = $1 AND is_verified = FALSE`,
    [mobileNumber]
  );

  const otp       = otpSvc.generateOtp();
  const otpHash   = otpSvc.hashOtp(otp, mobileNumber);
  const expiresAt = new Date(Date.now() + otpSvc.OTP_EXPIRY_MINUTES * 60 * 1000);

  await pool.query(
    `INSERT INTO otp_verifications (mobile_number, otp_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [mobileNumber, otpHash, expiresAt]
  );

  // Deliver OTP via SMS (Fast2SMS in prod, console.log in dev)
  await notificationService.sendOtp(mobileNumber, otp);
  console.log(`[AuthService] OTP generated for ${mobileNumber}`);
  return { success: true, message: 'OTP sent successfully' };
}

async function verifyOtp(mobileNumber, otp) {
  // Fetch the latest active (unverified) OTP for this number
  const { rows } = await pool.query(
    `SELECT id, otp_hash, expires_at, attempt_count FROM otp_verifications
     WHERE mobile_number = $1 AND is_verified = FALSE
     ORDER BY created_at DESC LIMIT 1`,
    [mobileNumber]
  );

  if (!rows.length) {
    const err = new Error('No active OTP found. Please request a new OTP.');
    err.status = 400;
    throw err;
  }

  const record = rows[0];

  if (new Date() > new Date(record.expires_at)) {
    const err = new Error('OTP has expired. Please request a new OTP.');
    err.status = 400;
    throw err;
  }

  if (record.attempt_count >= otpSvc.MAX_ATTEMPTS) {
    const err = new Error('Too many incorrect attempts. Please request a new OTP.');
    err.status = 400;
    throw err;
  }

  // Increment attempt counter before checking — prevents racing a brute-force window
  await pool.query(
    `UPDATE otp_verifications SET attempt_count = attempt_count + 1 WHERE id = $1`,
    [record.id]
  );

  if (!otpSvc.verifyOtpHash(otp, mobileNumber, record.otp_hash)) {
    const left = otpSvc.MAX_ATTEMPTS - record.attempt_count - 1;
    const err  = new Error(`Invalid OTP. ${left} attempt${left !== 1 ? 's' : ''} remaining.`);
    err.status = 400;
    throw err;
  }

  // Mark OTP as used
  await pool.query(
    `UPDATE otp_verifications SET is_verified = TRUE WHERE id = $1`,
    [record.id]
  );
  console.log(`[AuthService] OTP verified for ${mobileNumber}`);

  // Find or auto-create user
  const { rows: userRows } = await pool.query(
    `SELECT id, name, email, role, mobile_number, is_active
     FROM users WHERE mobile_number = $1`,
    [mobileNumber]
  );

  let user;
  if (!userRows.length) {
    // New user: auto-create with CUSTOMER role
    const { rows: created } = await pool.query(
      `INSERT INTO users (mobile_number, role, name)
       VALUES ($1, 'CUSTOMER', $2)
       RETURNING id, name, email, role, mobile_number`,
      [mobileNumber, `User ${mobileNumber.slice(-4)}`]
    );
    user = created[0];
  } else {
    user = userRows[0];
    if (!user.is_active) {
      const err = new Error('Account is deactivated. Please contact support.');
      err.status = 403;
      throw err;
    }
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, mobile: user.mobile_number },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  return {
    token,
    role: user.role,
    user: {
      id:            user.id,
      name:          user.name,
      email:         user.email   || null,
      role:          user.role,
      mobile_number: user.mobile_number,
    },
  };
}

module.exports = { register, login, sendOtp, verifyOtp };
