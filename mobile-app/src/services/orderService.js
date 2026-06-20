import api from './api';

const orderService = {
  // Cart
  getCart:          ()          => api.get('/api/cart').then(r => r.data),
  addToCart:        (foodId, qty) => api.post('/api/cart', { foodId, quantity: qty }).then(r => r.data),
  updateCartItem:   (foodId, qty) => api.put(`/api/cart/${foodId}`, { quantity: qty }).then(r => r.data),
  removeFromCart:   (foodId)    => api.delete(`/api/cart/${foodId}`).then(r => r.data),
  clearCart:        ()          => api.delete('/api/cart').then(r => r.data),

  // Checkout
  checkout:         (payload)   => api.post('/api/checkout', payload).then(r => r.data),
  splitCheckout:    (payload)   => api.post('/api/checkout/split', payload).then(r => r.data),

  // Orders — Customer
  getOrders:        (params)    => api.get('/api/orders', { params }).then(r => r.data),
  getOrderById:     (id)        => api.get(`/api/orders/${id}`).then(r => r.data),
  getMasterOrders:  (params)    => api.get('/api/master-orders', { params }).then(r => r.data),
  getMasterOrderById: (id)      => api.get(`/api/master-orders/${id}`).then(r => r.data),
  cancelOrder:      (id)        => api.patch(`/api/orders/${id}/cancel`).then(r => r.data),

  // Orders — Caterer
  getCatererOrders: (params)    => api.get('/api/caterer/orders', { params }).then(r => r.data),
  getCatererSubOrders: (params) => api.get('/api/caterer/sub-orders', { params }).then(r => r.data),
  updateOrderStatus: (id, status) => api.patch(`/api/caterer/orders/${id}/status`, { status }).then(r => r.data),

  // Orders — Rider
  getRiderOrders:   (params)    => api.get('/api/riders/deliveries', { params }).then(r => r.data),
  getDeliveryById:  (id)        => api.get(`/api/riders/deliveries/${id}`).then(r => r.data),
  startDelivery:    (orderId)   => api.patch(`/api/riders/deliveries/${orderId}/start`).then(r => r.data),
  markDelivered:    (orderId)   => api.patch(`/api/riders/deliveries/${orderId}/delivered`).then(r => r.data),
  lookupOrder:      (id)        => api.get(`/api/riders/lookup/${id}`).then(r => r.data),

  // Tracking
  getRiderLocation: (orderId)   => api.get(`/api/riders/location/${orderId}`).then(r => r.data),
  updateRiderLocation: (lat, lng, orderId) =>
    api.patch('/api/riders/location', { lat, lng, orderId }).then(r => r.data),
};

export default orderService;
