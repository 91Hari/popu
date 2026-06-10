-- Add reference_id to notifications so caterers can deep-link to the related order
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS reference_id UUID;
