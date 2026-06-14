-- Service configuration table — admin-controlled feature toggles for customer-facing services

CREATE TABLE IF NOT EXISTS service_config (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  service_code VARCHAR(50)  NOT NULL UNIQUE,
  service_name VARCHAR(100) NOT NULL,
  is_enabled   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

INSERT INTO service_config (service_code, service_name, is_enabled) VALUES
  ('CATERING',    'Catering',          TRUE),
  ('FOOD',        'Food Marketplace',  TRUE),
  ('LUNCH_BOX',   'Lunch Box',         TRUE),
  ('BOOK_A_COOK', 'Book A Cook',       FALSE),
  ('HOME_FOOD',   'Home Food',         FALSE),
  ('TRAINING',    'Training',          FALSE)
ON CONFLICT (service_code) DO NOTHING;

CREATE OR REPLACE FUNCTION trg_service_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS service_config_updated_at ON service_config;
CREATE TRIGGER service_config_updated_at
  BEFORE UPDATE ON service_config
  FOR EACH ROW EXECUTE FUNCTION trg_service_config_updated_at();
