-- =========================================================
-- Migration 0004: SlideBee Promotions & Voucher Engine
-- Applies to Cloudflare D1 & Local SQLite
-- =========================================================

-- 1. Master Promotions Table
CREATE TABLE IF NOT EXISTS promotions (
    id TEXT PRIMARY KEY,                       -- e.g. 'prm_diwali50_2026'
    code TEXT UNIQUE COLLATE NOCASE,          -- NULL for automatic promotions, e.g. 'DIWALI50'
    name TEXT NOT NULL,                        -- Internal campaign name
    description TEXT,                          -- Customer-facing explanation
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value REAL NOT NULL,              -- e.g. 50 for 50%, or 500 for 500 INR/USD
    currency TEXT CHECK (currency IN ('INR', 'USD', 'ALL')) DEFAULT 'ALL',
    applicable_scope TEXT NOT NULL CHECK (applicable_scope IN ('all', 'subscription', 'template')),
    eligible_tiers TEXT DEFAULT '["monthly","yearly","lifetime"]', -- JSON array of eligible tiers
    eligible_template_ids TEXT,               -- NULL for all templates, or JSON array
    min_order_amount_inr REAL DEFAULT 0,
    min_order_amount_usd REAL DEFAULT 0,
    max_discount_cap_inr REAL,                 -- Safety ceiling for percentage discounts
    max_discount_cap_usd REAL,
    starts_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    max_total_redemptions INTEGER,             -- Global redemption cap (NULL = unlimited)
    redemption_count INTEGER DEFAULT 0,
    max_redemptions_per_user INTEGER DEFAULT 1,
    first_time_subscribers_only INTEGER DEFAULT 0, -- 1 = New subscribers only
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code) WHERE is_active = 1;
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(starts_at, expires_at) WHERE is_active = 1;

-- 2. Promotion Redemptions Ledger (Enforces idempotency and per-user limits)
CREATE TABLE IF NOT EXISTS promotion_redemptions (
    id TEXT PRIMARY KEY,                       -- e.g. 'rdm_xyz123'
    promotion_id TEXT NOT NULL REFERENCES promotions(id),
    promotion_code TEXT COLLATE NOCASE,
    user_email TEXT NOT NULL COLLATE NOCASE,
    user_id TEXT,
    order_type TEXT NOT NULL CHECK (order_type IN ('subscription', 'template')),
    target_id TEXT NOT NULL,                   -- Tier name ('yearly') or template ID
    original_amount REAL NOT NULL,
    discount_amount REAL NOT NULL,
    final_amount REAL NOT NULL,
    currency TEXT NOT NULL CHECK (currency IN ('INR', 'USD')),
    payment_id TEXT UNIQUE,                    -- Gateway reference (idempotency key)
    order_reference TEXT,
    redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_redemptions_user ON promotion_redemptions(user_email, promotion_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_payment ON promotion_redemptions(payment_id);

-- 3. Seed Starter Campaigns
INSERT OR IGNORE INTO promotions (
    id, code, name, description, discount_type, discount_value, currency, applicable_scope,
    eligible_tiers, starts_at, expires_at, max_total_redemptions, max_redemptions_per_user, is_active
) VALUES (
    'prm_diwali50_2026',
    'DIWALI50',
    'Diwali Festival Studio Special',
    'Flat 50% discount on all executive Pro plans and template decks.',
    'percentage',
    50,
    'ALL',
    'all',
    '["monthly","yearly","lifetime"]',
    '2026-10-01 00:00:00',
    '2026-11-30 23:59:59',
    1000,
    1,
    1
);

INSERT OR IGNORE INTO promotions (
    id, code, name, description, discount_type, discount_value, currency, applicable_scope,
    eligible_tiers, starts_at, expires_at, max_total_redemptions, max_redemptions_per_user, is_active
) VALUES (
    'prm_welcome20_2026',
    'WELCOME20',
    'Welcome Studio Pass',
    '20% off on your first Pro subscription plan.',
    'percentage',
    20,
    'ALL',
    'subscription',
    '["monthly","yearly","lifetime"]',
    '2026-01-01 00:00:00',
    '2027-12-31 23:59:59',
    5000,
    1,
    1
);
