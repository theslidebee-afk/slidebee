# SlideBee — Domain & Technical Glossary

This glossary defines standard terminology used throughout the SlideBee platform, codebase, and documentation.

---

## 1. Product & Business Concepts

- **Curated Template Marketplace**: The primary e-commerce catalog featuring pre-designed executive presentations categorized by function (Pitch Decks, Strategy, Finance, Infographics, etc.).
- **Pro Membership**: Recurring subscription ($5 / 499 INR per month) offering 30 monthly deck downloads and commercial usage rights.
- **Daily Free Quota**: The entitlement for registered free users allowing up to 3 community template downloads every 24 hours.
- **Order Reference**: Unique tracking identifier assigned to custom design studio orders (format `SB-2026-XXXXX`), allowing clients to check order status and download deliverables.
- **Master Format**: Editable PowerPoint (`.pptx`) presentation file, compatible with Microsoft PowerPoint 365, Google Slides, and Apple Keynote.

---

## 2. UI & Interaction Concepts

- **Kinetic Hero Stage**: The unified top landing area in `Home.tsx` featuring the 3D video background, promotional split banners, and central search card.
- **Curtain Lift**: The animated state transition triggered by search focus or category selection (`isFilterActive`), where promotional banners collapse and the templates sheet `#templates` elevates ~180px to dock immediately beneath the search bar.
- **Magnet Masonry / Showcase Card**: SlideEgg-style template card layout displaying a prominent cover preview image, swallowtail ribbon badge, and a 3-column subgrid of inner preview slides.
- **Large Hex Grid**: The custom background canvas pattern (`.large-hex-grid`) rendered on `#FFF9E8` milk cream background across major pages.

---

## 3. Architecture & Code Concepts

- **Site Config Singleton**: Rows stored in the `public.site_config` database table storing dynamic JSON objects for marketing configuration (e.g. `hero`, `home_banner_1`, `home_banner_2`, `template_categories`).
- **Cloudflare Pages Functions**: Serverless edge handlers located in `functions/api/*.ts` executed by Cloudflare Pages runtime.
- **R2 Storage**: Cloudflare object storage bucket used for public CDN delivery of slide preview images and secure distribution of master presentation files (`.pptx`).
- **Client Ledger**: The client authentication and session tracking layer in `src/modules/ClientLedgerAuth/`.
