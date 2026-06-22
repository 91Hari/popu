'use strict';

const pool                  = require('../config/db');
const deliveryTaskService   = require('../services/deliveryTaskService');
const deliveryBatchService  = require('../services/deliveryBatchService');
const { runPoolingJob }     = require('../services/deliveryPoolingService');
const { runRiderAssignmentJob } = require('../services/riderAssignmentService');

// ─── POST /api/delivery/create-task ──────────────────────────────────────────
// Admin or internal: manually create a delivery task for a caterer_order
async function createDeliveryTask(req, res, next) {
  try {
    const { caterer_order_id } = req.body;
    if (!caterer_order_id) {
      return res.status(400).json({ error: 'caterer_order_id is required' });
    }
    const task = await deliveryTaskService.createDeliveryTask(caterer_order_id);
    res.status(201).json({ ok: true, task });
  } catch (err) { next(err); }
}

// ─── POST /api/delivery/create-batch ─────────────────────────────────────────
// Admin: manually trigger pooling + assignment cycle
async function createBatch(req, res, next) {
  try {
    const batched  = await runPoolingJob();
    const assigned = await runRiderAssignmentJob();
    res.json({ ok: true, batches_created: batched, batches_assigned: assigned });
  } catch (err) { next(err); }
}

// ─── GET /api/delivery/rider/current-batch ────────────────────────────────────
async function getRiderCurrentBatch(req, res, next) {
  try {
    const batch = await deliveryBatchService.getCurrentBatch(req.user.id);
    res.json({ batch: batch ?? null });
  } catch (err) { next(err); }
}

// ─── PATCH /api/delivery/rider/status ─────────────────────────────────────────
async function updateRiderDeliveryStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['AVAILABLE', 'OFFLINE'].includes(status)) {
      return res.status(400).json({ error: 'status must be AVAILABLE or OFFLINE' });
    }
    await pool.query(
      `UPDATE rider_profiles SET delivery_status = $1 WHERE user_id = $2`,
      [status, req.user.id]
    );
    res.json({ ok: true, delivery_status: status });
  } catch (err) { next(err); }
}

// ─── POST /api/delivery/rider/batch/:batch_id/start ───────────────────────────
async function startBatch(req, res, next) {
  try {
    const batch = await deliveryBatchService.startBatch(req.params.batch_id, req.user.id);
    res.json({ ok: true, batch });
  } catch (err) { next(err); }
}

// ─── PATCH /api/delivery/rider/batch/:batch_id/task/:task_id/pickup ───────────
async function markTaskPickedUp(req, res, next) {
  try {
    const result = await deliveryBatchService.markTaskPickedUp(
      req.params.batch_id, req.params.task_id, req.user.id
    );
    res.json(result);
  } catch (err) { next(err); }
}

// ─── PATCH /api/delivery/rider/batch/:batch_id/task/:task_id/deliver ──────────
async function markTaskDelivered(req, res, next) {
  try {
    const { code } = req.body;
    const result = await deliveryBatchService.markTaskDelivered(
      req.params.batch_id, req.params.task_id, req.user.id, code
    );
    res.json(result);
  } catch (err) { next(err); }
}

// ─── PATCH /api/delivery/rider/location ───────────────────────────────────────
async function updateRiderLocation(req, res, next) {
  try {
    const { latitude, longitude, batch_id } = req.body;
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'latitude and longitude are required' });
    }
    await deliveryBatchService.updateRiderLocation(
      req.user.id, latitude, longitude, batch_id ?? null
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
}

// ─── GET /api/delivery/customer/tracking/:master_order_id ────────────────────
async function getCustomerTracking(req, res, next) {
  try {
    const { master_order_id } = req.params;

    // Access control
    if (req.user.role === 'CUSTOMER') {
      const { rows: check } = await pool.query(
        `SELECT customer_id FROM master_orders WHERE id = $1`, [master_order_id]
      );
      if (!check[0] || check[0].customer_id !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    const { rows } = await pool.query(
      `SELECT co.id            AS caterer_order_id,
              co.status        AS order_status,
              co.eta_minutes,
              co.expected_arrival_at,
              co.accepted_at,
              co.preparing_at,
              co.ready_at,
              co.delivered_at,
              u.name           AS caterer_name,
              u.business_name  AS caterer_business,
              dt.id            AS task_id,
              dt.status        AS task_status,
              dbt.sequence_number,
              db.id            AS batch_id,
              db.status        AS batch_status,
              db.eta_minutes   AS batch_eta_minutes,
              db.rider_id,
              ur.name          AS rider_name,
              ur.phone         AS rider_phone,
              rp.vehicle_type,
              rp.vehicle_number,
              rp.current_latitude   AS rider_lat,
              rp.current_longitude  AS rider_lng,
              rp.location_updated_at AS rider_location_updated_at
       FROM caterer_orders co
       JOIN users u ON u.id = co.caterer_id
       LEFT JOIN delivery_tasks        dt  ON dt.caterer_order_id = co.id
       LEFT JOIN delivery_batch_tasks  dbt ON dbt.delivery_task_id = dt.id
       LEFT JOIN delivery_batches      db  ON db.id  = dbt.batch_id
       LEFT JOIN users                 ur  ON ur.id  = db.rider_id
       LEFT JOIN rider_profiles        rp  ON rp.user_id = db.rider_id
       WHERE co.master_order_id = $1
       ORDER BY co.created_at ASC`,
      [master_order_id]
    );

    res.json({ tracking: rows });
  } catch (err) { next(err); }
}

// ─── GET /api/delivery/admin/status ───────────────────────────────────────────
async function getAdminDeliveryStatus(req, res, next) {
  try {
    const { rows: activeBatches } = await pool.query(
      `SELECT db.id, db.status, db.created_at, db.assigned_at, db.eta_minutes,
              db.task_count,
              u.name           AS rider_name,
              u.phone          AS rider_phone,
              rp.delivery_status AS rider_delivery_status,
              rp.current_latitude,
              rp.current_longitude,
              json_agg(
                json_build_object(
                  'task_id',          dt.id,
                  'task_status',      dt.status,
                  'caterer_id',       dt.caterer_id,
                  'customer_id',      dt.customer_id,
                  'caterer_order_id', dt.caterer_order_id,
                  'sequence',         dbt.sequence_number
                ) ORDER BY dbt.sequence_number
              ) AS tasks
       FROM delivery_batches db
       LEFT JOIN users          u   ON u.id   = db.rider_id
       LEFT JOIN rider_profiles rp  ON rp.user_id = db.rider_id
       JOIN delivery_batch_tasks dbt ON dbt.batch_id = db.id
       JOIN delivery_tasks       dt  ON dt.id  = dbt.delivery_task_id
       WHERE db.status NOT IN ('COMPLETED', 'CANCELLED')
       GROUP BY db.id, u.name, u.phone, rp.delivery_status,
                rp.current_latitude, rp.current_longitude
       ORDER BY db.created_at DESC
       LIMIT 100`
    );

    const { rows: poolStats } = await pool.query(
      `SELECT COUNT(*) AS waiting FROM delivery_pool WHERE status = 'WAITING'`
    );

    const { rows: riderStats } = await pool.query(
      `SELECT rp.delivery_status, COUNT(*) AS count
       FROM rider_profiles rp
       JOIN users u ON u.id = rp.user_id
       WHERE u.is_active = TRUE
       GROUP BY rp.delivery_status`
    );

    const { rows: todayStats } = await pool.query(
      `SELECT COUNT(*) AS total,
              COUNT(*) FILTER (WHERE status = 'COMPLETED') AS completed
       FROM delivery_batches
       WHERE created_at >= CURRENT_DATE`
    );

    res.json({
      active_batches:  activeBatches,
      pool_waiting:    parseInt(poolStats[0]?.waiting ?? 0, 10),
      rider_stats:     riderStats,
      today:           todayStats[0] ?? { total: 0, completed: 0 },
    });
  } catch (err) { next(err); }
}

// ─── GET /api/delivery/batch/:batch_id ────────────────────────────────────────
async function getBatchDetail(req, res, next) {
  try {
    const batch = await deliveryBatchService.getBatchStatus(req.params.batch_id);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    res.json({ batch });
  } catch (err) { next(err); }
}

module.exports = {
  createDeliveryTask,
  createBatch,
  getRiderCurrentBatch,
  updateRiderDeliveryStatus,
  startBatch,
  markTaskPickedUp,
  markTaskDelivered,
  updateRiderLocation,
  getCustomerTracking,
  getAdminDeliveryStatus,
  getBatchDetail,
};
