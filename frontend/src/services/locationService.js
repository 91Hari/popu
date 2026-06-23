'use strict';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

/**
 * Request the device's current location.
 * On native Android/iOS uses Capacitor Geolocation (avoids GPS hang).
 * On browser falls back to navigator.geolocation.
 *
 * Resolves: { latitude: number, longitude: number }
 * Rejects:  Error with err.code matching PositionError codes (1 = denied, 2 = unavailable, 3 = timeout)
 */
export async function requestLocation() {
  if (Capacitor.isNativePlatform()) {
    let permStatus;
    try {
      permStatus = await Geolocation.checkPermissions();
    } catch {
      permStatus = { location: 'prompt' };
    }

    if (permStatus.location === 'denied') {
      const err = new Error(
        'Location permission denied. Please enable location access from your device settings.'
      );
      err.code = 1;
      throw err;
    }

    if (permStatus.location !== 'granted') {
      const requested = await Geolocation.requestPermissions({ permissions: ['location'] });
      if (requested.location !== 'granted') {
        const err = new Error(
          'Location permission denied. Please enable location access from your device settings.'
        );
        err.code = 1;
        throw err;
      }
    }

    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: false,
      timeout: 12000,
    });

    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  }

  // ── Browser fallback ──────────────────────────────────────────────────────
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      const err = new Error('Geolocation is not supported by your browser.');
      err.code = 0;
      reject(err);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 }
    );
  });
}
