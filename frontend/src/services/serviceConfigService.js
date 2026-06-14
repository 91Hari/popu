import api from "./api";

const serviceConfigService = {
  // Public — called by customer dashboard / services page
  async getServices() {
    return api.request("/customer/services");
  },

  // Admin only
  async adminGetServices() {
    return api.request("/admin/services");
  },

  async adminUpdateService(serviceCode, isEnabled) {
    return api.request(`/admin/services/${serviceCode}`, {
      method: "PUT",
      body: JSON.stringify({ isEnabled }),
    });
  },
};

export default serviceConfigService;
