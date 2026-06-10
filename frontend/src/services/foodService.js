import api from "./api";

export default {
  async getFoods() {
    const data = await api.request("/foods");
    return data.foods ?? data;
  },

  async getFoodById(id, { customerLat, customerLng } = {}) {
    const params = new URLSearchParams();
    if (customerLat != null) params.set("customer_lat", String(customerLat));
    if (customerLng != null) params.set("customer_lng", String(customerLng));
    const qs   = params.toString();
    const data = await api.request(`/foods/${id}${qs ? `?${qs}` : ""}`);
    return data.food ?? data;
  },

  async createFood({ name, description, price, available, preparation_time_minutes = 20 }) {
    const data = await api.request("/foods", {
      method: "POST",
      body: JSON.stringify({
        food_name:                name,
        description,
        price,
        is_available:             available,
        preparation_time_minutes: Number(preparation_time_minutes),
      }),
    });
    return data.food ?? data;
  },

  async updateFood(id, fields) {
    const data = await api.request(`/foods/${id}`, {
      method: "PUT",
      body: JSON.stringify(fields),
    });
    return data.food ?? data;
  },

  async deleteFood(id) {
    return api.request(`/foods/${id}`, { method: "DELETE" });
  },

  async patchAvailability(id, availabilityStatus) {
    return api.request(`/foods/${id}/availability`, {
      method: "PATCH",
      body: JSON.stringify({ availabilityStatus }),
    });
  },

  async searchFoods(q) {
    const data = await api.request(`/customer/foods/search?foodName=${encodeURIComponent(q)}`);
    return Array.isArray(data) ? data : (data.foods ?? []);
  },

  async searchFoodsFull({ foodName, category, catererName, minPrice, maxPrice, available, customerLat, customerLng } = {}) {
    const params = new URLSearchParams();
    if (foodName)          params.set("foodName",     foodName);
    if (category)          params.set("category",     category);
    if (catererName)       params.set("catererName",  catererName);
    if (minPrice != null)  params.set("minPrice",     String(minPrice));
    if (maxPrice != null)  params.set("maxPrice",     String(maxPrice));
    if (available != null) params.set("available",    String(available));
    if (customerLat != null) params.set("customer_lat", String(customerLat));
    if (customerLng != null) params.set("customer_lng", String(customerLng));
    const data = await api.request(`/customer/foods/search?${params.toString()}`);
    return Array.isArray(data) ? data : (data.foods ?? []);
  },

  async getCustomerFoods({ customerLat, customerLng } = {}) {
    const params = new URLSearchParams();
    if (customerLat != null) params.set("customer_lat", String(customerLat));
    if (customerLng != null) params.set("customer_lng", String(customerLng));
    const qs   = params.toString();
    const data = await api.request(`/customer/foods${qs ? `?${qs}` : ""}`);
    return Array.isArray(data) ? data : (data.foods ?? []);
  },
};
