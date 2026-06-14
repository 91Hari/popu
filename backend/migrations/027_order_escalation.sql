-- Order escalation: tracking columns on caterer_orders + delay config on platform_settings

ALTER TABLE caterer_orders
  ADD COLUMN IF NOT EXISTS reminder_sent      BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS whatsapp_sent      BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS auto_cancelled_at  TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_caterer_orders_escalation
  ON caterer_orders (status, created_at)
  WHERE status = 'PLACED';

ALTER TABLE platform_settings
  ADD COLUMN IF NOT EXISTS order_reminder_delay_secs    INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS order_whatsapp_delay_secs    INTEGER NOT NULL DEFAULT 120,
  ADD COLUMN IF NOT EXISTS order_autocancel_delay_secs  INTEGER NOT NULL DEFAULT 300;
