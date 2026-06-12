const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/profileController');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

// UPI VPA live lookup (no body, uses ?upi= query param)
router.get('/validate-upi', ctrl.lookupVpa);

// Profile settings
router.get('/',    ctrl.getProfile);
router.put('/',    ctrl.updateProfile);

// Addresses
router.get('/addresses',           ctrl.getAddresses);
router.post('/addresses',          ctrl.createAddress);
router.put('/addresses/:id',       ctrl.updateAddress);
router.delete('/addresses/:id',    ctrl.deleteAddress);
router.patch('/addresses/:id/default', ctrl.setDefaultAddress);

// Payment methods
router.get('/payment-methods',          ctrl.getPaymentMethods);
router.post('/payment-methods',         ctrl.savePaymentMethod);
router.put('/payment-methods/:id',      ctrl.updatePaymentMethod);
router.delete('/payment-methods/:id',   ctrl.deletePaymentMethod);

module.exports = router;
