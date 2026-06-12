-- Migration 015: Review & Rating System
-- Adds reviews table for food items, caterers, riders, and catering services

CREATE TABLE IF NOT EXISTS reviews (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_type VARCHAR(20) NOT NULL CHECK (subject_type IN ('food', 'caterer', 'rider', 'catering_service')),
  subject_id   UUID        NOT NULL,
  order_ref_id UUID,
  rating       SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (reviewer_id, subject_type, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_subject  ON reviews(subject_type, subject_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_id);
