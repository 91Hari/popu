-- Migration 009: Food Item Availability Management
--
-- The food_items table already has:
--   is_available BOOLEAN NOT NULL DEFAULT TRUE
--
-- This migration adds no schema change.  Instead it documents the new API
-- surface added in this release:
--
--   PATCH /api/foods/:id/availability
--   Body:    { "availabilityStatus": "AVAILABLE" | "UNAVAILABLE" }
--   Response:{ "success": true, "foodId": "<uuid>", "availabilityStatus": "AVAILABLE" }
--
-- The API maps AVAILABLE -> is_available = TRUE
--              UNAVAILABLE -> is_available = FALSE
--
-- Existing cart and order validation already guards against unavailable items.
-- Index already exists: idx_food_items_is_available ON food_items (is_available)

SELECT 'Migration 009 applied — food availability API surface documented.' AS status;
