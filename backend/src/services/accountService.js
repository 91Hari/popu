'use strict';

const pool = require('../config/db');

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function auditLog(userId, action, performedBy, reason, metadata) {
  await pool.query(
    `INSERT INTO account_audit_log (user_id, action, performed_by, reason, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, action, performedBy || null, reason || null,
     metadata ? JSON.stringify(metadata) : null]
  );
}

async function validateCanDelete(userId, role) {
  if (role === 'CUSTOMER') {
    const { rows } = await pool.query(
      `SELECT COUNT(*) AS cnt
       FROM caterer_orders co
       JOIN master_orders mo ON mo.id = co.master_order_id
       WHERE mo.customer_id = $1
         AND co.status NOT IN ('DELIVERED', 'CANCELLED')`,
      [userId]
    );
    if (parseInt(rows[0].cnt) > 0) {
      throw makeError(
        'You have active orders. Wait for all orders to be delivered or cancelled before deleting your account.',
        400
      );
    }
  }

  if (role === 'RIDER') {
    const { rows } = await pool.query(
      `SELECT COUNT(*) AS cnt FROM caterer_orders
       WHERE rider_id = $1 AND status IN ('ASSIGNED_TO_RIDER', 'OUT_FOR_DELIVERY')`,
      [userId]
    );
    if (parseInt(rows[0].cnt) > 0) {
      throw makeError(
        'You have active deliveries in progress. Complete all deliveries before deleting your account.',
        400
      );
    }
  }

  if (role === 'CATERER') {
    const { rows } = await pool.query(
      `SELECT COUNT(*) AS cnt FROM caterer_orders
       WHERE caterer_id = $1 AND status NOT IN ('DELIVERED', 'CANCELLED')`,
      [userId]
    );
    if (parseInt(rows[0].cnt) > 0) {
      throw makeError(
        'You have active orders pending. All orders must be completed or cancelled before requesting closure.',
        400
      );
    }
  }
}

// Customer / Rider: immediate soft delete
async function requestDelete(userId, role) {
  role = role.toUpperCase();
  if (!['CUSTOMER', 'RIDER'].includes(role)) {
    throw makeError('Caterers must request account closure, not deletion.', 403);
  }

  const { rows } = await pool.query(
    'SELECT is_deleted FROM users WHERE id = $1',
    [userId]
  );
  if (!rows[0]) throw makeError('User not found', 404);
  if (rows[0].is_deleted) throw makeError('Account is already deleted.', 400);

  await validateCanDelete(userId, role);

  await pool.query(
    `UPDATE users
     SET is_deleted = TRUE, deleted_at = NOW(), is_active = FALSE,
         deletion_requested_at = NOW(), deleted_by = $1,
         deletion_reason = 'Self-requested deletion'
     WHERE id = $1`,
    [userId]
  );

  await auditLog(userId, 'DELETION_SELF', userId, 'User self-requested deletion', { role });
  return { success: true, message: 'Your account has been deleted. You will be logged out.' };
}

// Caterer: submit closure request for admin approval
async function requestClosure(userId, reason) {
  const { rows } = await pool.query(
    'SELECT role, is_deleted FROM users WHERE id = $1',
    [userId]
  );
  const user = rows[0];
  if (!user) throw makeError('User not found', 404);
  if (user.role !== 'CATERER') throw makeError('Only caterers can request account closure.', 403);
  if (user.is_deleted) throw makeError('Account is already deleted.', 400);

  const { rows: existing } = await pool.query(
    `SELECT id FROM account_deletion_requests
     WHERE user_id = $1 AND status = 'PENDING'`,
    [userId]
  );
  if (existing.length > 0) {
    throw makeError('You already have a pending closure request. Please wait for admin review.', 400);
  }

  await validateCanDelete(userId, 'CATERER');

  await pool.query(
    `INSERT INTO account_deletion_requests (user_id, request_type, status, reason)
     VALUES ($1, 'CLOSURE', 'PENDING', $2)`,
    [userId, reason || null]
  );
  await pool.query(
    'UPDATE users SET deletion_requested_at = NOW() WHERE id = $1',
    [userId]
  );

  await auditLog(userId, 'CLOSURE_REQUESTED', userId, reason || 'Caterer requested account closure');
  return { success: true, message: 'Closure request submitted. Admin will review within 2–3 business days.' };
}

// Admin: list caterer closure requests
async function getAccountRequests({ page = 1, limit = 20, status } = {}) {
  const offset = (page - 1) * limit;
  const extra  = status ? 'AND adr.status = $3' : '';
  const params = status ? [limit, offset, status] : [limit, offset];

  const { rows } = await pool.query(
    `SELECT
       adr.id, adr.status, adr.reason, adr.requested_at, adr.reviewed_at, adr.review_notes,
       u.id AS user_id, u.name AS user_name, u.email, u.mobile_number, u.role,
       ru.name AS reviewed_by_name
     FROM account_deletion_requests adr
     JOIN users u   ON u.id = adr.user_id
     LEFT JOIN users ru ON ru.id = adr.reviewed_by
     WHERE 1=1 ${extra}
     ORDER BY adr.requested_at DESC
     LIMIT $1 OFFSET $2`,
    params
  );
  return rows;
}

// Admin: list deleted users
async function getDeletedUsers({ page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(
    `SELECT id, name, email, mobile_number, role, deleted_at, anonymized_at, deletion_reason
     FROM users
     WHERE is_deleted = TRUE
     ORDER BY deleted_at DESC NULLS LAST
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return rows;
}

// Admin: approve caterer closure → soft-delete immediately
async function approveClosure(requestId, adminId) {
  const { rows } = await pool.query(
    `SELECT adr.*, u.role FROM account_deletion_requests adr
     JOIN users u ON u.id = adr.user_id WHERE adr.id = $1`,
    [requestId]
  );
  const req = rows[0];
  if (!req) throw makeError('Request not found', 404);
  if (req.status !== 'PENDING') throw makeError(`Request is already ${req.status.toLowerCase()}.`, 400);

  await pool.query('BEGIN');
  try {
    await pool.query(
      `UPDATE account_deletion_requests
       SET status = 'APPROVED', reviewed_at = NOW(), reviewed_by = $1
       WHERE id = $2`,
      [adminId, requestId]
    );
    await pool.query(
      `UPDATE users
       SET is_deleted = TRUE, deleted_at = NOW(), is_active = FALSE,
           deleted_by = $1, deletion_reason = 'Admin approved caterer closure'
       WHERE id = $2`,
      [adminId, req.user_id]
    );
    await pool.query('COMMIT');
  } catch (err) {
    await pool.query('ROLLBACK');
    throw err;
  }

  await auditLog(req.user_id, 'CLOSURE_APPROVED', adminId, 'Admin approved account closure');
  return { success: true, message: 'Account closure approved and account deactivated.' };
}

// Admin: reject caterer closure request
async function rejectClosure(requestId, adminId, notes) {
  const { rows } = await pool.query(
    'SELECT id, user_id, status FROM account_deletion_requests WHERE id = $1',
    [requestId]
  );
  const req = rows[0];
  if (!req) throw makeError('Request not found', 404);
  if (req.status !== 'PENDING') throw makeError(`Request is already ${req.status.toLowerCase()}.`, 400);

  await pool.query(
    `UPDATE account_deletion_requests
     SET status = 'REJECTED', reviewed_at = NOW(), reviewed_by = $1, review_notes = $2
     WHERE id = $3`,
    [adminId, notes || null, requestId]
  );
  await pool.query(
    'UPDATE users SET deletion_requested_at = NULL WHERE id = $1',
    [req.user_id]
  );

  await auditLog(req.user_id, 'CLOSURE_REJECTED', adminId, notes || 'Admin rejected closure request');
  return { success: true, message: 'Closure request rejected.' };
}

// Admin: restore a deleted account (only if not yet anonymized)
async function restoreAccount(userId, adminId) {
  const { rows } = await pool.query(
    'SELECT id, is_deleted, anonymized_at FROM users WHERE id = $1',
    [userId]
  );
  const user = rows[0];
  if (!user) throw makeError('User not found', 404);
  if (!user.is_deleted) throw makeError('Account is not deleted.', 400);
  if (user.anonymized_at) throw makeError('Account has been anonymized and cannot be restored.', 400);

  await pool.query(
    `UPDATE users
     SET is_deleted = FALSE, deleted_at = NULL, is_active = TRUE,
         deletion_requested_at = NULL, deleted_by = NULL, deletion_reason = NULL
     WHERE id = $1`,
    [userId]
  );
  await pool.query(
    `UPDATE account_deletion_requests
     SET status = 'REJECTED', reviewed_by = $1, reviewed_at = NOW(),
         review_notes = 'Account restored by admin'
     WHERE user_id = $2 AND status = 'PENDING'`,
    [adminId, userId]
  );

  await auditLog(userId, 'ACCOUNT_RESTORED', adminId, 'Account restored by admin');
  return { success: true, message: 'Account has been restored.' };
}

// Admin: anonymize all accounts past 30-day retention window
async function runAnonymization() {
  const { rows } = await pool.query(
    `SELECT id FROM users
     WHERE is_deleted = TRUE
       AND deleted_at < NOW() - INTERVAL '30 days'
       AND anonymized_at IS NULL`
  );

  let count = 0;
  for (const u of rows) {
    await pool.query(
      `UPDATE users SET
         name          = 'Deleted User',
         email         = 'deleted_' || id || '@removed.local',
         mobile_number = NULL,
         address       = NULL, city = NULL, state = NULL, pincode = NULL,
         latitude      = NULL, longitude = NULL,
         anonymized_at = NOW()
       WHERE id = $1`,
      [u.id]
    );
    await auditLog(u.id, 'ACCOUNT_ANONYMIZED', null, '30-day retention period expired');
    count++;
  }

  return { success: true, anonymized: count };
}

module.exports = {
  requestDelete,
  requestClosure,
  getAccountRequests,
  getDeletedUsers,
  approveClosure,
  rejectClosure,
  restoreAccount,
  runAnonymization,
};
