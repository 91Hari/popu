-- Migration 040: Financial compliance tables
-- settlement_records, tds_deductions, tax_invoices, commission_rules

CREATE TABLE IF NOT EXISTS settlement_records (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caterer_id          UUID NOT NULL REFERENCES users(id),
  period_from         DATE NOT NULL,
  period_to           DATE NOT NULL,
  gross_amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  commission_amount   NUMERIC(12,2) NOT NULL DEFAULT 0,
  platform_fee        NUMERIC(12,2) NOT NULL DEFAULT 0,
  tds_deducted        NUMERIC(12,2) NOT NULL DEFAULT 0,
  gst_on_commission   NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_payout          NUMERIC(12,2) NOT NULL DEFAULT 0,
  order_count         INTEGER NOT NULL DEFAULT 0,
  status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  -- PENDING | PROCESSING | COMPLETED | FAILED
  utr_number          VARCHAR(30),
  payment_method      VARCHAR(20),
  -- NEFT | IMPS | UPI | MANUAL
  remarks             TEXT,
  settled_at          TIMESTAMPTZ,
  created_by          UUID REFERENCES users(id),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_settlement_caterer ON settlement_records(caterer_id);
CREATE INDEX IF NOT EXISTS idx_settlement_status ON settlement_records(status);
CREATE INDEX IF NOT EXISTS idx_settlement_period ON settlement_records(period_from, period_to);

-- Link caterer_orders to settlement
ALTER TABLE caterer_orders
  ADD COLUMN IF NOT EXISTS settlement_id     UUID REFERENCES settlement_records(id),
  ADD COLUMN IF NOT EXISTS settlement_status VARCHAR(20) DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS settled_at        TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_caterer_orders_settlement ON caterer_orders(settlement_id);

-- TDS deductions tracker (Section 194-O)
CREATE TABLE IF NOT EXISTS tds_deductions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caterer_id       UUID NOT NULL REFERENCES users(id),
  financial_year   VARCHAR(9) NOT NULL,
  quarter          SMALLINT NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  gross_amount     NUMERIC(12,2) NOT NULL,
  tds_rate         NUMERIC(5,2) NOT NULL DEFAULT 1.00,
  tds_amount       NUMERIC(12,2) NOT NULL,
  settlement_id    UUID REFERENCES settlement_records(id),
  challan_number   VARCHAR(50),
  deposited_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tds_caterer_fy ON tds_deductions(caterer_id, financial_year);

-- Tax invoices (customer receipts + commission invoices to caterers)
CREATE TABLE IF NOT EXISTS tax_invoices (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number   VARCHAR(30) UNIQUE NOT NULL,
  invoice_type     VARCHAR(30) NOT NULL,
  -- CUSTOMER_RECEIPT | COMMISSION_INVOICE | TDS_CERTIFICATE
  party_id         UUID REFERENCES users(id),
  order_ref_id     UUID,
  settlement_id    UUID REFERENCES settlement_records(id),
  taxable_amount   NUMERIC(12,2) NOT NULL DEFAULT 0,
  gst_rate         NUMERIC(5,2) NOT NULL DEFAULT 0,
  cgst_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
  sgst_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
  igst_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
  financial_year   VARCHAR(9),
  invoice_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_party ON tax_invoices(party_id);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_type ON tax_invoices(invoice_type);

-- Commission rules (per-category or per-caterer overrides)
CREATE TABLE IF NOT EXISTS commission_rules (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name        VARCHAR(100) NOT NULL,
  applies_to       VARCHAR(20) NOT NULL DEFAULT 'ALL',
  -- ALL | CATERER
  caterer_id       UUID REFERENCES users(id),
  commission_pct   NUMERIC(5,2) NOT NULL DEFAULT 0,
  platform_fee     NUMERIC(10,2) NOT NULL DEFAULT 0,
  valid_from       DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_to         DATE,
  is_active        BOOLEAN DEFAULT TRUE,
  created_by       UUID REFERENCES users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_commission_rules_active ON commission_rules(is_active, valid_from, valid_to);

-- Invoice number sequence
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1000;

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION next_invoice_number(prefix TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN prefix || '-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;
