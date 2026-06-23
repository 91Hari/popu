'use strict';

const express    = require('express');
const rateLimit  = require('express-rate-limit');
const router     = express.Router();
const ctrl       = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');

// ── Rate limiters ─────────────────────────────────────────────────────────────

// Prevent abuse on password-recovery endpoints
const forgotPasswordLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15-minute window
  max:              5,               // max 5 requests per IP per window
  standardHeaders:  true,
  legacyHeaders:    false,
  message: {
    error: 'Too many password reset requests. Please wait 15 minutes before trying again.',
  },
  skipSuccessfulRequests: false,
});

// Prevent brute-force on reset-password endpoint
const resetPasswordLimiter = rateLimit({
  windowMs:         60 * 60 * 1000, // 1-hour window
  max:              10,              // max 10 attempts per IP per hour
  standardHeaders:  true,
  legacyHeaders:    false,
  message: {
    error: 'Too many password reset attempts. Please try again later.',
  },
});

// General auth limiter
const loginLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              20,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: { error: 'Too many login attempts. Please wait 15 minutes.' },
  skipSuccessfulRequests: true,
});

// ── Routes ────────────────────────────────────────────────────────────────────

router.post('/login',           loginLimiter,          ctrl.login);
router.post('/register',                               ctrl.register);
router.post('/forgot-password', forgotPasswordLimiter, ctrl.forgotPassword);
router.post('/reset-password',  resetPasswordLimiter,  ctrl.resetPassword);
router.post('/change-password', authenticate,          ctrl.changePassword);

module.exports = router;
