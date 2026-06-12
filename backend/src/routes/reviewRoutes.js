const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/reviewController');
const { authenticate } = require('../middlewares/authMiddleware');

// Submit / update a review (authenticated)
router.post('/', authenticate, ctrl.submitReview);

// Get my review for a subject (authenticated)
router.get('/my/:type/:id', authenticate, ctrl.getMyReview);

// Get all reviews for a subject (public)
router.get('/:type/:id', ctrl.getReviews);

module.exports = router;
