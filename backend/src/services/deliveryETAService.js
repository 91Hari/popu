'use strict';

const axios = require('axios');
const { haversineKm, travelTimeMinutes } = require('./locationService');

const GMAPS_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GMAPS_TIMEOUT_MS = 5000;

// ─── Traffic-aware point-to-point ETA ────────────────────────────────────────
async function getTrafficAwareETA(origin, destination) {
  if (!GMAPS_KEY) return _haversineFallback(origin, destination);

  try {
    const resp = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
      params: {
        origins:        `${origin.lat},${origin.lng}`,
        destinations:   `${destination.lat},${destination.lng}`,
        departure_time: 'now',
        traffic_model:  'best_guess',
        key:            GMAPS_KEY,
      },
      timeout: GMAPS_TIMEOUT_MS,
    });

    const element = resp.data?.rows?.[0]?.elements?.[0];
    if (!element || element.status !== 'OK') {
      throw new Error(`Distance Matrix status: ${element?.status}`);
    }

    return {
      distance_km:          parseFloat((element.distance.value / 1000).toFixed(2)),
      normal_duration_min:  Math.ceil(element.duration.value / 60),
      traffic_duration_min: Math.ceil((element.duration_in_traffic?.value ?? element.duration.value) / 60),
    };
  } catch (err) {
    console.warn('[ETA] Google Maps fallback:', err.message);
    return _haversineFallback(origin, destination);
  }
}

function _haversineFallback(origin, destination) {
  const dist = haversineKm(origin.lat, origin.lng, destination.lat, destination.lng);
  const mins = travelTimeMinutes(dist);
  return { distance_km: parseFloat(dist.toFixed(2)), normal_duration_min: mins, traffic_duration_min: mins };
}

// ─── Route optimisation (Directions API with waypoint optimise) ───────────────
// waypoints: [{lat, lng, type: 'pickup'|'dropoff', label, task_id}]
async function getOptimizedRoute(waypoints) {
  if (!GMAPS_KEY || waypoints.length < 2) {
    return { waypoints, optimized: false, total_duration_min: null };
  }

  const origin      = waypoints[0];
  const destination = waypoints[waypoints.length - 1];
  const middle      = waypoints.slice(1, -1);

  if (middle.length === 0) {
    const leg = await getTrafficAwareETA(
      { lat: origin.lat, lng: origin.lng },
      { lat: destination.lat, lng: destination.lng }
    );
    return { waypoints, optimized: false, total_duration_min: leg.traffic_duration_min };
  }

  try {
    const resp = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin:         `${origin.lat},${origin.lng}`,
        destination:    `${destination.lat},${destination.lng}`,
        waypoints:      `optimize:true|${middle.map(w => `${w.lat},${w.lng}`).join('|')}`,
        departure_time: 'now',
        traffic_model:  'best_guess',
        key:            GMAPS_KEY,
      },
      timeout: 8000,
    });

    if (resp.data.status !== 'OK') throw new Error(resp.data.status);

    const order     = resp.data.routes[0]?.waypoint_order ?? [];
    const reordered = [origin, ...order.map(i => middle[i]), destination].filter(Boolean);

    const totalSec = resp.data.routes[0]?.legs?.reduce((s, l) =>
      s + (l.duration_in_traffic?.value ?? l.duration.value), 0) ?? 0;

    return {
      waypoints:         reordered,
      optimized:         true,
      total_duration_min: Math.ceil(totalSec / 60),
      route_summary:     resp.data.routes[0]?.summary ?? '',
    };
  } catch (err) {
    console.warn('[Route] Optimization fallback:', err.message);
    return { waypoints, optimized: false, total_duration_min: null };
  }
}

// ─── Full batch ETA ───────────────────────────────────────────────────────────
// tasks: [{pickup_latitude, pickup_longitude, drop_latitude, drop_longitude, preparation_time_minutes}]
async function calculateBatchETA(tasks, riderLat, riderLng) {
  if (!tasks?.length) return 30;

  let total = 0;

  // Rider → first pickup travel time
  const firstPickup = tasks[0];
  if (riderLat != null && riderLng != null && firstPickup.pickup_latitude) {
    const leg = await getTrafficAwareETA(
      { lat: riderLat,                            lng: riderLng },
      { lat: parseFloat(firstPickup.pickup_latitude), lng: parseFloat(firstPickup.pickup_longitude) }
    );
    total += leg.traffic_duration_min;
  } else {
    total += 10;
  }

  // ETA can't be less than max preparation time (food must be ready)
  const maxPrep = Math.max(...tasks.map(t => t.preparation_time_minutes ?? 20));
  total = Math.max(total, maxPrep);

  // Add pickup → drop travel for each task in sequence
  for (const task of tasks) {
    if (!task.pickup_latitude || !task.drop_latitude) { total += 15; continue; }
    const leg = await getTrafficAwareETA(
      { lat: parseFloat(task.pickup_latitude),  lng: parseFloat(task.pickup_longitude) },
      { lat: parseFloat(task.drop_latitude),    lng: parseFloat(task.drop_longitude) }
    );
    total += leg.traffic_duration_min + 3; // 3 min per handoff
  }

  return Math.ceil(total);
}

// ─── ETA refresh for active batches ──────────────────────────────────────────
async function runETARefreshJob() {
  const pool = require('../config/db');

  const { rows: activeBatches } = await pool.query(
    `SELECT db.id, db.rider_id,
            rp.current_latitude, rp.current_longitude,
            json_agg(
              json_build_object(
                'pickup_latitude',          dt.pickup_latitude,
                'pickup_longitude',         dt.pickup_longitude,
                'drop_latitude',            dt.drop_latitude,
                'drop_longitude',           dt.drop_longitude,
                'preparation_time_minutes', dt.preparation_time_minutes
              ) ORDER BY dbt.sequence_number
            ) AS tasks
     FROM delivery_batches db
     JOIN rider_profiles rp ON rp.user_id = db.rider_id
     JOIN delivery_batch_tasks dbt ON dbt.batch_id = db.id
     JOIN delivery_tasks dt ON dt.id = dbt.delivery_task_id
     WHERE db.status IN ('ASSIGNED', 'PICKING_UP', 'DELIVERING')
     GROUP BY db.id, db.rider_id, rp.current_latitude, rp.current_longitude`
  );

  for (const batch of activeBatches) {
    try {
      const eta = await calculateBatchETA(
        batch.tasks,
        batch.current_latitude  ? parseFloat(batch.current_latitude)  : null,
        batch.current_longitude ? parseFloat(batch.current_longitude) : null
      );
      await pool.query(
        `UPDATE delivery_batches SET eta_minutes = $1, updated_at = NOW() WHERE id = $2`,
        [eta, batch.id]
      );
    } catch (err) {
      console.error(`[ETA] Refresh failed for batch ${batch.id}:`, err.message);
    }
  }

  if (activeBatches.length > 0) {
    console.log(`[ETA] Refreshed ETA for ${activeBatches.length} active batch(es).`);
  }
}

module.exports = { getTrafficAwareETA, getOptimizedRoute, calculateBatchETA, runETARefreshJob };
