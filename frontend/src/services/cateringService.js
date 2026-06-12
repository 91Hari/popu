import api from "./api";

const cateringService = {
  toggleCatering: (available) =>
    api.request("/catering/toggle", { method: "PATCH", body: JSON.stringify({ available }) }),

  getMyServices: () => api.request("/catering/services/mine"),

  getServicesByCaterer: (catererId) =>
    api.request(`/catering/services/caterer/${catererId}`),

  createService: (data) =>
    api.request("/catering/services", { method: "POST", body: JSON.stringify(data) }),

  updateService: (id, data) =>
    api.request(`/catering/services/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  deleteService: (id) =>
    api.request(`/catering/services/${id}`, { method: "DELETE" }),

  bookCatering: (data) =>
    api.request("/catering/bookings", { method: "POST", body: JSON.stringify(data) }),

  getMyBookings: () => api.request("/catering/bookings/mine"),

  updateBookingStatus: (id, status) =>
    api.request(`/catering/bookings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
};

export default cateringService;
