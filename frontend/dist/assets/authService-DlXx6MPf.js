import { f as api } from "./index-EstIw0RN.js";
const authService = {
  async login({ email, password }) {
    return api.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
  },
  async register({ name, email, password, role, business_name, address, latitude, longitude }) {
    return api.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role, business_name, address, latitude, longitude })
    });
  }
};
export {
  authService as a
};
