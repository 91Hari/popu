const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/paymentController');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

// Customer: initiate PhonePe payment
router.post('/initiate', ctrl.initiatePayment);

// Customer: verify payment after redirect callback
router.get('/verify/:merchantOrderId', ctrl.verifyPayment);

// Customer: list own payments
router.get('/my', ctrl.getMyPayments);

module.exports = router;
