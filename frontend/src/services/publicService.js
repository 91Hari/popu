import api from "./api";

const publicService = {
  async getHomeData()         { return api.request("/public/home"); },
  async getStatistics()       { return api.request("/public/statistics"); },
  async getPopularFoods(n=10) { return api.request(`/public/popular-foods?limit=${n}`); },
  async getFeaturedCaterers() { return api.request("/public/featured-caterers"); },
  async getServices()         { return api.request("/public/services"); },
  async getLocations()        { return api.request("/public/locations"); },
  async getReviews()          { return api.request("/public/reviews"); },
};

export default publicService;
