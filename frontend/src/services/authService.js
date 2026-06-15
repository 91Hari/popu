import api from "./api";

export default {
  async sendOtp(mobileNumber) {
    return api.request("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ mobileNumber }),
    });
  },

  async verifyOtp(mobileNumber, otp) {
    return api.request("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ mobileNumber, otp }),
    });
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
