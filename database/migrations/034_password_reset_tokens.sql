-- Migration 034: Persistent password reset tokens + session invalidation support

-- Add password_changed_at to users so existing sessions can be invalidated after reset
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;

-- Main password reset tokens table (replaces in-memory Map)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       VARCHAR(128) UNIQUE,          -- hex token for email link / post-OTP temp token
  otp         CHAR(6),                      -- 6-digit code for mobile OTP flow
  expires_at  TIMESTAMPTZ  NOT NULL,
  used        BOOLEAN      NOT NULL DEFAULT FALSE,
  attempts    INTEGER      NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prt_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_prt_token   ON password_reset_tokens(token) WHERE token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prt_expires ON password_reset_tokens(expires_at);

-- Auto-cleanup: mark expired tokens as used (run periodically via cron or on-startup)
-- Tokens expire naturally; this index helps prune them efficiently.
