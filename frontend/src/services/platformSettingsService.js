import api from "./api";

const platformSettingsService = {
  async getSettings() {
    return api.request("/admin/platform-settings");
  },

  async updateSettings(payload) {
    return api.request("/admin/platform-settings", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};

export default platformSettingsService;
