const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.post('/',              requireRole('CUSTOMER'), orderController.createOrder);
router.get('/',                                        orderController.getOrders);
router.get('/:id',                                     orderController.getOrderById);
router.patch('/:id/status',                            orderController.updateOrderStatus);
router.patch('/:id/cancel',   requireRole('CUSTOMER'), orderController.cancelOrder);

module.exports = router;
