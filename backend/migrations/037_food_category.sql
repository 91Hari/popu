ALTER TABLE food_items
  ADD COLUMN IF NOT EXISTS food_category VARCHAR(20) NOT NULL DEFAULT 'VEG'
    CHECK (food_category IN ('VEG', 'NON_VEG'));

CREATE INDEX IF NOT EXISTS idx_food_items_food_category ON food_items (food_category);
