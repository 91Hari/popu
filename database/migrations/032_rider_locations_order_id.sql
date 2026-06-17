-- Migration 032: Add order_id to rider_locations
--
-- Links each GPS breadcrumb to the specific delivery order it belongs to.
-- Allows accurate per-order location queries when a rider handles multiple orders.

ALTER TABLE rider_locations
  ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES caterer_orders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_rider_locations_order
  ON rider_locations (order_id, created_at DESC)
  WHERE order_id IS NOT NULL;

SELECT 'Migration 032 applied: rider_locations.order_id column added' AS status;
