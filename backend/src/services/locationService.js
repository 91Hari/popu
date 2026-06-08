'use strict';

/**
 * Haversine great-circle distance between two GPS coordinates.
 * @returns distance in kilometres
 */
function haversineKm(lat1, lng1, lat2, lng2) {
  const R     = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat  = toRad(lat2 - lat1);
  const dLng  = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Bracket-based travel time matching the delivery settings.
 * 0-3 km → 10 min | 3-8 km → 20 min | 8-15 km → 30 min | 15+ km → 45 min
 */
function travelTimeMinutes(distKm) {
  if (distKm <= 3)  return 10;
  if (distKm <= 8)  return 20;
  if (distKm <= 15) return 30;
  return 45;
}

/**
 * Calculate full ETA metadata for a single caterer ↔ customer pair.
 * @param {number} preparationMinutes  - food prep time
 * @param {number} distKm              - distance between caterer and customer
 * @returns {{ preparationTime, travelTime, etaMinutes, etaRange, distanceKm }}
 */
function calculateETA(preparationMinutes, distKm) {
  const prep   = preparationMinutes || 20;
  const travel = travelTimeMinutes(distKm);
  const total  = prep + travel;
  const buf    = 5;
  const low    = Math.max(10, total - buf);
  const high   = total + buf;
  return {
    preparationTime: prep,
    travelTime:      travel,
    etaMinutes:      total,
    etaRange:        `${low}-${high} mins`,
    distanceKm:      parseFloat(distKm.toFixed(2)),
  };
}

/**
 * Given a customer location and an array of food-item rows (each with
 * caterer_lat, caterer_lng, preparation_time_minutes), return the worst-case
 * ETA (max across all caterers involved in the order).
 */
function orderETA(customerLat, customerLng, foodRows) {
  const validRows = foodRows.filter(
    (r) => r.caterer_lat != null && r.caterer_lng != null
  );
  if (validRows.length === 0) return null;

  // Group by caterer — prep time = max of items from that caterer
  const byId = {};
  for (const r of validRows) {
    const key = `${r.caterer_lat},${r.caterer_lng}`;
    if (!byId[key]) byId[key] = { lat: r.caterer_lat, lng: r.caterer_lng, prep: 0 };
    byId[key].prep = Math.max(byId[key].prep, r.preparation_time_minutes || 20);
  }

  let worstEta = 0;
  for (const { lat, lng, prep } of Object.values(byId)) {
    const dist = haversineKm(customerLat, customerLng, Number(lat), Number(lng));
    const eta  = prep + travelTimeMinutes(dist);
    if (eta > worstEta) worstEta = eta;
  }

  return worstEta;
}

module.exports = { haversineKm, travelTimeMinutes, calculateETA, orderETA };
