import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import api from './api';
import { FCM_TOKEN_KEY } from '../config/constants';
import { Platform } from 'react-native';

// Configure how notifications appear when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
});

const notificationService = {
  // ─── Request permissions and register ────────────────────────────────────
  async register() {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Notifications] Permission not granted');
      return null;
    }

    // Android channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name:             'PO.PU Notifications',
        importance:       Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor:       '#1B5E20',
        sound:            'default',
      });
      await Notifications.setNotificationChannelAsync('orders', {
        name:             'Order Updates',
        importance:       Notifications.AndroidImportance.HIGH,
        sound:            'default',
      });
    }

    try {
      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: 'f2a6007e-a99b-4aa2-8106-97e276f3da91',
      })).data;
      await SecureStore.setItemAsync(FCM_TOKEN_KEY, token);
      await api.post('/api/profile/fcm-token', { fcmToken: token }).catch(() => {});
      return token;
    } catch (err) {
      console.error('[Notifications] Token error:', err);
      return null;
    }
  },

  // ─── API notifications ────────────────────────────────────────────────────
  getNotifications:  (params)  => api.get('/api/notifications', { params }).then(r => r.data),
  markRead:          (id)      => api.patch(`/api/notifications/${id}/read`).then(r => r.data),
  markAllRead:       ()        => api.patch('/api/notifications/read-all').then(r => r.data),
  getUnreadCount:    ()        => api.get('/api/notifications/unread-count').then(r => r.data),

  // ─── Schedule local notification ─────────────────────────────────────────
  async scheduleLocal(title, body, data = {}) {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data, sound: 'default' },
      trigger:  null, // immediate
    });
  },

  // ─── Add listeners ────────────────────────────────────────────────────────
  addReceivedListener(handler) {
    return Notifications.addNotificationReceivedListener(handler);
  },

  addResponseListener(handler) {
    return Notifications.addNotificationResponseReceivedListener(handler);
  },

  removeListener(sub) {
    Notifications.removeNotificationSubscription(sub);
  },

  // ─── Badge ────────────────────────────────────────────────────────────────
  setBadgeCount:     (n)       => Notifications.setBadgeCountAsync(n),
  clearBadge:        ()        => Notifications.setBadgeCountAsync(0),
};

export default notificationService;
