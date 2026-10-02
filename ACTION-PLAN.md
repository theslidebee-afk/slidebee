# SlideBee Prioritized Engineering Action Plan

**Repository**: `/home/revenant/xyz_templates` (Branch: `dev`)  
**Standard**: Agentic-SEO-Skill & SlideBee Engineering Directives  
**Date**: October 1, 2026  
**Implementation Priority**: Phase 1 (Immediate / High Impact) -> Phase 2 (CMS & UI Clean Up) -> Phase 3 (GEO & AI Optimization)

---

## Phase 1: Critical SEO & Social Sharing Architecture (High Impact)

### Task 1.1: Migrate from HashRouter to BrowserRouter
* **Target File**: `src/App.tsx`
* **Problem**: HashRouter causes all URLs to contain `/#/`. Search engines, social networks, and AI crawlers do not crawl or index hash URLs.
* **Fix**:
  1. Replace `HashRouter` with `BrowserRouter` in `src/App.tsx`.
  2. Verify `public/_redirects` contains `/* /index.html 200` (already in place).
  3. Clean HTML5 URLs (`/blog`, `/blog/1`, `/templates`, `/services`, `/pricing`) will now be received directly by the server.

### Task 1.2: Rebuild `public/sitemap.xml` with Clean Canonical URLs
* **Target File**: `public/sitemap.xml`
* **Problem**: All current `<loc>` entries contain `/#/`, causing Google Search Console to drop the fragments and flag duplicate entries.
* **Fix**:
  1. Strip all `/#/` substrings.
  2. Map all 10 blog articles (`https://theslidebee.com/blog/1` through `/blog/10`).
  3. Add marketplace category URLs (`/templates?category=pitch-decks`, `/templates?category=business`).
  4. Ensure lastmod dates and priorities match SEO best practices.

### Task 1.3: Overhaul `usePageSEO` Hook with Complete Metadata
* **Target File**: `src/hooks/usePageSEO.ts`
* **Problem**: The hook currently drops keywords, og:image, twitter:image, og:url, and twitter:card.
* **Fix**:
  Extend `PageSEOProps` to accept:
  ```typescript
  interface PageSEOProps {
    title: string;
    description: string;
    keywords?: string[];
    canonicalUrl?: string;
    ogImage?: string;
    ogType?: "website" | "article" | "product";
    twitterCard?: "summary" | "summary_large_image";
    publishedTime?: string;
    author?: string;
  }
  ```
  Ensure it updates or injects:
  - `<meta name="keywords" content="..." />`
  - `<meta property="og:title" content="..." />`
  - `<meta property="og:description" content="..." />`
  - `<meta property="og:image" content="..." />`
  - `<meta property="og:url" content="..." />`
  - `<meta property="og:type" content="..." />`
  - `<meta name="twitter:card" content="..." />`
  - `<meta name="twitter:title" content="..." />`
  - `<meta name="twitter:description" content="..." />`
  - `<meta name="twitter:image" content="..." />`

### Task 1.4: Feed Specific SEO Keywords & Social Previews to Blog Pages
* **Target Files**: `src/pages/Blog.tsx`, `src/pages/BlogDetail.tsx`
* **Problem**: Blog articles lack explicit SEO keywords and social preview images.
* **Fix**:
  1. For each article in `defaultArticles`, attach an explicit `keywords` array containing target search phrases (e.g. `["presentation design", "c-suite slide structure", "mckinsey presentation framework", "executive keynote"]`).
  2. Pass `article.keywords`, `article.imageUrl`, and `canonicalUrl` into `usePageSEO`.
  3. In `BlogDetail.tsx`, inject a dynamic JSON-LD `BlogPosting` structured data tag into `<head>` with author, datePublished, headline, and articleBody summary.

---

## Phase 2: UI Refinements & Admin CMS Cleanup

### Task 2.1: Resolve the "Black Underlayer" in the Banner Section
* **Target File**: `src/pages/Home.tsx`
* **Problem**: The hero section has a deep black canvas (`bg-[#111111]`) with an isometric cubes video and a dark overlay (`bg-black/20`). Banner 2 is styled with solid obsidian black (`bg-[#0D0D0D]/95`), creating a heavy black block and underlayer friction.
* **Fix**:
  1. Harmonize Banner 2: Use a warm obsidian card with honey gold borders (`border-primary/40`), or adjust background translucency so it feels integrated rather than an isolated dark slab.
  2. Reduce the heavy drop shadow from `shadow-[0_15px_40px_rgba(0,0,0,0.30)]` to a soft ambient glow.
  3. Ensure the kinetic fold transition doesn't expose a stark black background void during search expansion.

### Task 2.2: Prune Dead & Redundant Controls in Admin.tsx
* **Target File**: `src/pages/Admin.tsx`
* **Problem**: Admin contains controls for fields that no longer exist in the front-end redesign.
* **Fix**:
  1. **Remove Hero Eyebrow Input**: `siteConfigs["hero"]?.badge` is not rendered.
  2. **Remove Hero Subtitle Paragraph**: `siteConfigs["hero"]?.subtitle` is not rendered.
  3. **Remove Hero Guarantee Input**: `siteConfigs["hero"]?.guarantee` is not rendered.
  4. **Retain & Highlight**: `headline` and `slogan` (the two active controls for the hero stage).
  5. **Delete Dead Component**: Delete `src/components/Banner.tsx` from the codebase.

---

## Phase 3: GEO, AI Search & Knowledge Files Modernization

### Task 3.1: Modernize `llms.txt` and `llms-full.txt`
* **Target Files**: `public/llms.txt`, `public/llms-full.txt`
* **Fix**:
  1. Remove all hash URLs (`/#/services` -> `/services`, `/#/templates` -> `/templates`, `/#/pricing` -> `/pricing`).
  2. Add knowledge sections for the 10 Presentation Playbook articles with direct markdown summaries and URLs.
  3. Add the Ecommerce Development offering (₹25,000 package details).

### Task 3.2: Update `public/robots.txt` for AI Crawlers
* **Target File**: `public/robots.txt`
* **Fix**:
  Explicitly allow AI search crawlers (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended`) while protecting administrative paths (`/admin`, `/account`). Reference the clean `sitemap.xml` and `llms.txt`.

### Task 3.3: Fix Deprecated Metric Reference in Blog Article #10
* **Target File**: `src/pages/BlogDetail.tsx`
* **Fix**:
  Replace `FID` (First Input Delay) with `INP` (Interaction to Next Paint) in Article #10 to maintain 100% technical accuracy with Google's Core Web Vitals standards.

---

## Verification & Deployment Checklist
- [ ] Run `npm run build` (`tsc -b && vite build`) to guarantee zero TypeScript or build regressions.
- [ ] Verify clean URL routing on reload (`curl -I http://localhost:5173/blog/1`).
- [ ] Run `scripts/sitemap_checker.py` to confirm zero duplicate URLs.
- [ ] Run `scripts/llms_txt_checker.py` to confirm 100% knowledge graph health.
- [ ] Deploy to Cloudflare Pages on branch `dev`: `npx wrangler pages deploy dist --project-name slidebee --branch dev`.
