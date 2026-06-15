'use strict';

// Fast2SMS REST API client — uses Node 18+ native fetch (no npm packages needed).
// OTP route: no DLT registration required.
//
// Required env var:
//   FAST2SMS_API_KEY=<key from fast2sms.com → Dashboard → Dev API>

const REQUEST_TIMEOUT_MS = 10_000;

function _requireApiKey() {
  const key = (process.env.FAST2SMS_API_KEY || '').trim();
  if (!key) {
    throw new Error(
      'FAST2SMS_API_KEY is not set. ' +
      'Add it in Render → your service → Environment → FAST2SMS_API_KEY.'
    );
  }
  return key;
}

async function _call(params) {
  const qs  = new URLSearchParams(params).toString();
  const url = `https://www.fast2sms.com/dev/bulkV2?${qs}`;

  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res, raw, body;
  try {
    res  = await fetch(url, {
      method:  'GET',
      headers: { 'cache-control': 'no-cache' },
      signal:  controller.signal,
    });
    raw  = await res.text();
    body = JSON.parse(raw);
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Fast2SMS: request timed out after 10 s');
    }
    throw new Error(`Fast2SMS: network/parse error — ${err.message}`);
  } finally {
    clearTimeout(timer);
  }

  // Always log the raw response so it appears in Render logs for debugging
  console.log(`[Fast2SMS] HTTP ${res.status} → ${raw}`);
  return body;
}

/**
 * Send a 6-digit OTP via the Fast2SMS OTP route (no DLT needed).
 * Fast2SMS delivers: "Your OTP is XXXXXX. Please do not share it with anyone."
 *
 * @param {string} mobileNumber  10-digit Indian mobile number, no country code
 * @param {string} otp           6-digit OTP string
 */
async function sendOtp(mobileNumber, otp) {
  const apiKey = _requireApiKey();
  console.log(`[Fast2SMS] Sending OTP to ${mobileNumber}`);

  const body = await _call({
    authorization:    apiKey,
    route:            'otp',
    variables_values: otp,
    numbers:          mobileNumber,
    flash:            '0',
  });

  if (body.return !== true) {
    const reason = Array.isArray(body.message)
      ? body.message.join(', ')
      : String(body.message ?? JSON.stringify(body));
    throw new Error(`Fast2SMS OTP failed: ${reason}`);
  }

  console.log(`[Fast2SMS] OTP dispatched to ${mobileNumber} (request_id: ${body.request_id})`);
}

/**
 * Send a custom text message via Fast2SMS Quick SMS route.
 * Requires DLT-registered sender + template for production traffic.
 *
 * @param {string} mobileNumber  10-digit Indian mobile number
 * @param {string} message       Full message text
 */
async function sendMessage(mobileNumber, message) {
  const apiKey = _requireApiKey();
  console.log(`[Fast2SMS] Sending message to ${mobileNumber}`);

  const body = await _call({
    authorization: apiKey,
    route:         'q',
    message,
    numbers:       mobileNumber,
    flash:         '0',
  });

  if (body.return !== true) {
    const reason = Array.isArray(body.message)
      ? body.message.join(', ')
      : String(body.message ?? JSON.stringify(body));
    throw new Error(`Fast2SMS message failed: ${reason}`);
  }

  console.log(`[Fast2SMS] Message dispatched to ${mobileNumber} (request_id: ${body.request_id})`);
}

module.exports = { sendOtp, sendMessage };
