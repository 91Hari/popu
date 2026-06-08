const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/cartController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

router.use(authenticate);
router.use(requireRole('CUSTOMER'));

router.get('/',           ctrl.getCart);
router.post('/add',       ctrl.addItem);
router.put('/:id',        ctrl.updateItem);
router.delete('/:id',     ctrl.removeItem);
router.delete('/',        ctrl.clearCart);

module.exports = router;
