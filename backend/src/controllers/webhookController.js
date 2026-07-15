'use strict';

const pool            = require('../config/db');
const paymentService  = require('../services/paymentService');
const razorpayService = require('../services/razorpayService');

/**
 * POST /api/webhooks/phonepe
 * PhonePe S2S server-to-server callback.
 * Always respond 200 immediately; process asynchronously.
 */
async function phonePeWebhook(req, res) {
  res.status(200).json({ success: true });

  const body    = req.body || {};
  const payload = body.payload || body;

  setImmediate(async () => {
    try {
      await paymentService.handleWebhookEvent(payload);
    } catch (err) {
      console.error('[Webhook] PhonePe processing failed:', err.message);
    }
  });
}

/**
 * POST /api/webhooks/razorpay
 * Razorpay S2S webhook — raw body required for signature verification.
 * Handles: payment.captured, payment.failed, refund.processed, refund.failed
 *
 * Idempotent: event_id stored in razorpay_webhook_events, duplicate events ignored.
 */
async function razorpayWebhook(req, res) {
  // Acknowledge immediately
  res.status(200).json({ success: true });

  const signature = req.headers['x-razorpay-signature'];
  const rawBody   = req.body; // Buffer (express.raw)

  setImmediate(async () => {
    try {
      // 1. Verify webhook signature
      if (!razorpayService.verifyWebhookSignature(rawBody, signature)) {
        console.warn('[Webhook] Razorpay signature mismatch — ignoring event');
        return;
      }

      const event = JSON.parse(rawBody.toString());
      const eventId   = event.id;
      const eventType = event.event;

      if (!eventId || !eventType) return;

      // 2. Idempotency check — skip if already processed
      const { rows: existing } = await pool.query(
        'SELECT id, processed FROM razorpay_webhook_events WHERE event_id = $1',
        [eventId]
      );
      if (existing.length > 0 && existing[0].processed) {
        console.log(`[Webhook] Razorpay event ${eventId} already processed — skipping`);
        return;
      }

      // 3. Insert or mark as processing
      if (existing.length === 0) {
        await pool.query(
          `INSERT INTO razorpay_webhook_events (event_id, event_type, payload)
           VALUES ($1, $2, $3) ON CONFLICT (event_id) DO NOTHING`,
          [eventId, eventType, JSON.stringify(event)]
        );
      }

      // 4. Handle each event type
      await handleRazorpayEvent(eventType, event);

      // 5. Mark processed
      await pool.query(
        `UPDATE razorpay_webhook_events
         SET processed = TRUE, processed_at = NOW()
         WHERE event_id = $1`,
        [eventId]
      );

      console.log(`[Webhook] Razorpay ${eventType} (${eventId}) processed`);
    } catch (err) {
      console.error('[Webhook] Razorpay processing failed:', err.message);
      try {
        const event   = JSON.parse(req.body?.toString() || '{}');
        const eventId = event.id;
        if (eventId) {
          await pool.query(
            `UPDATE razorpay_webhook_events
             SET error_message = $1
             WHERE event_id = $2`,
            [err.message, eventId]
          );
        }
      } catch { /* ignore secondary failure */ }
    }
  });
}

async function handleRazorpayEvent(eventType, event) {
  const payment = event.payload?.payment?.entity;
  const refund  = event.payload?.refund?.entity;

  switch (eventType) {
    case 'payment.captured': {
      if (!payment) return;
      // Update payments record by razorpay_order_id
      await pool.query(
        `UPDATE payments
         SET payment_status = 'SUCCESS',
             razorpay_payment_id = $1,
             updated_at = NOW()
         WHERE razorpay_order_id = $2
           AND payment_status = 'PENDING'`,
        [payment.id, payment.order_id]
      );
      // Also sync tiffin_orders if linked
      await pool.query(
        `UPDATE tiffin_orders t
         SET payment_status = 'SUCCESS',
             razorpay_payment_id = $1,
             confirmed_at = NOW()
         FROM payments p
         WHERE p.razorpay_order_id = $2
           AND p.tiffin_order_id = t.id
           AND t.payment_status = 'PENDING'`,
        [payment.id, payment.order_id]
      );
      break;
    }

    case 'payment.failed': {
      if (!payment) return;
      await pool.query(
        `UPDATE payments
         SET payment_status = 'FAILED',
             updated_at = NOW()
         WHERE razorpay_order_id = $1
           AND payment_status = 'PENDING'`,
        [payment.order_id]
      );
      await pool.query(
        `UPDATE tiffin_orders t
         SET payment_status = 'FAILED'
         FROM payments p
         WHERE p.razorpay_order_id = $1
           AND p.tiffin_order_id = t.id`,
        [payment.order_id]
      );
      break;
    }

    case 'refund.processed': {
      if (!refund) return;
      // Update refund status
      await pool.query(
        `UPDATE payments
         SET refund_status = 'SUCCESS',
             refunded_at = NOW()
         WHERE razorpay_payment_id = $1`,
        [refund.payment_id]
      );
      break;
    }

    case 'refund.failed': {
      if (!refund) return;
      await pool.query(
        `UPDATE payments
         SET refund_status = 'FAILED'
         WHERE razorpay_payment_id = $1`,
        [refund.payment_id]
      );
      break;
    }

    default:
      console.log(`[Webhook] Razorpay unhandled event type: ${eventType}`);
  }
}

module.exports = { phonePeWebhook, razorpayWebhook };
