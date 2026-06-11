-- Migration 012: add phone number to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
