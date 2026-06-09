import api from "./api";

export default {
  async getNotifications() {
    const data = await api.request("/customer/notifications");
    return Array.isArray(data) ? data : (data.notifications ?? []);
  },
  async markRead(id) {
    return api.request(`/customer/notifications/${id}/read`, { method: "PATCH" });
  },
  async markAllRead() {
    return api.request("/customer/notifications/read-all", { method: "PATCH" });
  },
};
