-- Platform settings: singleton table for commission, fees, and payment configuration.
-- All values default to 0/disabled so PO.PU operates as a pure marketplace in MVP.
-- Admin can enable commission/fees later without any schema changes.

CREATE TABLE IF NOT EXISTS platform_settings (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_enabled    BOOLEAN       NOT NULL DEFAULT FALSE,
  commission_percentage NUMERIC(5,2)  NOT NULL DEFAULT 0.00
    CONSTRAINT chk_commission_pct CHECK (commission_percentage >= 0 AND commission_percentage <= 100),
  platform_fee_enabled  BOOLEAN       NOT NULL DEFAULT FALSE,
  platform_fee_amount   NUMERIC(10,2) NOT NULL DEFAULT 0.00
    CONSTRAINT chk_platform_fee_positive CHECK (platform_fee_amount >= 0),
  updated_by            UUID          REFERENCES users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Seed the one-and-only settings row.
-- All fees disabled — PO.PU charges nothing in MVP phase.
INSERT INTO platform_settings (commission_enabled, commission_percentage, platform_fee_enabled, platform_fee_amount)
SELECT FALSE, 0.00, FALSE, 0.00
WHERE NOT EXISTS (SELECT 1 FROM platform_settings);
