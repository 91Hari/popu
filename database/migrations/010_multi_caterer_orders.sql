-- Migration 010: Multi-Caterer Order Management
--
-- Adds:
--   caterer payment profile fields to users table
--   master_orders        — top-level order grouping per customer checkout
--   caterer_orders       — per-caterer sub-order with independent status
--   caterer_order_items  — line items per sub-order
--   payment_proofs       — per-caterer payment proof (screenshot URL + UPI ref)

-- Caterer payment profile fields
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS upi_id            VARCHAR(100),
  ADD COLUMN IF NOT EXISTS payment_name      VARCHAR(200),
  ADD COLUMN IF NOT EXISTS qr_code_image_url TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(200);

-- Master orders (one per customer checkout session, groups all caterer sub-orders)
CREATE TABLE IF NOT EXISTS master_orders (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID         NOT NULL REFERENCES users(id),
  total_amount    DECIMAL(10,2) NOT NULL DEFAULT 0,
  customer_lat    DOUBLE PRECISION,
  customer_lng    DOUBLE PRECISION,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_master_orders_customer ON master_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_master_orders_created  ON master_orders(created_at DESC);

-- Per-caterer sub-orders (child of master_order)
CREATE TABLE IF NOT EXISTS caterer_orders (
  id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  master_order_id     UUID         NOT NULL REFERENCES master_orders(id) ON DELETE CASCADE,
  caterer_id          UUID         NOT NULL REFERENCES users(id),
  status              VARCHAR(20)  NOT NULL DEFAULT 'PLACED',
  subtotal            DECIMAL(10,2) NOT NULL DEFAULT 0,
  accepted_at         TIMESTAMPTZ,
  preparing_at        TIMESTAMPTZ,
  ready_at            TIMESTAMPTZ,
  delivered_at        TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  cancel_reason       TEXT,
  eta_minutes         INTEGER,
  expected_arrival_at TIMESTAMPTZ,
  payment_status      VARCHAR(30)  NOT NULL DEFAULT 'PENDING',
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_caterer_orders_master  ON caterer_orders(master_order_id);
CREATE INDEX IF NOT EXISTS idx_caterer_orders_caterer ON caterer_orders(caterer_id);

-- Line items per sub-order
CREATE TABLE IF NOT EXISTS caterer_order_items (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  caterer_order_id UUID         NOT NULL REFERENCES caterer_orders(id) ON DELETE CASCADE,
  food_item_id     UUID         NOT NULL REFERENCES food_items(id),
  quantity         INTEGER      NOT NULL,
  unit_price       DECIMAL(10,2) NOT NULL,
  total_price      DECIMAL(10,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_caterer_order_items_order ON caterer_order_items(caterer_order_id);

-- Payment proofs (one active proof per caterer sub-order; re-upload updates in place)
CREATE TABLE IF NOT EXISTS payment_proofs (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  master_order_id        UUID        NOT NULL REFERENCES master_orders(id),
  caterer_order_id       UUID        NOT NULL REFERENCES caterer_orders(id),
  customer_id            UUID        NOT NULL REFERENCES users(id),
  caterer_id             UUID        NOT NULL REFERENCES users(id),
  amount                 DECIMAL(10,2),
  payment_screenshot_url TEXT,
  upi_reference          VARCHAR(100),
  payment_status         VARCHAR(30) NOT NULL DEFAULT 'PENDING_REVIEW',
  rejection_reason       TEXT,
  uploaded_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at            TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (caterer_order_id)
);

CREATE INDEX IF NOT EXISTS idx_payment_proofs_caterer  ON payment_proofs(caterer_id);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_customer ON payment_proofs(customer_id);

SELECT 'Migration 010 applied — multi-caterer order management tables created.' AS status;
