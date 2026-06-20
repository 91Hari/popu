import api, { uploadFile } from './api';

const profileService = {
  getProfile:         ()         => api.get('/api/profile').then(r => r.data),
  updateProfile:      (payload)  => api.patch('/api/profile', payload).then(r => r.data),
  uploadAvatar:       (uri)      => uploadFile('/api/profile/avatar', uri, 'avatar'),
  changePassword:     (payload)  => api.post('/api/profile/change-password', payload).then(r => r.data),
  deleteAccount:      (reason)   => api.post('/api/account/delete', { reason }).then(r => r.data),

  // Addresses
  getAddresses:       ()         => api.get('/api/profile/addresses').then(r => r.data),
  addAddress:         (payload)  => api.post('/api/profile/addresses', payload).then(r => r.data),
  updateAddress:      (id, payload) => api.put(`/api/profile/addresses/${id}`, payload).then(r => r.data),
  deleteAddress:      (id)       => api.delete(`/api/profile/addresses/${id}`).then(r => r.data),
  setDefaultAddress:  (id)       => api.patch(`/api/profile/addresses/${id}/default`).then(r => r.data),

  // Payment Methods
  getPaymentMethods:  ()         => api.get('/api/profile/payment-methods').then(r => r.data),
  addPaymentMethod:   (payload)  => api.post('/api/profile/payment-methods', payload).then(r => r.data),
  deletePaymentMethod:(id)       => api.delete(`/api/profile/payment-methods/${id}`).then(r => r.data),
};

export default profileService;
