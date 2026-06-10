import api from "./api";

export default {
  async createSplitOrder({ items, customer_lat, customer_lng, payment_proofs = [] }) {
    const data = await api.request("/checkout/split-order", {
      method: "POST",
      body: JSON.stringify({ items, customer_lat, customer_lng, payment_proofs }),
    });
    return data.masterOrder ?? data;
  },

  async getMasterOrders() {
    const data = await api.request("/master-orders");
    return data.orders ?? data;
  },

  async getMasterOrderById(id) {
    const data = await api.request(`/master-orders/${id}`);
    return data.order ?? data;
  },

  async getCatererSubOrders() {
    const data = await api.request("/caterer-orders");
    return data.orders ?? data;
  },

  async updateCatererOrderStatus(id, status) {
    const data = await api.request(`/caterer-orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return data.catererOrder ?? data;
  },

  async cancelCatererOrder(id, cancel_reason) {
    const data = await api.request(`/caterer-orders/${id}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({ cancel_reason }),
    });
    return data.catererOrder ?? data;
  },
};
