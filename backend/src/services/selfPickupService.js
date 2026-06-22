'use strict';

const pool                = require('../config/db');
const { haversineKm }     = require('./locationService');

// ─── Config cache (60 s TTL) ─────────────────────────────────────────────────
let _cfg = null, _exp = 0;
const CACHE_TTL = 60_000;

async function getPickupConfig() {
  if (_cfg && Date.now() < _exp) return _cfg;
  const { rows } = await pool.query(
    `SELECT pickup_recommendation_enabled, pickup_radius_km, pickup_min_saving,
            platform_fee_enabled, platform_fee_amount
     FROM platform_settings LIMIT 1`
  );
  _cfg = rows[0] || {
    pickup_recommendation_enabled: true,
    pickup_radius_km:   3.0,
    pickup_min_saving:  0,
    platform_fee_enabled: false,
    platform_fee_amount:  0,
  };
  _exp = Date.now() + CACHE_TTL;
  return _cfg;
}

function invalidatePickupCache() { _cfg = null; _exp = 0; }

// ─── Secure alphanumeric code (no ambiguous chars 0/O/1/I) ───────────────────
function generatePickupCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ─── Smart message builder ────────────────────────────────────────────────────
function buildMessage(distKm, saving) {
  if (saving >= 50) return `Save ₹${Math.round(saving)} by picking up your order 🚀`;
  if (distKm < 0.5) return 'Your food is ready nearby. Skip the wait for delivery!';
  if (distKm < 1.5) return 'Nearby caterer! Collect faster and save delivery charges.';
  return `Only ${distKm.toFixed(1)} km away — pick up and save ₹${Math.round(saving)}`;
}

// ─── Eligibility engine ───────────────────────────────────────────────────────
async function getRecommendation({ caterer_id, customer_lat, customer_lng, food_item_ids = [] }) {
  const cfg = await getPickupConfig();

  if (!cfg.pickup_recommendation_enabled) return { show: false };
  if (!customer_lat || !customer_lng)     return { show: false };

  // Get caterer location
  const { rows: catRows } = await pool.query(
    `SELECT latitude, longitude FROM users WHERE id = $1`, [caterer_id]
  );
  const caterer = catRows[0];
  if (!caterer?.latitude || !caterer?.longitude) return { show: false };

  // Rule 1 — Distance
  const distKm = haversineKm(
    parseFloat(customer_lat), parseFloat(customer_lng),
    parseFloat(caterer.latitude), parseFloat(caterer.longitude)
  );
  if (distKm > parseFloat(cfg.pickup_radius_km)) return { show: false };

  // Rule 2 — Saving (platform fee = delivery charge the customer pays)
  const saving = cfg.platform_fee_enabled ? parseFloat(cfg.platform_fee_amount) : 0;
  if (saving <= parseFloat(cfg.pickup_min_saving)) return { show: false };

  // Rule 3 — Prep time ≤ 60 min
  let maxPrep = 20;
  if (food_item_ids.length > 0) {
    const { rows: prepRows } = await pool.query(
      `SELECT COALESCE(MAX(preparation_time_minutes), 20) AS max_prep
       FROM food_items WHERE id = ANY($1::uuid[])`,
      [food_item_ids]
    );
    maxPrep = parseInt(prepRows[0]?.max_prep ?? 20, 10);
  }
  if (maxPrep > 60) return { show: false };

  const distLabel = distKm < 1
    ? `${Math.round(distKm * 1000)} m`
    : `${distKm.toFixed(1)} km`;

  return {
    show:          true,
    distance_km:   parseFloat(distKm.toFixed(2)),
    distance_label: distLabel,
    saving:        saving,
    prep_time:     maxPrep,
    message:       buildMessage(distKm, saving),
    caterer_lat:   parseFloat(caterer.latitude),
    caterer_lng:   parseFloat(caterer.longitude),
  };
}

// ─── Analytics ────────────────────────────────────────────────────────────────
async function trackEvent({ master_order_id = null, customer_id, caterer_id, event, distance_km, saving_amount }) {
  try {
    await pool.query(
      `INSERT INTO pickup_analytics
         (master_order_id, customer_id, caterer_id, event, distance_km, saving_amount)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [master_order_id, customer_id, caterer_id, event,
       distance_km ?? null, saving_amount ?? null]
    );
  } catch (err) {
    console.error('[SelfPickup] Analytics error:', err.message);
  }
}

// ─── Caterer confirms pickup ──────────────────────────────────────────────────
async function confirmPickupCollection(caterer_order_id, pickup_code, caterer_id) {
  const { rows } = await pool.query(
    `SELECT id, pickup_code, status, fulfillment_type, caterer_id, customer_id, master_order_id
     FROM caterer_orders WHERE id = $1`,
    [caterer_order_id]
  );
  const order = rows[0];
  if (!order)                                    { const e = new Error('Order not found');      e.status = 404; throw e; }
  if (order.caterer_id !== caterer_id)           { const e = new Error('Forbidden');            e.status = 403; throw e; }
  if (order.fulfillment_type !== 'SELF_PICKUP')  { const e = new Error('Not a pickup order');  e.status = 400; throw e; }
  if ((order.pickup_code || '').toUpperCase() !== pickup_code.toUpperCase()) {
    const e = new Error('Invalid pickup code'); e.status = 400; throw e;
  }
  if (['COLLECTED', 'DELIVERED'].includes(order.status)) {
    const e = new Error('Order already collected'); e.status = 400; throw e;
  }

  const { rows: updated } = await pool.query(
    `UPDATE caterer_orders
     SET status = 'COLLECTED', collected_at = NOW(), updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [caterer_order_id]
  );

  // Track analytics
  setImmediate(() => trackEvent({
    master_order_id: order.master_order_id,
    customer_id:     order.customer_id,
    caterer_id,
    event:           'COLLECTED',
    distance_km:     null,
    saving_amount:   null,
  }));

  return updated[0];
}

module.exports = {
  getRecommendation,
  generatePickupCode,
  confirmPickupCollection,
  trackEvent,
  invalidatePickupCache,
};
