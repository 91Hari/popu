-- Migration 044: Centralize Razorpay payment architecture
-- Adds Razorpay fields to payments table, adds service_type,
-- adds payment fields to tiffin_orders, adds webhook events table.
-- All changes are additive (IF NOT EXISTS / safe defaults).

-- ── 1. Extend payments table with Razorpay and service_type ─────────────────

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS razorpay_order_id   VARCHAR(100),
  ADD COLUMN IF NOT EXISTS razorpay_payment_id  VARCHAR(100),
  ADD COLUMN IF NOT EXISTS razorpay_signature   VARCHAR(200),
  ADD COLUMN IF NOT EXISTS payment_gateway      VARCHAR(20) DEFAULT 'PHONEPE',
  ADD COLUMN IF NOT EXISTS service_type         VARCHAR(20) DEFAULT 'FOOD',
  ADD COLUMN IF NOT EXISTS delivery_charge      NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pickup_saving        NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS refund_status        VARCHAR(20),
  ADD COLUMN IF NOT EXISTS refund_amount        NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS refunded_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS idempotency_key      VARCHAR(100) UNIQUE,
  ADD COLUMN IF NOT EXISTS tiffin_order_id      UUID REFERENCES tiffin_orders(id) ON DELETE SET NULL;

-- Back-fill existing PhonePe payments
UPDATE payments SET payment_gateway = 'PHONEPE' WHERE payment_gateway IS NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order
  ON payments (razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payments_service_type
  ON payments (service_type);

CREATE INDEX IF NOT EXISTS idx_payments_tiffin_order
  ON payments (tiffin_order_id) WHERE tiffin_order_id IS NOT NULL;

-- ── 2. Extend tiffin_orders with payment and fulfillment fields ──────────────

ALTER TABLE tiffin_orders
  ADD COLUMN IF NOT EXISTS fulfillment_type     VARCHAR(20)  DEFAULT 'DELIVERY'
    CHECK (fulfillment_type IN ('DELIVERY', 'SELF_PICKUP')),
  ADD COLUMN IF NOT EXISTS payment_method       VARCHAR(20)  DEFAULT 'ONLINE'
    CHECK (payment_method IN ('ONLINE', 'COD', 'RAZORPAY')),
  ADD COLUMN IF NOT EXISTS razorpay_order_id    VARCHAR(100),
  ADD COLUMN IF NOT EXISTS razorpay_payment_id  VARCHAR(100),
  ADD COLUMN IF NOT EXISTS delivery_charge      NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pickup_saving        NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pickup_code          VARCHAR(20),
  ADD COLUMN IF NOT EXISTS pickup_status        VARCHAR(20)  DEFAULT 'PENDING'
    CHECK (pickup_status IN ('PENDING', 'READY', 'COLLECTED')),
  ADD COLUMN IF NOT EXISTS confirmed_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS caterer_address      TEXT,
  ADD COLUMN IF NOT EXISTS caterer_lat          DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS caterer_lng          DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS idx_tiffin_razorpay
  ON tiffin_orders (razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tiffin_payment_status
  ON tiffin_orders (payment_status);

-- ── 3. Razorpay webhook events table (idempotent processing) ─────────────────

CREATE TABLE IF NOT EXISTS razorpay_webhook_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        VARCHAR(100) NOT NULL UNIQUE,   -- Razorpay event ID for dedup
  event_type      VARCHAR(50)  NOT NULL,          -- payment.captured, refund.processed etc
  payload         JSONB        NOT NULL,
  processed       BOOLEAN      DEFAULT FALSE,
  error_message   TEXT,
  created_at      TIMESTAMPTZ  DEFAULT NOW(),
  processed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_rzp_webhook_event_type
  ON razorpay_webhook_events (event_type, processed);

-- ── 4. Add RAZORPAY to payment_status constraint on caterer_orders (safe) ───
-- Note: no ALTER CONSTRAINT needed — payment_status is VARCHAR with app-level validation.

SELECT 'Migration 044 applied — Razorpay payment architecture.' AS status;
