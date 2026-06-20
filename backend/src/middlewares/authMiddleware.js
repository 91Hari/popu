const jwt  = require('jsonwebtoken');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET;

async function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    // Verify account is still active and token wasn't issued before a password change
    const { rows } = await pool.query(
      'SELECT is_active, is_deleted, password_changed_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (!rows[0] || !rows[0].is_active || rows[0].is_deleted) {
      return res.status(401).json({ error: 'Account is no longer active.' });
    }

    // Invalidate sessions issued before the last password change
    if (rows[0].password_changed_at) {
      const changedAtSec = Math.floor(new Date(rows[0].password_changed_at).getTime() / 1000);
      if (decoded.iat < changedAtSec) {
        return res.status(401).json({
          error: 'Session expired due to password change. Please login again.',
        });
      }
    }

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    next(err);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
