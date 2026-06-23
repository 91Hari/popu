'use strict';

const router = require('express').Router();
const { authenticate, requireRole } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/deliveryController');

// ── Admin endpoints ───────────────────────────────────────────────────────────
router.post('/create-task',  authenticate, requireRole('ADMIN'), ctrl.createDeliveryTask);
router.post('/create-batch', authenticate, requireRole('ADMIN'), ctrl.createBatch);
router.get('/admin/status',  authenticate, requireRole('ADMIN'), ctrl.getAdminDeliveryStatus);
router.get('/batch/:batch_id', authenticate, requireRole('ADMIN'), ctrl.getBatchDetail);

// ── Rider endpoints ───────────────────────────────────────────────────────────
router.get('/rider/current-batch',
  authenticate, requireRole('RIDER'), ctrl.getRiderCurrentBatch);

router.patch('/rider/status',
  authenticate, requireRole('RIDER'), ctrl.updateRiderDeliveryStatus);

router.patch('/rider/location',
  authenticate, requireRole('RIDER'), ctrl.updateRiderLocation);

router.post('/rider/batch/:batch_id/start',
  authenticate, requireRole('RIDER'), ctrl.startBatch);

router.patch('/rider/batch/:batch_id/task/:task_id/pickup',
  authenticate, requireRole('RIDER'), ctrl.markTaskPickedUp);

router.patch('/rider/batch/:batch_id/task/:task_id/deliver',
  authenticate, requireRole('RIDER'), ctrl.markTaskDelivered);

// ── Customer endpoint ─────────────────────────────────────────────────────────
router.get('/customer/tracking/:master_order_id',
  authenticate, ctrl.getCustomerTracking);

module.exports = router;
