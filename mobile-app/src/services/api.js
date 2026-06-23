import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL, TOKEN_KEY } from '../config/constants';

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor — attach JWT ────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // SecureStore unavailable (simulator without keychain) — continue without token
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor — normalise errors ─────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message
      || error.response?.data?.error
      || error.message
      || 'Something went wrong';

    if (status === 401) {
      // Token expired — clear credentials
      try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } catch { /* ignore */ }
    }

    const enhancedError   = new Error(message);
    enhancedError.status  = status;
    enhancedError.data    = error.response?.data;
    return Promise.reject(enhancedError);
  },
);

export default api;

// ─── Multipart helper (image upload) ─────────────────────────────────────────
export async function uploadFile(endpoint, fileUri, fieldName = 'image', extraFields = {}) {
  const token = await SecureStore.getItemAsync(TOKEN_KEY).catch(() => null);
  const formData = new FormData();
  formData.append(fieldName, {
    uri:  fileUri,
    type: 'image/jpeg',
    name: `upload_${Date.now()}.jpg`,
  });
  Object.entries(extraFields).forEach(([k, v]) => formData.append(k, v));

  const res = await fetch(`${API_URL}${endpoint}`, {
    method:  'POST',
    headers: {
      'Content-Type':  'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || 'Upload failed');
  }
  return res.json();
}
