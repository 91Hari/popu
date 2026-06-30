-- Migration 038: Compliance core tables
-- legal_consents, caterer_kyc, caterer_bank_accounts, fssai_details

-- Legal consent audit trail
CREATE TABLE IF NOT EXISTS legal_consents (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_type     VARCHAR(50) NOT NULL,
  -- TERMS_OF_SERVICE | PRIVACY_POLICY | VENDOR_AGREEMENT | RIDER_AGREEMENT
  -- MARKETING_CONSENT | LOCATION_CONSENT | NOTIFICATION_CONSENT
  document_version VARCHAR(20) NOT NULL DEFAULT '1.0',
  accepted         BOOLEAN NOT NULL,
  ip_address       INET,
  user_agent       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_legal_consents_user_id ON legal_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_consents_type ON legal_consents(consent_type);

-- Caterer KYC documents
CREATE TABLE IF NOT EXISTS caterer_kyc (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caterer_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pan_number       VARCHAR(10),
  pan_url          TEXT,
  gst_number       VARCHAR(15),
  gst_verified     BOOLEAN DEFAULT FALSE,
  business_type    VARCHAR(30),
  -- PROPRIETORSHIP | PARTNERSHIP | LLP | PRIVATE_LIMITED | HUF
  kyc_status       VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  -- PENDING | SUBMITTED | APPROVED | REJECTED
  rejection_reason TEXT,
  kyc_reviewed_by  UUID REFERENCES users(id),
  kyc_reviewed_at  TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(caterer_id)
);
CREATE INDEX IF NOT EXISTS idx_caterer_kyc_status ON caterer_kyc(kyc_status);

-- Caterer bank accounts for settlement payouts
CREATE TABLE IF NOT EXISTS caterer_bank_accounts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caterer_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_holder   VARCHAR(200) NOT NULL,
  bank_name        VARCHAR(100) NOT NULL,
  account_number   VARCHAR(30) NOT NULL,
  ifsc_code        VARCHAR(11) NOT NULL,
  account_type     VARCHAR(20) DEFAULT 'SAVINGS',
  is_primary       BOOLEAN DEFAULT FALSE,
  is_verified      BOOLEAN DEFAULT FALSE,
  verified_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_caterer_bank_caterer_id ON caterer_bank_accounts(caterer_id);

-- FSSAI license details per caterer
CREATE TABLE IF NOT EXISTS fssai_details (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caterer_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fssai_number     VARCHAR(14) NOT NULL,
  license_type     VARCHAR(30),
  -- REGISTRATION | STATE_LICENSE | CENTRAL_LICENSE
  issue_date       DATE,
  expiry_date      DATE NOT NULL,
  certificate_url  TEXT,
  verified         BOOLEAN DEFAULT FALSE,
  verified_by      UUID REFERENCES users(id),
  verified_at      TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(caterer_id)
);
CREATE INDEX IF NOT EXISTS idx_fssai_expiry ON fssai_details(expiry_date);
CREATE INDEX IF NOT EXISTS idx_fssai_verified ON fssai_details(verified);

-- Users: compliance fields
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS pan_number       VARCHAR(10),
  ADD COLUMN IF NOT EXISTS gst_number       VARCHAR(15),
  ADD COLUMN IF NOT EXISTS is_kyc_verified  BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS kyc_verified_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deletion_reason  TEXT;
