'use strict';

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/pickupController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

router.use(authenticate);

// Customer: check eligibility
router.get('/recommendation',            requireRole('CUSTOMER'), ctrl.getRecommendation);
router.post('/track',                    requireRole('CUSTOMER'), ctrl.trackEvent);

// Caterer: confirm customer has collected their order
router.patch('/confirm/:caterer_order_id', requireRole('CATERER'), ctrl.confirmPickup);

module.exports = router;
