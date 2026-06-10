-- =============================================================================
-- Popu — Canonical Production Schema
-- Idempotent: safe to run on a fresh database.
-- For existing databases use migration 011_production_sync.sql instead.
-- =============================================================================

-- Extensions ----------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- must be before trgm indexes

-- Enum types ----------------------------------------------------------------
-- user_role: wrap in DO block so re-runs don't fail
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('CUSTOMER', 'CATERER', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- order_status: includes READY (added in migration 008)
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- updated_at trigger function -----------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Core tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(255) NOT NULL,
  email             VARCHAR(255) NOT NULL UNIQUE,
  password_hash     TEXT         NOT NULL,
  role              user_role    NOT NULL,

  -- Profile (caterer-specific, nullable for customers)
  business_name     VARCHAR(255),
  location          VARCHAR(255),
  address           TEXT,
  latitude          NUMERIC(10, 7),
  longitude         NUMERIC(10, 7),

  -- Caterer availability
  availability_status VARCHAR(20) NOT NULL DEFAULT 'READY'
    CHECK (availability_status IN ('READY', 'NOT_READY')),

  -- Caterer payment profile
  upi_id            VARCHAR(100),
  payment_name      VARCHAR(200),
  qr_code_image_url TEXT,
  bank_account_name VARCHAR(200),

  is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email    ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role     ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_location ON users (location);
CREATE INDEX IF NOT EXISTS idx_users_name_trgm
  ON users USING gin (name gin_trgm_ops);

DO $$ BEGIN
  CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS food_items (
  id                       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  caterer_id               UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  food_name                VARCHAR(255) NOT NULL,
  description              TEXT,
  price                    NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image_url                TEXT,
  is_available             BOOLEAN      NOT NULL DEFAULT TRUE,
  category                 VARCHAR(100),
  preparation_time_minutes INTEGER      NOT NULL DEFAULT 20,
  created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_items_caterer_id   ON food_items (caterer_id);
CREATE INDEX IF NOT EXISTS idx_food_items_is_available ON food_items (is_available);
CREATE INDEX IF NOT EXISTS idx_food_items_category     ON food_items (category);
CREATE INDEX IF NOT EXISTS idx_food_items_search
  ON food_items USING gin (to_tsvector('english', food_name));
CREATE INDEX IF NOT EXISTS idx_food_items_name_trgm
  ON food_items USING gin (food_name gin_trgm_ops);

DO $$ BEGIN
  CREATE TRIGGER trg_food_items_updated_at
    BEFORE UPDATE ON food_items
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS orders (
  id                     UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id            UUID          NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  total_amount           NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  status                 order_status  NOT NULL DEFAULT 'PLACED',

  -- Coordinates captured at order time for ETA calculation
  customer_lat           NUMERIC(10, 7),
  customer_lng           NUMERIC(10, 7),

  -- ETA fields (set when caterer starts preparing)
  eta_minutes            INTEGER,
  expected_arrival_at    TIMESTAMPTZ,
  preparation_started_at TIMESTAMPTZ,

  -- Lifecycle timestamps
  accepted_at            TIMESTAMPTZ,
  cancelled_at           TIMESTAMPTZ,
  cancel_reason          TEXT,

  created_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders (status);

DO $$ BEGIN
  CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS order_items (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID          NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  food_item_id UUID          NOT NULL REFERENCES food_items (id) ON DELETE RESTRICT,
  quantity     INTEGER       NOT NULL CHECK (quantity > 0),
  unit_price   NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price  NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id     ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_food_item_id ON order_items (food_item_id);

-- =============================================================================
-- Supporting tables (added via migrations 001-003)
-- =============================================================================

CREATE TABLE IF NOT EXISTS cart_items (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  UUID    NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  food_item_id UUID    NOT NULL REFERENCES food_items (id) ON DELETE CASCADE,
  quantity     INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (customer_id, food_item_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_customer ON cart_items (customer_id);

-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notifications (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  title             TEXT        NOT NULL,
  message           TEXT        NOT NULL,
  is_read           BOOLEAN     NOT NULL DEFAULT FALSE,
  reference_id      UUID,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id     ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, is_read);

-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS order_status_history (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID         NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  status     order_status NOT NULL,
  updated_by UUID         REFERENCES users (id) ON DELETE SET NULL,
  notes      TEXT,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_osh_order_id ON order_status_history (order_id);

-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS food_events (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id    UUID        NOT NULL REFERENCES food_items (id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  old_value  JSONB,
  new_value  JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_events_food_id ON food_events (food_id);
CREATE INDEX IF NOT EXISTS idx_food_events_type    ON food_events (event_type);

-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS customer_favorites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  food_id     UUID NOT NULL REFERENCES food_items (id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (customer_id, food_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_favorites_customer ON customer_favorites (customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_favorites_food     ON customer_favorites (food_id);

-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS audit_logs (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type  VARCHAR(100) NOT NULL,
  entity_id    UUID         NOT NULL,
  action       VARCHAR(100) NOT NULL,
  performed_by UUID         REFERENCES users (id) ON DELETE SET NULL,
  details      JSONB,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity       ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by ON audit_logs (performed_by);

-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS system_notifications (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255) NOT NULL,
  message     TEXT         NOT NULL,
  target_role VARCHAR(20)  DEFAULT 'ALL',
  created_by  UUID         REFERENCES users (id),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Multi-caterer order system (migration 010)
-- =============================================================================

CREATE TABLE IF NOT EXISTS master_orders (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  UUID           NOT NULL REFERENCES users (id),
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  customer_lat DOUBLE PRECISION,
  customer_lng DOUBLE PRECISION,
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_master_orders_customer ON master_orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_master_orders_created  ON master_orders (created_at DESC);

-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS caterer_orders (
  id                  UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  master_order_id     UUID           NOT NULL REFERENCES master_orders (id) ON DELETE CASCADE,
  caterer_id          UUID           NOT NULL REFERENCES users (id),
  status              VARCHAR(20)    NOT NULL DEFAULT 'PLACED',
  subtotal            DECIMAL(10, 2) NOT NULL DEFAULT 0,
  accepted_at         TIMESTAMPTZ,
  preparing_at        TIMESTAMPTZ,
  ready_at            TIMESTAMPTZ,
  delivered_at        TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  cancel_reason       TEXT,
  eta_minutes         INTEGER,
  expected_arrival_at TIMESTAMPTZ,
  payment_status      VARCHAR(30)    NOT NULL DEFAULT 'PENDING',
  created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_caterer_orders_master  ON caterer_orders (master_order_id);
CREATE INDEX IF NOT EXISTS idx_caterer_orders_caterer ON caterer_orders (caterer_id);

-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS caterer_order_items (
  id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  caterer_order_id UUID           NOT NULL REFERENCES caterer_orders (id) ON DELETE CASCADE,
  food_item_id     UUID           NOT NULL REFERENCES food_items (id),
  quantity         INTEGER        NOT NULL,
  unit_price       DECIMAL(10, 2) NOT NULL,
  total_price      DECIMAL(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_caterer_order_items_order ON caterer_order_items (caterer_order_id);

-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS payment_proofs (
  id                     UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  master_order_id        UUID           NOT NULL REFERENCES master_orders (id),
  caterer_order_id       UUID           NOT NULL REFERENCES caterer_orders (id),
  customer_id            UUID           NOT NULL REFERENCES users (id),
  caterer_id             UUID           NOT NULL REFERENCES users (id),
  amount                 DECIMAL(10, 2),
  payment_screenshot_url TEXT,
  upi_reference          VARCHAR(100),
  payment_status         VARCHAR(30)    NOT NULL DEFAULT 'PENDING_REVIEW',
  rejection_reason       TEXT,
  uploaded_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  reviewed_at            TIMESTAMPTZ,
  created_at             TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  UNIQUE (caterer_order_id)
);

CREATE INDEX IF NOT EXISTS idx_payment_proofs_caterer  ON payment_proofs (caterer_id);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_customer ON payment_proofs (customer_id);
