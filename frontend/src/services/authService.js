import api from "./api";

export default {
  async login({ username, password }) {
    return api.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },

  async register({ name, mobileNumber, email, password, role }) {
    return api.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, mobileNumber, email, password, role }),
    });
  },

  async forgotPassword({ username }) {
    return api.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ username }),
    });
  },

  async resetPassword({ token, newPassword }) {
    return api.request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
