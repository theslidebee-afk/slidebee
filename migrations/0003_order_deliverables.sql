-- =========================================================
-- Migration 0003: Final Master Presentation Deliverable on Orders
-- =========================================================
ALTER TABLE orders ADD COLUMN deliverable_url TEXT;
ALTER TABLE orders ADD COLUMN deliverable_name TEXT;
