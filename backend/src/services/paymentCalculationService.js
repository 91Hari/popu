'use strict';

/**
 * PaymentCalculationService
 *
 * Single source of truth for all order financial calculations.
 * Reads live settings from platform_settings (cached 60 s).
 *
 * Current phase (MVP): commission = 0%, platform fee = ₹0.
 * Enabling either requires only an admin toggle — no code changes.
 *
 * Usage:
 *   const { calculate } = require('./paymentCalculationService');
 *   const breakdown = await calculate(subtotal);
 *   // → { order_total, commission_percentage, commission_amount, platform_fee, caterer_payout }
 */

const pool = require('../config/db');

let _cache    = null;
let _expireAt = 0;
const CACHE_TTL_MS = 60_000;

async function getSettings() {
  const now = Date.now();
  if (_cache && now < _expireAt) return _cache;

  const { rows } = await pool.query(
    `SELECT commission_enabled, commission_percentage, platform_fee_enabled, platform_fee_amount
     FROM platform_settings ORDER BY created_at ASC LIMIT 1`
  );

  _cache = rows[0] || {
    commission_enabled:    false,
    commission_percentage: 0,
    platform_fee_enabled:  false,
    platform_fee_amount:   0,
  };
  _expireAt = now + CACHE_TTL_MS;
  return _cache;
}

/** Force next call to re-fetch from DB (call after admin updates settings). */
function invalidateCache() {
  _cache    = null;
  _expireAt = 0;
}

/**
 * Calculate full payment breakdown for an amount.
 *
 * @param {number} orderTotal  Raw sum of item prices for one caterer sub-order.
 * @returns {Promise<{
 *   order_total: number,
 *   commission_percentage: number,
 *   commission_amount: number,
 *   platform_fee: number,
 *   caterer_payout: number,
 * }>}
 */
async function calculate(orderTotal) {
  const s     = await getSettings();
  const total = Math.round(Number(orderTotal) * 100) / 100;

  const commissionPct = s.commission_enabled ? Number(s.commission_percentage) : 0;
  const commissionAmt = s.commission_enabled
    ? Math.round((total * commissionPct / 100) * 100) / 100
    : 0;

  const platformFee = s.platform_fee_enabled ? Number(s.platform_fee_amount) : 0;

  const payout = Math.max(0, Math.round((total - commissionAmt - platformFee) * 100) / 100);

  return {
    order_total:           total,
    commission_percentage: commissionPct,
    commission_amount:     commissionAmt,
    platform_fee:          platformFee,
    caterer_payout:        payout,
  };
}

module.exports = { calculate, getSettings, invalidateCache };
