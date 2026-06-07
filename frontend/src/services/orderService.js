import api from "./api";

export default {
  async createOrder(payload) {
    return api.request("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  async getOrders() {
    return api.request("/orders");
  },
};
