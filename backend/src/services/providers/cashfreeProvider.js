'use strict';

const PaymentProvider = require('../paymentProviderInterface');

/**
 * CashfreeProvider — Cashfree Payment Gateway integration.
 *
 * Required env vars:
 *   CASHFREE_APP_ID     Your Cashfree App ID
 *   CASHFREE_SECRET_KEY Your Cashfree secret key
 *   CASHFREE_ENV        'production' | 'sandbox' (default: 'sandbox')
 *
 * Install SDK: npm install cashfree-pg
 * Docs: https://docs.cashfree.com/docs/nodejs-sdk
 */
class CashfreeProvider extends PaymentProvider {
  get name() { return 'cashfree'; }

  _assertConfigured() {
    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      throw new Error(
        'Cashfree is not configured. Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY env vars.'
      );
    }
  }

  async createPayment({ orderId, amount, currency = 'INR', customerId, description }) {
    this._assertConfigured();
    // TODO:
    // const { Cashfree } = require('cashfree-pg');
    // Cashfree.XClientId = process.env.CASHFREE_APP_ID;
    // Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
    // Cashfree.XEnvironment = process.env.CASHFREE_ENV === 'production'
    //   ? Cashfree.Environment.PRODUCTION : Cashfree.Environment.SANDBOX;
    // const request = { order_id: orderId, order_amount: amount, order_currency: currency,
    //   customer_details: { customer_id: customerId }, order_meta: { return_url: '...' } };
    // const response = await Cashfree.PGCreateOrder('2023-08-01', request);
    // return { paymentId: response.data.cf_order_id, paymentUrl: response.data.payment_session_id, ... };
    throw new Error('Cashfree createPayment: implementation pending.');
  }

  async verifyPayment({ paymentId }) {
    this._assertConfigured();
    // TODO: Cashfree.PGFetchOrder('2023-08-01', paymentId)
    throw new Error('Cashfree verifyPayment: implementation pending.');
  }

  async refundPayment({ paymentId, refundAmount, reason }) {
    this._assertConfigured();
    // TODO: Cashfree.PGOrderCreateRefund
    throw new Error('Cashfree refundPayment: implementation pending.');
  }

  async getPaymentStatus({ paymentId }) {
    this._assertConfigured();
    // TODO: Cashfree.PGFetchOrder
    throw new Error('Cashfree getPaymentStatus: implementation pending.');
  }
}

module.exports = new CashfreeProvider();
