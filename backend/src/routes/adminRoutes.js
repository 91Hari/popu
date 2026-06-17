const express      = require('express');
const router       = express.Router();
const ctrl         = require('../controllers/adminController');
const psCtrl       = require('../controllers/platformSettingsController');
const payCtrl      = require('../controllers/paymentController');
const refundCtrl   = require('../controllers/refundController');
const svcCtrl      = require('../controllers/serviceConfigController');
const acctCtrl     = require('../controllers/adminAccountController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

router.use(authenticate, requireRole('ADMIN'));

router.get('/dashboard',                 ctrl.getDashboard);
router.get('/platform-settings',         psCtrl.getSettings);
router.put('/platform-settings',         psCtrl.updateSettings);
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
router.get('/payments',                  payCtrl.adminListPayments);
router.get('/refunds',                   refundCtrl.adminListRefunds);

router.get('/services',                  svcCtrl.getAllServices);
router.put('/services/:serviceCode',     svcCtrl.updateService);

router.get('/account-requests',              acctCtrl.getAccountRequests);
router.get('/account-requests/deleted',      acctCtrl.getDeletedUsers);
router.post('/account-requests/:id/approve', acctCtrl.approveClosure);
router.post('/account-requests/:id/reject',  acctCtrl.rejectClosure);
router.post('/accounts/:id/restore',         acctCtrl.restoreAccount);
router.post('/accounts/anonymize',           acctCtrl.runAnonymization);

module.exports = router;
