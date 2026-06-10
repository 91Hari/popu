import api from "./api";

export default {
  async submitProof({ caterer_order_id, payment_screenshot_url, upi_reference }) {
    const data = await api.request("/payment-proofs", {
      method: "POST",
      body: JSON.stringify({ caterer_order_id, payment_screenshot_url, upi_reference }),
    });
    return data.proof ?? data;
  },

  async reviewProof(id, { status, rejection_reason }) {
    const data = await api.request(`/payment-proofs/${id}/review`, {
      method: "PATCH",
      body: JSON.stringify({ status, rejection_reason }),
    });
    return data.proof ?? data;
  },

  async getProofsForCaterer() {
    const data = await api.request("/payment-proofs");
    return data.proofs ?? data;
  },

  async getProofsForCustomer() {
    const data = await api.request("/payment-proofs/my");
    return data.proofs ?? data;
  },
};
