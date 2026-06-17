-- Migration 030: Mobile Number + OTP Authentication
--
-- Replaces email/password login with mobile OTP.
-- Existing users retain their email/password data (backwards compatible).
-- New OTP-only accounts have NULL email and NULL password_hash.

-- Make email and password_hash optional for OTP-only users
ALTER TABLE users
  ALTER COLUMN email          DROP NOT NULL,
  ALTER COLUMN password_hash  DROP NOT NULL;

-- Add mobile_number for OTP authentication
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(15);

-- Unique sparse index: enforces uniqueness only where mobile_number IS NOT NULL
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_mobile_number
  ON users (mobile_number)
  WHERE mobile_number IS NOT NULL;

-- OTP verifications table
CREATE TABLE IF NOT EXISTS otp_verifications (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile_number VARCHAR(15) NOT NULL,
  otp_hash      TEXT        NOT NULL,         -- HMAC-SHA256 of otp keyed on mobile_number
  expires_at    TIMESTAMPTZ NOT NULL,
  is_verified   BOOLEAN     NOT NULL DEFAULT FALSE,
  attempt_count INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- For rate-limit queries (count sends per hour per number)
CREATE INDEX IF NOT EXISTS idx_otp_mobile_created
  ON otp_verifications (mobile_number, created_at DESC);

-- For fast lookup of active (unverified, unexpired) OTPs
CREATE INDEX IF NOT EXISTS idx_otp_active
  ON otp_verifications (mobile_number, expires_at)
  WHERE is_verified = FALSE;

SELECT 'Migration 030 applied: mobile_number column + otp_verifications table' AS status;
