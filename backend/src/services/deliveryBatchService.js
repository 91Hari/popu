'use strict';

const pool         = require('../config/db');
const { notifyUser } = require('./notificationService');

// ─── Get the active batch for a rider ────────────────────────────────────────
async function getCurrentBatch(rider_id) {
  const { rows } = await pool.query(
    `SELECT db.id, db.status, db.eta_minutes, db.created_at, db.assigned_at, db.started_at,
            db.task_count,
            json_agg(
              json_build_object(
                'task_id',              dt.id,
                'task_status',          dt.status,
                'batch_task_status',    dbt.status,
                'sequence',             dbt.sequence_number,
                'caterer_id',           dt.caterer_id,
                'caterer_name',         uc.name,
                'caterer_business',     uc.business_name,
                'pickup_lat',           dt.pickup_latitude,
                'pickup_lng',           dt.pickup_longitude,
                'customer_id',          dt.customer_id,
                'customer_name',        ucust.name,
                'customer_phone',       ucust.phone,
                'drop_lat',             dt.drop_latitude,
                'drop_lng',             dt.drop_longitude,
                'caterer_order_id',     dt.caterer_order_id,
                'caterer_order_status', co.status,
                'delivery_code',        co.delivery_confirmation_code
              ) ORDER BY dbt.sequence_number
            ) AS tasks
     FROM delivery_batches db
     JOIN delivery_batch_tasks dbt ON dbt.batch_id    = db.id
     JOIN delivery_tasks       dt  ON dt.id           = dbt.delivery_task_id
     JOIN caterer_orders       co  ON co.id           = dt.caterer_order_id
     JOIN users                uc  ON uc.id           = dt.caterer_id
     JOIN users                ucust ON ucust.id      = dt.customer_id
     WHERE db.rider_id = $1
       AND db.status IN ('ASSIGNED', 'PICKING_UP', 'DELIVERING')
     GROUP BY db.id
     ORDER BY db.assigned_at DESC
     LIMIT 1`,
    [rider_id]
  );
  return rows[0] ?? null;
}

// ─── Start a batch (rider taps START DELIVERY) ────────────────────────────────
async function startBatch(batch_id, rider_id) {
  const { rows } = await pool.query(
    `SELECT * FROM delivery_batches
     WHERE id = $1 AND rider_id = $2 AND status = 'ASSIGNED'`,
    [batch_id, rider_id]
  );
  if (!rows[0]) {
    const err = new Error('Batch not found or already started'); err.status = 404; throw err;
  }

  const { rows: updated } = await pool.query(
    `UPDATE delivery_batches
     SET status = 'PICKING_UP', started_at = NOW(), updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [batch_id]
  );
  await pool.query(
    `UPDATE rider_profiles SET delivery_status = 'PICKING_UP' WHERE user_id = $1`,
    [rider_id]
  );
  return updated[0];
}

// ─── Mark a task picked up ────────────────────────────────────────────────────
async function markTaskPickedUp(batch_id, delivery_task_id, rider_id) {
  const { rows } = await pool.query(
    `SELECT dbt.id AS batch_task_id, dt.caterer_order_id, dt.customer_id, dt.caterer_id
     FROM delivery_batch_tasks dbt
     JOIN delivery_tasks dt ON dt.id = dbt.delivery_task_id
     JOIN delivery_batches db ON db.id = dbt.batch_id
     WHERE dbt.batch_id = $1
       AND dbt.delivery_task_id = $2
       AND db.rider_id = $3
       AND dbt.status = 'PENDING'`,
    [batch_id, delivery_task_id, rider_id]
  );
  if (!rows[0]) {
    const err = new Error('Task not found, not in this batch, or already picked up'); err.status = 404; throw err;
  }
  const task = rows[0];

  await pool.query(
    `UPDATE delivery_batch_tasks SET status = 'PICKED_UP' WHERE id = $1`,
    [task.batch_task_id]
  );
  await pool.query(
    `UPDATE delivery_tasks
     SET status = 'PICKED_UP', actual_pickup_time = NOW(), updated_at = NOW()
     WHERE id = $1`,
    [delivery_task_id]
  );
  await pool.query(
    `UPDATE caterer_orders
     SET status = 'OUT_FOR_DELIVERY', delivery_started_at = NOW()
     WHERE id = $1`,
    [task.caterer_order_id]
  );

  // Switch batch to DELIVERING once all tasks are picked up
  const { rows: pendingPicks } = await pool.query(
    `SELECT COUNT(*) AS cnt FROM delivery_batch_tasks
     WHERE batch_id = $1 AND status = 'PENDING'`,
    [batch_id]
  );
  if (parseInt(pendingPicks[0].cnt, 10) === 0) {
    await pool.query(
      `UPDATE delivery_batches SET status = 'DELIVERING', updated_at = NOW() WHERE id = $1`,
      [batch_id]
    );
    await pool.query(
      `UPDATE rider_profiles SET delivery_status = 'DELIVERING' WHERE user_id = $1`,
      [rider_id]
    );
  }

  setImmediate(async () => {
    try {
      await notifyUser(task.customer_id, {
        notification_type: 'ORDER_OUT_FOR_DELIVERY',
        title:        'On the Way!',
        message:      'Your food has been picked up and is on the way to you.',
        reference_id: task.caterer_order_id,
      });
    } catch (_) {}
  });

  return { ok: true };
}

// ─── Mark a task delivered ────────────────────────────────────────────────────
async function markTaskDelivered(batch_id, delivery_task_id, rider_id, code) {
  const { rows } = await pool.query(
    `SELECT dbt.id AS batch_task_id,
            dt.caterer_order_id, dt.customer_id, dt.caterer_id,
            co.delivery_confirmation_code,
            co.payment_method, co.payment_status
     FROM delivery_batch_tasks dbt
     JOIN delivery_tasks  dt ON dt.id  = dbt.delivery_task_id
     JOIN delivery_batches db ON db.id = dbt.batch_id
     JOIN caterer_orders   co ON co.id = dt.caterer_order_id
     WHERE dbt.batch_id = $1
       AND dbt.delivery_task_id = $2
       AND db.rider_id = $3
       AND dbt.status IN ('PENDING', 'PICKED_UP')`,
    [batch_id, delivery_task_id, rider_id]
  );
  if (!rows[0]) {
    const err = new Error('Task not found or already delivered'); err.status = 404; throw err;
  }
  const task = rows[0];

  // Confirmation code check (if set)
  if (task.delivery_confirmation_code && task.delivery_confirmation_code !== String(code)) {
    const err = new Error('Invalid delivery confirmation code'); err.status = 400; throw err;
  }

  // COD payment must be confirmed before marking delivered
  if (task.payment_method === 'COD' && task.payment_status !== 'PAID') {
    const err = new Error('Confirm cash payment collection before marking as delivered');
    err.status = 400; throw err;
  }

  await pool.query(
    `UPDATE delivery_batch_tasks SET status = 'DELIVERED' WHERE id = $1`,
    [task.batch_task_id]
  );
  await pool.query(
    `UPDATE delivery_tasks
     SET status = 'COMPLETED', actual_drop_time = NOW(), updated_at = NOW()
     WHERE id = $1`,
    [delivery_task_id]
  );
  await pool.query(
    `UPDATE caterer_orders SET status = 'DELIVERED', delivered_at = NOW()
     WHERE id = $1`,
    [task.caterer_order_id]
  );

  // Check if whole batch is done
  const { rows: remaining } = await pool.query(
    `SELECT COUNT(*) AS cnt FROM delivery_batch_tasks
     WHERE batch_id = $1 AND status NOT IN ('DELIVERED', 'FAILED')`,
    [batch_id]
  );
  if (parseInt(remaining[0].cnt, 10) === 0) {
    await pool.query(
      `UPDATE delivery_batches
       SET status = 'COMPLETED', completed_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [batch_id]
    );
    await pool.query(
      `UPDATE rider_profiles
       SET delivery_status = 'AVAILABLE', current_batch_id = NULL
       WHERE user_id = $1`,
      [rider_id]
    );
    console.log(`[DeliveryBatch] Batch ${batch_id} completed.`);
  }

  setImmediate(async () => {
    try {
      await notifyUser(task.customer_id, {
        notification_type: 'ORDER_DELIVERED',
        title:        'Order Delivered!',
        message:      'Your order has been delivered. Enjoy your meal!',
        reference_id: task.caterer_order_id,
      });
      await notifyUser(task.caterer_id, {
        notification_type: 'ORDER_DELIVERED',
        title:        'Order Delivered',
        message:      'Your order has been delivered successfully.',
        reference_id: task.caterer_order_id,
      });
    } catch (_) {}
  });

  return { ok: true };
}

// ─── Get batch status (for admin / customer) ──────────────────────────────────
async function getBatchStatus(batch_id) {
  const { rows } = await pool.query(
    `SELECT db.id, db.status, db.eta_minutes, db.created_at, db.assigned_at,
            db.started_at, db.completed_at, db.task_count, db.route_data,
            u.name          AS rider_name,
            u.phone         AS rider_phone,
            rp.vehicle_type, rp.vehicle_number,
            rp.current_latitude  AS rider_lat,
            rp.current_longitude AS rider_lng,
            json_agg(
              json_build_object(
                'task_id',           dt.id,
                'task_status',       dt.status,
                'batch_task_status', dbt.status,
                'sequence',          dbt.sequence_number,
                'caterer_id',        dt.caterer_id,
                'customer_id',       dt.customer_id,
                'caterer_order_id',  dt.caterer_order_id
              ) ORDER BY dbt.sequence_number
            ) AS tasks
     FROM delivery_batches db
     LEFT JOIN users          u  ON u.id  = db.rider_id
     LEFT JOIN rider_profiles rp ON rp.user_id = db.rider_id
     JOIN delivery_batch_tasks dbt ON dbt.batch_id = db.id
     JOIN delivery_tasks dt ON dt.id = dbt.delivery_task_id
     WHERE db.id = $1
     GROUP BY db.id, u.name, u.phone, rp.vehicle_type, rp.vehicle_number,
              rp.current_latitude, rp.current_longitude`,
    [batch_id]
  );
  return rows[0] ?? null;
}

// ─── Update rider GPS location ────────────────────────────────────────────────
// Also syncs current_latitude/longitude on rider_profiles for assignment scoring.
async function updateRiderLocation(rider_id, latitude, longitude, batch_id) {
  await Promise.all([
    pool.query(
      `INSERT INTO rider_locations (rider_id, latitude, longitude, order_id)
       VALUES ($1, $2, $3, $4)`,
      [rider_id, latitude, longitude, batch_id ?? null]
    ),
    pool.query(
      `UPDATE rider_profiles
       SET current_latitude = $1, current_longitude = $2, location_updated_at = NOW()
       WHERE user_id = $3`,
      [latitude, longitude, rider_id]
    ),
  ]);
}

module.exports = {
  getCurrentBatch,
  startBatch,
  markTaskPickedUp,
  markTaskDelivered,
  getBatchStatus,
  updateRiderLocation,
};
