'use strict';

const pool = require('../config/db');

async function getAvailability(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT availability_status FROM users WHERE id = $1 AND role = 'CATERER'`,
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Caterer not found' });
    res.json({ availability_status: rows[0].availability_status });
  } catch (err) { next(err); }
}

async function setAvailability(req, res, next) {
  try {
    const { status } = req.body;
    if (!['READY', 'NOT_READY'].includes(status)) {
      return res.status(400).json({ error: 'status must be READY or NOT_READY' });
    }
    const { rows } = await pool.query(
      `UPDATE users SET availability_status = $1 WHERE id = $2 AND role = 'CATERER' RETURNING availability_status`,
      [status, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Caterer not found' });
    res.json({ availability_status: rows[0].availability_status });
  } catch (err) { next(err); }
}

module.exports = { getAvailability, setAvailability };
