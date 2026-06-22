'use strict';

const pool                              = require('../config/db');
const { haversineKm }                   = require('./locationService');
const { calculateBatchETA, getOptimizedRoute } = require('./deliveryETAService');
const { notifyUser }                    = require('./notificationService');

// ─── Main assignment job ──────────────────────────────────────────────────────
// Finds CREATED batches without a rider and assigns the nearest available rider.
async function runRiderAssignmentJob() {
  console.log('[RiderAssignment] Running assignment job...');

  // Unassigned batches with their task details
  const { rows: pendingBatches } = await pool.query(
    `SELECT db.id AS batch_id,
            db.task_count,
            json_agg(
              json_build_object(
                'task_id',                  dt.id,
                'pickup_latitude',          dt.pickup_latitude,
                'pickup_longitude',         dt.pickup_longitude,
                'drop_latitude',            dt.drop_latitude,
                'drop_longitude',           dt.drop_longitude,
                'preparation_time_minutes', dt.preparation_time_minutes,
                'customer_id',              dt.customer_id,
                'caterer_id',               dt.caterer_id,
                'caterer_order_id',         dt.caterer_order_id
              ) ORDER BY dbt.sequence_number
            ) AS tasks
     FROM delivery_batches db
     JOIN delivery_batch_tasks dbt ON dbt.batch_id = db.id
     JOIN delivery_tasks dt        ON dt.id = dbt.delivery_task_id
     WHERE db.status = 'CREATED'
       AND db.rider_id IS NULL
     GROUP BY db.id
     ORDER BY db.created_at ASC`
  );

  if (pendingBatches.length === 0) {
    console.log('[RiderAssignment] No unassigned batches.');
    return 0;
  }

  // Available riders with their current location
  const { rows: availableRiders } = await pool.query(
    `SELECT u.id, u.name, u.phone,
            rp.delivery_status,
            rp.current_latitude,
            rp.current_longitude,
            rp.max_batch_capacity,
            rp.current_batch_id
     FROM users u
     JOIN rider_profiles rp ON rp.user_id = u.id
     WHERE rp.delivery_status = 'AVAILABLE'
       AND u.is_active = TRUE`
  );

  if (availableRiders.length === 0) {
    console.log('[RiderAssignment] No available riders.');
    return 0;
  }

  // Track which riders were used in this round (avoid double-assigning)
  const usedRiderIds = new Set();
  let assigned = 0;

  for (const batch of pendingBatches) {
    const tasks = batch.tasks;
    const firstTask = tasks[0];

    // Score riders by distance to first pickup (fallback to any rider if no coords)
    const eligible = availableRiders.filter(r => !usedRiderIds.has(r.id));
    if (eligible.length === 0) break;

    let bestRider;
    if (firstTask?.pickup_latitude) {
      const scored = eligible
        .filter(r => r.current_latitude && r.current_longitude)
        .map(r => ({
          ...r,
          dist: haversineKm(
            parseFloat(r.current_latitude), parseFloat(r.current_longitude),
            parseFloat(firstTask.pickup_latitude), parseFloat(firstTask.pickup_longitude)
          ),
        }))
        .sort((a, b) => a.dist - b.dist);

      // Pick nearest; if no rider has coordinates, take first available
      bestRider = scored[0] ?? eligible[0];
    } else {
      bestRider = eligible[0];
    }

    if (!bestRider) continue;

    const ok = await _assignBatchToRider(batch.batch_id, bestRider, tasks);
    if (ok) {
      usedRiderIds.add(bestRider.id);
      assigned++;
    }
  }

  console.log(`[RiderAssignment] Assigned ${assigned} batch(es).`);
  return assigned;
}

// ─── Core assignment logic ────────────────────────────────────────────────────
async function _assignBatchToRider(batch_id, rider, tasks) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Optimise route, then calculate ETA
    const waypoints = _buildWaypoints(tasks);
    let routeResult = { waypoints, optimized: false, total_duration_min: null };
    try {
      routeResult = await getOptimizedRoute(waypoints);
    } catch (err) {
      console.warn('[RiderAssignment] Route optimisation failed:', err.message);
    }

    // Re-sequence batch tasks to match optimised order
    if (routeResult.optimized && routeResult.waypoints.length) {
      await _resequenceBatchTasks(client, batch_id, tasks, routeResult.waypoints);
    }

    // Calculate traffic-aware ETA
    let etaMinutes = 30;
    try {
      etaMinutes = await calculateBatchETA(
        tasks,
        rider.current_latitude  ? parseFloat(rider.current_latitude)  : null,
        rider.current_longitude ? parseFloat(rider.current_longitude) : null
      );
    } catch (err) {
      console.warn('[RiderAssignment] ETA calculation failed:', err.message);
    }

    // Assign batch
    await client.query(
      `UPDATE delivery_batches
       SET rider_id    = $1,
           status      = 'ASSIGNED',
           assigned_at = NOW(),
           eta_minutes = $2,
           route_data  = $3,
           updated_at  = NOW()
       WHERE id = $4`,
      [rider.id, etaMinutes, JSON.stringify(routeResult), batch_id]
    );

    // Update rider profile
    await client.query(
      `UPDATE rider_profiles
       SET delivery_status  = 'ASSIGNED',
           current_batch_id = $1
       WHERE user_id = $2`,
      [batch_id, rider.id]
    );

    // Per-task: update caterer_order with rider_id + status
    for (const task of tasks) {
      await client.query(
        `UPDATE caterer_orders
         SET rider_id = $1, status = 'ASSIGNED_TO_RIDER'
         WHERE id = $2`,
        [rider.id, task.caterer_order_id]
      );
    }

    await client.query('COMMIT');

    // ── Async notifications (fire-and-forget) ────────────────────────────────
    const uniqueCustomers = [...new Set(tasks.map(t => t.customer_id))];
    const uniqueCaterers  = [...new Set(tasks.map(t => t.caterer_id))];

    setImmediate(async () => {
      for (const cid of uniqueCustomers) {
        try {
          await notifyUser(cid, {
            notification_type: 'ORDER_ASSIGNED_TO_RIDER',
            title:   'Rider Assigned',
            message: `A rider has been assigned to your order. Estimated delivery: ${etaMinutes} min.`,
          });
        } catch (_) {}
      }
      for (const catId of uniqueCaterers) {
        try {
          await notifyUser(catId, {
            notification_type: 'RIDER_ASSIGNED',
            title:   'Rider On The Way',
            message: 'A rider has been assigned and will pick up the order shortly.',
          });
        } catch (_) {}
      }
      try {
        await notifyUser(rider.id, {
          notification_type: 'BATCH_ASSIGNED',
          title:   'New Delivery Batch',
          message: `You have a batch of ${tasks.length} delivery(s). ETA: ${etaMinutes} min.`,
          reference_id: batch_id,
        });
      } catch (_) {}
    });

    console.log(`[RiderAssignment] Batch ${batch_id} → rider ${rider.name} (ETA ${etaMinutes} min).`);
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`[RiderAssignment] Failed to assign batch ${batch_id}:`, err.message);
    return false;
  } finally {
    client.release();
  }
}

// ─── Build waypoints array for route optimisation ─────────────────────────────
function _buildWaypoints(tasks) {
  const pickups  = tasks.filter(t => t.pickup_latitude).map(t => ({
    lat: parseFloat(t.pickup_latitude), lng: parseFloat(t.pickup_longitude),
    type: 'pickup', task_id: t.task_id,
  }));
  const dropoffs = tasks.filter(t => t.drop_latitude).map(t => ({
    lat: parseFloat(t.drop_latitude), lng: parseFloat(t.drop_longitude),
    type: 'dropoff', task_id: t.task_id,
  }));
  // Pickup all first, then drop all — optimiser may reorder within each group
  return [...pickups, ...dropoffs];
}

// ─── Re-sequence batch tasks per optimised route ──────────────────────────────
async function _resequenceBatchTasks(client, batch_id, tasks, orderedWaypoints) {
  const dropoffs = orderedWaypoints.filter(w => w.type === 'dropoff');
  for (let i = 0; i < dropoffs.length; i++) {
    const wp = dropoffs[i];
    if (!wp.task_id) continue;
    await client.query(
      `UPDATE delivery_batch_tasks
       SET sequence_number = $1
       WHERE batch_id = $2 AND delivery_task_id = $3`,
      [i + 1, batch_id, wp.task_id]
    );
  }
}

module.exports = { runRiderAssignmentJob };
