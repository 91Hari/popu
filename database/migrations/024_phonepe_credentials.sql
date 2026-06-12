-- Store PhonePe API credentials in platform_settings so admin can update
-- them from the dashboard without touching server environment variables.

ALTER TABLE platform_settings
  ADD COLUMN IF NOT EXISTS phonepe_client_id      VARCHAR(200),
  ADD COLUMN IF NOT EXISTS phonepe_client_secret  VARCHAR(200),
  ADD COLUMN IF NOT EXISTS phonepe_env            VARCHAR(20)  DEFAULT 'uat',
  ADD COLUMN IF NOT EXISTS phonepe_client_version VARCHAR(10)  DEFAULT '1';
