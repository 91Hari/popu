const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/cateringController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.patch('/toggle',                  requireRole('CATERER'),  ctrl.toggleCatering);
router.get('/services/mine',             requireRole('CATERER'),  ctrl.getMyServices);
router.get('/services/caterer/:catererId',                        ctrl.getServicesByCaterer);
router.post('/services',                 requireRole('CATERER'),  ctrl.createService);
router.patch('/services/:id',            requireRole('CATERER'),  ctrl.updateService);
router.delete('/services/:id',           requireRole('CATERER'),  ctrl.deleteService);
router.post('/bookings',                 requireRole('CUSTOMER'), ctrl.bookCatering);
router.get('/bookings/mine',                                      ctrl.getMyBookings);
router.patch('/bookings/:id/status',     requireRole('CATERER'),  ctrl.updateBookingStatus);

module.exports = router;
