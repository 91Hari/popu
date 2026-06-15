'use strict';

const crypto = require('crypto');

const OTP_EXPIRY_MINUTES   = 5;
const MAX_ATTEMPTS         = 5;
const MAX_RESENDS_PER_HOUR = 5;

function generateOtp() {
  // Cryptographically secure 6-digit OTP (000000–999999)
  const n = crypto.randomBytes(4).readUInt32BE(0) % 1_000_000;
  return String(n).padStart(6, '0');
}

function hashOtp(otp, mobileNumber) {
  // HMAC-SHA256: mobile number acts as the key, OTP as the message.
  // Timing-safe comparison happens in verifyOtpHash.
  return crypto.createHmac('sha256', mobileNumber).update(otp).digest('hex');
}

function verifyOtpHash(otp, mobileNumber, storedHash) {
  const computed = hashOtp(otp, mobileNumber);
  if (computed.length !== storedHash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(storedHash, 'hex'));
}

async function sendOtp(mobileNumber, otp) {
  const env = process.env.NODE_ENV;

  if (env !== 'production') {
    // Development / staging: print OTP to console so developers can test
    console.log(`\n🔑 [OTP DEV] ${mobileNumber} → ${otp}  (valid ${OTP_EXPIRY_MINUTES} min)\n`);
    return;
  }

  // Production: configure one of the providers below via environment variables.
  // Uncomment the block for your chosen provider.

  // ── MSG91 ──────────────────────────────────────────────────────────────────
  // const { default: fetch } = await import('node-fetch');
  // await fetch('https://api.msg91.com/api/v5/otp', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', 'authkey': process.env.MSG91_AUTH_KEY },
  //   body: JSON.stringify({ mobile: `91${mobileNumber}`, otp, template_id: process.env.MSG91_TEMPLATE_ID }),
  // });

  // ── Twilio ─────────────────────────────────────────────────────────────────
  // const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
  // await twilio.messages.create({
  //   body: `Your PO.PU OTP is ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share.`,
  //   from: process.env.TWILIO_FROM,
  //   to: `+91${mobileNumber}`,
  // });

  // ── Fast2SMS ───────────────────────────────────────────────────────────────
  // const { default: fetch } = await import('node-fetch');
  // await fetch(`https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMS_KEY}&variables_values=${otp}&route=otp&numbers=${mobileNumber}`);

  // ── AWS SNS ────────────────────────────────────────────────────────────────
  // const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
  // const sns = new SNSClient({ region: process.env.AWS_REGION });
  // await sns.send(new PublishCommand({
  //   PhoneNumber: `+91${mobileNumber}`,
  //   Message: `Your PO.PU OTP is ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
  // }));

  throw new Error(
    'SMS provider not configured. Set NODE_ENV=development or uncomment an SMS provider in otpService.js.'
  );
}

module.exports = {
  OTP_EXPIRY_MINUTES,
  MAX_ATTEMPTS,
  MAX_RESENDS_PER_HOUR,
  generateOtp,
  hashOtp,
  verifyOtpHash,
  sendOtp,
};
