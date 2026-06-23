-- Migration 041: Make email mandatory on users table
--
-- Migration 030 dropped NOT NULL on email for mobile-OTP accounts.
-- Email is now required for all new registrations and password recovery.
-- This migration safely restores the constraint.

-- ── Step 1: Fill placeholder emails for any users that have NULL email ────────
-- These accounts were created before email was required (mobile-OTP era).
-- Placeholder format: noemail.<8-char-uuid>@placeholder.popu.com
-- Admins can reach these users via mobile to collect their real email.
UPDATE users
SET    email = CONCAT('noemail.', SUBSTRING(id::text, 1, 8), '@placeholder.popu.com')
WHERE  email IS NULL;

-- ── Step 2: Restore NOT NULL constraint on email ──────────────────────────────
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

-- ── Step 3: Ensure the unique index on email exists ───────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email);

SELECT 'Migration 041 applied: email is now mandatory for all users' AS status;
