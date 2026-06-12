'use strict';

const pool = require('../config/db');

async function createOrUpdateReview({ reviewer_id, subject_type, subject_id, order_ref_id, rating, comment }) {
  const { rows } = await pool.query(
    `INSERT INTO reviews (reviewer_id, subject_type, subject_id, order_ref_id, rating, comment)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (reviewer_id, subject_type, subject_id)
     DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment,
                   order_ref_id = EXCLUDED.order_ref_id, updated_at = NOW()
     RETURNING *`,
    [reviewer_id, subject_type, subject_id, order_ref_id || null, rating, comment || null]
  );
  return rows[0];
}

async function getReviews({ subject_type, subject_id, page = 1, limit = 20 } = {}) {
  const offset = (Math.max(1, Number(page)) - 1) * Math.min(50, Number(limit));
  const { rows } = await pool.query(
    `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS reviewer_name
     FROM reviews r
     JOIN users u ON u.id = r.reviewer_id
     WHERE r.subject_type = $1 AND r.subject_id = $2
     ORDER BY r.created_at DESC
     LIMIT $3 OFFSET $4`,
    [subject_type, subject_id, limit, offset]
  );
  const { rows: cnt } = await pool.query(
    `SELECT COUNT(*) AS total, ROUND(AVG(rating)::numeric, 1) AS avg_rating
     FROM reviews WHERE subject_type = $1 AND subject_id = $2`,
    [subject_type, subject_id]
  );
  return {
    reviews: rows,
    total:      Number(cnt[0].total),
    avg_rating: cnt[0].avg_rating ? parseFloat(cnt[0].avg_rating) : null,
  };
}

async function getMyReview({ reviewer_id, subject_type, subject_id }) {
  const { rows } = await pool.query(
    `SELECT * FROM reviews
     WHERE reviewer_id = $1 AND subject_type = $2 AND subject_id = $3`,
    [reviewer_id, subject_type, subject_id]
  );
  return rows[0] || null;
}

module.exports = { createOrUpdateReview, getReviews, getMyReview };
