-- Payment calculation snapshot columns.
-- Stored at time-of-order so historical records are immutable even if admin changes rates later.
-- All default to 0 (MVP: no commission, no fees, payout = subtotal).

-- caterer_orders: per-caterer payout breakdown
ALTER TABLE caterer_orders
  ADD COLUMN IF NOT EXISTS commission_percentage NUMERIC(5,2)  NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS commission_amount     NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS platform_fee          NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS caterer_payout        NUMERIC(10,2) NOT NULL DEFAULT 0.00;

-- Backfill: existing orders had 0% commission so payout = subtotal
UPDATE caterer_orders
SET caterer_payout = subtotal
WHERE caterer_payout = 0 AND subtotal > 0;

-- orders: legacy single-caterer flow
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS commission_percentage NUMERIC(5,2)  NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS commission_amount     NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS platform_fee          NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS caterer_payout        NUMERIC(10,2) NOT NULL DEFAULT 0.00;

-- Backfill legacy orders
UPDATE orders
SET caterer_payout = total_amount
WHERE caterer_payout = 0 AND total_amount > 0;
