ALTER TABLE food_items ADD COLUMN IF NOT EXISTS category VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_food_items_category ON food_items (category);

CREATE TABLE IF NOT EXISTS notifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  title             TEXT NOT NULL,
  message           TEXT NOT NULL,
  is_read           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id      ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread  ON notifications(user_id, is_read);

CREATE TABLE IF NOT EXISTS food_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id    UUID NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  old_value  JSONB,
  new_value  JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_events_food_id ON food_events(food_id);
CREATE INDEX IF NOT EXISTS idx_food_events_type    ON food_events(event_type);

CREATE TABLE IF NOT EXISTS customer_favorites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  food_id     UUID NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (customer_id, food_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_favorites_customer ON customer_favorites(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_favorites_food     ON customer_favorites(food_id);

CREATE TABLE IF NOT EXISTS audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type  VARCHAR(100) NOT NULL,
  entity_id    UUID NOT NULL,
  action       VARCHAR(100) NOT NULL,
  performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  details      JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity        ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by  ON audit_logs(performed_by);
