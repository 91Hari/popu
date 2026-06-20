const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');

router.post('/login',           ctrl.login);
router.post('/register',        ctrl.register);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/verify-otp',      ctrl.verifyOtp);
router.post('/reset-password',  ctrl.resetPassword);
router.post('/change-password', authenticate, ctrl.changePassword);

module.exports = router;
