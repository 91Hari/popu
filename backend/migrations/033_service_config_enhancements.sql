-- Migration 033: extend service_config with coming-soon flag and display ordering
ALTER TABLE service_config
  ADD COLUMN IF NOT EXISTS is_coming_soon BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS display_order  INT     NOT NULL DEFAULT 0;
