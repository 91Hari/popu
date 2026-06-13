import api from './api';

const tiffinService = {
  // ─── Customer ───────────────────────────────────────────────────────────────
  getCaterers:         ()         => api.request('/tiffin/caterers'),
  getCatererSettings:  (id)       => api.request(`/tiffin/caterers/${id}/settings`),
  getCatererItems:     (id)       => api.request(`/tiffin/caterers/${id}/items`),
  createOrder:         (payload)  => api.request('/tiffin/orders', { method: 'POST', body: JSON.stringify(payload) }),
  getMyOrders:         ()         => api.request('/tiffin/orders/my'),
  getOrderById:        (id)       => api.request(`/tiffin/orders/${id}`),

  // ─── Caterer ─────────────────────────────────────────────────────────────────
  getCatererOwnSettings: ()        => api.request('/tiffin/caterer/settings'),
  saveSettings:          (data)    => api.request('/tiffin/caterer/settings', { method: 'PUT', body: JSON.stringify(data) }),
  getCatererFoods:       ()        => api.request('/tiffin/caterer/foods'),
  saveFoodMapping:       (mappings)=> api.request('/tiffin/caterer/food-mapping', { method: 'PUT', body: JSON.stringify({ mappings }) }),

  // ─── Admin ───────────────────────────────────────────────────────────────────
  getAdminMetrics: () => api.request('/tiffin/admin/metrics'),
};

export default tiffinService;
