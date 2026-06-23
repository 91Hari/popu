'use strict';

/**
 * SMS OTP utility.
 * Integrate your SMS provider here (MSG91, Twilio, AWS SNS, etc.).
 * Falls back to console logging in development.
 *
 * To integrate MSG91 (popular in India):
 *   Set env vars: MSG91_AUTH_KEY, MSG91_SENDER_ID, MSG91_TEMPLATE_ID
 *
 * To integrate Twilio:
 *   Set env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 */

async function sendOtp({ mobile, otp, name }) {
  // ── MSG91 integration ──────────────────────────────────────────────────────
  if (process.env.MSG91_AUTH_KEY) {
    try {
      const response = await fetch('https://api.msg91.com/api/v5/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'authkey': process.env.MSG91_AUTH_KEY },
        body: JSON.stringify({
          template_id: process.env.MSG91_TEMPLATE_ID,
          mobile:      `91${mobile}`,
          otp,
        }),
      });
      const data = await response.json();
      if (data.type === 'success') {
        console.log(`[SMS] OTP sent to +91${mobile} via MSG91`);
        return;
      }
      console.error('[SMS] MSG91 error:', data);
    } catch (err) {
      console.error('[SMS] MSG91 request failed:', err.message);
    }
  }

  // ── Twilio integration (commented template) ────────────────────────────────
  // if (process.env.TWILIO_ACCOUNT_SID) {
  //   const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  //   await twilio.messages.create({
  //     body: `Your PO.PU OTP is: ${otp}. Valid for 5 minutes. Do not share.`,
  //     from: process.env.TWILIO_PHONE_NUMBER,
  //     to:   `+91${mobile}`,
  //   });
  //   console.log(`[SMS] OTP sent to +91${mobile} via Twilio`);
  //   return;
  // }

  // Dev fallback — log to console
  console.log('\n📱 [OTP SMS — DEV CONSOLE]');
  console.log(`   To      : +91${mobile} (${name})`);
  console.log(`   OTP     : ${otp}`);
  console.log(`   Expires : 5 minutes\n`);
}

module.exports = { sendOtp };
