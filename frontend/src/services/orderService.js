import api from "./api";

export default {
  async createOrder(payload) {
    const data = await api.request("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data.order ?? data;
  },
  async getOrders() {
    const data = await api.request("/orders");
    return data.orders ?? data;
  },
  async getOrderById(id) {
    const data = await api.request(`/orders/${id}`);
    return data.order ?? data;
  },
  async updateOrderStatus(id, status) {
    const data = await api.request(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return data.order ?? data;
  },
  async cancelOrder(id, cancel_reason) {
    const data = await api.request(`/orders/${id}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({ cancel_reason }),
    });
    return data.order ?? data;
  },
};
