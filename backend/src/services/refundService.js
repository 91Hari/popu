'use strict';

const { randomUUID } = require('crypto');
const pool           = require('../config/db');
const phonePe        = require('./phonePeService');

function generateMerchantRefundId() {
  return `REFUND_${randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase()}`;
}

/**
 * Initiate a refund for a caterer sub-order.
 * Called after caterer cancels an order that was paid via PhonePe.
 * Idempotent: if a refund already exists for this caterer_order_id, returns it.
 */
async function initiateRefund({ paymentId, merchantOrderId, catererOrderId, masterOrderId, refundAmount, reason }) {
  // Idempotency: one refund per caterer order
  const { rows: existing } = await pool.query(
    `SELECT * FROM refunds WHERE caterer_order_id = $1`,
    [catererOrderId]
  );
  if (existing.length) return existing[0];

  const merchantRefundId = generateMerchantRefundId();
  const amountInPaise    = Math.round(refundAmount * 100);

  // Create refund record first
  const { rows } = await pool.query(
    `INSERT INTO refunds
       (payment_id, master_order_id, caterer_order_id, merchant_refund_id, refund_amount, refund_reason)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [paymentId, masterOrderId, catererOrderId, merchantRefundId, refundAmount, reason || null]
  );
  const refund = rows[0];

  // Call PhonePe refund API
  try {
    const phonepeRes = await phonePe.createRefund({
      originalMerchantOrderId: merchantOrderId,
      merchantRefundId,
      amountInPaise,
    });

    const { rows: updated } = await pool.query(
      `UPDATE refunds
       SET refund_status    = 'PROCESSING',
           phonepe_refund_id = $1,
           refund_response   = $2,
           updated_at        = NOW()
       WHERE id = $3 RETURNING *`,
      [phonepeRes.refundId || merchantRefundId, JSON.stringify(phonepeRes), refund.id]
    );
    return updated[0];
  } catch (err) {
    console.error('[RefundService] PhonePe refund API failed:', err.message);
    const { rows: failed } = await pool.query(
      `UPDATE refunds
       SET refund_status  = 'FAILED',
           refund_response = $1,
           updated_at      = NOW()
       WHERE id = $2 RETURNING *`,
      [JSON.stringify({ error: err.message }), refund.id]
    );
    return failed[0];
  }
}

/** List all refunds (admin) */
async function getRefunds({ page = 1, limit = 20, status } = {}) {
  const offset     = (page - 1) * limit;
  const conditions = [];
  const params     = [];

  if (status) { conditions.push(`r.refund_status = $${params.length + 1}`); params.push(status); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit, offset);

  const { rows } = await pool.query(
    `SELECT r.*,
            p.merchant_transaction_id,
            u.name  AS customer_name,
            u.email AS customer_email
     FROM refunds r
     JOIN payments p ON p.id = r.payment_id
     JOIN users u ON u.id = p.customer_id
     ${where}
     ORDER BY r.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const countParams = status ? [status] : [];
  const { rows: cnt } = await pool.query(
    `SELECT COUNT(*) FROM refunds r ${where}`,
    countParams
  );

  return { refunds: rows, total: parseInt(cnt[0].count, 10), page, limit };
}

module.exports = { initiateRefund, getRefunds };
