'use strict';

/**
 * PhonePe Standard Checkout API v2
 *
 * Required env vars:
 *   PHONEPE_CLIENT_ID      OAuth client ID from PhonePe merchant dashboard
 *   PHONEPE_CLIENT_SECRET  OAuth client secret
 *   PHONEPE_CLIENT_VERSION Client version (default: 1)
 *   PHONEPE_ENV            'production' | 'uat'  (default: 'uat')
 *
 * Optional (for reference / fallback docs):
 *   PHONEPE_MERCHANT_ID    Merchant ID shown in dashboard
 *   PHONEPE_SALT_KEY       Salt key (used only in v1 HMAC API — not used here)
 *   PHONEPE_SALT_INDEX     Salt index (same)
 */

const PROD_BASE = 'https://api.phonepe.com/apis/pg';
const UAT_BASE  = 'https://api-preprod.phonepe.com/apis/pg';

// ─── DB-backed config with env-var fallback ───────────────────────────────────

let _configCache = null;
let _configExp   = 0;

async function getPhonePeConfig() {
  const now = Date.now();
  if (_configCache && now < _configExp) return _configCache;

  try {
    const pool = require('../config/db');
    const { rows } = await pool.query(
      `SELECT phonepe_client_id, phonepe_client_secret, phonepe_env, phonepe_client_version
       FROM platform_settings ORDER BY created_at ASC LIMIT 1`
    );
    const row = rows[0] || {};
    _configCache = {
      client_id:      row.phonepe_client_id      || process.env.PHONEPE_CLIENT_ID      || '',
      client_secret:  row.phonepe_client_secret  || process.env.PHONEPE_CLIENT_SECRET  || '',
      env:            row.phonepe_env            || process.env.PHONEPE_ENV            || 'uat',
      client_version: row.phonepe_client_version || process.env.PHONEPE_CLIENT_VERSION || '1',
    };
  } catch {
    // DB unavailable — fall back to env vars
    _configCache = {
      client_id:      process.env.PHONEPE_CLIENT_ID      || '',
      client_secret:  process.env.PHONEPE_CLIENT_SECRET  || '',
      env:            process.env.PHONEPE_ENV            || 'uat',
      client_version: process.env.PHONEPE_CLIENT_VERSION || '1',
    };
  }

  _configExp = now + 60_000; // re-read DB at most once per minute
  return _configCache;
}

// Cached access token
let _token     = null;
let _tokenExp  = 0;

async function getAccessToken() {
  const now = Date.now();
  if (_token && now < _tokenExp) return _token;

  const cfg = await getPhonePeConfig();
  if (!cfg.client_id || !cfg.client_secret) {
    throw Object.assign(
      new Error('PhonePe not configured. Set credentials in Admin → Platform Settings.'),
      { status: 503 }
    );
  }

  const baseUrl = cfg.env === 'production' ? PROD_BASE : UAT_BASE;
  const url     = `${baseUrl}/v1/oauth/token`;
  const body    = new URLSearchParams({
    grant_type:     'client_credentials',
    client_id:      cfg.client_id,
    client_secret:  cfg.client_secret,
    client_version: cfg.client_version,
  });

  const res  = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  });
  const data = await res.json();

  if (!res.ok) {
    throw Object.assign(
      new Error(`PhonePe token error ${res.status}: ${data.message || res.statusText}`),
      { status: 502 }
    );
  }

  _token    = data.access_token;
  _tokenExp = now + Math.max(0, (data.expires_in || 900) - 60) * 1000;
  return _token;
}

async function authHeaders() {
  const token = await getAccessToken();
  return {
    'Content-Type':  'application/json',
    'Authorization': `O-Bearer ${token}`,
  };
}

async function baseUrl() {
  const cfg = await getPhonePeConfig();
  return cfg.env === 'production' ? PROD_BASE : UAT_BASE;
}

/**
 * Create a Standard Checkout payment order.
 * Returns { orderId, state, checkoutUrl, expireAt }
 */
async function createPaymentOrder({ merchantOrderId, amountInPaise, redirectUrl }) {
  const url     = `${await baseUrl()}/v2/pg/orders`;
  const headers = await authHeaders();

  const res  = await fetch(url, {
    method:  'POST',
    headers,
    body: JSON.stringify({
      merchantOrderId,
      amount:      amountInPaise,
      expireAfter: 1200,
      paymentFlow: {
        type:    'PG_CHECKOUT',
        message: 'Payment for PO.PU Order',
        merchantUrls: { redirectUrl },
      },
    }),
  });
  const data = await res.json();

  if (!res.ok) {
    throw Object.assign(
      new Error(`PhonePe create order ${res.status}: ${data.message || res.statusText}`),
      { status: 502 }
    );
  }
  return data; // { orderId, state, checkoutUrl, expireAt }
}

/**
 * Fetch status of a payment order.
 * Returns { orderId, merchantOrderId, state, amount, paymentDetails[] }
 * state: CREATED | PENDING | COMPLETED | FAILED | CANCELLED
 */
async function getOrderStatus(merchantOrderId) {
  const url     = `${await baseUrl()}/v2/pg/orders/${encodeURIComponent(merchantOrderId)}`;
  const headers = await authHeaders();

  const res  = await fetch(url, { headers });
  const data = await res.json();

  if (!res.ok) {
    throw Object.assign(
      new Error(`PhonePe status check ${res.status}: ${data.message || res.statusText}`),
      { status: 502 }
    );
  }
  return data;
}

/**
 * Initiate a refund.
 * Returns { refundId, state, amount, ... }
 */
async function createRefund({ originalMerchantOrderId, merchantRefundId, amountInPaise }) {
  const url     = `${await baseUrl()}/v2/pg/refunds`;
  const headers = await authHeaders();

  const res  = await fetch(url, {
    method:  'POST',
    headers,
    body: JSON.stringify({
      originalMerchantOrderId,
      merchantRefundId,
      amount: amountInPaise,
    }),
  });
  const data = await res.json();

  if (!res.ok) {
    throw Object.assign(
      new Error(`PhonePe refund ${res.status}: ${data.message || res.statusText}`),
      { status: 502 }
    );
  }
  return data;
}

/**
 * Fetch refund status.
 */
async function getRefundStatus(merchantRefundId) {
  const url     = `${await baseUrl()}/v2/pg/refunds/${encodeURIComponent(merchantRefundId)}`;
  const headers = await authHeaders();

  const res  = await fetch(url, { headers });
  const data = await res.json();

  if (!res.ok) {
    throw Object.assign(
      new Error(`PhonePe refund status ${res.status}: ${data.message || res.statusText}`),
      { status: 502 }
    );
  }
  return data;
}

/**
 * Validate a UPI VPA (Virtual Payment Address).
 * Returns { valid: boolean, name: string|null }
 * If PhonePe API is unreachable or not configured, throws so caller can degrade gracefully.
 */
async function validateVpa(vpa) {
  const url     = `${await baseUrl()}/v2/pg/vpa/validate`;
  const headers = await authHeaders();

  const res  = await fetch(url, {
    method:  'POST',
    headers,
    body: JSON.stringify({ vpa }),
  });
  const data = await res.json();

  // PhonePe returns success:false for unregistered VPAs (not an HTTP error)
  return {
    valid: data.success === true && data.data?.valid === true,
    name:  data.data?.name || null,
  };
}

function clearTokenCache() {
  _token    = null;
  _tokenExp = 0;
}

function clearConfigCache() {
  _configCache = null;
  _configExp   = 0;
  clearTokenCache(); // credentials changed — old token is invalid
}

module.exports = {
  createPaymentOrder,
  getOrderStatus,
  createRefund,
  getRefundStatus,
  validateVpa,
  clearTokenCache,
  clearConfigCache,
};
