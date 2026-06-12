const express   = require('express');
const router    = express.Router();
const ctrl      = require('../controllers/catererController');
const availCtrl = require('../controllers/catererAvailabilityController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

// Caterer-only routes — must be before /:id to avoid Express treating "me" as an id
router.get('/me',                    authenticate, requireRole('CATERER'), ctrl.getMyProfile);
router.get('/me/availability',       authenticate, requireRole('CATERER'), availCtrl.getAvailability);
router.patch('/me/availability',     authenticate, requireRole('CATERER'), availCtrl.setAvailability);
router.patch('/me/payment-profile',  authenticate, requireRole('CATERER'), ctrl.updatePaymentProfile);

// Public caterer info
router.get('/',          ctrl.getCaterers);
router.get('/:id/foods', ctrl.getCatererFoods);
router.get('/:id',       ctrl.getCatererById);

module.exports = router;
