-- Migration 034: Add address fields to users table
-- Used by registration, profile settings, and ETA/delivery calculations
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS address   TEXT,
  ADD COLUMN IF NOT EXISTS city      VARCHAR(100),
  ADD COLUMN IF NOT EXISTS state     VARCHAR(100),
  ADD COLUMN IF NOT EXISTS pincode   VARCHAR(10),
  ADD COLUMN IF NOT EXISTS latitude  DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

SELECT 'Migration 034 applied — address, city, state, pincode, latitude, longitude added to users.' AS status;
