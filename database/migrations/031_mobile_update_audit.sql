-- Migration 031: Mobile number update audit log
--
-- Records every time a user changes their mobile_number from Settings,
-- capturing who changed what and when for security/compliance.

CREATE TABLE IF NOT EXISTS user_mobile_audit (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  old_mobile  VARCHAR(15),            -- NULL if user had no mobile before
  new_mobile  VARCHAR(15) NOT NULL,
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mobile_audit_user
  ON user_mobile_audit (user_id, changed_at DESC);

SELECT 'Migration 031 applied: user_mobile_audit table' AS status;
