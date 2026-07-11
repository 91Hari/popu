'use strict';

const razorpayService = require('../services/razorpayService');

/**
 * POST /api/razorpay/create-order
 * Body: { amount_paise: number, receipt?: string }
 * Returns: { order_id, amount, currency }
 */
async function createOrder(req, res) {
  try {
    const { amount_paise, receipt } = req.body;

    if (!amount_paise || typeof amount_paise !== 'number') {
      return res.status(400).json({ error: 'amount_paise is required and must be a number.' });
    }

    const order = await razorpayService.createOrder(amount_paise, receipt);
    return res.json(order);
  } catch (err) {
    const status = err.status || 500;
    console.error('[razorpay] create-order error:', err.message || err);
    return res.status(status).json({ error: err.message || 'Failed to create Razorpay order.' });
  }
}

/**
 * POST /api/razorpay/verify
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * Returns: { verified: true } or 400
 */
function verifyPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.' });
    }

    const valid = razorpayService.verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!valid) {
      return res.status(400).json({ error: 'Payment verification failed. Invalid signature.' });
    }

    return res.json({ verified: true, payment_id: razorpay_payment_id });
  } catch (err) {
    console.error('[razorpay] verify error:', err.message || err);
    return res.status(500).json({ error: 'Payment verification failed.' });
  }
}

module.exports = { createOrder, verifyPayment };
