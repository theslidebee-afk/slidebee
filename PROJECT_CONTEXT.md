# SlideBee Project Context & Developer Reference

This document serves as the single source of truth for Antigravity agents and developers working on the SlideBee repository. Read this file when starting any new chat session to understand the architecture, design system, state of features, and recent changes.

---

## 1. Executive Overview & Brand Identity

* **Project Name**: SlideBee
* **Domain / Live URL**: `https://dev.slidebee.pages.dev` (Production: `https://slidebee.com`)
* **Core Business**: High-end executive presentation design studio and curated template marketplace (PowerPoint `.pptx` & Google Slides).
* **Brand Aesthetic**: Premium, clean, executive, minimalist, high contrast.
* **Palette**:
  * Canvas / Background: `#FFF9E8` (Warm Milk Cream) with `.large-hex-grid`
  * Accent Colors: `#FCBF14` (Honey Gold), `#D99B00` (Primary Amber)
  * Dark / Text Color: `#111111` (Deep Charcoal)
  * White Highlights: `#FFFDF5` / `#FFFFFF`
* **Typography**: **Manrope** across all headers, body, buttons, cards, and UI elements.

---

## 2. Strict Engineering Directives

1. **NO EMOJIS ANYWHERE**:
   * Never use unicode emojis in code, strings, console logs, commit messages, or chat responses.
   * Always use Lucide React icons (`<Search />`, `<Flame />`, `<Sparkles />`, `<Crown />`, `<Zap />`, `<Eye />`, etc.).
2. **CLEAN CODE INTEGRITY**:
   * Preserve existing comments, docstrings, and type definitions.
   * Run `npm run build` (`tsc -b && vite build`) before committing and deploying.
3. **BRANCH & REPO DISCIPLINE**:
   * Working branch is `dev` (`origin/dev`).
   * Never commit directly to `main` without testing on `dev`.

---

## 3. Technology Stack & Deployment

* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Lucide React
* **Router**: React Router DOM (`v7`, HTML5 `BrowserRouter`)
* **Hosting**: Cloudflare Pages (Project: `slidebee`, Branch: `dev`)
  * Deploy command: `npx wrangler pages deploy dist --project-name slidebee --branch dev`
* **Database**: Cloudflare D1 SQLite (`binding = "DB"`, database `slidebee-db`)
  * Data Engine: Cloudflare Pages Function `/api/data` (`functions/api/data.ts`)
  * Client: `src/lib/d1.ts` (`d1.from(...)`)
* **Storage**: Cloudflare R2 (`R2_BUCKET = "slidebee"`, public CDN `pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev`)
  * Client: `src/lib/r2.ts`, `/api/r2-storage`
* **Authentication**: Cloudflare Pages Functions `/api/auth` backed by D1 `users` & `sessions` tables
* **Architecture Mandate**: 100% Cloudflare Edge native (D1 SQLite, R2 object storage, Pages Functions). Direct imports from `src/lib/d1.ts`.

---

## 4. Key Pages & File Map

* `src/pages/Home.tsx`: Primary landing page, video hero stage, interactive search card, category filters, and continuous template feed.
* `src/pages/Services.tsx`: Design service packages and tier offerings.
* `src/pages/Pricing.tsx`: Subscription plans and custom deck pricing.
* `src/pages/Examples.tsx`: Showcase of past client decks and case studies.
* `src/pages/TemplateDetail.tsx`: Individual template preview, slide gallery, and download/checkout flow.
* `src/pages/Admin.tsx`: Storefront management, hero/banner toggles, template CRUD, and site config.
* `src/components/Navbar.tsx`: Sticky navigation with service links, template search, and quote CTA.
* `src/components/Footer.tsx`: Universal footer with copyright, links, and guarantee badges.
* `src/lib/templates.ts`: PPTX presentation deliverable validation, download triggering, and strict no-fallback architecture.
* `src/features/admin/inquiries/AdminInquiries.tsx`: Dedicated Inbound Quotes and Communications hub for client inquiries.
* `src/features/admin/shared/RouteUrlSelector.tsx`: Reusable route / destination URL selector for CMS button links.
* `src/modules/StudioStoreClient/useStudioStore.ts`: Template catalog state, filtering, and Cloudflare D1 data fetcher.

---

## 5. Core Architectural Pillars & Deliverable Rules

1. **STRICT PPTX DELIVERABLE INTEGRITY (NO IMAGE FALLBACKS)**:
   - When a user downloads a purchased or free template, the system MUST deliver a verified presentation file (`.pptx`, `.ppt`, `.zip`).
   - Never fall back to downloading `.jpg`/`.png` slide preview images renamed as `.pptx`.
   - All deliverable URLs pass through `isValidPptxUrl()` and `getTemplateDeliverableUrl()`.
   - In Bulk CSV Import, `pptx_file_url` is a first-class required column.

2. **DUAL-ROLE ORDERS & INBOUND COMMUNICATIONS HUB**:
   - Client brief orders and "Get a Quote" / inbound inquiries are both recorded in Cloudflare D1 `orders` table.
   - Inquiries are stamped with `status: "inquiry"`, `service_type: "Inbound Quote Request"`, and reference prefix `INQ-`.
   - Admin features a dedicated "Inquiries & Quotes" portal (`src/features/admin/inquiries/AdminInquiries.tsx`) to review, filter, and respond to incoming leads.
   - Immediate email alerts are dispatched to `vizhalsuresh@gmail.com` and `admin@theslidebee.com`.

3. **REUSABLE ROUTE & URL SELECTOR**:
   - All CMS panels with button targets use `RouteUrlSelector` (`src/features/admin/shared/RouteUrlSelector.tsx`), offering curated preset routes (`/templates`, `/services`, `/pricing`, `/ordernow`, etc.) and a live test preview link.

4. **VIBE CODER SECURITY FRAMEWORK & DEFENSIVE HARDENING**:
   - **Password Security**: WebCrypto PBKDF2 (SHA-256, 600,000 iterations) with transparent migration of legacy SHA-256 hashes on login and server-side rate-limiting (10 failed attempts / 15 minutes).
   - **OAuth Token Verification**: Direct cryptographic validation via Google `tokeninfo` endpoint; client-supplied unverified JWT claims are rejected.
   - **Database Gatekeeper**: `/api/data` permanently blacklists `users` and `auth_logs` tables, enforces identifier regex whitelisting (`/^[a-zA-Z0-9_]{1,64}$/`) against SQL injection, restricts catalog/config mutations to admin, and strips protected columns (`role`, `tier`, `credits_balance`) to prevent mass assignment privilege escalation.
   - **Deliverables Paywall**: Master PowerPoint decks (.pptx) stream through `/api/download` from internal Cloudflare R2 bucket bindings, enforcing HTTP 401 for unauthenticated visitors and HTTP 403 for unlicensed access.
   - **Zero Vulnerability Hygiene**: 0 dependencies reported in `npm audit`; automated 15-check test suite (`npm test`).

---

## 6. Homepage & Hero Section Architecture (`src/pages/Home.tsx`)

The hero section features a coordinated kinetic stage interaction:

### A. Stage Elements (Resting View)
1. **Background Video**: 3D Isometric animated cubes (`/hero_section.mp4`) with parallax scroll scale/opacity.
2. **Promotional Banners**:
   * Banner 1 (Yellow): *"Create Presentations That Make an Impact"*
   * Banner 2 (Black): *"Get Unlimited Downloads"*
3. **Central Frosted Card (`#hero-search-card`)**:
   * **Row 1**: Template count (`Showing X of Y templates`) and headline (*"Explore Executive Presentation Templates"*).
   * **Row 2**: Live search input with expandable kinetic focus width, Escape key reset, Clear button, and Tier filter toggles (*All*, *Free*, *Premium*).
   * **Row 3**: Multi-line wrapped category filter pills (*All Templates*, *Trending*, *Pitch Decks*, *Business*, *Infographics*, etc.).
4. **Slogan Note (`#hero-slogan-note`)**: *"Better Presentations Brighter Ideas"* with honey gold underline.
5. **Marketplace Sheet (`#templates`)**: Cream sheet resting at `-32px` margin at the bottom of the hero stage.

### B. Kinetic Focus Lift (Search & Filter Mode)
When the user types into search, focuses the search input, or clicks any category pill (`isFilterActive`):
* **Promotional Banners Fold**: The yellow and black banners smoothly collapse (`height: 0, opacity: 0`).
* **Headline Folds**: Row 1 headline collapses (`height: 0, opacity: 0`).
* **Stage Rises**: The search card, category pills, and slogan lift **~180px higher**.
* **Curtain Rises**: `#templates` springs upward by `-dockOffset` (`Math.round(diff + 175)`), docking snugly below the slogan.
* **Top Padding Compacts**: `#templates` padding reduces to `pt-3 sm:pt-4`.
* **Result**: The entire first row of template cards (all 6 columns) is 100% visible on screen without any scrolling required.

### C. Outside-Click & Escape Dismissal
* Clicking anywhere outside `#hero-search-card` and `#templates` (e.g. background video, margins):
  * Clears `searchQuery` (`""`).
  * Resets `activeSidebarCategory` (`"all"`).
  * Blurs focus (`isSearchFocused = false`).
  * Banners expand back, headline expands back, and `#templates` glides down to `-32px`.
* Pressing `Escape` or clicking the `Clear ×` button executes the exact same reset.

### D. 6-Column CSS Grid (Eliminating Gaps)
* The template feed uses standard CSS Grid:
  ```tsx
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 items-start">
  ```
* **Crucial Rule**: Never revert to CSS `columns-*` (multi-column layout). Multi-column flows items vertically down columns, which creates empty holes in row 2 when template counts are not divisible by 6. CSS Grid ensures strict left-to-right, row-by-row filling with zero gaps.

---

## 7. How to Start a New Chat Session with Full Context

When launching a new chat in Antigravity to save tokens:
1. Provide this brief instruction to the agent:
   > *"We are working on SlideBee in `/home/revenant/xyz_templates` on branch `dev`. Please read `PROJECT_CONTEXT.md` first to understand the architecture, recent changes, and rules."*
2. The agent will read this file in a single tool call, initializing with 100% full context while keeping input token overhead at ~2,000 tokens instead of 45,000+.

