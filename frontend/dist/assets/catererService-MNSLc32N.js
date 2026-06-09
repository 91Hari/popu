import { f as api } from "./index-EstIw0RN.js";
const catererService = {
  async getCaterers({ search, location, page = 1, limit = 20 } = {}) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (location) params.set("location", location);
    params.set("page", String(page));
    params.set("limit", String(limit));
    return api.request(`/caterers?${params.toString()}`);
  },
  async getMyAvailability() {
    return api.request("/caterers/me/availability");
  },
  async setMyAvailability(status) {
    return api.request("/caterers/me/availability", {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
  }
};
export {
  catererService as c
};
