'use strict';

/**
 * PaymentProvider — Abstract interface.
 *
 * Every payment integration (PhonePe, Razorpay, Cashfree, ManualUPI, …)
 * must extend this class and implement all four methods.
 *
 * This ensures the order-creation flow can swap providers via a single
 * environment variable (PAYMENT_PROVIDER=phonepe|razorpay|cashfree|manual)
 * without touching business logic.
 */
class PaymentProvider {
  get name() { return 'abstract'; }

  /**
   * Create a payment order / session.
   * @param {{ orderId: string, amount: number, currency: string, customerId: string, description: string }} options
   * @returns {Promise<{ paymentId: string, paymentUrl: string|null, qrCode: string|null, metadata: object }>}
   */
  // eslint-disable-next-line no-unused-vars
  async createPayment(options) {
    throw new Error(`${this.name}.createPayment() not implemented`);
  }

  /**
   * Verify payment after customer completes it.
   * @param {{ paymentId: string, orderId: string, signature: string, metadata: object }} options
   * @returns {Promise<{ verified: boolean, status: string, transactionId: string, amount: number }>}
   */
  // eslint-disable-next-line no-unused-vars
  async verifyPayment(options) {
    throw new Error(`${this.name}.verifyPayment() not implemented`);
  }

  /**
   * Initiate a refund.
   * @param {{ paymentId: string, refundAmount: number, reason: string }} options
   * @returns {Promise<{ refundId: string, status: string, amount: number }>}
   */
  // eslint-disable-next-line no-unused-vars
  async refundPayment(options) {
    throw new Error(`${this.name}.refundPayment() not implemented`);
  }

  /**
   * Fetch live payment status from provider.
   * @param {{ paymentId: string }} options
   * @returns {Promise<{ status: string, amount: number, transactionId: string, metadata: object }>}
   */
  // eslint-disable-next-line no-unused-vars
  async getPaymentStatus(options) {
    throw new Error(`${this.name}.getPaymentStatus() not implemented`);
  }
}

module.exports = PaymentProvider;
