import api from "./api";

const riderService = {
  createRider: (data) =>
    api.request("/riders", { method: "POST", body: JSON.stringify(data) }),

  listMyRiders: () => api.request("/riders"),

  deleteRider: (id) =>
    api.request(`/riders/${id}`, { method: "DELETE" }),

  assignRider: (orderId, rider_id) =>
    api.request(`/riders/assign/${orderId}`, { method: "PATCH", body: JSON.stringify({ rider_id }) }),

  pushLocation: ({ latitude, longitude, order_id }) =>
    api.request("/riders/location", { method: "POST", body: JSON.stringify({ latitude, longitude, order_id }) }),

  getRiderLocation: (riderId) =>
    api.request(`/riders/location/${riderId}`),

  getAssignedDeliveries: () => api.request("/riders/deliveries"),

  lookupOrder: (id) => api.request(`/riders/orders/${id}`),

  startDelivery: (id) =>
    api.request(`/riders/orders/${id}/start`, { method: "PATCH" }),

  confirmCodPayment: (id) =>
    api.request(`/riders/orders/${id}/confirm-cod`, { method: "POST" }),

  confirmDelivery: (id, code) =>
    api.request(`/riders/orders/${id}/confirm`, { method: "POST", body: JSON.stringify({ code }) }),

  getOrderRiderLocation: (orderId) =>
    api.request(`/riders/orders/${orderId}/rider-location`),

  // Delivery engine — Rider
  getCurrentBatch: () =>
    api.request("/delivery/rider/current-batch"),

  setRiderDeliveryStatus: (status) =>
    api.request("/delivery/rider/status", { method: "PATCH", body: JSON.stringify({ status }) }),

  updateDeliveryLocation: (latitude, longitude, batch_id) =>
    api.request("/delivery/rider/location", { method: "PATCH", body: JSON.stringify({ latitude, longitude, batch_id }) }),

  startBatch: (batchId) =>
    api.request(`/delivery/rider/batch/${batchId}/start`, { method: "POST" }),

  markTaskPickedUp: (batchId, taskId) =>
    api.request(`/delivery/rider/batch/${batchId}/task/${taskId}/pickup`, { method: "PATCH" }),

  confirmTaskDelivered: (batchId, taskId, code) =>
    api.request(`/delivery/rider/batch/${batchId}/task/${taskId}/deliver`, { method: "PATCH", body: JSON.stringify({ code }) }),

  // Delivery engine — Customer
  getDeliveryTracking: (masterOrderId) =>
    api.request(`/delivery/customer/tracking/${masterOrderId}`),

  // Delivery engine — Admin
  getAdminDeliveryStatus: () =>
    api.request("/delivery/admin/status"),

  triggerDeliveryBatch: () =>
    api.request("/delivery/create-batch", { method: "POST" }),
};

export default riderService;
