import { r as reactExports } from "./index-EstIw0RN.js";
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (x) => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function travelTimeMinutes(distKm) {
  if (distKm <= 3) return 10;
  if (distKm <= 8) return 20;
  if (distKm <= 15) return 30;
  return 45;
}
function etaMinutes(km, _unused_speedKmh = 25) {
  return Math.max(10, (km == null ? 20 : travelTimeMinutes(km)) + 20);
}
function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1e3)} m`;
  return `${km.toFixed(1)} km`;
}
function formatEta(min) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
function etaRange(totalMinutes, buf = 5) {
  const low = Math.max(10, totalMinutes - buf);
  const high = totalMinutes + buf;
  return `${low}-${high} mins`;
}
function formatArrivalTime(dateOrIso) {
  if (!dateOrIso) return null;
  const d = dateOrIso instanceof Date ? dateOrIso : new Date(dateOrIso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}
function useCustomerGeo() {
  const [coords, setCoords] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
      }
    );
  }, []);
  return coords;
}
export {
  formatDistance as a,
  formatEta as b,
  etaMinutes as c,
  etaRange as e,
  formatArrivalTime as f,
  haversineKm as h,
  travelTimeMinutes as t,
  useCustomerGeo as u
};
