'use strict';

const paymentProofService = require('../services/paymentProofService');

async function submitProof(req, res, next) {
  try {
    const { caterer_order_id, payment_screenshot_url, upi_reference } = req.body;
    if (!caterer_order_id || !payment_screenshot_url) {
      return res.status(400).json({ error: 'caterer_order_id and payment_screenshot_url are required' });
    }
    const proof = await paymentProofService.submitProof({
      customer_id:            req.user.id,
      caterer_order_id,
      payment_screenshot_url,
      upi_reference,
    });
    res.status(201).json({ proof });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function reviewProof(req, res, next) {
  try {
    const { status, rejection_reason } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });
    const proof = await paymentProofService.reviewProof(
      req.params.id, { status, rejection_reason }, req.user.id
    );
    res.json({ proof });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function getProofsForCaterer(req, res, next) {
  try {
    const proofs = await paymentProofService.getProofsForCaterer(req.user.id);
    res.json({ proofs });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function getProofsForCustomer(req, res, next) {
  try {
    const proofs = await paymentProofService.getProofsForCustomer(req.user.id);
    res.json({ proofs });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = { submitProof, reviewProof, getProofsForCaterer, getProofsForCustomer };
