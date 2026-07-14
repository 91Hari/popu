'use strict';

const Razorpay = require('razorpay');
const crypto   = require('crypto');

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw Object.assign(
      new Error('Razorpay credentials not configured.'),
      { status: 500 }
    );
  }
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

/**
 * Create a Razorpay order.
 * @param {number} amountInPaise  >= 100 (₹1 minimum)
 * @param {string} receipt        Optional receipt label
 * @param {string} serviceType    'FOOD' | 'LUNCH_BOX' | 'CATERING'
 */
async function createOrder(amountInPaise, receipt, serviceType = 'FOOD') {
  if (!amountInPaise || amountInPaise < 100) {
    throw Object.assign(new Error('Amount must be at least ₹1 (100 paise).'), { status: 400 });
  }
  const instance = getRazorpay();
  const order = await instance.orders.create({
    amount:   Math.round(amountInPaise),
    currency: 'INR',
    receipt:  receipt || `rcpt_${Date.now()}`,
    notes:    { service_type: serviceType },
  });
  return { order_id: order.id, amount: order.amount, currency: order.currency };
}

/**
 * Verify HMAC-SHA256 signature returned by Razorpay after payment.
 * Uses constant-time comparison to prevent timing attacks.
 */
function verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) return false;
  const payload  = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected,              'hex'),
      Buffer.from(razorpaySignature,     'hex')
    );
  } catch {
    return false; // length mismatch → invalid
  }
}

/**
 * Verify Razorpay webhook signature.
 * Header: X-Razorpay-Signature
 */
function verifyWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return true; // Skip if not configured (dev mode)
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected,  'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Initiate a refund via Razorpay API.
 * @param {string} paymentId  razorpay_payment_id
 * @param {number} amountInPaise  partial or full amount (paise)
 * @param {string} notes  reason string
 */
async function createRefund(paymentId, amountInPaise, notes = '') {
  if (!paymentId) throw Object.assign(new Error('paymentId is required for refund'), { status: 400 });
  const instance = getRazorpay();
  const refund = await instance.payments.refund(paymentId, {
    amount: Math.round(amountInPaise),
    notes:  { reason: notes },
  });
  return {
    refund_id:  refund.id,
    status:     refund.status,  // 'processed' | 'pending' | 'failed'
    amount:     refund.amount,
  };
}

/**
 * Fetch payment details from Razorpay (for reconciliation).
 */
async function fetchPayment(paymentId) {
  const instance = getRazorpay();
  return instance.payments.fetch(paymentId);
}

module.exports = { createOrder, verifySignature, verifyWebhookSignature, createRefund, fetchPayment };
