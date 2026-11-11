-- =========================================================
-- Migration 0005: Cryptographic Single-Use Browser Download Tokens
-- Enforces strictly one-time client PPTX downloads at checkout
-- Zero storage URL exposure, atomic consumption, 15-minute TTL
-- =========================================================

CREATE TABLE IF NOT EXISTS single_use_download_tokens (
  token TEXT PRIMARY KEY,
  order_reference TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  client_email TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  is_consumed INTEGER DEFAULT 0,
  consumed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sudt_lookup ON single_use_download_tokens(token, is_consumed);
CREATE INDEX IF NOT EXISTS idx_sudt_order ON single_use_download_tokens(order_reference);
