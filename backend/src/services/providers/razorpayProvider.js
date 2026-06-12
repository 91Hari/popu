'use strict';

const PaymentProvider = require('../paymentProviderInterface');

/**
 * RazorpayProvider — Razorpay Payment Gateway integration.
 *
 * Required env vars:
 *   RAZORPAY_KEY_ID      Your Razorpay key ID
 *   RAZORPAY_KEY_SECRET  Your Razorpay key secret
 *
 * Install SDK: npm install razorpay
 * Docs: https://razorpay.com/docs/payments/server-integration/nodejs/
 */
class RazorpayProvider extends PaymentProvider {
  get name() { return 'razorpay'; }

  _assertConfigured() {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error(
        'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET env vars.'
      );
    }
  }

  async createPayment({ orderId, amount, currency = 'INR', description }) {
    this._assertConfigured();
    // TODO:
    // const Razorpay = require('razorpay');
    // const rz = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    // const order = await rz.orders.create({ amount: amount * 100, currency, receipt: orderId, notes: { description } });
    // return { paymentId: order.id, paymentUrl: null, qrCode: null, metadata: order };
    throw new Error('Razorpay createPayment: implementation pending.');
  }

  async verifyPayment({ paymentId, signature, metadata }) {
    this._assertConfigured();
    // TODO: verify HMAC-SHA256 signature of razorpay_order_id|razorpay_payment_id
    throw new Error('Razorpay verifyPayment: implementation pending.');
  }

  async refundPayment({ paymentId, refundAmount, reason }) {
    this._assertConfigured();
    // TODO: rz.payments.refund(paymentId, { amount: refundAmount * 100, notes: { reason } })
    throw new Error('Razorpay refundPayment: implementation pending.');
  }

  async getPaymentStatus({ paymentId }) {
    this._assertConfigured();
    // TODO: rz.payments.fetch(paymentId)
    throw new Error('Razorpay getPaymentStatus: implementation pending.');
  }
}

module.exports = new RazorpayProvider();
