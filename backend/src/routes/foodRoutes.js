const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

router.get('/search', foodController.searchFoods);
router.get('/',       foodController.getAllFoods);
router.get('/:id',    foodController.getFoodById);

router.use(authenticate);

router.post('/',                        requireRole('CATERER'), foodController.createFood);
router.put('/:id',                      requireRole('CATERER'), foodController.updateFood);
router.patch('/:id/availability',       requireRole('CATERER'), foodController.patchAvailability);
router.delete('/:id',                   requireRole('CATERER'), foodController.deleteFood);

module.exports = router;
