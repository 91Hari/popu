import api from "./api";

const complianceService = {
  // ─── FSSAI ──────────────────────────────────────────────────────────────────
  async getFssai()         { return api.request("/compliance/caterer/fssai"); },
  async upsertFssai(data)  { return api.request("/compliance/caterer/fssai", { method: "POST", body: JSON.stringify(data) }); },

  // ─── KYC ────────────────────────────────────────────────────────────────────
  async getKyc()                   { return api.request("/compliance/caterer/kyc"); },
  async submitKyc(data)            { return api.request("/compliance/caterer/kyc", { method: "POST", body: JSON.stringify(data) }); },
  async addBankAccount(data)       { return api.request("/compliance/caterer/bank-account", { method: "POST", body: JSON.stringify(data) }); },
  async getCatererSettlements(p={}) {
    const q = new URLSearchParams({ page: p.page || 1, limit: p.limit || 20 });
    return api.request(`/compliance/caterer/settlements?${q}`);
  },

  // ─── RIDER ──────────────────────────────────────────────────────────────────
  async updateRiderKyc(data) { return api.request("/compliance/rider/kyc", { method: "PUT", body: JSON.stringify(data) }); },

  // ─── CONSENT ────────────────────────────────────────────────────────────────
  async recordConsent(consents) {
    return api.request("/compliance/consent", { method: "POST", body: JSON.stringify({ consents }) });
  },

  // ─── GRIEVANCES ─────────────────────────────────────────────────────────────
  async submitGrievance(data) {
    return api.request("/compliance/grievances", { method: "POST", body: JSON.stringify(data) });
  },
  async myGrievances(p = {}) {
    const q = new URLSearchParams({ page: p.page || 1, limit: p.limit || 20 });
    return api.request(`/compliance/grievances?${q}`);
  },

  // ─── ADMIN ──────────────────────────────────────────────────────────────────
  async adminComplianceDashboard() { return api.request("/compliance/admin/dashboard"); },

  async adminListFssai({ status = "all", page = 1, limit = 20 } = {}) {
    const q = new URLSearchParams({ status, page, limit });
    return api.request(`/compliance/admin/fssai?${q}`);
  },
  async adminVerifyFssai(id, { approved, rejection_reason }) {
    return api.request(`/compliance/admin/fssai/${id}/verify`, {
      method: "PATCH", body: JSON.stringify({ approved, rejection_reason }),
    });
  },

  async adminListKyc({ status = "all", page = 1, limit = 20 } = {}) {
    const q = new URLSearchParams({ status, page, limit });
    return api.request(`/compliance/admin/kyc?${q}`);
  },
  async adminReviewKyc(id, { approved, rejection_reason }) {
    return api.request(`/compliance/admin/kyc/${id}/review`, {
      method: "PATCH", body: JSON.stringify({ approved, rejection_reason }),
    });
  },

  async adminListGrievances({ status = "all", page = 1, limit = 20 } = {}) {
    const q = new URLSearchParams({ status, page, limit });
    return api.request(`/compliance/admin/grievances?${q}`);
  },
  async adminUpdateGrievance(id, data) {
    return api.request(`/compliance/admin/grievances/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  },

  async adminListSettlements({ caterer_id, status = "all", page = 1, limit = 20 } = {}) {
    const q = new URLSearchParams({ status, page, limit });
    if (caterer_id) q.set("caterer_id", caterer_id);
    return api.request(`/compliance/admin/settlements?${q}`);
  },
  async adminCreateSettlement(data) {
    return api.request("/compliance/admin/settlements", { method: "POST", body: JSON.stringify(data) });
  },
  async adminMarkSettlementPaid(id, data) {
    return api.request(`/compliance/admin/settlements/${id}/mark-paid`, { method: "PATCH", body: JSON.stringify(data) });
  },
};

export default complianceService;
