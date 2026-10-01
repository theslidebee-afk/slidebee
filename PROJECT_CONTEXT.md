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

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React
* **Router**: React Router DOM (`v6`)
* **Hosting**: Cloudflare Pages (Project: `slidebee`, Branch: `dev`)
  * Deploy command: `npx wrangler pages deploy dist --project-name slidebee --branch dev`
* **Backend & Database**: Supabase (`site_config`, `templates`, `orders`, `profiles`)
  * Client: `src/lib/supabase.ts`
* **Edge Functions / Serverless**: Cloudflare Pages Functions (`functions/api/`)

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
* `src/modules/StudioStoreClient/useStudioStore.ts`: Template catalog state, filtering, and Supabase data fetcher.

---

## 5. Homepage & Hero Section Architecture (`src/pages/Home.tsx`)

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

## 6. How to Start a New Chat Session with Full Context

When launching a new chat in Antigravity to save tokens:
1. Provide this brief instruction to the agent:
   > *"We are working on SlideBee in `/home/revenant/xyz_templates` on branch `dev`. Please read `PROJECT_CONTEXT.md` first to understand the architecture, recent changes, and rules."*
2. The agent will read this file in a single tool call, initializing with 100% full context while keeping input token overhead at ~2,000 tokens instead of 45,000+.
