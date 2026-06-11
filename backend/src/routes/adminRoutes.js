const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

router.use(authenticate, requireRole('ADMIN'));

router.get('/dashboard',                 ctrl.getDashboard);
router.get('/customers',                 ctrl.getCustomers);
router.get('/caterers',                  ctrl.getCaterers);
router.get('/foods',                     ctrl.getFoods);
router.get('/orders',                    ctrl.getOrders);
router.patch('/customers/:id/status',    ctrl.setCustomerStatus);
router.patch('/caterers/:id/status',     ctrl.setCatererStatus);
router.patch('/foods/:id/status',        ctrl.setFoodStatus);
router.patch('/orders/:id/status',       ctrl.updateOrderStatus);
router.post('/notifications',            ctrl.broadcastNotification);
router.post('/users',                    ctrl.createUser);
router.delete('/users/:id',              ctrl.deleteUser);
router.get('/catering-bookings',         ctrl.getCateringBookings);
router.get('/riders',                    ctrl.getAllRiders);

module.exports = router;
