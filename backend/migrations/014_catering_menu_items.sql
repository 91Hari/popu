-- Add menu items list to catering services
ALTER TABLE catering_services ADD COLUMN IF NOT EXISTS menu_items TEXT;
