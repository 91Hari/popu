-- Migration 039: Grievance redressal system (Consumer Protection Act 2019)

CREATE TABLE IF NOT EXISTS grievances (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number  VARCHAR(20) UNIQUE NOT NULL,
  user_id        UUID NOT NULL REFERENCES users(id),
  order_ref_id   UUID,
  category       VARCHAR(50) NOT NULL,
  -- FOOD_QUALITY | WRONG_ORDER | LATE_DELIVERY | REFUND | PAYMENT | RIDER_BEHAVIOUR | OTHER
  description    TEXT NOT NULL,
  status         VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  -- OPEN | IN_PROGRESS | RESOLVED | CLOSED | ESCALATED
  assigned_to    UUID REFERENCES users(id),
  resolution     TEXT,
  resolved_at    TIMESTAMPTZ,
  escalated_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_grievances_user_id ON grievances(user_id);
CREATE INDEX IF NOT EXISTS idx_grievances_status ON grievances(status);
CREATE INDEX IF NOT EXISTS idx_grievances_created_at ON grievances(created_at DESC);

-- Auto-generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number := 'GRV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS grievances_ticket_number ON grievances;
CREATE TRIGGER grievances_ticket_number
  BEFORE INSERT ON grievances
  FOR EACH ROW
  WHEN (NEW.ticket_number IS NULL OR NEW.ticket_number = '')
  EXECUTE FUNCTION generate_ticket_number();
