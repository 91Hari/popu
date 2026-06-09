const express = require('express');
const router  = express.Router();

router.use('/auth',                   require('./authRoutes'));
router.use('/foods',                  require('./foodRoutes'));
router.use('/orders',                 require('./orderRoutes'));
router.use('/caterers',               require('./catererRoutes'));
router.use('/cart',                   require('./cartRoutes'));
router.use('/customer',               require('./customerFoodRoutes'));
router.use('/search',                 require('./searchRoutes'));
router.use('/admin',                  require('./adminRoutes'));
router.use('/caterer/notifications',  require('./catererNotificationRoutes'));

module.exports = router;
