-- Migration 040: Email-only password reset with hashed tokens + email_logs
-- Safe to run whether or not migration 039 was previously applied.

-- ── Ensure base column exists (idempotent with 039) ─────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;

-- ── password_reset_tokens: clean schema ─────────────────────────────────────
-- Create the table if it was never created (039 never ran)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add token_hash column (email-based secure token, SHA-256 hashed before storage)
ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS token_hash VARCHAR(128);

-- Drop legacy raw-token and OTP columns (email-only flow; keeps table clean)
ALTER TABLE password_reset_tokens DROP COLUMN IF EXISTS token;
ALTER TABLE password_reset_tokens DROP COLUMN IF EXISTS otp;
ALTER TABLE password_reset_tokens DROP COLUMN IF EXISTS attempts;

-- Add unique constraint on token_hash (skip if already present)
DO $$
BEGIN
  ALTER TABLE password_reset_tokens
    ADD CONSTRAINT prt_token_hash_unique UNIQUE (token_hash);
EXCEPTION WHEN duplicate_table THEN NULL;
         WHEN others THEN
           IF SQLERRM LIKE '%already exists%' THEN NULL;
           ELSE RAISE;
           END IF;
END $$;

-- Rebuild indexes
DROP INDEX IF EXISTS idx_prt_token;
CREATE INDEX IF NOT EXISTS idx_prt_user_id    ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_prt_token_hash ON password_reset_tokens(token_hash) WHERE token_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prt_expires    ON password_reset_tokens(expires_at);

-- ── email_logs: audit trail for all outbound emails ─────────────────────────
CREATE TABLE IF NOT EXISTS email_logs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient     VARCHAR(320) NOT NULL,
  subject       VARCHAR(500) NOT NULL,
  status        VARCHAR(10)  NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  error_message TEXT,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient   ON email_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at  ON email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_status      ON email_logs(status);
