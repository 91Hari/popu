-- Migration 022: User delivery addresses
CREATE TABLE IF NOT EXISTS user_addresses (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name  VARCHAR(200) NOT NULL,
  mobile     VARCHAR(15)  NOT NULL,
  house_no   VARCHAR(200) NOT NULL,
  street     VARCHAR(300) NOT NULL,
  landmark   VARCHAR(200),
  city       VARCHAR(100) NOT NULL,
  state      VARCHAR(100) NOT NULL,
  pincode    VARCHAR(10)  NOT NULL,
  latitude   DOUBLE PRECISION,
  longitude  DOUBLE PRECISION,
  is_default BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user    ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_default ON user_addresses(user_id, is_default);

SELECT 'Migration 022 applied — user_addresses table created.' AS status;
