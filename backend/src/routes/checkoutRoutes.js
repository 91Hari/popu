const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/masterOrderController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

router.use(authenticate);

// POST /api/checkout/split-order
router.post('/split-order', requireRole('CUSTOMER'), ctrl.createSplitOrder);

module.exports = router;
