ALTER TABLE users ADD COLUMN IF NOT EXISTS location      VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_name VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_users_location ON users (location);
