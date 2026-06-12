'use strict';

const reviewService = require('../services/reviewService');

const VALID_TYPES = ['food', 'caterer', 'rider', 'catering_service'];

async function submitReview(req, res, next) {
  try {
    const { subject_type, subject_id, order_ref_id, rating, comment } = req.body;
    if (!VALID_TYPES.includes(subject_type)) {
      return res.status(400).json({ error: 'Invalid subject_type' });
    }
    const r = Number(rating);
    if (!r || r < 1 || r > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    if (!subject_id) return res.status(400).json({ error: 'subject_id is required' });

    const review = await reviewService.createOrUpdateReview({
      reviewer_id: req.user.id,
      subject_type, subject_id, order_ref_id, rating: r, comment,
    });
    res.status(201).json(review);
  } catch (err) { next(err); }
}

async function getReviews(req, res, next) {
  try {
    const { type, id } = req.params;
    if (!VALID_TYPES.includes(type)) return res.status(400).json({ error: 'Invalid type' });
    const { page, limit } = req.query;
    res.json(await reviewService.getReviews({ subject_type: type, subject_id: id, page, limit }));
  } catch (err) { next(err); }
}

async function getMyReview(req, res, next) {
  try {
    const { type, id } = req.params;
    if (!VALID_TYPES.includes(type)) return res.status(400).json({ error: 'Invalid type' });
    res.json(await reviewService.getMyReview({ reviewer_id: req.user.id, subject_type: type, subject_id: id }));
  } catch (err) { next(err); }
}

module.exports = { submitReview, getReviews, getMyReview };
