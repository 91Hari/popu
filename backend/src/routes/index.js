const express = require('express');
const router  = express.Router();

router.use('/auth',   require('./authRoutes'));
router.use('/foods',  require('./foodRoutes'));
router.use('/orders', require('./orderRoutes'));

module.exports = router;
