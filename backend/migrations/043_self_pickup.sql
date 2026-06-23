-- Migration 043: Self Pickup Recommendation System
-- Adds: fulfillment_type, pickup_code, pickup_time, collected_at to caterer_orders
--       pickup config columns to platform_settings
--       pickup_analytics table

-- ─── caterer_orders ──────────────────────────────────────────────────────────
ALTER TABLE caterer_orders
  ADD COLUMN IF NOT EXISTS fulfillment_type VARCHAR(20) NOT NULL DEFAULT 'DELIVERY',
  ADD COLUMN IF NOT EXISTS pickup_code      VARCHAR(10),
  ADD COLUMN IF NOT EXISTS pickup_time      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS collected_at     TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_caterer_orders_fulfillment ON caterer_orders(fulfillment_type);

-- ─── platform_settings ───────────────────────────────────────────────────────
ALTER TABLE platform_settings
  ADD COLUMN IF NOT EXISTS pickup_recommendation_enabled BOOLEAN       NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS pickup_radius_km              NUMERIC(5,2)  NOT NULL DEFAULT 3.0,
  ADD COLUMN IF NOT EXISTS pickup_min_saving             NUMERIC(10,2) NOT NULL DEFAULT 0;

-- ─── pickup_analytics ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pickup_analytics (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  master_order_id UUID        REFERENCES master_orders(id) ON DELETE SET NULL,
  customer_id     UUID        REFERENCES users(id)         ON DELETE SET NULL,
  caterer_id      UUID        REFERENCES users(id)         ON DELETE SET NULL,
  event           VARCHAR(20) NOT NULL,  -- SHOWN | ACCEPTED | REJECTED
  distance_km     NUMERIC(8,3),
  saving_amount   NUMERIC(10,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pickup_analytics_customer ON pickup_analytics(customer_id);
CREATE INDEX IF NOT EXISTS idx_pickup_analytics_caterer  ON pickup_analytics(caterer_id);
CREATE INDEX IF NOT EXISTS idx_pickup_analytics_event    ON pickup_analytics(event);
CREATE INDEX IF NOT EXISTS idx_pickup_analytics_created  ON pickup_analytics(created_at);

SELECT 'Migration 043 applied — self pickup system tables created.' AS status;
