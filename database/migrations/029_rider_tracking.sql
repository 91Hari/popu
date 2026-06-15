-- Migration 029: Real-time GPS Rider Tracking Enhancements
--
-- Adds:
--   rider_nearby_notified — prevents duplicate "Rider Nearby" push notifications
--                           once the rider is within 500 m of the customer

ALTER TABLE caterer_orders
  ADD COLUMN IF NOT EXISTS rider_nearby_notified BOOLEAN NOT NULL DEFAULT FALSE;

-- Efficient lookup: find active OUT_FOR_DELIVERY orders without nearby notif
CREATE INDEX IF NOT EXISTS idx_caterer_orders_rider_nearby
  ON caterer_orders (rider_id, status, rider_nearby_notified)
  WHERE status = 'OUT_FOR_DELIVERY' AND rider_nearby_notified = FALSE;

SELECT 'Migration 029 applied — GPS tracking nearby-notification column added.' AS status;
