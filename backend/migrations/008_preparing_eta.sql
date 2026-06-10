-- Add READY status: order is prepared and out for delivery
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'READY' AFTER 'PREPARING';

-- Track when caterer started preparing — ETA anchor point
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS preparation_started_at TIMESTAMPTZ;
