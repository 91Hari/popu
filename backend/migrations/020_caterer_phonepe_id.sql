-- Migration 020: PhonePe ID for caterers
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phonepe_id VARCHAR(100);

SELECT 'Migration 020 applied — phonepe_id column added to users.' AS status;
