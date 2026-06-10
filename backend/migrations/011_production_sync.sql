-- =============================================================================
-- Migration 011 — Production Sync
-- Purpose: bring an existing Render DB fully in-line with the canonical schema.
-- Every statement is idempotent; safe to re-run.
-- =============================================================================

-- Extensions (idempotent; must run before any gin_trgm_ops indexes) ----------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enum: add missing values -----------------------------------------------
-- order_status: add READY if missing
DO $$ BEGIN
  ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'READY' AFTER 'PREPARING';
EXCEPTION WHEN others THEN NULL;
END $$;

-- user_role: add ADMIN if missing (may have been added by migration 006)
DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'ADMIN';
EXCEPTION WHEN others THEN NULL;
END $$;

-- users: add any missing columns ------------------------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_name       VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS location            VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address             TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude            NUMERIC(10, 7);
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude           NUMERIC(10, 7);
ALTER TABLE users ADD COLUMN IF NOT EXISTS availability_status VARCHAR(20) NOT NULL DEFAULT 'READY';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active           BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS upi_id              VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_name        VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS qr_code_image_url   TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_account_name   VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Add CHECK constraint on availability_status if not already present
DO $$ BEGIN
  ALTER TABLE users ADD CONSTRAINT users_availability_status_check
    CHECK (availability_status IN ('READY', 'NOT_READY'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- orders: add missing columns ---------------------------------------------
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_lat           NUMERIC(10, 7);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_lng           NUMERIC(10, 7);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS eta_minutes            INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS expected_arrival_at    TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS preparation_started_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS accepted_at            TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at           TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancel_reason          TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- food_items: add missing columns -----------------------------------------
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS category                 VARCHAR(100);
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS preparation_time_minutes INTEGER NOT NULL DEFAULT 20;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- updated_at trigger function (idempotent via CREATE OR REPLACE) ----------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers (skip if already present) --------------------------------
DO $$ BEGIN
  CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_food_items_updated_at
    BEFORE UPDATE ON food_items
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Supporting tables -------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart_items (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  UUID    NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  food_item_id UUID    NOT NULL REFERENCES food_items (id) ON DELETE CASCADE,
  quantity     INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (customer_id, food_item_id)
);

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

CREATE TABLE IF NOT EXISTS order_status_history (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID         NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  status     order_status NOT NULL,
  updated_by UUID         REFERENCES users (id) ON DELETE SET NULL,
  notes      TEXT,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS food_events (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id    UUID        NOT NULL REFERENCES food_items (id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  old_value  JSONB,
  new_value  JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_favorites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  food_id     UUID NOT NULL REFERENCES food_items (id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (customer_id, food_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type  VARCHAR(100) NOT NULL,
  entity_id    UUID         NOT NULL,
  action       VARCHAR(100) NOT NULL,
  performed_by UUID         REFERENCES users (id) ON DELETE SET NULL,
  details      JSONB,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS system_notifications (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255) NOT NULL,
  message     TEXT         NOT NULL,
  target_role VARCHAR(20)  DEFAULT 'ALL',
  created_by  UUID         REFERENCES users (id),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Multi-caterer order system (migration 010) ------------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS upi_id            VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_name      VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS qr_code_image_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(200);

CREATE TABLE IF NOT EXISTS master_orders (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  UUID           NOT NULL REFERENCES users (id),
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  customer_lat DOUBLE PRECISION,
  customer_lng DOUBLE PRECISION,
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS caterer_order_items (
  id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  caterer_order_id UUID           NOT NULL REFERENCES caterer_orders (id) ON DELETE CASCADE,
  food_item_id     UUID           NOT NULL REFERENCES food_items (id),
  quantity         INTEGER        NOT NULL,
  unit_price       DECIMAL(10, 2) NOT NULL,
  total_price      DECIMAL(10, 2) NOT NULL
);

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

-- Indexes (all IF NOT EXISTS — safe to re-run) ----------------------------
CREATE INDEX IF NOT EXISTS idx_users_email               ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role                ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_location            ON users (location);
CREATE INDEX IF NOT EXISTS idx_users_name_trgm           ON users USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_food_items_caterer_id     ON food_items (caterer_id);
CREATE INDEX IF NOT EXISTS idx_food_items_is_available   ON food_items (is_available);
CREATE INDEX IF NOT EXISTS idx_food_items_category       ON food_items (category);
CREATE INDEX IF NOT EXISTS idx_food_items_search         ON food_items USING gin (to_tsvector('english', food_name));
CREATE INDEX IF NOT EXISTS idx_food_items_name_trgm      ON food_items USING gin (food_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id        ON orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status             ON orders (status);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id      ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_food_item_id  ON order_items (food_item_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_customer       ON cart_items (customer_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id     ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_osh_order_id              ON order_status_history (order_id);

CREATE INDEX IF NOT EXISTS idx_food_events_food_id       ON food_events (food_id);
CREATE INDEX IF NOT EXISTS idx_food_events_type          ON food_events (event_type);

CREATE INDEX IF NOT EXISTS idx_customer_favorites_customer ON customer_favorites (customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_favorites_food     ON customer_favorites (food_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity           ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by     ON audit_logs (performed_by);

CREATE INDEX IF NOT EXISTS idx_master_orders_customer      ON master_orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_master_orders_created       ON master_orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_caterer_orders_master       ON caterer_orders (master_order_id);
CREATE INDEX IF NOT EXISTS idx_caterer_orders_caterer      ON caterer_orders (caterer_id);
CREATE INDEX IF NOT EXISTS idx_caterer_order_items_order   ON caterer_order_items (caterer_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_caterer      ON payment_proofs (caterer_id);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_customer     ON payment_proofs (customer_id);
