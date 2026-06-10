-- Feature 2: Store customer coords on order; ETA calculated at acceptance
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_lat  NUMERIC(10,7);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_lng  NUMERIC(10,7);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS accepted_at   TIMESTAMPTZ;

-- Feature 3: Caterer availability status
ALTER TABLE users ADD COLUMN IF NOT EXISTS availability_status VARCHAR(20) NOT NULL DEFAULT 'READY'
  CHECK (availability_status IN ('READY', 'NOT_READY'));

-- Feature 7: Admin role (alter enum to add ADMIN)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'ADMIN';

-- System notifications table for admin broadcast
CREATE TABLE IF NOT EXISTS system_notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        VARCHAR(255) NOT NULL,
  message      TEXT         NOT NULL,
  target_role  VARCHAR(20)  DEFAULT 'ALL',
  created_by   UUID         REFERENCES users(id),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Extension must exist before gin_trgm_ops indexes
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Index for search suggestions performance
CREATE INDEX IF NOT EXISTS idx_food_items_name_trgm
  ON food_items USING gin (food_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_users_name_trgm
  ON users USING gin (name gin_trgm_ops);
