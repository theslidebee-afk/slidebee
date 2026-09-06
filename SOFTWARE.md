# 🐝 SlideBee — Software Architecture & Master Handoff Documentation

> **Project Name:** SlideBee Design Studio (formerly XYZ Templates)  
> **Repository Root:** `/home/revenant/xyz_templates`  
> **Local Production Preview:** `http://localhost:3000`  
> **Production Target:** `https://theslidebee.com`  
> **Status:** Fully Functional Locally • Ready for Cloudflare R2 File Uploads & Live Gateway Phase  

---

## 🏛️ 1. Architecture & Tech Stack

```
                          ┌────────────────────────────────────────────────────────┐
                          │                   Client & Admin UI                    │
                          │   React 19 • Vite • Tailwind CSS • Framer Motion       │
                          └───────────────────────────┬────────────────────────────┘
                                                      │
                       ┌──────────────────────────────┴──────────────────────────────┐
                       │                                                             │
                       ▼                                                             ▼
     ┌────────────────────────────────────┐                        ┌────────────────────────────────────┐
     │       Supabase (PostgreSQL)        │                        │     Cloudflare R2 & Edge CDN       │
     ├────────────────────────────────────┤                        ├────────────────────────────────────┤
     │ • Row Level Security (RLS)         │                        │ • 10 GB Free Tier Object Storage   │
     │ • Client & Admin User Auth         │                        │ • Downloadable .pptx Deck Packages │
     │ • Orders & Briefs Pipeline         │                        │ • High-Res Slide Preview Delivery  │
     │ • Dynamic Site CMS & Config        │                        │ • $0.00 / Zero Egress Bandwidth    │
     │ • Subscriptions & MRR Tracking     │                        └────────────────────────────────────┘
     └────────────────────────────────────┘
```

---

## 🗄️ 2. Database Schema & Tables (Supabase Cluster `whwyfqtvuubkfypmgosi`)

All tables are created, secured with Row Level Security (RLS), and active:

| Table Name | Description | Key Fields |
| :--- | :--- | :--- |
| **`public.profiles`** | Client & admin accounts | `id`, `email`, `full_name`, `company`, `role`, `created_at` |
| **`public.subscriptions`** | Monthly retainer clients | `id`, `user_email`, `plan_name`, `status`, `amount_usd`, `amount_inr`, `slides_limit`, `slides_used`, `current_period_end` |
| **`public.orders`** | Inbound project briefs | `id`, `client_name`, `client_email`, `service_type`, `slide_count`, `rush_delivery`, `drive_link`, `status`, `customer_notes` |
| **`public.templates`** | Presentation marketplace | `id`, `title`, `slug`, `category`, `price_inr`, `price_usd`, `slide_count`, `thumbnail_url`, `download_url`, `is_published` |
| **`public.assets`** | Media & portfolio CMS | `id`, `key`, `title`, `category`, `url`, `alt_text`, `metadata` |
| **`public.site_config`** | Global live pricing & copy | `key` (`pricing`, `hero`, `general`), `value` (JSONB) |
| **`public.waitlist`** | Coming soon leads | `id`, `email`, `source`, `created_at` |

---

## 🔐 3. Access Portals & Credentials

### A. Master Studio Admin Portal
- **URL:** `http://localhost:3000/#/admin`
- **Email:** `admin@theslidebee.com`
- **Password:** `SlideBee@Admin2026!`
- **Instant Studio Passkey:** `2026` *(or passkey trigger button on login screen)*
- **Admin Capabilities:**
  1. **📋 Project Briefs:** Review client order submissions, slide counts, rush flags, open Google Drive asset folders, and update status (`Pending` ➔ `In Progress` ➔ `Completed`).
  2. **👥 Waitlist Leads:** View all subscribers with real-time timestamps + 1-Click **"Export to CSV"**.
  3. **📦 Template Marketplace CMS:** Add single template, or **Bulk Import via Spreadsheet (.CSV)** with sample template download.
  4. **🖼️ Media CMS:** Dynamically update portfolio slides, case study graphics, and before/after URLs without touching code.
  5. **⚙️ Dynamic Rates & Site Copy CMS:** Edit per-slide rates for all tiers ($19/$29/$49 and ₹1,499/₹2,299/₹3,899), monthly retainer rates, and hero copy.
  6. **👥 Subscriptions & Accounts:** Monitor MRR ($2,980+), active monthly retainers, client slide quota consumption, and registered client profiles.
  7. **💽 Cloudflare R2 Storage Monitor:** Live 10 GB quota meter tracking MB usage across `.pptx` decks and preview images.

### B. Client Account Portal
- **URL:** `http://localhost:3000/#/login`
- **Capabilities:** Sign in, register free client account, view active presentation project briefs, track monthly retainer slide consumption (e.g. `24 / 80 slides used`), and download purchased templates.
- **Demo Client Credentials:** `sarah.jenkins@hypergrowth.vc` / `client123`

---

## 🎨 4. Design System & Brand Identity

- **Background Palette:** Warm Milk Cream (`#FFF9E8`)
- **Primary Brand Color:** Honey Gold (`#FCBF14`) / Amber (`#F59E0B`)
- **Typography & Dark Contrast:** Dark Obsidian (`#111111`) / Slate (`#726F6D`)
- **Shape Language:** Hexagonal containers (`hex-card`, `hex-pill`, `hex-pill-sm`) with soft shadows.
- **No Decorative AI Clutter:** Clean typography without artificial sparkles or trailing cursor lag.

---

## 🚀 5. How to Run Locally

```bash
# 1. Switch to Node 22
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22

# 2. Build the project
npm run build

# 3. Serve production build locally on port 3000
node serve_local.js
```

---

## 📋 6. Priority Roadmap for Tomorrow's Session

1. **📦 Template File Upload Surface in CMS:**
   - Add direct PowerPoint `.pptx` file upload drag-and-drop to Cloudflare R2 / Supabase Storage inside the "Add Template" modal.
2. **💳 Payment Gateway Integration (Stripe / Razorpay):**
   - Connect 1-click checkout for template purchases and instant retainer onboarding.
3. **🌐 Cloudflare Subdomain & Final Production Release:**
   - Move from local testing to live deployment when ready (`theslidebee.com`).

---

*Authored on September 3, 2026 for SlideBee Studio Team.*
