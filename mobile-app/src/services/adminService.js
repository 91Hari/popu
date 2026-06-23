import api from './api';

const adminService = {
  // Dashboard
  getDashboard:         ()        => api.get('/api/admin/dashboard').then(r => r.data),

  // Customers
  getCustomers:         (params)  => api.get('/api/admin/customers', { params }).then(r => r.data),
  getCustomerById:      (id)      => api.get(`/api/admin/customers/${id}`).then(r => r.data),
  updateCustomerStatus: (id, s)   => api.patch(`/api/admin/customers/${id}/status`, { status: s }).then(r => r.data),

  // Caterers
  getCaterers:          (params)  => api.get('/api/admin/caterers', { params }).then(r => r.data),
  getCatererById:       (id)      => api.get(`/api/admin/caterers/${id}`).then(r => r.data),
  approveCaterer:       (id)      => api.patch(`/api/admin/caterers/${id}/approve`).then(r => r.data),
  updateCatererStatus:  (id, s)   => api.patch(`/api/admin/caterers/${id}/status`, { status: s }).then(r => r.data),

  // Orders
  getOrders:            (params)  => api.get('/api/admin/orders', { params }).then(r => r.data),
  getMasterOrders:      (params)  => api.get('/api/admin/master-orders', { params }).then(r => r.data),
  updateOrderStatus:    (id, s)   => api.patch(`/api/admin/orders/${id}/status`, { status: s }).then(r => r.data),

  // Payments
  getPayments:          (params)  => api.get('/api/admin/payments', { params }).then(r => r.data),
  getRefunds:           (params)  => api.get('/api/admin/refunds', { params }).then(r => r.data),
  processRefund:        (id, p)   => api.post(`/api/admin/refunds/${id}`, p).then(r => r.data),

  // Riders
  getRiders:            (params)  => api.get('/api/admin/riders', { params }).then(r => r.data),
  getRiderById:         (id)      => api.get(`/api/admin/riders/${id}`).then(r => r.data),

  // Notifications
  sendBroadcast:        (payload) => api.post('/api/admin/notifications', payload).then(r => r.data),
  getNotifications:     (params)  => api.get('/api/admin/notifications', { params }).then(r => r.data),

  // Services
  getServices:          ()        => api.get('/api/admin/services').then(r => r.data),
  updateService:        (id, p)   => api.put(`/api/admin/services/${id}`, p).then(r => r.data),

  // Platform Settings
  getSettings:          ()        => api.get('/api/admin/platform-settings').then(r => r.data),
  updateSettings:       (payload) => api.put('/api/admin/platform-settings', payload).then(r => r.data),

  // Reports
  getReports:           (params)  => api.get('/api/admin/reports', { params }).then(r => r.data),

  // Tiffin
  getTiffin:            (params)  => api.get('/api/admin/tiffin', { params }).then(r => r.data),

  // Catering Bookings
  getCateringBookings:  (params)  => api.get('/api/admin/catering-bookings', { params }).then(r => r.data),

  // Foods
  getFoods:             (params)  => api.get('/api/admin/foods', { params }).then(r => r.data),
};

export default adminService;
