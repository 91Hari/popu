'use strict';

const { randomUUID }   = require('crypto');
const pool             = require('../config/db');
const phonePe          = require('./phonePeService');
const payCalc          = require('./paymentCalculationService');
const { notifyUser, NOTIFICATION_TYPES } = require('./notificationService');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://popu.co.in';

function generateMerchantOrderId() {
  const uid = randomUUID().replace(/-/g, '').slice(0, 20).toUpperCase();
  return `POPU_${uid}`;
}

/**
 * Validate cart items, store snapshot, call PhonePe → return checkoutUrl.
 * No order is created yet — only a PENDING payments record.
 */
async function initiatePayment({ customerId, items, customerLat, customerLng }) {
  if (!items || items.length === 0) {
    throw Object.assign(new Error('Cart is empty'), { status: 400 });
  }

  // Validate all items and lock prices
  const foodIds = items.map((i) => i.food_item_id);
  const { rows: foods } = await pool.query(
    `SELECT f.id, f.price, f.is_available, f.food_name, f.caterer_id,
            u.availability_status
     FROM food_items f
     JOIN users u ON u.id = f.caterer_id
     WHERE f.id = ANY($1::uuid[])`,
    [foodIds]
  );

  const foodMap = new Map(foods.map((f) => [f.id, f]));
  const lineItems = [];
  for (const item of items) {
    const food = foodMap.get(item.food_item_id);
    if (!food) throw Object.assign(new Error('Food item not found'), { status: 404 });
    if (!food.is_available) {
      throw Object.assign(new Error(`"${food.food_name}" is not available`), { status: 400 });
    }
    if (food.availability_status === 'NOT_READY') {
      throw Object.assign(new Error('A caterer in your cart is not accepting orders right now'), { status: 400 });
    }
    lineItems.push({
      food_item_id: food.id,
      food_name:    food.food_name,
      caterer_id:   food.caterer_id,
      quantity:     item.quantity,
      unit_price:   parseFloat(food.price),
      total_price:  parseFloat(food.price) * item.quantity,
    });
  }

  const totalAmount  = lineItems.reduce((s, l) => s + l.total_price, 0);
  const amountInPaise = Math.round(totalAmount * 100);
  const merchantOrderId = generateMerchantOrderId();

  // Persist cart snapshot before calling PhonePe
  const cartSnapshot = {
    items:        lineItems,
    customer_lat: customerLat || null,
    customer_lng: customerLng || null,
  };

  const { rows: pRows } = await pool.query(
    `INSERT INTO payments (customer_id, merchant_transaction_id, amount, cart_snapshot)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [customerId, merchantOrderId, totalAmount, JSON.stringify(cartSnapshot)]
  );
  const paymentId = pRows[0].id;

  // Call PhonePe
  const redirectUrl = `${FRONTEND_URL}/payment/callback?merchantOrderId=${merchantOrderId}`;
  let phonepeRes;
  try {
    phonepeRes = await phonePe.createPaymentOrder({ merchantOrderId, amountInPaise, redirectUrl });
  } catch (err) {
    await pool.query(
      `UPDATE payments SET payment_status = 'FAILED', updated_at = NOW() WHERE id = $1`,
      [paymentId]
    );
    throw err;
  }

  await pool.query(
    `UPDATE payments SET phonepe_order_id = $1, payment_response = $2, updated_at = NOW() WHERE id = $3`,
    [phonepeRes.orderId, JSON.stringify(phonepeRes), paymentId]
  );

  return {
    paymentId,
    merchantOrderId,
    checkoutUrl: phonepeRes.checkoutUrl,
    amount:      totalAmount,
  };
}

/**
 * Verify payment with PhonePe and, on SUCCESS, atomically create the master order.
 * Safe to call concurrently — row-level lock prevents duplicate order creation.
 */
async function verifyAndFulfill(merchantOrderId, customerId) {
  const { rows } = await pool.query(
    `SELECT * FROM payments WHERE merchant_transaction_id = $1`,
    [merchantOrderId]
  );
  if (!rows.length) throw Object.assign(new Error('Payment not found'), { status: 404 });
  const payment = rows[0];

  if (customerId && payment.customer_id !== customerId) {
    throw Object.assign(new Error('Forbidden'), { status: 403 });
  }

  // Already resolved
  if (['SUCCESS', 'FAILED', 'CANCELLED', 'AUTO_CANCELLED'].includes(payment.payment_status)) {
    return { status: payment.payment_status, masterOrderId: payment.master_order_id, payment };
  }

  // Query PhonePe
  const phonepeStatus = await phonePe.getOrderStatus(merchantOrderId);
  const state = phonepeStatus.state; // COMPLETED | FAILED | CANCELLED | CREATED | PENDING

  if (state === 'COMPLETED') {
    return _fulfillOrder(payment, phonepeStatus);
  }

  if (state === 'FAILED' || state === 'CANCELLED') {
    await pool.query(
      `UPDATE payments SET payment_status = $1, payment_response = $2, updated_at = NOW()
       WHERE id = $3 AND payment_status = 'PENDING'`,
      [state, JSON.stringify(phonepeStatus), payment.id]
    );
    return { status: state, payment };
  }

  // CREATED | PENDING — still processing
  return { status: 'PENDING', payment };
}

/**
 * Atomically claim the payment row and create the master order.
 * Uses SELECT FOR UPDATE so concurrent webhook + redirect calls serialize safely.
 */
async function _fulfillOrder(payment, phonepeStatus) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Acquire row lock — blocks concurrent calls on same payment
    const { rows } = await client.query(
      `SELECT * FROM payments WHERE id = $1 FOR UPDATE`,
      [payment.id]
    );
    const locked = rows[0];

    if (locked.payment_status === 'SUCCESS') {
      await client.query('COMMIT');
      return { status: 'SUCCESS', masterOrderId: locked.master_order_id, payment: locked };
    }
    if (locked.payment_status !== 'PENDING') {
      await client.query('COMMIT');
      return { status: locked.payment_status, payment: locked };
    }

    // Mark payment SUCCESS
    await client.query(
      `UPDATE payments SET payment_status = 'SUCCESS', payment_response = $1, updated_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(phonepeStatus), locked.id]
    );

    // Create master order from stored cart snapshot
    const snap     = locked.cart_snapshot;
    const storedLat = parseFloat(snap.customer_lat);
    const storedLng = parseFloat(snap.customer_lng);

    const { rows: moRows } = await client.query(
      `INSERT INTO master_orders (customer_id, total_amount, customer_lat, customer_lng)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        locked.customer_id,
        locked.amount,
        !isNaN(storedLat) ? storedLat : null,
        !isNaN(storedLng) ? storedLng : null,
      ]
    );
    const masterOrder = moRows[0];

    // Group line items by caterer
    const catererGroups = new Map();
    for (const line of snap.items) {
      if (!catererGroups.has(line.caterer_id)) catererGroups.set(line.caterer_id, []);
      catererGroups.get(line.caterer_id).push(line);
    }

    const createdCatererOrders = [];
    for (const [caterer_id, lines] of catererGroups) {
      const subtotal = lines.reduce((s, l) => s + l.total_price, 0);
      const pc = await payCalc.calculate(subtotal);

      const { rows: coRows } = await client.query(
        `INSERT INTO caterer_orders
           (master_order_id, caterer_id, subtotal,
            commission_percentage, commission_amount, platform_fee, caterer_payout)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [masterOrder.id, caterer_id, subtotal,
         pc.commission_percentage, pc.commission_amount, pc.platform_fee, pc.caterer_payout]
      );
      const catererOrder = coRows[0];

      for (const line of lines) {
        await client.query(
          `INSERT INTO caterer_order_items
             (caterer_order_id, food_item_id, quantity, unit_price, total_price)
           VALUES ($1, $2, $3, $4, $5)`,
          [catererOrder.id, line.food_item_id, line.quantity, line.unit_price, line.total_price]
        );
      }
      createdCatererOrders.push({ caterer_id, lines });
    }

    // Link order back to payment record
    const txnDetail = phonepeStatus.paymentDetails?.[0];
    await client.query(
      `UPDATE payments SET master_order_id = $1, payment_method = $2 WHERE id = $3`,
      [masterOrder.id, txnDetail?.paymentMode || null, locked.id]
    );

    await client.query('COMMIT');

    // Notify caterers asynchronously
    const shortId = masterOrder.id.slice(0, 8).toUpperCase();
    setImmediate(async () => {
      for (const { caterer_id, lines } of createdCatererOrders) {
        try {
          await notifyUser(caterer_id, {
            notification_type: NOTIFICATION_TYPES.NEW_ORDER,
            title:        'New Order Received',
            message:      `Order #${shortId} placed for ${lines[0]?.food_name || 'a food item'}.`,
            reference_id: masterOrder.id,
          });
        } catch (e) {
          console.error('[PaymentService] Caterer notification failed:', e.message);
        }
      }
    });

    return { status: 'SUCCESS', masterOrderId: masterOrder.id, payment: locked };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Called by the PhonePe S2S webhook handler.
 * Extracts merchantOrderId + state from the webhook payload and acts accordingly.
 */
async function handleWebhookEvent(webhookPayload) {
  const merchantOrderId = webhookPayload?.merchantOrderId || webhookPayload?.payload?.merchantOrderId;
  const state           = webhookPayload?.state           || webhookPayload?.payload?.state;

  if (!merchantOrderId) {
    console.warn('[PaymentService] Webhook missing merchantOrderId');
    return;
  }

  const { rows } = await pool.query(
    `SELECT * FROM payments WHERE merchant_transaction_id = $1`,
    [merchantOrderId]
  );
  if (!rows.length) {
    console.warn('[PaymentService] Webhook: payment not found for', merchantOrderId);
    return;
  }
  const payment = rows[0];
  if (payment.payment_status !== 'PENDING') return; // Already handled

  if (state === 'COMPLETED') {
    try {
      const phonepeStatus = await phonePe.getOrderStatus(merchantOrderId);
      if (phonepeStatus.state === 'COMPLETED') {
        await _fulfillOrder(payment, phonepeStatus);
      }
    } catch (err) {
      console.error('[PaymentService] Webhook fulfillment failed:', err.message);
    }
  } else if (state === 'FAILED' || state === 'CANCELLED') {
    await pool.query(
      `UPDATE payments SET payment_status = $1, updated_at = NOW()
       WHERE id = $2 AND payment_status = 'PENDING'`,
      [state, payment.id]
    );
  }
}

/** Admin / customer: list payments */
async function getPayments({ customerId, page = 1, limit = 20, status } = {}) {
  const offset     = (page - 1) * limit;
  const conditions = [];
  const params     = [];

  if (customerId) { conditions.push(`p.customer_id = $${params.length + 1}`); params.push(customerId); }
  if (status)     { conditions.push(`p.payment_status = $${params.length + 1}`); params.push(status); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit, offset);

  const { rows } = await pool.query(
    `SELECT p.id, p.merchant_transaction_id, p.phonepe_order_id,
            p.amount, p.payment_status, p.payment_method,
            p.master_order_id, p.created_at, p.updated_at,
            u.name AS customer_name, u.email AS customer_email
     FROM payments p
     JOIN users u ON u.id = p.customer_id
     ${where}
     ORDER BY p.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const countParams = conditions.length ? params.slice(0, params.length - 2) : [];
  const { rows: cnt } = await pool.query(
    `SELECT COUNT(*) FROM payments p ${where}`,
    countParams
  );

  return { payments: rows, total: parseInt(cnt[0].count, 10), page, limit };
}

/** Get single payment by merchantOrderId (admin or owner) */
async function getPaymentByMerchantId(merchantOrderId) {
  const { rows } = await pool.query(
    `SELECT p.*, u.name AS customer_name, u.email AS customer_email
     FROM payments p
     JOIN users u ON u.id = p.customer_id
     WHERE p.merchant_transaction_id = $1`,
    [merchantOrderId]
  );
  if (!rows.length) throw Object.assign(new Error('Payment not found'), { status: 404 });
  return rows[0];
}

module.exports = {
  initiatePayment,
  verifyAndFulfill,
  handleWebhookEvent,
  getPayments,
  getPaymentByMerchantId,
};
