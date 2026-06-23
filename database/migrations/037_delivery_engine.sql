-- Migration 037: Scalable Delivery Engine
-- Adds: delivery_tasks, delivery_pool, delivery_batches, delivery_batch_tasks
--       rider delivery status columns on rider_profiles

-- ─── Rider delivery status ────────────────────────────────────────────────────
ALTER TABLE rider_profiles
  ADD COLUMN IF NOT EXISTS delivery_status      VARCHAR(20)     NOT NULL DEFAULT 'OFFLINE',
  ADD COLUMN IF NOT EXISTS current_latitude     NUMERIC(10,7),
  ADD COLUMN IF NOT EXISTS current_longitude    NUMERIC(10,7),
  ADD COLUMN IF NOT EXISTS location_updated_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS max_batch_capacity   INTEGER         NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS current_batch_id     UUID;
-- FK on current_batch_id added after delivery_batches exists (below)

-- ─── Delivery tasks ───────────────────────────────────────────────────────────
-- One delivery_task per caterer_order: one pickup point + one drop point.
-- Created when caterer_order reaches READY status.
CREATE TABLE IF NOT EXISTS delivery_tasks (
  id                       UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  caterer_order_id         UUID          NOT NULL REFERENCES caterer_orders(id)  ON DELETE CASCADE,
  master_order_id          UUID          NOT NULL REFERENCES master_orders(id)   ON DELETE CASCADE,
  caterer_id               UUID          NOT NULL REFERENCES users(id),
  customer_id              UUID          NOT NULL REFERENCES users(id),
  pickup_latitude          NUMERIC(10,7),
  pickup_longitude         NUMERIC(10,7),
  drop_latitude            NUMERIC(10,7),
  drop_longitude           NUMERIC(10,7),
  status                   VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
  -- PENDING | ASSIGNED | PICKED_UP | DELIVERING | COMPLETED | CANCELLED
  preparation_time_minutes INTEGER       NOT NULL DEFAULT 20,
  estimated_pickup_time    TIMESTAMPTZ,
  estimated_drop_time      TIMESTAMPTZ,
  actual_pickup_time       TIMESTAMPTZ,
  actual_drop_time         TIMESTAMPTZ,
  created_at               TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_tasks_caterer_order ON delivery_tasks(caterer_order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tasks_status        ON delivery_tasks(status);
CREATE INDEX IF NOT EXISTS idx_delivery_tasks_caterer       ON delivery_tasks(caterer_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tasks_customer      ON delivery_tasks(customer_id);

-- ─── Delivery pool ────────────────────────────────────────────────────────────
-- Staging area: tasks wait here until the pooling algorithm groups them.
CREATE TABLE IF NOT EXISTS delivery_pool (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_task_id UUID          NOT NULL REFERENCES delivery_tasks(id) ON DELETE CASCADE,
  caterer_id       UUID          NOT NULL REFERENCES users(id),
  status           VARCHAR(20)   NOT NULL DEFAULT 'WAITING',
  -- WAITING | BATCHED | EXPIRED
  expires_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW() + INTERVAL '15 minutes',
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (delivery_task_id)
);

CREATE INDEX IF NOT EXISTS idx_delivery_pool_status  ON delivery_pool(status);
CREATE INDEX IF NOT EXISTS idx_delivery_pool_caterer ON delivery_pool(caterer_id);
CREATE INDEX IF NOT EXISTS idx_delivery_pool_expires ON delivery_pool(expires_at);

-- ─── Delivery batches ─────────────────────────────────────────────────────────
-- A batch groups one or more tasks assigned to one rider.
CREATE TABLE IF NOT EXISTS delivery_batches (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id      UUID          REFERENCES users(id) ON DELETE SET NULL,
  status        VARCHAR(20)   NOT NULL DEFAULT 'CREATED',
  -- CREATED | ASSIGNED | PICKING_UP | DELIVERING | COMPLETED | CANCELLED
  task_count    INTEGER       NOT NULL DEFAULT 0,
  eta_minutes   INTEGER,
  route_data    JSONB,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  assigned_at   TIMESTAMPTZ,
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_delivery_batches_rider  ON delivery_batches(rider_id);
CREATE INDEX IF NOT EXISTS idx_delivery_batches_status ON delivery_batches(status);

-- ─── Delivery batch tasks ─────────────────────────────────────────────────────
-- Many-to-many: which tasks are in which batch, with optimized sequence.
CREATE TABLE IF NOT EXISTS delivery_batch_tasks (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id         UUID        NOT NULL REFERENCES delivery_batches(id)  ON DELETE CASCADE,
  delivery_task_id UUID        NOT NULL REFERENCES delivery_tasks(id)    ON DELETE CASCADE,
  sequence_number  INTEGER     NOT NULL DEFAULT 1,
  status           VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  -- PENDING | PICKED_UP | DELIVERED | FAILED
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (batch_id, delivery_task_id)
);

CREATE INDEX IF NOT EXISTS idx_batch_tasks_batch ON delivery_batch_tasks(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_tasks_task  ON delivery_batch_tasks(delivery_task_id);

-- ─── FK: rider_profiles.current_batch_id → delivery_batches ──────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_rider_current_batch'
  ) THEN
    ALTER TABLE rider_profiles
      ADD CONSTRAINT fk_rider_current_batch
      FOREIGN KEY (current_batch_id) REFERENCES delivery_batches(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ─── updated_at trigger for delivery_tasks ────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_delivery_tasks_updated_at') THEN
    CREATE TRIGGER trg_delivery_tasks_updated_at
      BEFORE UPDATE ON delivery_tasks
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_delivery_batches_updated_at') THEN
    CREATE TRIGGER trg_delivery_batches_updated_at
      BEFORE UPDATE ON delivery_batches
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

SELECT 'Migration 037 applied — delivery engine tables created.' AS status;
