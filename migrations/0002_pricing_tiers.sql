-- =========================================================
-- Migration 0002: Pricing Tiers, Template Categories & Anti-Bot Engine
-- Applies to Cloudflare D1 & Local SQLite
-- =========================================================

-- 1. Add Tier and Usage Tracking Columns to profiles
ALTER TABLE profiles ADD COLUMN tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'monthly', 'yearly', 'lifetime'));
ALTER TABLE profiles ADD COLUMN tier_expires_at DATETIME;
ALTER TABLE profiles ADD COLUMN downloads_today INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN last_download_date TEXT;
ALTER TABLE profiles ADD COLUMN downloads_this_month INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN month_cycle_start TEXT;
ALTER TABLE profiles ADD COLUMN is_bot_flagged INTEGER DEFAULT 0;

-- 2. Add is_premium flag to templates (0 = Free template, 1 = Premium template)
ALTER TABLE templates ADD COLUMN is_premium INTEGER DEFAULT 1;

-- 3. Create download_logs table for audit & security rate-limiting
CREATE TABLE IF NOT EXISTS download_logs (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL COLLATE NOCASE,
    template_id TEXT NOT NULL,
    template_title TEXT NOT NULL,
    tier TEXT NOT NULL,
    is_premium INTEGER DEFAULT 1,
    download_url TEXT,
    ip_address TEXT,
    user_agent TEXT,
    downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_download_logs_email ON download_logs(user_email, downloaded_at);
CREATE INDEX IF NOT EXISTS idx_download_logs_template ON download_logs(template_id);
CREATE INDEX IF NOT EXISTS idx_templates_is_premium ON templates(is_premium, is_published);

-- 4. Categorize Starter Templates into Free vs Premium
-- Mark 4 templates as Free Templates (accessible via Basic Free tier)
UPDATE templates 
SET is_premium = 0 
WHERE slug IN ('company-profile-2024', 'swot-analysis-suite', 'tag-creative-production-rfp', 'slidebee-1-');

-- Mark remaining templates as Premium Templates (accessible via Monthly, Yearly, Lifetime)
UPDATE templates 
SET is_premium = 1 
WHERE is_premium IS NULL OR is_premium != 0;
