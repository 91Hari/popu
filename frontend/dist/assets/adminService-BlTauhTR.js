import { f as api } from "./index-EstIw0RN.js";
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
  }
};
export {
  adminService as a
};
