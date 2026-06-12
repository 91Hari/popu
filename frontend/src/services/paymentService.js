import api from "./api";

const paymentService = {
  /** Initiate PhonePe payment — returns { paymentId, merchantOrderId, checkoutUrl, amount } */
  async initiate({ items, customerLat, customerLng }) {
    return api.request("/payments/initiate", {
      method: "POST",
      body: JSON.stringify({
        items,
        customer_lat: customerLat,
        customer_lng: customerLng,
      }),
    });
  },

  /** Verify payment after PhonePe redirect — returns { status, masterOrderId } */
  async verify(merchantOrderId) {
    return api.request(`/payments/verify/${encodeURIComponent(merchantOrderId)}`);
  },

  /** Customer's own payment history */
  async getMyPayments({ page = 1, limit = 20, status } = {}) {
    const p = new URLSearchParams({ page, limit });
    if (status) p.set("status", status);
    return api.request(`/payments/my?${p}`);
  },
};

export default paymentService;
