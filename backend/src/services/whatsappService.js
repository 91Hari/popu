'use strict';

const https = require('https');

/**
 * Send a WhatsApp message via the Twilio REST API.
 * Uses Node.js built-in https — no external packages required.
 *
 * @param {string} toPhone  - Recipient's phone number (raw, e.g. "9876543210" or "+919876543210")
 * @param {{ orderId: string, customerName: string, amount: number }} payload
 */
async function send(toPhone, { orderId, customerName, amount }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const from       = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

  if (!accountSid) {
    console.warn('[WhatsAppService] TWILIO_ACCOUNT_SID not set — skipping WhatsApp send.');
    return;
  }

  // Normalize phone number
  const normalised = toPhone.startsWith('+') ? toPhone : `+91${toPhone}`;
  const to         = `whatsapp:${normalised}`;

  const shortId = orderId.slice(0, 8).toUpperCase();
  const amountStr = parseFloat(amount).toFixed(2);

  const body =
    `🍽️ *PO.PU — New Order Alert*\n\n` +
    `*Order ID:* #${shortId}\n` +
    `*Customer:* ${customerName}\n` +
    `*Amount:* ₹${amountStr}\n\n` +
    `Please login and accept or reject the order immediately.\n\n` +
    `⏰ Order will be auto-cancelled if not responded to within 5 minutes.`;

  const postData = new URLSearchParams({ From: from, To: to, Body: body }).toString();

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.twilio.com',
      path:     `/2010-04-01/Accounts/${accountSid}/Messages.json`,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization':  'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          const err = new Error(`Twilio API error ${res.statusCode}: ${data}`);
          err.statusCode = res.statusCode;
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

module.exports = { send };
