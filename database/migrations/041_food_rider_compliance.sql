-- Migration 041: Food item safety fields + rider KYC fields

-- Food items: veg/non-veg + allergens (FSSAI 2021 requirement)
ALTER TABLE food_items
  ADD COLUMN IF NOT EXISTS is_veg     BOOLEAN,
  ADD COLUMN IF NOT EXISTS allergens  TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS calories   INTEGER,
  ADD COLUMN IF NOT EXISTS is_vegan   BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_jain    BOOLEAN DEFAULT FALSE;

-- Rider KYC / compliance fields
ALTER TABLE rider_profiles
  ADD COLUMN IF NOT EXISTS govt_id_type             VARCHAR(20),
  -- AADHAAR | VOTER_ID | PASSPORT
  ADD COLUMN IF NOT EXISTS govt_id_number           VARCHAR(30),
  ADD COLUMN IF NOT EXISTS govt_id_url              TEXT,
  ADD COLUMN IF NOT EXISTS driving_license          VARCHAR(20),
  ADD COLUMN IF NOT EXISTS dl_category              VARCHAR(10),
  ADD COLUMN IF NOT EXISTS dl_expiry                DATE,
  ADD COLUMN IF NOT EXISTS dl_url                   TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_rc_number        VARCHAR(20),
  ADD COLUMN IF NOT EXISTS insurance_number         VARCHAR(30),
  ADD COLUMN IF NOT EXISTS insurance_expiry         DATE,
  ADD COLUMN IF NOT EXISTS insurance_url            TEXT,
  ADD COLUMN IF NOT EXISTS background_check_status  VARCHAR(20) DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS background_check_date    DATE,
  ADD COLUMN IF NOT EXISTS gps_consent_given        BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS gps_consent_at           TIMESTAMPTZ;

-- Add GST fields to payments table
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS gst_amount    NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gst_rate      NUMERIC(5,2) DEFAULT 5.00,
  ADD COLUMN IF NOT EXISTS invoice_id    UUID REFERENCES tax_invoices(id);

-- Add GST fields to caterer_orders
ALTER TABLE caterer_orders
  ADD COLUMN IF NOT EXISTS gst_amount    NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gst_rate      NUMERIC(5,2) DEFAULT 5.00;
