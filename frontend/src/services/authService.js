import api from "./api";

export default {
  async login({ email, password }) {
    return api.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  async register({ email, password }) {
    return api.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
};
