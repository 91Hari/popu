import api from "./api";

export default {
  async login({ username, password }) {
    return api.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },

  async register({ name, mobileNumber, email, password, role, address, city, state, pincode, latitude, longitude }) {
    return api.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, mobileNumber, email, password, role, address, city, state, pincode, latitude, longitude }),
    });
  },

  async forgotPassword({ email }) {
    return api.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword({ token, newPassword }) {
    return api.request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  },

  async changePassword({ currentPassword, newPassword }) {
    return api.request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
