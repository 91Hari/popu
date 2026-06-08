const pool = require('../config/db');

async function recordAudit({ entity_type, entity_id, action, performed_by, details }) {
  try {
    await pool.query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, performed_by, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [entity_type, entity_id, action, performed_by || null, details ? JSON.stringify(details) : null]
    );
  } catch (err) {
    console.error('[AuditService] Failed to record audit:', err.message);
  }
}

async function getAuditLogs({ entity_type, entity_id, limit = 50, offset = 0 }) {
  const { rows } = await pool.query(
    `SELECT al.*, u.name AS performed_by_name
     FROM audit_logs al
     LEFT JOIN users u ON u.id = al.performed_by
     WHERE al.entity_type = $1 AND al.entity_id = $2
     ORDER BY al.created_at DESC
     LIMIT $3 OFFSET $4`,
    [entity_type, entity_id, limit, offset]
  );
  return rows;
}

module.exports = { recordAudit, getAuditLogs };
