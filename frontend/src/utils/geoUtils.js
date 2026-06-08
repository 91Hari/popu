import { useState, useEffect } from "react";

// Haversine great-circle distance (km)
export function haversineKm(lat1, lng1, lat2, lng2) {
  const R     = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat  = toRad(lat2 - lat1);
  const dLng  = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Bracket-based travel time matching backend delivery_settings
export function travelTimeMinutes(distKm) {
  if (distKm <= 3)  return 10;
  if (distKm <= 8)  return 20;
  if (distKm <= 15) return 30;
  return 45;
}

// Min ETA clamped to 10 min
export function etaMinutes(km, _unused_speedKmh = 25) {
  return Math.max(10, (km == null ? 20 : travelTimeMinutes(km)) + 20);
}

export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function formatEta(min) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// "35-45 mins" style range with a ±5 buffer
export function etaRange(totalMinutes, buf = 5) {
  const low  = Math.max(10, totalMinutes - buf);
  const high = totalMinutes + buf;
  return `${low}-${high} mins`;
}

// Format a Date (or ISO string) as "7:45 PM"
export function formatArrivalTime(dateOrIso) {
  if (!dateOrIso) return null;
  const d = dateOrIso instanceof Date ? dateOrIso : new Date(dateOrIso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

// React hook — resolves once to customer's GPS, silently ignores denial
export function useCustomerGeo() {
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  return coords;
}
