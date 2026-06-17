-- Soft-delete fields on users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_deleted              BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deleted_at              TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deletion_requested_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by              UUID,
  ADD COLUMN IF NOT EXISTS deletion_reason         TEXT,
  ADD COLUMN IF NOT EXISTS anonymized_at           TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_is_deleted ON users(is_deleted) WHERE is_deleted = TRUE;

-- Caterer account closure requests (requires admin approval before deletion)
CREATE TABLE IF NOT EXISTS account_deletion_requests (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_type VARCHAR(20) NOT NULL DEFAULT 'CLOSURE' CHECK (request_type IN ('CLOSURE')),
  status       VARCHAR(20) NOT NULL DEFAULT 'PENDING'  CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  reason       TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at  TIMESTAMPTZ,
  reviewed_by  UUID,
  review_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_adr_user_id ON account_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_adr_status  ON account_deletion_requests(status);

-- Audit trail for all account lifecycle actions
CREATE TABLE IF NOT EXISTS account_audit_log (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL,
  action       VARCHAR(50) NOT NULL,
  performed_by UUID,
  reason       TEXT,
  metadata     JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aal_user_id ON account_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_aal_created ON account_audit_log(created_at DESC);
