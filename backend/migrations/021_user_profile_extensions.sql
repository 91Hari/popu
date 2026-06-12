-- Migration 021: Extend users table for customer profile settings
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS gender        VARCHAR(20)
    CONSTRAINT chk_gender CHECK (gender IN ('male','female','other','prefer_not_to_say'));

SELECT 'Migration 021 applied — date_of_birth and gender added to users.' AS status;
