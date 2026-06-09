import api from "./api";

export default {
  async getNotifications() {
    const data = await api.request("/caterer/notifications");
    return Array.isArray(data) ? data : (data.notifications ?? []);
  },
  async getUnreadCount() {
    return api.request("/caterer/notifications/unread-count");
  },
  async markRead(id) {
    return api.request(`/caterer/notifications/${id}/read`, { method: "PATCH" });
  },
  async markAllRead() {
    return api.request("/caterer/notifications/read-all", { method: "PATCH" });
  },
};
