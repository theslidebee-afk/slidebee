# SlideBee Database Reference Specification

This document details the persistent storage schema, relationships, queries, and constraints for the SlideBee platform.

---

## 1. Architectural Overview

SlideBee runs **100% serverless on Cloudflare Edge**, powered by **Cloudflare D1 (SQLite)** for database persistence, **Cloudflare Pages Functions** for serverless endpoints, and **Cloudflare R2** for binary asset and presentation storage.

> All persistence is handled natively by Cloudflare D1 and Cloudflare R2.

### Database Credentials & Access
- Engine: Cloudflare D1 SQLite (`binding = "DB"`, `database_name = "slidebee-db"` in `wrangler.toml`).
- Query Engine: Cloudflare Pages Function `/api/data` (`functions/api/data.ts`) with automatic JSON serialization and RPC emulation.
- Client: `src/lib/d1.ts` (`EdgeQueryBuilder`, `d1.from(table)`).
- Migrations: `migrations/0001_d1_init.sql`, `migrations/0002_pricing_tiers.sql`, `migrations/0003_order_deliverables.sql`.

---

## 2. Entity Relationship Diagram (ERD)

```text
users
  ├── [1:N] ── sessions
  └── [1:1] ── profiles
                 ├── [1:N] ── download_logs ── [N:1] ── templates
                 ├── [1:N] ── subscriptions
                 └── [1:N] ── auth_logs

orders (matched to customer via email)

site_config (Key-Value CMS store for Hero, Banners, Categories, Testimonials)

waitlist (Newsletter & Early Access Signups)

assets (Media metadata registry)
```

---

## 3. Entity Catalog & Schema (Cloudflare D1)

### A. `templates`
Primary presentation catalog table.

- `id`: TEXT PRIMARY KEY (UUID format)
- `slug`: TEXT UNIQUE NOT NULL
- `code`: TEXT (e.g. `SLD-101`)
- `title`: TEXT NOT NULL
- `category`: TEXT NOT NULL
- `price_inr`: REAL NOT NULL
- `price_usd`: REAL NOT NULL
- `original_price_inr`: REAL
- `image_url`: TEXT NOT NULL — Cloudflare R2 public CDN URL
- `thumbnail_url`: TEXT
- `slides_count`: INTEGER DEFAULT 30 NOT NULL
- `rating`: REAL DEFAULT 4.9
- `downloads`: INTEGER DEFAULT 0
- `formats`: TEXT (JSON array string, e.g. `["PPT", "Slides", "Canva"]`)
- `slides`: TEXT (JSON array string of inner slide preview R2 image URLs)
- `description`: TEXT NOT NULL
- `features`: TEXT (JSON array string of bullet points)
- `download_url`: TEXT — Verified Cloudflare R2 presentation deliverable URL (`/templates/decks/*.pptx`). Strict integrity: Must NEVER point to image files.
- `file_name`: TEXT (e.g. `Master_Presentation.pptx`)
- `file_size`: TEXT (e.g. `4.5 MB`)
- `is_credit_eligible`: INTEGER DEFAULT 0 — Allows Pro plan members to redeem quota for this premium template.
- `is_featured`: INTEGER DEFAULT 0
- `is_published`: INTEGER DEFAULT 1
- `is_premium`: INTEGER DEFAULT 1 — Set to 0 strictly for Free Tier templates (price_inr: 0).
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP

---

### B. `orders`
Dual-role table recording custom design project briefs submitted through `/ordernow` and client quote inquiries submitted through `/contact`.

- `id`: TEXT PRIMARY KEY
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP
- `order_reference`: TEXT UNIQUE NOT NULL (e.g. `SB-2026-XXXXX` for custom briefs, `INQ-XXXXXX` for quote inquiries)
- `service_type`: TEXT NOT NULL (e.g. custom presentation service, or `"Inbound Quote Request"`)
- `slide_count`: TEXT NOT NULL
- `timeline`: TEXT NOT NULL
- `formats`: TEXT (JSON array string)
- `style_preference`: TEXT
- `drive_url`: TEXT
- `project_brief`: TEXT NOT NULL (Contains brief details or message body of the client inquiry)
- `full_name`: TEXT NOT NULL
- `email`: TEXT NOT NULL COLLATE NOCASE
- `company`: TEXT
- `phone`: TEXT
- `payment_id`: TEXT UNIQUE
- `status`: TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'inquiry', 'in_review', 'in_progress', 'completed', 'cancelled'))
- `deliverable_url`: TEXT — R2 deliverable download link
- `deliverable_name`: TEXT

---

### C. `profiles`
User profiles, credit ledgers, and download limits.

- `id`: TEXT PRIMARY KEY
- `email`: TEXT UNIQUE NOT NULL COLLATE NOCASE
- `full_name`: TEXT
- `company`: TEXT
- `phone`: TEXT
- `role`: TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin', 'super_admin'))
- `credits_total`: INTEGER DEFAULT 5
- `credits_used`: INTEGER DEFAULT 0
- `credits_balance`: INTEGER DEFAULT 5
- `purchased_items`: TEXT DEFAULT '[]' (JSON array of unlocked decks)
- `usage_history`: TEXT DEFAULT '[]' (JSON array of actions)
- `last_sign_in_at`: DATETIME DEFAULT CURRENT_TIMESTAMP
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP
- `updated_at`: DATETIME DEFAULT CURRENT_TIMESTAMP
- `tier`: TEXT DEFAULT 'free' CHECK (tier IN ('free', 'monthly', 'yearly', 'lifetime'))
- `tier_expires_at`: DATETIME
- `downloads_today`: INTEGER DEFAULT 0
- `last_download_date`: TEXT
- `downloads_this_month`: INTEGER DEFAULT 0
- `month_cycle_start`: TEXT
- `is_bot_flagged`: INTEGER DEFAULT 0

---

### D. `users` & `sessions`
Authentication tables managed by Cloudflare Pages Function `/api/auth`.

- `users`:
  - `id`: TEXT PRIMARY KEY
  - `email`: TEXT UNIQUE NOT NULL COLLATE NOCASE
  - `password_hash`: TEXT NOT NULL (SHA-256 with salt)
  - `salt`: TEXT NOT NULL
  - `role`: TEXT DEFAULT 'client'
  - `created_at`: DATETIME
  - `updated_at`: DATETIME
- `sessions`:
  - `id`: TEXT PRIMARY KEY (Session token)
  - `user_id`: TEXT NOT NULL (REFERENCES `users(id)`)
  - `email`: TEXT NOT NULL COLLATE NOCASE
  - `role`: TEXT NOT NULL
  - `device_info`: TEXT DEFAULT 'Browser'
  - `ip_address`: TEXT
  - `created_at`: DATETIME
  - `expires_at`: DATETIME NOT NULL

---

### E. `site_config`
Dynamic CMS configuration store for real-time frontend controls.

- `id`: TEXT
- `key`: TEXT PRIMARY KEY (e.g. `hero`, `home_banner_1`, `home_banner_2`, `template_categories`, `trending_templates`, `testimonials`)
- `value`: TEXT (JSON object string)
- `updated_at`: DATETIME

---

### F. `subscriptions`
Recurring Pro plan memberships processed via Razorpay.

- `id`: TEXT PRIMARY KEY
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP
- `updated_at`: DATETIME DEFAULT CURRENT_TIMESTAMP
- `user_id`: TEXT
- `user_email`: TEXT
- `plan_name`: TEXT
- `amount_usd`: REAL
- `amount_inr`: REAL
- `slides_used`: INTEGER
- `slides_limit`: INTEGER
- `current_period_end`: DATETIME
- `status`: TEXT
- `razorpay_subscription_id`: TEXT

---

### G. `download_logs`
Audit log tracking individual downloads against daily and monthly quotas.

- `id`: TEXT PRIMARY KEY
- `user_email`: TEXT
- `template_id`: TEXT
- `template_title`: TEXT
- `tier`: TEXT
- `is_premium`: INTEGER
- `download_url`: TEXT
- `ip_address`: TEXT
- `user_agent`: TEXT
- `downloaded_at`: DATETIME DEFAULT CURRENT_TIMESTAMP

---

## 4. Storage Architecture (Cloudflare R2)

- **Bucket**: `slidebee`
- **Public CDN Base**: `https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev`
- **Directories**:
  - `templates/slides/`: High-resolution slide preview images and thumbnail frames.
  - `templates/decks/`: Full Master PowerPoint presentation binaries (`.pptx`).
  - `deliverables/`: Completed client project deliverables linked to `orders.deliverable_url`.
- **API**: Managed via Cloudflare Pages Function `/api/r2-storage` (`functions/api/r2-storage.ts`) and client `src/lib/r2.ts`.
