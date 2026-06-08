const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const SALT_ROUNDS = 12;
const JWT_SECRET  = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set');
  process.exit(1);
}

async function register({ name, email, password, role, business_name, address, latitude, longitude }) {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const upperRole  = role.toUpperCase();
  const isCaterer  = upperRole === 'CATERER';

  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, business_name, location, address, latitude, longitude)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, name, email, role, is_active, created_at`,
    [
      name, email, password_hash, upperRole,
      isCaterer ? (business_name || null) : null,
      isCaterer ? (address || null) : null,
      isCaterer ? (address || null) : null,
      isCaterer ? (latitude  != null ? latitude  : null) : null,
      isCaterer ? (longitude != null ? longitude : null) : null,
    ]
  );

  return rows[0];
}

async function login({ email, password }) {
  const { rows } = await pool.query(
    'SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = $1',
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
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

module.exports = { register, login };
