'use strict';

const pool = require('../config/db');

async function submitProof({ customer_id, caterer_order_id, payment_screenshot_url, upi_reference }) {
  const { rows } = await pool.query(
    `SELECT co.caterer_id, co.subtotal, co.master_order_id, mo.customer_id AS order_customer_id
     FROM caterer_orders co
     JOIN master_orders mo ON mo.id = co.master_order_id
     WHERE co.id = $1`,
    [caterer_order_id]
  );
  const catererOrder = rows[0];
  if (!catererOrder) { const e = new Error('Caterer order not found'); e.status = 404; throw e; }
  if (catererOrder.order_customer_id !== customer_id) { const e = new Error('Forbidden'); e.status = 403; throw e; }

  const { rows: proofRows } = await pool.query(
    `INSERT INTO payment_proofs
       (master_order_id, caterer_order_id, customer_id, caterer_id, amount,
        payment_screenshot_url, upi_reference, payment_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING_REVIEW')
     ON CONFLICT (caterer_order_id) DO UPDATE SET
       payment_screenshot_url = EXCLUDED.payment_screenshot_url,
       upi_reference          = EXCLUDED.upi_reference,
       payment_status         = 'PENDING_REVIEW',
       rejection_reason       = NULL,
       uploaded_at            = NOW()
     RETURNING *`,
    [catererOrder.master_order_id, caterer_order_id, customer_id, catererOrder.caterer_id,
     catererOrder.subtotal, payment_screenshot_url, upi_reference || null]
  );

  await pool.query(
    `UPDATE caterer_orders SET payment_status = 'PROOF_SUBMITTED' WHERE id = $1`,
    [caterer_order_id]
  );

  return proofRows[0];
}

const VALID_REVIEW_STATUSES = ['APPROVED', 'REJECTED', 'REUPLOAD_REQUESTED'];

async function reviewProof(id, { status, rejection_reason }, caterer_id) {
  if (!VALID_REVIEW_STATUSES.includes(status)) {
    const e = new Error(`Status must be one of: ${VALID_REVIEW_STATUSES.join(', ')}`);
    e.status = 400; throw e;
  }

  const { rows } = await pool.query(`SELECT * FROM payment_proofs WHERE id = $1`, [id]);
  const proof = rows[0];
  if (!proof) { const e = new Error('Payment proof not found'); e.status = 404; throw e; }
  if (proof.caterer_id !== caterer_id) { const e = new Error('Forbidden'); e.status = 403; throw e; }

  const { rows: updated } = await pool.query(
    `UPDATE payment_proofs
     SET payment_status = $1, rejection_reason = $2, reviewed_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [status, rejection_reason || null, id]
  );

  const coStatus = status === 'APPROVED' ? 'APPROVED'
    : status === 'REJECTED' ? 'REJECTED'
    : 'REUPLOAD_REQUESTED';
  await pool.query(
    `UPDATE caterer_orders SET payment_status = $1 WHERE id = $2`,
    [coStatus, proof.caterer_order_id]
  );

  return updated[0];
}

async function getProofsForCaterer(caterer_id) {
  const { rows } = await pool.query(
    `SELECT pp.*, u.name AS customer_name, u.email AS customer_email
     FROM payment_proofs pp
     JOIN users u ON u.id = pp.customer_id
     WHERE pp.caterer_id = $1
     ORDER BY pp.uploaded_at DESC`,
    [caterer_id]
  );
  return rows;
}

async function getProofsForCustomer(customer_id) {
  const { rows } = await pool.query(
    `SELECT pp.*, cu.name AS caterer_name
     FROM payment_proofs pp
     JOIN users cu ON cu.id = pp.caterer_id
     WHERE pp.customer_id = $1
     ORDER BY pp.uploaded_at DESC`,
    [customer_id]
  );
  return rows;
}

module.exports = { submitProof, reviewProof, getProofsForCaterer, getProofsForCustomer };
