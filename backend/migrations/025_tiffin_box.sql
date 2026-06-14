-- Tiffin Box module — completely isolated from existing order tables

CREATE TABLE IF NOT EXISTS tiffin_box_settings (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  caterer_id           UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tiffin_enabled       BOOLEAN       NOT NULL DEFAULT FALSE,
  one_carriage_price   NUMERIC(10,2) NOT NULL DEFAULT 80.00,
  two_carriage_price   NUMERIC(10,2) NOT NULL DEFAULT 120.00,
  three_carriage_price NUMERIC(10,2) NOT NULL DEFAULT 180.00,
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE(caterer_id)
);

CREATE TABLE IF NOT EXISTS tiffin_food_mapping (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  caterer_id           UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  food_item_id         UUID        NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
  available_for_tiffin BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(caterer_id, food_item_id)
);

CREATE TABLE IF NOT EXISTS tiffin_orders (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id    UUID          NOT NULL REFERENCES users(id),
  caterer_id     UUID          NOT NULL REFERENCES users(id),
  order_type     VARCHAR(20)   NOT NULL DEFAULT 'TIFFIN_BOX',
  service_type   VARCHAR(10)   NOT NULL CHECK (service_type IN ('TODAY','DAILY')),
  box_type       VARCHAR(20)   NOT NULL CHECK (box_type IN ('ONE_CARRIAGE','TWO_CARRIAGE','THREE_CARRIAGE')),
  total_amount   NUMERIC(10,2) NOT NULL,
  status         VARCHAR(30)   NOT NULL DEFAULT 'PLACED',
  payment_status VARCHAR(30)   NOT NULL DEFAULT 'PENDING',
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tiffin_order_days (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tiffin_order_id UUID        NOT NULL REFERENCES tiffin_orders(id) ON DELETE CASCADE,
  day_of_week     VARCHAR(10) NOT NULL CHECK (day_of_week IN ('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'))
);

CREATE TABLE IF NOT EXISTS tiffin_order_items (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tiffin_order_id UUID          NOT NULL REFERENCES tiffin_orders(id) ON DELETE CASCADE,
  food_item_id    UUID          REFERENCES food_items(id),
  food_name       VARCHAR(200)  NOT NULL,
  food_price      NUMERIC(10,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tiffin_orders_customer   ON tiffin_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_tiffin_orders_caterer    ON tiffin_orders(caterer_id);
CREATE INDEX IF NOT EXISTS idx_tiffin_food_map_caterer  ON tiffin_food_mapping(caterer_id);
CREATE INDEX IF NOT EXISTS idx_tiffin_order_items_order ON tiffin_order_items(tiffin_order_id);
CREATE INDEX IF NOT EXISTS idx_tiffin_order_days_order  ON tiffin_order_days(tiffin_order_id);
