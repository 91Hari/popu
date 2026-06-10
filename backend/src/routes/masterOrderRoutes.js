const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/masterOrderController');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

// GET /api/master-orders
// GET /api/master-orders/:id
router.get('/',    ctrl.getMasterOrders);
router.get('/:id', ctrl.getMasterOrderById);

module.exports = router;
