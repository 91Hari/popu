'use strict';

const pool             = require('../config/db');
const { notifyUser }   = require('./notificationService');
const whatsappService  = require('./whatsappService');

// Delay config loaded from platform_settings; refreshed every 5 minutes
let config = {
  order_reminder_delay_secs:   30,
  order_whatsapp_delay_secs:   120,
  order_autocancel_delay_secs: 300,
};

async function loadConfig() {
  try {
    const { rows } = await pool.query(
      `SELECT order_reminder_delay_secs, order_whatsapp_delay_secs, order_autocancel_delay_secs
       FROM platform_settings
       ORDER BY created_at ASC LIMIT 1`
    );
    if (rows.length > 0) {
      config = {
        order_reminder_delay_secs:   rows[0].order_reminder_delay_secs   ?? 30,
        order_whatsapp_delay_secs:   rows[0].order_whatsapp_delay_secs   ?? 120,
        order_autocancel_delay_secs: rows[0].order_autocancel_delay_secs ?? 300,
      };
    }
  } catch (err) {
    console.error('[EscalationScheduler] Failed to load config:', err.message);
  }
}

// ---------------------------------------------------------------------------
// Shared query builder — finds PLACED orders past a given delay
// ---------------------------------------------------------------------------
async function fetchPlacedOrders({ delaySecs, reminderSentFilter, whatsappSentFilter }) {
  const conditions = [
    `co.status = 'PLACED'`,
    `co.created_at <= NOW() - make_interval(secs => $1)`,
  ];
  if (reminderSentFilter !== undefined) {
    conditions.push(`co.reminder_sent = ${reminderSentFilter}`);
  }
  if (whatsappSentFilter !== undefined) {
    conditions.push(`co.whatsapp_sent = ${whatsappSentFilter}`);
  }

  const { rows } = await pool.query(
    `SELECT co.id,
            co.subtotal,
            co.caterer_id,
            co.master_order_id,
            u.name        AS caterer_name,
            u.phone       AS caterer_phone,
            mo.customer_id,
            cu.name       AS customer_name
     FROM caterer_orders co
     JOIN master_orders mo ON mo.id = co.master_order_id
     JOIN users u           ON u.id  = co.caterer_id
     JOIN users cu          ON cu.id = mo.customer_id
     WHERE ${conditions.join(' AND ')}`,
    [delaySecs]
  );
  return rows;
}

// ---------------------------------------------------------------------------
// Job 1 — In-app reminder to caterer (runs every 15 s)
// ---------------------------------------------------------------------------
async function runReminderJob() {
  let orders;
  try {
    orders = await fetchPlacedOrders({
      delaySecs:          config.order_reminder_delay_secs,
      reminderSentFilter: false,
    });
  } catch (err) {
    console.error('[EscalationScheduler] reminderJob fetch error:', err.message);
    return;
  }

  for (const order of orders) {
    try {
      const shortId = order.id.slice(0, 8).toUpperCase();
      await notifyUser(order.caterer_id, {
        notification_type: 'ORDER_REMINDER',
        title:             '⚠️ Order Awaiting Response',
        message:           `Order #${shortId} from ${order.customer_name} has been waiting for your response. Please accept or reject it now.`,
        reference_id:      order.id,
      });
      await pool.query(
        `UPDATE caterer_orders SET reminder_sent = TRUE WHERE id = $1`,
        [order.id]
      );
    } catch (err) {
      console.error(`[EscalationScheduler] reminderJob failed for order ${order.id}:`, err.message);
    }
  }
}

// ---------------------------------------------------------------------------
// Job 2 — WhatsApp alert to caterer (runs every 30 s)
// ---------------------------------------------------------------------------
async function runWhatsappJob() {
  let orders;
  try {
    orders = await fetchPlacedOrders({
      delaySecs:           config.order_whatsapp_delay_secs,
      whatsappSentFilter:  false,
    });
  } catch (err) {
    console.error('[EscalationScheduler] whatsappJob fetch error:', err.message);
    return;
  }

  for (const order of orders) {
    if (!order.caterer_phone) {
      console.warn(`[EscalationScheduler] whatsappJob: caterer ${order.caterer_id} has no phone — skipping.`);
      // Mark sent so we don't keep logging the warning
      try {
        await pool.query(
          `UPDATE caterer_orders SET whatsapp_sent = TRUE WHERE id = $1`,
          [order.id]
        );
      } catch (upErr) {
        console.error(`[EscalationScheduler] whatsappJob mark-sent failed for order ${order.id}:`, upErr.message);
      }
      continue;
    }

    try {
      await whatsappService.send(order.caterer_phone, {
        orderId:      order.id,
        customerName: order.customer_name,
        amount:       order.subtotal,
      });
      await pool.query(
        `UPDATE caterer_orders SET whatsapp_sent = TRUE WHERE id = $1`,
        [order.id]
      );
    } catch (err) {
      console.error(`[EscalationScheduler] whatsappJob failed for order ${order.id}:`, err.message);
    }
  }
}

// ---------------------------------------------------------------------------
// Job 3 — Auto-cancel PLACED orders past auto-cancel delay (runs every 30 s)
// ---------------------------------------------------------------------------
async function runAutoCancelJob() {
  let orders;
  try {
    const { rows } = await pool.query(
      `SELECT co.id,
              co.subtotal,
              co.caterer_id,
              co.master_order_id,
              u.name  AS caterer_name,
              u.phone AS caterer_phone,
              mo.customer_id,
              cu.name AS customer_name
       FROM caterer_orders co
       JOIN master_orders mo ON mo.id = co.master_order_id
       JOIN users u           ON u.id  = co.caterer_id
       JOIN users cu          ON cu.id = mo.customer_id
       WHERE co.status = 'PLACED'
         AND co.created_at <= NOW() - make_interval(secs => $1)`,
      [config.order_autocancel_delay_secs]
    );
    orders = rows;
  } catch (err) {
    console.error('[EscalationScheduler] autoCancelJob fetch error:', err.message);
    return;
  }

  for (const order of orders) {
    try {
      // Update the caterer order to AUTO_CANCELLED
      const { rowCount } = await pool.query(
        `UPDATE caterer_orders
         SET status           = 'AUTO_CANCELLED',
             auto_cancelled_at = NOW(),
             cancelled_at      = NOW(),
             cancel_reason     = 'Automatically cancelled — caterer did not respond in time.'
         WHERE id = $1 AND status = 'PLACED'`,
        [order.id]
      );

      // Guard against race: another process may have already updated it
      if (rowCount === 0) continue;

      const shortId = order.id.slice(0, 8).toUpperCase();

      // Notify customer
      await notifyUser(order.customer_id, {
        notification_type: 'ORDER_AUTO_CANCELLED',
        title:             'Order Auto-Cancelled',
        message:           `Your order #${shortId} was automatically cancelled because the caterer did not respond in time.`,
        reference_id:      order.id,
      });

      // Notify caterer
      await notifyUser(order.caterer_id, {
        notification_type: 'ORDER_AUTO_CANCELLED',
        title:             'Order Auto-Cancelled',
        message:           `Order #${shortId} from ${order.customer_name} was automatically cancelled due to no response.`,
        reference_id:      order.id,
      });

      // Check for a successful payment on the master order and initiate refund
      try {
        const { rows: payRows } = await pool.query(
          `SELECT * FROM payments WHERE master_order_id = $1 AND payment_status = 'SUCCESS' LIMIT 1`,
          [order.master_order_id]
        );
        if (payRows.length > 0) {
          const payment      = payRows[0];
          const refundService = require('./refundService');
          await refundService.initiateRefund({
            paymentId:       payment.id,
            merchantOrderId: payment.merchant_transaction_id,
            catererOrderId:  order.id,
            masterOrderId:   order.master_order_id,
            refundAmount:    parseFloat(order.subtotal),
            reason:          `Auto-cancelled sub-order ${shortId} — caterer did not respond in time.`,
          });

          await notifyUser(order.customer_id, {
            notification_type: 'REFUND_INITIATED',
            title:             'Refund Initiated',
            message:           `A refund of ₹${parseFloat(order.subtotal).toFixed(2)} for order #${shortId} has been initiated and will be credited within 5–7 business days.`,
            reference_id:      order.master_order_id,
          });
        }
      } catch (refundErr) {
        console.error(`[EscalationScheduler] autoCancelJob refund failed for order ${order.id}:`, refundErr.message);
      }
    } catch (err) {
      console.error(`[EscalationScheduler] autoCancelJob failed for order ${order.id}:`, err.message);
    }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
function start() {
  // Load config immediately, then refresh every 5 minutes
  loadConfig();
  setInterval(loadConfig, 5 * 60 * 1000);

  // Job 1: reminder — every 15 s
  setInterval(runReminderJob, 15_000);

  // Job 2: WhatsApp — every 30 s
  setInterval(runWhatsappJob, 30_000);

  // Job 3: auto-cancel — every 30 s
  setInterval(runAutoCancelJob, 30_000);

  console.log('[EscalationScheduler] Started (reminder=15s, whatsapp=30s, autocancel=30s).');
}

module.exports = { start };
