import api from "./api";

export default {
  async createSplitOrder({ items, customer_lat, customer_lng, payment_proofs = [], fulfillment_type = 'DELIVERY' }) {
    const data = await api.request("/checkout/split-order", {
      method: "POST",
      body: JSON.stringify({ items, customer_lat, customer_lng, payment_proofs, fulfillment_type }),
    });
    return data.masterOrder ?? data;
  },

  async getPickupRecommendation({ caterer_id, customer_lat, customer_lng, food_item_ids = [] }) {
    const params = new URLSearchParams({
      caterer_id,
      customer_lat,
      customer_lng,
      food_item_ids: food_item_ids.join(','),
    });
    const data = await api.request(`/pickup/recommendation?${params}`);
    return data;
  },

  async trackPickupEvent({ caterer_id, event, distance_km, saving_amount }) {
    await api.request('/pickup/track', {
      method: 'POST',
      body: JSON.stringify({ caterer_id, event, distance_km, saving_amount }),
    });
  },

  async confirmPickup(catererOrderId, code) {
    const data = await api.request(`/pickup/confirm/${catererOrderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ code }),
    });
    return data;
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
