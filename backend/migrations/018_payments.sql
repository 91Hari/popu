-- Migration 018: Online Payments (PhonePe)
--
-- Adds:
--   payments  — one record per PhonePe payment intent; stores cart snapshot so
--               the order can be created server-side after payment success.
--   Idempotency key: merchant_transaction_id (UNIQUE constraint).

CREATE TABLE IF NOT EXISTS payments (
  id                       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id              UUID         NOT NULL REFERENCES users(id),
  merchant_transaction_id  VARCHAR(100) NOT NULL UNIQUE,
  phonepe_order_id         VARCHAR(200),
  amount                   NUMERIC(10,2) NOT NULL,
  currency                 VARCHAR(3)   NOT NULL DEFAULT 'INR',
  payment_status           VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
    CONSTRAINT chk_payment_status CHECK (
      payment_status IN ('PENDING','SUCCESS','FAILED','CANCELLED','REFUNDED','AUTO_CANCELLED')
    ),
  payment_method           VARCHAR(50),
  payment_response         JSONB,
  cart_snapshot            JSONB        NOT NULL,
  master_order_id          UUID         REFERENCES master_orders(id) ON DELETE SET NULL,
  created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_customer        ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status          ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_master_order    ON payments(master_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_merchant_txn    ON payments(merchant_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_created         ON payments(created_at DESC);

SELECT 'Migration 018 applied — payments table created.' AS status;
