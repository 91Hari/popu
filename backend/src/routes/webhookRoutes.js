const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/webhookController');

// No authentication — PhonePe posts from their servers
router.post('/phonepe', ctrl.phonePeWebhook);

module.exports = router;
