const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/customerFoodController');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/foods',        ctrl.getCustomerFoods);
router.get('/foods/search', ctrl.searchCustomerFoods);

router.use(authenticate);

router.patch('/notifications/read-all', ctrl.markAllNotificationsRead);
router.patch('/notifications/:id/read', ctrl.markNotificationRead);
router.get('/notifications',            ctrl.getNotifications);

module.exports = router;
