'use strict';

// Fast2SMS REST API client
// Docs: https://docs.fast2sms.com
// OTP route: no DLT registration required — uses TRAI-approved OTP template.
// Quick SMS (sendMessage): requires DLT-registered sender ID + template.
//
// Required env var:
//   FAST2SMS_API_KEY=<your key from fast2sms.com dashboard → Dev API>

const https = require('https');

const FAST2SMS_HOST    = 'www.fast2sms.com';
const FAST2SMS_PATH    = '/dev/bulkV2';
const REQUEST_TIMEOUT  = 10_000; // 10 s

// Safe logger — never prints OTP values in production
function log(level, message, meta = {}) {
  const safe = { ...meta };
  if (process.env.NODE_ENV === 'production') {
    delete safe.otp;
    delete safe.variables_values;
  }
  const extra = Object.keys(safe).length ? ` ${JSON.stringify(safe)}` : '';
  console[level](`[Fast2SMS] ${message}${extra}`);
}

// Internal: make a GET request to the Fast2SMS bulk API
function _request(params) {
  const query   = new URLSearchParams(params).toString();
  const options = {
    hostname: FAST2SMS_HOST,
    path:     `${FAST2SMS_PATH}?${query}`,
    method:   'GET',
    headers:  { 'cache-control': 'no-cache' },
    timeout:  REQUEST_TIMEOUT,
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(raw) });
        } catch {
          reject(new Error(
            `Fast2SMS: unexpected non-JSON response [${res.statusCode}]: ${raw.slice(0, 200)}`
          ));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Fast2SMS: request timed out after 10 s'));
    });

    req.on('error', (err) => {
      reject(new Error(`Fast2SMS: network error — ${err.message}`));
    });

    req.end();
  });
}

function _requireApiKey() {
  const key = process.env.FAST2SMS_API_KEY;
  if (!key || !key.trim()) {
    throw new Error(
      'Fast2SMS: FAST2SMS_API_KEY is not set. ' +
      'Add it to your environment variables (Render → Environment → FAST2SMS_API_KEY).'
    );
  }
  return key.trim();
}

function _extractError(body) {
  if (Array.isArray(body.message)) return body.message.join(', ');
  if (typeof body.message === 'string') return body.message;
  return JSON.stringify(body);
}

/**
 * Send a 6-digit OTP to an Indian mobile number.
 * Uses Fast2SMS OTP route — no DLT registration required.
 *
 * Fast2SMS delivers: "Your OTP is <otp>. Please do not share it with anyone."
 *
 * @param {string} mobileNumber  10-digit number, no country code (+91 is added internally by Fast2SMS)
 * @param {string} otp           6-digit OTP string
 * @throws {Error} on API failure, network error, or missing API key
 */
async function sendOtp(mobileNumber, otp) {
  const apiKey = _requireApiKey();

  log('info', `Sending OTP to ${mobileNumber}`);

  const { statusCode, body } = await _request({
    authorization:    apiKey,
    route:            'otp',
    variables_values: otp,
    numbers:          mobileNumber,
    flash:            '0',
  });

  if (body.return !== true) {
    const reason = _extractError(body);
    log('error', `OTP delivery failed for ${mobileNumber}`, { statusCode, reason });
    throw new Error(`Fast2SMS OTP delivery failed: ${reason}`);
  }

  log('info', `OTP delivered to ${mobileNumber}`, { requestId: body.request_id });
}

/**
 * Send a custom text message via Fast2SMS Quick SMS route.
 * NOTE: Requires a DLT-registered sender ID and template for production traffic.
 *
 * @param {string} mobileNumber  10-digit number
 * @param {string} message       Full message text (must match DLT template)
 */
async function sendMessage(mobileNumber, message) {
  const apiKey = _requireApiKey();

  log('info', `Sending message to ${mobileNumber}`);

  const { statusCode, body } = await _request({
    authorization: apiKey,
    route:         'q',
    message,
    numbers:       mobileNumber,
    flash:         '0',
  });

  if (body.return !== true) {
    const reason = _extractError(body);
    log('error', `Message delivery failed for ${mobileNumber}`, { statusCode, reason });
    throw new Error(`Fast2SMS message delivery failed: ${reason}`);
  }

  log('info', `Message delivered to ${mobileNumber}`, { requestId: body.request_id });
}

module.exports = { sendOtp, sendMessage };
