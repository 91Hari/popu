const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/riderController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

router.use(authenticate);

// Caterer: manage own riders
router.post('/',     requireRole('CATERER'), ctrl.createRider);
router.get('/',      requireRole('CATERER'), ctrl.listRiders);
router.delete('/:id', requireRole('CATERER'), ctrl.deleteRider);

// Caterer: assign a rider to an order
router.patch('/assign/:orderId', requireRole('CATERER'), ctrl.assignRider);

// GPS: rider pushes, anyone authenticated can read
router.post('/location',              requireRole('RIDER'), ctrl.pushLocation);
router.get('/location/:rider_id',                          ctrl.getLocation);

// Rider: delivery workflow
router.get('/deliveries',                    requireRole('RIDER'), ctrl.getAssignedDeliveries);
router.get('/orders/:id',                    requireRole('RIDER'), ctrl.lookupOrder);
router.patch('/orders/:id/start',            requireRole('RIDER'), ctrl.startDelivery);
router.post('/orders/:id/confirm-cod',       requireRole('RIDER'), ctrl.confirmCodPayment);
router.post('/orders/:id/confirm',           requireRole('RIDER'), ctrl.confirmDelivery);

// Live tracking — accessible by CUSTOMER, CATERER, ADMIN (all authenticated)
router.get('/orders/:id/rider-location',     ctrl.getOrderRiderLocation);

module.exports = router;
