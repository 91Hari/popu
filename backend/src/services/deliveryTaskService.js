'use strict';

const pool = require('../config/db');

// ─── Create a delivery task from a caterer_order ──────────────────────────────
// Called when caterer marks order READY. Idempotent — safe to call twice.
async function createDeliveryTask(caterer_order_id) {
  // Load caterer_order with all needed coordinates
  const { rows } = await pool.query(
    `SELECT co.id               AS caterer_order_id,
            co.master_order_id,
            co.caterer_id,
            mo.customer_id,
            mo.customer_lat     AS drop_lat,
            mo.customer_lng     AS drop_lng,
            u.latitude          AS pickup_lat,
            u.longitude         AS pickup_lng,
            MAX(COALESCE(f.preparation_time_minutes, 20)) AS prep_time
     FROM caterer_orders co
     JOIN master_orders   mo  ON mo.id  = co.master_order_id
     JOIN users           u   ON u.id   = co.caterer_id
     JOIN caterer_order_items coi ON coi.caterer_order_id = co.id
     JOIN food_items      f   ON f.id   = coi.food_item_id
     WHERE co.id = $1
     GROUP BY co.id, co.master_order_id, co.caterer_id, mo.customer_id,
              mo.customer_lat, mo.customer_lng, u.latitude, u.longitude`,
    [caterer_order_id]
  );

  const co = rows[0];
  if (!co) {
    const err = new Error('caterer_order not found'); err.status = 404; throw err;
  }

  // Idempotency guard
  const { rows: existing } = await pool.query(
    `SELECT id FROM delivery_tasks WHERE caterer_order_id = $1`, [caterer_order_id]
  );
  if (existing[0]) return existing[0];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: taskRows } = await client.query(
      `INSERT INTO delivery_tasks
         (caterer_order_id, master_order_id, caterer_id, customer_id,
          pickup_latitude, pickup_longitude, drop_latitude, drop_longitude,
          preparation_time_minutes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING')
       RETURNING *`,
      [
        co.caterer_order_id, co.master_order_id, co.caterer_id, co.customer_id,
        co.pickup_lat ?? null, co.pickup_lng ?? null,
        co.drop_lat   ?? null, co.drop_lng   ?? null,
        co.prep_time  ?? 20,
      ]
    );
    const task = taskRows[0];

    // Place in pool immediately
    await client.query(
      `INSERT INTO delivery_pool (delivery_task_id, caterer_id)
       VALUES ($1, $2)
       ON CONFLICT (delivery_task_id) DO NOTHING`,
      [task.id, co.caterer_id]
    );

    await client.query('COMMIT');
    console.log(`[DeliveryTask] Created task ${task.id} for caterer_order ${caterer_order_id}.`);
    return task;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ─── Get the delivery task + batch/rider details for a caterer_order ──────────
async function getDeliveryTaskStatus(caterer_order_id) {
  const { rows } = await pool.query(
    `SELECT dt.id, dt.status AS task_status, dt.preparation_time_minutes,
            dt.actual_pickup_time, dt.actual_drop_time,
            dbt.sequence_number,
            db.id           AS batch_id,
            db.status       AS batch_status,
            db.eta_minutes,
            db.rider_id,
            u.name          AS rider_name,
            u.phone         AS rider_phone,
            rp.vehicle_type,
            rp.vehicle_number,
            rp.current_latitude  AS rider_lat,
            rp.current_longitude AS rider_lng
     FROM delivery_tasks dt
     LEFT JOIN delivery_batch_tasks dbt ON dbt.delivery_task_id = dt.id
     LEFT JOIN delivery_batches     db  ON db.id  = dbt.batch_id
     LEFT JOIN users                u   ON u.id   = db.rider_id
     LEFT JOIN rider_profiles       rp  ON rp.user_id = db.rider_id
     WHERE dt.caterer_order_id = $1
     LIMIT 1`,
    [caterer_order_id]
  );
  return rows[0] ?? null;
}

// ─── Cancel a delivery task (e.g. order cancelled) ───────────────────────────
async function cancelDeliveryTask(caterer_order_id) {
  await pool.query(
    `UPDATE delivery_tasks SET status = 'CANCELLED', updated_at = NOW()
     WHERE caterer_order_id = $1 AND status NOT IN ('COMPLETED', 'CANCELLED')`,
    [caterer_order_id]
  );
  // Expire pool entry too
  await pool.query(
    `UPDATE delivery_pool SET status = 'EXPIRED'
     WHERE delivery_task_id IN (
       SELECT id FROM delivery_tasks WHERE caterer_order_id = $1
     ) AND status = 'WAITING'`,
    [caterer_order_id]
  );
}

module.exports = { createDeliveryTask, getDeliveryTaskStatus, cancelDeliveryTask };
