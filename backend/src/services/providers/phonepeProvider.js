'use strict';

const PaymentProvider = require('../paymentProviderInterface');

/**
 * PhonePeProvider — PhonePe Payment Gateway integration.
 *
 * Required env vars (set in Render dashboard — never commit to source):
 *   PHONEPE_MERCHANT_ID      Your PhonePe merchant ID
 *   PHONEPE_SALT_KEY         Salt key for request signing
 *   PHONEPE_SALT_INDEX       Salt index (default: 1)
 *   PHONEPE_ENV              'production' | 'uat' (default: 'uat')
 *
 * Docs: https://developer.phonepe.com/v1/docs
 */
class PhonePeProvider extends PaymentProvider {
  get name() { return 'phonepe'; }

  _assertConfigured() {
    if (!process.env.PHONEPE_MERCHANT_ID || !process.env.PHONEPE_SALT_KEY) {
      throw new Error(
        'PhonePe is not configured. Set PHONEPE_MERCHANT_ID and PHONEPE_SALT_KEY env vars.'
      );
    }
  }

  async createPayment({ orderId, amount, currency = 'INR', customerId, description }) {
    this._assertConfigured();
    // TODO: implement PhonePe Pay API v2 — POST /pg/v1/pay
    // 1. Build payload with merchantTransactionId = orderId
    // 2. Base64-encode + SHA256-sign with saltKey
    // 3. POST to PhonePe API
    // 4. Return redirect URL from response.data.instrumentResponse.redirectInfo.url
    throw new Error('PhonePe createPayment: implementation pending. Activate after merchant onboarding.');
  }

  async verifyPayment({ paymentId }) {
    this._assertConfigured();
    // TODO: GET /pg/v1/status/:merchantId/:merchantTransactionId
    throw new Error('PhonePe verifyPayment: implementation pending.');
  }

  async refundPayment({ paymentId, refundAmount, reason }) {
    this._assertConfigured();
    // TODO: POST /pg/v1/refund
    throw new Error('PhonePe refundPayment: implementation pending.');
  }

  async getPaymentStatus({ paymentId }) {
    this._assertConfigured();
    // TODO: GET /pg/v1/status/:merchantId/:merchantTransactionId
    throw new Error('PhonePe getPaymentStatus: implementation pending.');
  }
}

module.exports = new PhonePeProvider();
