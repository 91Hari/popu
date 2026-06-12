import api from "./api";

const platformSettingsService = {
  async getSettings() {
    return api.request("/admin/platform-settings");
  },

  async updateSettings({ commission_enabled, commission_percentage, platform_fee_enabled, platform_fee_amount }) {
    return api.request("/admin/platform-settings", {
      method: "PUT",
      body: JSON.stringify({ commission_enabled, commission_percentage, platform_fee_enabled, platform_fee_amount }),
    });
  },
};

export default platformSettingsService;
