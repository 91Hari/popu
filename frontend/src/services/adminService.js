import api from "./api";

const adminService = {
  async getDashboard() {
    return api.request("/admin/dashboard");
  },
  async getCustomers({ search, page = 1, limit = 20 } = {}) {
    const p = new URLSearchParams({ page, limit });
    if (search) p.set("search", search);
    return api.request(`/admin/customers?${p}`);
  },
  async getCaterers({ search, page = 1, limit = 20 } = {}) {
    const p = new URLSearchParams({ page, limit });
    if (search) p.set("search", search);
    return api.request(`/admin/caterers?${p}`);
  },
  async getFoods({ search, page = 1, limit = 20 } = {}) {
    const p = new URLSearchParams({ page, limit });
    if (search) p.set("search", search);
    return api.request(`/admin/foods?${p}`);
  },
  async getOrders({ status, page = 1, limit = 20 } = {}) {
    const p = new URLSearchParams({ page, limit });
    if (status) p.set("status", status);
    return api.request(`/admin/orders?${p}`);
  },
  async setCustomerStatus(id, active) {
    return api.request(`/admin/customers/${id}/status`, { method: "PATCH", body: JSON.stringify({ active }) });
  },
  async setCatererStatus(id, active) {
    return api.request(`/admin/caterers/${id}/status`, { method: "PATCH", body: JSON.stringify({ active }) });
  },
  async setFoodStatus(id, available) {
    return api.request(`/admin/foods/${id}/status`, { method: "PATCH", body: JSON.stringify({ available }) });
  },
  async updateOrderStatus(id, status) {
    return api.request(`/admin/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
  },
  async broadcastNotification({ title, message, target_role }) {
    return api.request("/admin/notifications", { method: "POST", body: JSON.stringify({ title, message, target_role }) });
  },
  async createUser(data) {
    return api.request("/admin/users", { method: "POST", body: JSON.stringify(data) });
  },
  async deleteUser(id) {
    return api.request(`/admin/users/${id}`, { method: "DELETE" });
  },
  async getCateringBookings({ page = 1, limit = 20, status } = {}) {
    const p = new URLSearchParams({ page, limit });
    if (status) p.set("status", status);
    return api.request(`/admin/catering-bookings?${p}`);
  },
  async getAllRiders({ search, page = 1, limit = 20 } = {}) {
    const p = new URLSearchParams({ page, limit });
    if (search) p.set("search", search);
    return api.request(`/admin/riders?${p}`);
  },
  async getPlatformSettings() {
    return api.request("/admin/platform-settings");
  },
  async updatePlatformSettings(data) {
    return api.request("/admin/platform-settings", { method: "PUT", body: JSON.stringify(data) });
  },
};

export default adminService;
