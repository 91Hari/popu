CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('CUSTOMER', 'CATERER');
CREATE TYPE order_status AS ENUM ('PLACED', 'ACCEPTED', 'PREPARING', 'DELIVERED', 'CANCELLED');

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          user_role NOT NULL,

  business_name VARCHAR(255),
  location      TEXT,
  address       TEXT,
  latitude      NUMERIC(10,7),
  longitude     NUMERIC(10,7),

  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role  ON users (role);

CREATE TABLE food_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caterer_id   UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  food_name    VARCHAR(255) NOT NULL,
  description  TEXT,
  price        NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image_url    TEXT,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_food_items_caterer_id   ON food_items (caterer_id);
CREATE INDEX idx_food_items_is_available ON food_items (is_available);
CREATE INDEX idx_food_items_search       ON food_items USING gin (to_tsvector('english', food_name));

CREATE TABLE orders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  status       order_status NOT NULL DEFAULT 'PLACED',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_customer_id ON orders (customer_id);
CREATE INDEX idx_orders_status      ON orders (status);

CREATE TABLE order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  food_item_id UUID NOT NULL REFERENCES food_items (id) ON DELETE RESTRICT,
  quantity     INTEGER NOT NULL CHECK (quantity > 0),
  unit_price   NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price  NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0)
);

CREATE INDEX idx_order_items_order_id     ON order_items (order_id);
CREATE INDEX idx_order_items_food_item_id ON order_items (food_item_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_food_items_updated_at
  BEFORE UPDATE ON food_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
