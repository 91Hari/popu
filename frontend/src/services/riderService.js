import api from "./api";

const riderService = {
  createRider: (data) =>
    api.request("/riders", { method: "POST", body: JSON.stringify(data) }),

  listMyRiders: () => api.request("/riders"),

  deleteRider: (id) =>
    api.request(`/riders/${id}`, { method: "DELETE" }),

  assignRider: (orderId, rider_id) =>
    api.request(`/riders/assign/${orderId}`, { method: "PATCH", body: JSON.stringify({ rider_id }) }),

  pushLocation: ({ latitude, longitude }) =>
    api.request("/riders/location", { method: "POST", body: JSON.stringify({ latitude, longitude }) }),

  getRiderLocation: (riderId) =>
    api.request(`/riders/location/${riderId}`),

  getAssignedDeliveries: () => api.request("/riders/deliveries"),

  lookupOrder: (id) => api.request(`/riders/orders/${id}`),

  startDelivery: (id) =>
    api.request(`/riders/orders/${id}/start`, { method: "PATCH" }),

  confirmDelivery: (id, code) =>
    api.request(`/riders/orders/${id}/confirm`, { method: "POST", body: JSON.stringify({ code }) }),
};

export default riderService;
