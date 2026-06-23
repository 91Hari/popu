import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  extra.apiUrl ??
  'https://popu-backend.onrender.com';

export const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export const APP_ENV =
  process.env.EXPO_PUBLIC_APP_ENV ?? 'production';

export const PACKAGE_NAME = 'com.popu.app';
export const APP_VERSION  = '1.0.0';
export const VERSION_CODE = 1;

export const PRIVACY_POLICY_URL =
  process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ?? 'https://popu.app/privacy';
export const TERMS_URL =
  process.env.EXPO_PUBLIC_TERMS_URL ?? 'https://popu.app/terms';

// Location tracking task name (background)
export const LOCATION_TASK_NAME = 'POPU_BACKGROUND_LOCATION';

// Token storage key (expo-secure-store)
export const TOKEN_KEY     = 'popu_auth_token';
export const USER_KEY      = 'popu_user_data';
export const FCM_TOKEN_KEY = 'popu_fcm_token';
