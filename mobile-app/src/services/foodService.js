import api, { uploadFile } from './api';

const foodService = {
  // Public
  getAllFoods:      (params)  => api.get('/api/foods', { params }).then(r => r.data),
  getFoodById:      (id)      => api.get(`/api/foods/${id}`).then(r => r.data),
  searchFoods:      (q, params) => api.get('/api/search/suggestions', { params: { q, ...params } }).then(r => r.data),

  // Caterer
  getCatererFoods:  ()        => api.get('/api/caterers/me/foods').then(r => r.data),
  createFood:       (payload) => api.post('/api/foods', payload).then(r => r.data),
  updateFood:       (id, payload) => api.put(`/api/foods/${id}`, payload).then(r => r.data),
  deleteFood:       (id)      => api.delete(`/api/foods/${id}`).then(r => r.data),
  toggleAvailability: (id, available) => api.patch(`/api/foods/${id}/availability`, { available }).then(r => r.data),

  // Image upload
  uploadFoodImage:  (id, uri) => uploadFile(`/api/foods/${id}/image`, uri, 'image'),
};

export default foodService;
