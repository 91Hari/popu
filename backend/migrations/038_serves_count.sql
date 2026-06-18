-- 038: add serves_count to food_items
ALTER TABLE food_items
  ADD COLUMN IF NOT EXISTS serves_count INTEGER NOT NULL DEFAULT 1
    CHECK (serves_count >= 1 AND serves_count <= 100);

COMMENT ON COLUMN food_items.serves_count IS 'Number of persons this food item serves';
