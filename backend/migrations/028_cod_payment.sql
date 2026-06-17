-- Migration 028: Cash on Delivery (COD) Support
--
-- Adds:
--   payment_method            — ONLINE (default) or COD on caterer_orders
--   payment_collected_at      — timestamp when rider collected cash
--   payment_collected_by_rider — rider who confirmed cash collection

ALTER TABLE caterer_orders
  ADD COLUMN IF NOT EXISTS payment_method              VARCHAR(10) NOT NULL DEFAULT 'ONLINE',
  ADD COLUMN IF NOT EXISTS payment_collected_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_collected_by_rider  UUID REFERENCES users(id);

CREATE INDEX IF NOT EXISTS idx_caterer_orders_payment_method
  ON caterer_orders (payment_method)
  WHERE payment_method = 'COD';

SELECT 'Migration 028 applied — COD payment fields added to caterer_orders.' AS status;
