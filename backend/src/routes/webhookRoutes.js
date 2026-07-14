const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/webhookController');

// Raw body needed for Razorpay signature verification
router.post('/razorpay',
  express.raw({ type: 'application/json' }),
  ctrl.razorpayWebhook
);

// No authentication — PhonePe posts from their servers
router.post('/phonepe', ctrl.phonePeWebhook);

module.exports = router;
