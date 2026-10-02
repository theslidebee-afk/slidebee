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
