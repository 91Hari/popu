-- Migration 019: Refunds
--
-- Adds:
--   refunds — one record per refund initiated (PhonePe).
--   A caterer sub-order cancellation triggers a partial refund for that sub-order's amount.

CREATE TABLE IF NOT EXISTS refunds (
  id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id         UUID         NOT NULL REFERENCES payments(id),
  master_order_id    UUID         REFERENCES master_orders(id) ON DELETE SET NULL,
  caterer_order_id   UUID         REFERENCES caterer_orders(id) ON DELETE SET NULL,
  merchant_refund_id VARCHAR(100) NOT NULL UNIQUE,
  phonepe_refund_id  VARCHAR(200),
  refund_amount      NUMERIC(10,2) NOT NULL,
  refund_status      VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
    CONSTRAINT chk_refund_status CHECK (
      refund_status IN ('PENDING','PROCESSING','SUCCESS','FAILED')
    ),
  refund_response    JSONB,
  refund_reason      TEXT,
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refunds_payment        ON refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_master_order   ON refunds(master_order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_caterer_order  ON refunds(caterer_order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status         ON refunds(refund_status);

SELECT 'Migration 019 applied — refunds table created.' AS status;
