const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/authController');

// Mobile OTP authentication (primary flow)
router.post('/send-otp',   ctrl.sendOtp);
router.post('/verify-otp', ctrl.verifyOtp);

// Legacy email/password (kept for backwards compatibility)
router.post('/register', ctrl.register);
router.post('/login',    ctrl.login);

module.exports = router;
