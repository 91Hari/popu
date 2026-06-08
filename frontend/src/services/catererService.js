import api from "./api";

export default {
  async getCaterers({ search, location, page = 1, limit = 20 } = {}) {
    const params = new URLSearchParams();
    if (search)   params.set("search",   search);
    if (location) params.set("location", location);
    params.set("page",  String(page));
    params.set("limit", String(limit));
    const data = await api.request(`/caterers?${params.toString()}`);
    return data;
  },
};
