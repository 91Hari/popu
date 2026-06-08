import api from "./api";

export default {
  async getFoods() {
    const data = await api.request("/foods");
    return data.foods ?? data;
  },
  async getFoodById(id) {
    const data = await api.request(`/foods/${id}`);
    return data.food ?? data;
  },
  async createFood({ name, description, price, available }) {
    const data = await api.request("/foods", {
      method: "POST",
      body: JSON.stringify({
        food_name:    name,
        description,
        price,
        is_available: available,
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
  async searchFoods(q) {
    const data = await api.request(`/customer/foods/search?foodName=${encodeURIComponent(q)}`);
    return Array.isArray(data) ? data : (data.foods ?? []);
  },
  async searchFoodsFull({ foodName, category, catererName, minPrice, maxPrice, available } = {}) {
    const params = new URLSearchParams();
    if (foodName)    params.set("foodName",    foodName);
    if (category)    params.set("category",    category);
    if (catererName) params.set("catererName", catererName);
    if (minPrice != null) params.set("minPrice", String(minPrice));
    if (maxPrice != null) params.set("maxPrice", String(maxPrice));
    if (available != null) params.set("available", String(available));
    const data = await api.request(`/customer/foods/search?${params.toString()}`);
    return Array.isArray(data) ? data : (data.foods ?? []);
  },
  async getCustomerFoods() {
    const data = await api.request("/customer/foods");
    return Array.isArray(data) ? data : (data.foods ?? []);
  },
};
