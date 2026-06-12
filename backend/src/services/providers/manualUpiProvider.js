'use strict';

const PaymentProvider = require('../paymentProviderInterface');

/**
 * ManualUpiProvider — current PO.PU payment flow.
 *
 * Customer pays the caterer directly via UPI and uploads a screenshot as proof.
 * No third-party API is called. "Verification" is the caterer reviewing the screenshot.
 *
 * This is the active provider during MVP. Switch to PhonePe/Razorpay/Cashfree
 * by setting PAYMENT_PROVIDER=phonepe|razorpay|cashfree in environment.
 */
class ManualUpiProvider extends PaymentProvider {
  get name() { return 'manual_upi'; }

  async createPayment({ orderId, amount, customerId, description }) {
    return {
      paymentId:  `manual_${orderId}`,
      paymentUrl: null,
      qrCode:     null,
      metadata:   { provider: this.name, orderId, amount, customerId, description },
    };
  }

  async verifyPayment({ paymentId, metadata }) {
    // Actual verification happens when caterer approves the proof screenshot.
    return {
      verified:      true,
      status:        'PROOF_SUBMITTED',
      transactionId: paymentId,
      amount:        metadata?.amount ?? 0,
    };
  }

  async refundPayment({ paymentId, refundAmount, reason }) {
    // Manual refunds are coordinated offline between caterer and customer.
    return {
      refundId: `refund_${paymentId}`,
      status:   'PENDING_MANUAL_PROCESSING',
      amount:   refundAmount,
      note:     reason,
    };
  }

  async getPaymentStatus({ paymentId }) {
    return {
      status:        'MANUAL',
      amount:        0,
      transactionId: paymentId,
      metadata:      { provider: this.name },
    };
  }
}

module.exports = new ManualUpiProvider();
