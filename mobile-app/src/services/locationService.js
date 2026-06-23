import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { LOCATION_TASK_NAME } from '../config/constants';
import orderService from './orderService';

// ─── Background Task ──────────────────────────────────────────────────────────
// Must be defined at module top level (not inside a component)
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) { console.error('[Location Task]', error); return; }
  if (!data)  return;

  const { locations } = data;
  const loc = locations?.[0];
  if (!loc) return;

  try {
    const { orderId } = await TaskManager.getTaskOptionsAsync(LOCATION_TASK_NAME).catch(() => ({}));
    await orderService.updateRiderLocation(
      loc.coords.latitude,
      loc.coords.longitude,
      orderId,
    );
  } catch (e) {
    console.warn('[Location Task] Failed to send update:', e.message);
  }
});

// ─── Service ──────────────────────────────────────────────────────────────────
const locationService = {
  async requestPermissions() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  },

  async requestBackgroundPermissions() {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    return status === 'granted';
  },

  async getCurrentLocation() {
    const fg = await Location.requestForegroundPermissionsAsync();
    if (fg.status !== 'granted') throw new Error('Location permission denied');
    return Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  },

  async reverseGeocode(lat, lng) {
    const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    return results?.[0] ?? null;
  },

  async geocode(address) {
    const results = await Location.geocodeAsync(address);
    return results?.[0] ?? null;
  },

  // ─── Background tracking for Rider ───────────────────────────────────────
  async startBackgroundTracking(orderId) {
    const hasFg = await this.requestPermissions();
    if (!hasFg) throw new Error('Foreground location permission required');

    const hasBg = await this.requestBackgroundPermissions();
    if (!hasBg) throw new Error('Background location permission required for delivery tracking');

    const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).catch(() => false);
    if (isRunning) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy:         Location.Accuracy.High,
      distanceInterval: 10,          // every 10 metres
      timeInterval:     5_000,       // every 5 seconds
      foregroundService: {
        notificationTitle: 'PO.PU Delivery Active',
        notificationBody:  'Your location is being shared with the customer.',
        notificationColor:  '#1B5E20',
      },
      // Store orderId as task option
      taskOption: { orderId },
    });
  },

  async stopBackgroundTracking() {
    const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).catch(() => false);
    if (isRunning) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
  },

  isTrackingActive: () =>
    Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).catch(() => false),
};

export default locationService;
