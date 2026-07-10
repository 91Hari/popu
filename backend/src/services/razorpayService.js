'use strict';

const Razorpay = require('razorpay');
const crypto   = require('crypto');

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw Object.assign(
      new Error('Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'),
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
 * @param {number} amountInPaise  Must be >= 100 (₹1 minimum)
 * @param {string} receipt        Optional receipt ID for your records
 */
async function createOrder(amountInPaise, receipt) {
  if (!amountInPaise || amountInPaise < 100) {
    throw Object.assign(
      new Error('Amount must be at least ₹1 (100 paise).'),
      { status: 400 }
    );
  }

  const instance = getRazorpay();
  const order = await instance.orders.create({
    amount:   Math.round(amountInPaise),
    currency: 'INR',
    receipt:  receipt || `rcpt_${Date.now()}`,
  });

  return {
    order_id: order.id,
    amount:   order.amount,
    currency: order.currency,
  };
}

/**
 * Verify the HMAC-SHA256 signature returned by Razorpay after successful payment.
 * Returns true if valid, false otherwise.
 */
function verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return false;
  }
  const payload  = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest('hex');

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(razorpaySignature, 'hex')
  );
}

module.exports = { createOrder, verifySignature };
