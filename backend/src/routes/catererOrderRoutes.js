const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/masterOrderController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

router.use(authenticate);

// Caterer: list their sub-orders
router.get('/', requireRole('CATERER'), ctrl.getCatererSubOrders);

// Caterer: update status
router.patch('/:id/status', requireRole('CATERER'), ctrl.updateCatererOrderStatus);

// Customer or Caterer: cancel sub-order
router.patch('/:id/cancel', ctrl.cancelCatererOrder);

module.exports = router;
