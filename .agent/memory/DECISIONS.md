# SlideBee — Architectural Decision Records (ADRs)

---

## ADR-001: HTML5 BrowserRouter Migration
- **Status**: Accepted
- **Date**: October 2026
- **Decision**: Migrate from React Router `HashRouter` (`/#/...`) to HTML5 `BrowserRouter` with server-side SPA fallback.
- **Reason**: Hash routes hurt SEO crawlability, social preview generation (Open Graph), AI search indexing (`llms.txt`), and aesthetic quality.
- **Alternatives considered**: Retaining `HashRouter` to prevent 404s on static hosts.
- **Consequences**: Cloudflare Pages routes all non-asset requests to `/index.html`. Clean URLs across all marketing pages and blog posts.
- **Related files**: `src/App.tsx`, `src/main.tsx`, `public/sitemap.xml`, `public/robots.txt`.

---

## ADR-002: Standard CSS Grid for Template Marketplace Feed
- **Status**: Accepted
- **Date**: October 2026
- **Decision**: Use strict standard CSS Grid (`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6`) instead of CSS `columns-*` (multi-column masonry).
- **Reason**: Multi-column masonry renders elements vertically top-to-bottom per column. When template counts are not exact multiples of the column count, empty holes appear in subsequent rows.
- **Alternatives considered**: Masonry.js or CSS `columns-*` with dynamic padding.
- **Consequences**: Strict left-to-right, row-by-row rendering with predictable heights and zero visual gaps.
- **Related files**: `src/pages/Home.tsx`.

---

## ADR-003: Direct Checkout & Quota Model Over Complex Shopping Cart
- **Status**: Accepted
- **Date**: September 2026
- **Decision**: Support immediate single-deck unlock/purchase and recurring Pro quota downloads rather than a multi-item persistent shopping cart.
- **Reason**: Customers purchasing presentation templates typically need a specific deck immediately or prefer unmetered access via subscription. A multi-item cart added friction.
- **Alternatives considered**: Full cart and cart items database schema.
- **Consequences**: Higher conversion rates, streamlined checkout, simplified database requirements.
- **Related files**: `src/pages/TemplateDetail.tsx`, `src/modules/StudioStoreClient/useTemplateCheckout.ts`.

---

## ADR-004: Complete Migration to Cloudflare D1 and Cloudflare R2
- **Status**: Accepted
- **Date**: September 2026 / October 2026 Modernization
- **Decision**: Standardize 100% serverless on Cloudflare D1 (SQLite database), Cloudflare R2 (Object storage), and Cloudflare Pages Functions (`/api/data`, `/api/auth`, `/api/r2-storage`).
- **Reason**: Cloudflare D1 offers zero inactivity pausing, instantaneous edge cold starts, and seamless edge co-location with Cloudflare Pages. Cloudflare R2 provides 10 GB free tier with $0 egress bandwidth costs on large presentation binaries.
- **Alternatives considered**: Retaining third-party cloud database vendors or self-hosting PostgreSQL.
- **Consequences**: Zero external database dependency, unified edge deployment on Cloudflare, zero external SDK bundle overhead, direct client imports from `src/lib/d1.ts`.
- **Related files**: `wrangler.toml`, `src/lib/d1.ts`, `src/lib/r2.ts`, `functions/api/*`, `migrations/*`.

---

## ADR-005: Strict Zero-Emoji Engineering Rule
- **Status**: Accepted
- **Date**: September 2026
- **Decision**: Forbid unicode emojis universally across the entire codebase, UI, comments, commits, and emails.
- **Reason**: SlideBee targets high-level executives, venture capitalists, and enterprise teams. Modern Lucide React SVG icons deliver a sophisticated studio aesthetic that emojis degrade.
- **Alternatives considered**: Allowing selective emojis in blog or marketing headlines.
- **Consequences**: Universal adoption of Lucide React SVG icons and text badges.
- **Related files**: `rules/no-emojis.md`, `.agent/core/RULES.md`.

---

## ADR-007: Strict PPTX Deliverable Validation & Zero Silent Image Fallbacks
- **Status**: Accepted
- **Date**: October 2026
- **Decision**: Forbid any fallback to slide preview images (.jpg/.png) when delivering PowerPoint templates. All template deliverables must be verified presentations (`.pptx`, `.ppt`, `.zip`) via `isValidPptxUrl()` and `getTemplateDeliverableUrl()`.
- **Reason**: In previous revisions, if a template lacked an explicit `download_url`, client code silently fell back to downloading the preview image (`image_url`) renamed as `.pptx`, corrupting the user's deliverable and causing client frustration.
- **Alternatives considered**: Automatic on-the-fly conversion of slide images to PPTX via backend script (too slow and prone to formatting distortion).
- **Consequences**: 100% of marketplace templates have genuine PowerPoint deliverables in Cloudflare R2; downloads fail explicitly with user-friendly alerts if a deliverable is absent rather than corrupting user files.
- **Related files**: `src/lib/templates.ts`, `src/pages/TemplateDetail.tsx`, `functions/api/entitlement.ts`.

---

## ADR-008: Dual-Role Orders & Inbound Communications Pipeline
- **Status**: Accepted
- **Date**: October 2026
- **Decision**: Leverage Cloudflare D1 `orders` table as a unified intake engine for both paid custom design project briefs (`SB-2026-XXXXX`) and "Get a Quote" / inbound inquiries (`INQ-XXXXXX` with `status: "inquiry"`).
- **Reason**: Avoid creating redundant tables while giving studio operations a centralized single pane of glass in the Admin Studio to review, filter, and track all incoming client communications and conversion funnels.
- **Alternatives considered**: Storing inquiries strictly in `waitlist` or creating a separate `inquiries` table.
- **Consequences**: Inquiries are automatically tracked alongside orders; instant Zoho Mail alerts dispatch to studio leadership (`vizhalsuresh@gmail.com`, `admin@theslidebee.com`); dedicated "Inquiries & Quotes" portal in Admin Studio.
- **Related files**: `src/pages/Contact.tsx`, `src/features/admin/inquiries/AdminInquiries.tsx`, `docs/DATABASE.md`.

---

## ADR-009: Strict Free Tier vs Pro Credit Classification
- **Status**: Accepted
- **Date**: October 2026
- **Decision**: Explicitly decouple Free Tier templates (`!is_premium || price_inr === 0`) from Pro Credit eligible premium templates (`is_credit_eligible === 1`).
- **Reason**: Previously, the Admin table labeled templates as "Free Tier" whenever `is_credit_eligible` was true, leading to confusion where dozens of paid templates appeared with "Free Tier" badges when only 2 templates were genuinely free.
- **Alternatives considered**: Overloading `is_credit_eligible` as a synonym for free.
- **Consequences**: Admin filters and badges accurately display "Free Tier" (emerald) ONLY for templates priced at ₹0, and "Premium" (amber) + "Pro Credit" (blue) for paid templates that can be redeemed by subscribers.
- **Related files**: `src/features/admin/templates/components/TemplatesTableView.tsx`, `src/features/admin/templates/AdminTemplates.tsx`.

---

## ADR-010: Reusable Route & Destination URL Selector in CMS
- **Status**: Accepted
- **Date**: October 2026
- **Decision**: Provide a universal `RouteUrlSelector` component across all Admin CMS panels with preset routes, deep links, custom URL support, and a live test preview link.
- **Reason**: Clients and administrators configuring promotional banners, blog promos, and about pages frequently did not know the exact route paths (e.g. `/ordernow?service=ecommerce`, `/services?type=presentation`). Free-form text fields led to 404s and broken links.
- **Alternatives considered**: Static help text listing routes.
- **Consequences**: Dropdown selection of all core studio routes and deep links with two-way sync to manual input and immediate live testing.
- **Related files**: `src/features/admin/shared/RouteUrlSelector.tsx`, `src/features/admin/customization/*`.

