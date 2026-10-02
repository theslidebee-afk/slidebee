# SlideBee — Project Identity & Scope

## 1. Project Purpose
SlideBee (`https://slidebee.com`, staging `https://dev.slidebee.pages.dev`) is an executive presentation design studio and curated template marketplace. It solves the problem of poorly designed, time-consuming business presentations by offering:
1. Instant downloads of high-conversion PowerPoint (`.pptx`) and Google Slides decks.
2. Bespoke custom presentation design services with rapid turnaround (24h to 5 days).
3. A monthly Pro membership providing unmetered download access for high-volume creators and teams.

---

## 2. Business Model
- **Freemium Tier**: 3 free template downloads daily for registered community users.
- **Pay-Per-Deck**: One-off purchase of premium master presentation decks (priced in INR and USD).
- **Pro Membership**: Recurring monthly subscription ($5 / 499 INR) offering 30 premium deck unlocks per month.
- **Custom Design Studio**: Service packages (Pitch decks, redesigns, board decks) priced by slide count and urgency, quoted via `/ordernow`.

---

## 3. Target Users
- **Startup Founders**: Raising Pre-Seed to Series B rounds requiring investor-ready pitch decks.
- **Corporate Executives & Consultants**: Preparing board decks, quarterly business reviews, and strategy frameworks.
- **Marketing & Sales Teams**: Needing high-impact product launch decks, case studies, and sales proposals.

---

## 4. Existing Features vs Planned Features

### EXISTING (Implemented & Verified in Code)
- **Kinetic Homepage & Hero**: 3D video hero stage with parallax depth, live expandable search input, multi-line category pills, and dynamic curtain lift.
- **Endless Magnet Masonry Marketplace**: SlideEgg-style 6-column CSS grid template feed with cover zoom and real slide thumbnail subgrids.
- **Template Detail & Showcase**: `/template/:id` page with full-resolution slide preview modal, format badges, and instant download/purchase actions.
- **Client Brief Studio Order Form**: `/ordernow` with timeline selection, slide volume, format checkboxes, cloud storage link attachment, and payment integration.
- **Custom Design Services Showcase**: `/services` detailing packages, before/after case studies, process infographics, and testimonials.
- **Subscription Tier Pricing**: `/pricing` with localized pricing (INR / USD), feature comparison matrix, and Razorpay subscription checkout.
- **Client Ledger & User Dashboard**: Authentication modal, Google OAuth, Magic Link login, daily download quota tracking, and order deliverables repository.
- **Admin Studio Management**: `/admin` with template CRUD, hero CMS, banner toggles, trending template pinning, and site configuration controls.
- **Content Marketing & SEO**: `/blog` and `/blog/:slug` with 10 high-ranking articles, dynamic canonical URLs, Open Graph tags, and JSON-LD structured data.
- **AI Agent Discovery**: Complete `public/llms.txt`, `public/llms-full.txt`, `public/robots.txt`, and clean `public/sitemap.xml`.

### PLANNED / BACKLOG (Explicitly Documented or In-Progress)
- **Direct Multi-Item Shopping Cart**: Currently checkout is single-item direct flow. Multi-item cart is a potential future consideration (`UNKNOWN — requires product decision`).
- **Canva / Google Slides Native Sync**: Currently delivers `.pptx` and `.pdf` deliverables; direct Google Drive / Canva API sync is planned for future phase.
- **Automated AI Deck Generation**: Future capability mentioned in roadmap; not yet present in codebase.

---

## 5. Major Integrations
- **Database**: Cloudflare D1 (SQLite Edge Database `slidebee-db`).
- **Auth**: Cloudflare Pages Serverless Auth (`/api/auth`) + Google OAuth.
- **Payment Gateway**: Razorpay (Orders, Subscriptions).
- **Asset Storage**: Cloudflare R2 (`slidebee` bucket, `pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev`).
- **Transactional Email**: Zoho Mail via Cloudflare Pages Function `/api/send-email`.
- **Hosting & Edge**: Cloudflare Pages (`slidebee` project).
