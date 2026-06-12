'use strict';

const paymentService = require('../services/paymentService');

/**
 * POST /api/webhooks/phonepe
 * PhonePe S2S server-to-server callback.
 * Always respond 200 immediately; process asynchronously.
 */
async function phonePeWebhook(req, res) {
  // Acknowledge immediately — PhonePe retries if it gets non-2xx
  res.status(200).json({ success: true });

  const body = req.body || {};

  // PhonePe v2 webhook shape:
  // { "type": "pg.order.completed"|"pg.order.failed", "payload": { merchantOrderId, state, ... } }
  const payload = body.payload || body;

  setImmediate(async () => {
    try {
      await paymentService.handleWebhookEvent(payload);
    } catch (err) {
      console.error('[WebhookController] PhonePe webhook processing failed:', err.message);
    }
  });
}

module.exports = { phonePeWebhook };
