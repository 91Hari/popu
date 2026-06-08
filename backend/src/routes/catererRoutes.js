const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controllers/catererController');

router.get('/',          ctrl.getCaterers);
router.get('/:id/foods', ctrl.getCatererFoods);
router.get('/:id',       ctrl.getCatererById);

module.exports = router;
