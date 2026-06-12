-- Migration 013: Rider portal, catering services, GPS tracking, delivery codes

-- Add RIDER to user_role enum (idempotent)
DO $$
BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'RIDER';
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

-- Catering availability toggle on caterer accounts
ALTER TABLE users ADD COLUMN IF NOT EXISTS catering_available BOOLEAN NOT NULL DEFAULT FALSE;

-- Delivery tracking columns on caterer_orders
ALTER TABLE caterer_orders ADD COLUMN IF NOT EXISTS rider_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE caterer_orders ADD COLUMN IF NOT EXISTS delivery_confirmation_code VARCHAR(6);
ALTER TABLE caterer_orders ADD COLUMN IF NOT EXISTS delivery_started_at TIMESTAMPTZ;

-- rider_profiles: links RIDER users to their managing caterer
CREATE TABLE IF NOT EXISTS rider_profiles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  caterer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_type   VARCHAR(50),
  vehicle_number VARCHAR(30),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_rider_profiles_caterer ON rider_profiles(caterer_id);
CREATE INDEX IF NOT EXISTS idx_rider_profiles_user    ON rider_profiles(user_id);

-- catering_services: occasions offered by each caterer
CREATE TABLE IF NOT EXISTS catering_services (
  id                   UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  caterer_id           UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  occasion_name        VARCHAR(255) NOT NULL,
  price_per_person     NUMERIC(10,2) NOT NULL,
  minimum_people       INTEGER NOT NULL DEFAULT 10,
  maximum_people       INTEGER NOT NULL DEFAULT 500,
  advance_booking_days INTEGER NOT NULL DEFAULT 7,
  status               VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catering_services_caterer ON catering_services(caterer_id);

-- catering_bookings: customer event catering requests
CREATE TABLE IF NOT EXISTS catering_bookings (
  id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id         UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  caterer_id          UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  catering_service_id UUID    REFERENCES catering_services(id) ON DELETE SET NULL,
  occasion_name       VARCHAR(255) NOT NULL,
  event_date          DATE    NOT NULL,
  number_of_people    INTEGER NOT NULL,
  price_per_person    NUMERIC(10,2) NOT NULL,
  total_amount        NUMERIC(10,2) NOT NULL,
  special_food_request TEXT,
  special_instructions TEXT,
  status              VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catering_bookings_customer ON catering_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_catering_bookings_caterer  ON catering_bookings(caterer_id);

-- rider_locations: GPS breadcrumbs from riders
CREATE TABLE IF NOT EXISTS rider_locations (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id   UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  latitude   NUMERIC(10,7) NOT NULL,
  longitude  NUMERIC(10,7) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rider_locations_rider ON rider_locations(rider_id, created_at DESC);
