import api from "./api";

export default {
  async getCart() {
    return api.request("/cart");
  },
  async addItem(food_item_id, quantity = 1) {
    return api.request("/cart/add", {
      method: "POST",
      body: JSON.stringify({ food_item_id, quantity }),
    });
  },
  async updateItem(cartItemId, quantity) {
    return api.request(`/cart/${cartItemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  },
  async removeItem(cartItemId) {
    return api.request(`/cart/${cartItemId}`, { method: "DELETE" });
  },
  async clearCart() {
    return api.request("/cart", { method: "DELETE" });
  },
};
