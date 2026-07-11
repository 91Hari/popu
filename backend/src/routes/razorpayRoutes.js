'use strict';

const express    = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const ctrl       = require('../controllers/razorpayController');

const router = express.Router();

// Both endpoints require a logged-in customer
router.post('/create-order', authenticate, ctrl.createOrder);
router.post('/verify',       authenticate, ctrl.verifyPayment);

module.exports = router;
