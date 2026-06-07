import api from "./api";

export default {
  async getFoods() {
    return api.request("/foods");
  },
  async getFoodById(id) {
    return api.request(`/foods/${id}`);
  },
};
