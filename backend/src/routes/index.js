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
router.use('/checkout',               require('./checkoutRoutes'));
router.use('/master-orders',          require('./masterOrderRoutes'));
router.use('/caterer-orders',         require('./catererOrderRoutes'));
router.use('/payment-proofs',         require('./paymentProofRoutes'));
router.use('/reviews',                require('./reviewRoutes'));
router.use('/payments',               require('./paymentRoutes'));
router.use('/webhooks',               require('./webhookRoutes'));
router.use('/profile',                require('./profileRoutes'));
router.use('/tiffin',                 require('./tiffinRoutes'));
router.use('/account',               require('./accountRoutes'));

module.exports = router;
