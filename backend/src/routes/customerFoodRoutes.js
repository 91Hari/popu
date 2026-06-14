const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/customerFoodController');
const svcCtrl  = require('../controllers/serviceConfigController');
const { authenticate } = require('../middlewares/authMiddleware');

// Public — customer UI reads service config to show enabled/disabled state
router.get('/services', svcCtrl.getAllServices);

router.get('/foods/latest', ctrl.getLatestFoods);
router.get('/foods/search', ctrl.searchCustomerFoods);
router.get('/foods',        ctrl.getCustomerFoods);

router.use(authenticate);

router.patch('/notifications/read-all', ctrl.markAllNotificationsRead);
router.patch('/notifications/:id/read', ctrl.markNotificationRead);
router.get('/notifications',            ctrl.getNotifications);

module.exports = router;
