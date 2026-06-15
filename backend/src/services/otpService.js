'use strict';

// OTP crypto utilities only.
// SMS delivery is handled by notificationService.sendOtp() → fast2smsService.

const crypto = require('crypto');

const OTP_EXPIRY_MINUTES   = 5;
const MAX_ATTEMPTS         = 5;
const MAX_RESENDS_PER_HOUR = 5;

// Cryptographically secure 6-digit OTP (000000–999999)
function generateOtp() {
  const n = crypto.randomBytes(4).readUInt32BE(0) % 1_000_000;
  return String(n).padStart(6, '0');
}

// HMAC-SHA256: mobile number is the key, OTP is the message.
// Prevents OTP reuse across different numbers even if the raw value collides.
function hashOtp(otp, mobileNumber) {
  return crypto.createHmac('sha256', mobileNumber).update(otp).digest('hex');
}

// Constant-time comparison to prevent timing attacks.
function verifyOtpHash(otp, mobileNumber, storedHash) {
  const computed = hashOtp(otp, mobileNumber);
  if (computed.length !== storedHash.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(computed,    'hex'),
    Buffer.from(storedHash,  'hex')
  );
}

module.exports = {
  OTP_EXPIRY_MINUTES,
  MAX_ATTEMPTS,
  MAX_RESENDS_PER_HOUR,
  generateOtp,
  hashOtp,
  verifyOtpHash,
};
