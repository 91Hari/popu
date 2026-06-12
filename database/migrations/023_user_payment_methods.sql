-- Migration 023: Customer payment methods
-- Phase 1: PhonePe ID. Future-ready columns included for Google Pay, Paytm, Bank, UPI, Cards.
CREATE TABLE IF NOT EXISTS user_payment_methods (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_type    VARCHAR(50) NOT NULL DEFAULT 'phonepe',
  phonepe_id      VARCHAR(100),
  -- Future fields (nullable, unused in Phase 1):
  gpay_id         VARCHAR(100),
  paytm_id        VARCHAR(100),
  upi_id          VARCHAR(100),
  bank_name       VARCHAR(200),
  bank_account_no VARCHAR(50),
  bank_ifsc       VARCHAR(20),
  card_last4      VARCHAR(4),
  card_network    VARCHAR(20),
  is_default      BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_payment_type UNIQUE (user_id, payment_type)
);

CREATE INDEX IF NOT EXISTS idx_user_payment_methods_user ON user_payment_methods(user_id);

SELECT 'Migration 023 applied — user_payment_methods table created.' AS status;
