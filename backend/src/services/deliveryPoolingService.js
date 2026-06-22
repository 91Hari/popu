'use strict';

const pool         = require('../config/db');
const { haversineKm } = require('./locationService');

// ─── Configurable pooling parameters ─────────────────────────────────────────
const CONFIG = {
  PICKUP_RADIUS_KM:   0.8,  // caterers within 800 m can be co-batched
  CUSTOMER_RADIUS_KM: 5.0,  // customers must be within 5 km of each other
  MAX_BATCH_SIZE:     4,    // max delivery tasks per batch
};

// ─── Main pooling job ─────────────────────────────────────────────────────────
// Groups WAITING pool entries into delivery_batches using 4 rules:
//   Rule 1 – Same caterer → always pool
//   Rule 2 – Nearby caterers (within PICKUP_RADIUS_KM)
//   Rule 3 – Customer drop radius (within CUSTOMER_RADIUS_KM)
//   Rule 4 – Time window (pool entry expiry handled via expires_at column)
async function runPoolingJob() {
  console.log('[DeliveryPool] Running pooling job...');

  // Expire stale entries first
  await expireStalePoolEntries();

  // Fetch all eligible WAITING tasks
  const { rows: entries } = await pool.query(
    `SELECT dp.id            AS pool_id,
            dp.delivery_task_id,
            dp.caterer_id,
            dt.pickup_latitude,
            dt.pickup_longitude,
            dt.drop_latitude,
            dt.drop_longitude,
            dt.preparation_time_minutes,
            dt.master_order_id,
            dt.caterer_order_id,
            dt.customer_id
     FROM delivery_pool dp
     JOIN delivery_tasks dt ON dt.id = dp.delivery_task_id
     WHERE dp.status = 'WAITING'
       AND dp.expires_at > NOW()
       AND dt.status = 'PENDING'
     ORDER BY dp.created_at ASC`
  );

  if (entries.length === 0) {
    console.log('[DeliveryPool] No pending tasks to pool.');
    return 0;
  }

  console.log(`[DeliveryPool] Processing ${entries.length} pending task(s).`);

  const processed = new Set();
  const groups    = [];

  for (const anchor of entries) {
    if (processed.has(anchor.pool_id)) continue;

    const group = [anchor];
    processed.add(anchor.pool_id);

    for (const candidate of entries) {
      if (processed.has(candidate.pool_id))         continue;
      if (group.length >= CONFIG.MAX_BATCH_SIZE)    break;
      if (_canPool(anchor, candidate, group)) {
        group.push(candidate);
        processed.add(candidate.pool_id);
      }
    }

    groups.push(group);
  }

  let created = 0;
  for (const group of groups) {
    const batch = await _createBatchFromGroup(group);
    if (batch) created++;
  }

  console.log(`[DeliveryPool] Created ${created} batch(es).`);
  return created;
}

// ─── Pooling eligibility check ────────────────────────────────────────────────
function _canPool(anchor, candidate, existingGroup) {
  // Rule 1: same caterer → always pool (subject to customer radius)
  const sameCaterer = anchor.caterer_id === candidate.caterer_id;

  if (!sameCaterer) {
    // Rule 2: pickup distance must be within radius
    if (!anchor.pickup_latitude || !candidate.pickup_latitude) return false;
    const pickupDist = haversineKm(
      parseFloat(anchor.pickup_latitude),    parseFloat(anchor.pickup_longitude),
      parseFloat(candidate.pickup_latitude), parseFloat(candidate.pickup_longitude)
    );
    if (pickupDist > CONFIG.PICKUP_RADIUS_KM) return false;
  }

  // Rule 3: customer drop-off must be within radius of ALL existing group members
  return _withinCustomerRadius(candidate, existingGroup);
}

function _withinCustomerRadius(candidate, group) {
  if (!candidate.drop_latitude) return false;
  for (const existing of group) {
    if (!existing.drop_latitude) continue;
    const dist = haversineKm(
      parseFloat(candidate.drop_latitude),  parseFloat(candidate.drop_longitude),
      parseFloat(existing.drop_latitude),   parseFloat(existing.drop_longitude)
    );
    if (dist > CONFIG.CUSTOMER_RADIUS_KM) return false;
  }
  return true;
}

// ─── Create a delivery_batch from a group of pool entries ─────────────────────
async function _createBatchFromGroup(group) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: batchRows } = await client.query(
      `INSERT INTO delivery_batches (task_count, status)
       VALUES ($1, 'CREATED')
       RETURNING *`,
      [group.length]
    );
    const batch = batchRows[0];

    for (let i = 0; i < group.length; i++) {
      const entry = group[i];

      await client.query(
        `INSERT INTO delivery_batch_tasks (batch_id, delivery_task_id, sequence_number)
         VALUES ($1, $2, $3)`,
        [batch.id, entry.delivery_task_id, i + 1]
      );

      await client.query(
        `UPDATE delivery_tasks SET status = 'ASSIGNED', updated_at = NOW()
         WHERE id = $1`,
        [entry.delivery_task_id]
      );

      await client.query(
        `UPDATE delivery_pool SET status = 'BATCHED'
         WHERE id = $1`,
        [entry.pool_id]
      );
    }

    await client.query('COMMIT');
    console.log(`[DeliveryPool] Batch ${batch.id} created with ${group.length} task(s).`);
    return batch;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[DeliveryPool] Failed to create batch:', err.message);
    return null;
  } finally {
    client.release();
  }
}

// ─── Expire stale pool entries ────────────────────────────────────────────────
async function expireStalePoolEntries() {
  const { rowCount } = await pool.query(
    `UPDATE delivery_pool SET status = 'EXPIRED'
     WHERE status = 'WAITING' AND expires_at <= NOW()`
  );
  if (rowCount > 0) {
    console.log(`[DeliveryPool] Expired ${rowCount} stale entry(s).`);
  }
}

module.exports = { runPoolingJob, expireStalePoolEntries };
