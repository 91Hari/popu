-- Food preparation time
ALTER TABLE food_items
  ADD COLUMN IF NOT EXISTS preparation_time_minutes INTEGER NOT NULL DEFAULT 20;

-- ETA stored on order at creation time
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS eta_minutes          INTEGER,
  ADD COLUMN IF NOT EXISTS expected_arrival_at  TIMESTAMPTZ;

-- Admin-configurable delivery rules
CREATE TABLE IF NOT EXISTS delivery_settings (
  key         VARCHAR(100) PRIMARY KEY,
  value       TEXT         NOT NULL,
  description TEXT,
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

INSERT INTO delivery_settings (key, value, description) VALUES
  ('max_delivery_radius_km', '30',  'Refuse orders beyond this radius (km)'),
  ('speed_kmh',              '25',  'Average delivery speed used for ETA (km/h)'),
  ('min_eta_minutes',        '10',  'Minimum ETA floor in minutes'),
  ('eta_buffer_minutes',     '5',   'Buffer added/subtracted for ETA range display'),
  ('bracket_0_3_minutes',    '10',  'Travel time for 0-3 km'),
  ('bracket_3_8_minutes',    '20',  'Travel time for 3-8 km'),
  ('bracket_8_15_minutes',   '30',  'Travel time for 8-15 km'),
  ('bracket_15plus_minutes', '45',  'Travel time for 15+ km')
ON CONFLICT (key) DO NOTHING;
