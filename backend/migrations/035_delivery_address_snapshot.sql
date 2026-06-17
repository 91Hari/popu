-- Migration 035: Delivery address snapshot on master_orders
-- Stores the customer's delivery address at order-placement time so riders
-- always see the address that was correct when the order was placed,
-- even if the customer later edits their saved address.
ALTER TABLE master_orders
  ADD COLUMN IF NOT EXISTS delivery_house_no  VARCHAR(200),
  ADD COLUMN IF NOT EXISTS delivery_street    VARCHAR(300),
  ADD COLUMN IF NOT EXISTS delivery_landmark  VARCHAR(200),
  ADD COLUMN IF NOT EXISTS delivery_city      VARCHAR(100),
  ADD COLUMN IF NOT EXISTS delivery_state     VARCHAR(100),
  ADD COLUMN IF NOT EXISTS delivery_pincode   VARCHAR(10);

SELECT 'Migration 035 applied — delivery address snapshot columns added to master_orders.' AS status;
