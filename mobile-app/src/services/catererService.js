import api, { uploadFile } from './api';

const catererService = {
  // Public
  getAllCaterers:    (params)   => api.get('/api/caterers', { params }).then(r => r.data),
  getCatererById:   (id)       => api.get(`/api/caterers/${id}`).then(r => r.data),

  // Caterer self
  getMyProfile:     ()         => api.get('/api/caterers/me').then(r => r.data),
  updateMyProfile:  (payload)  => api.put('/api/caterers/me', payload).then(r => r.data),
  uploadBanner:     (uri)      => uploadFile('/api/caterers/me/banner', uri, 'banner'),

  // Availability
  getAvailability:  ()         => api.get('/api/caterers/me/availability').then(r => r.data),
  updateAvailability: (payload) => api.put('/api/caterers/me/availability', payload).then(r => r.data),
  toggleAvailability: (open)   => api.patch('/api/caterers/me/availability', { isOpen: open }).then(r => r.data),

  // Riders
  getCatererRiders: ()         => api.get('/api/riders').then(r => r.data),
  addRider:         (payload)  => api.post('/api/riders', payload).then(r => r.data),
  updateRider:      (id, p)    => api.put(`/api/riders/${id}`, p).then(r => r.data),
  deleteRider:      (id)       => api.delete(`/api/riders/${id}`).then(r => r.data),

  // Payments
  getPaymentReview: ()         => api.get('/api/caterer/payment-review').then(r => r.data),
  getPaymentDetails:()         => api.get('/api/caterer/payment-details').then(r => r.data),

  // Catering bookings
  getCateringBookings: (params) => api.get('/api/catering', { params }).then(r => r.data),
  getCateringBookingById: (id)  => api.get(`/api/catering/${id}`).then(r => r.data),
  updateCateringStatus: (id, status) => api.patch(`/api/catering/${id}/status`, { status }).then(r => r.data),

  // Tiffin
  getTiffin:        ()         => api.get('/api/tiffin').then(r => r.data),
  updateTiffin:     (payload)  => api.put('/api/tiffin', payload).then(r => r.data),

  // Notifications
  getCatererNotifications: () => api.get('/api/caterer/notifications').then(r => r.data),
  markCatererNotificationRead: (id) => api.patch(`/api/caterer/notifications/${id}/read`).then(r => r.data),
};

export default catererService;
