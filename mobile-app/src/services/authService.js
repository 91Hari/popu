import * as SecureStore from 'expo-secure-store';
import api from './api';
import { TOKEN_KEY, USER_KEY } from '../config/constants';

const authService = {
  // ─── Login ────────────────────────────────────────────────────────────────
  async login(username, password) {
    const { data } = await api.post('/api/auth/login', { username, password });
    const user = { ...data.user, role: (data.user.role || 'customer').toLowerCase() };
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    return { token: data.token, user };
  },

  // ─── Register ─────────────────────────────────────────────────────────────
  async register(payload) {
    const { data } = await api.post('/api/auth/register', payload);
    const user = { ...data.user, role: (data.user.role || 'customer').toLowerCase() };
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    return { token: data.token, user };
  },

  // ─── OTP Auth (mobile) ────────────────────────────────────────────────────
  async requestOTP(phone) {
    const { data } = await api.post('/api/auth/otp/request', { phone });
    return data;
  },

  async verifyOTP(phone, otp) {
    const { data } = await api.post('/api/auth/otp/verify', { phone, otp });
    const user = { ...data.user, role: (data.user.role || 'customer').toLowerCase() };
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    return { token: data.token, user };
  },

  // ─── Forgot / Reset Password ──────────────────────────────────────────────
  async forgotPassword(email) {
    const { data } = await api.post('/api/auth/forgot-password', { email });
    return data;
  },

  async resetPassword(token, password) {
    const { data } = await api.post('/api/auth/reset-password', { token, password });
    return data;
  },

  // ─── Logout ───────────────────────────────────────────────────────────────
  async logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  },

  // ─── Restore Session ──────────────────────────────────────────────────────
  async getStoredSession() {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const raw   = await SecureStore.getItemAsync(USER_KEY);
    if (!token || !raw) return null;
    try {
      const user = JSON.parse(raw);
      return { token, user };
    } catch {
      return null;
    }
  },

  // ─── Update FCM Token on backend ─────────────────────────────────────────
  async updateFCMToken(fcmToken) {
    try {
      await api.post('/api/profile/fcm-token', { fcmToken });
    } catch { /* non-critical */ }
  },
};

export default authService;
