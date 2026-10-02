# SlideBee — Verified Technical Learnings & Discoveries

This document captures concrete, non-obvious engineering discoveries and edge cases uncovered during development.

---

## 1. Cloudflare D1 Native Query Engine
- **Discovery**: The data layer is 100% serverless via Cloudflare D1 (`d1.from(...)` -> `POST /api/data` -> D1 database `slidebee-db`). All client files import directly from `src/lib/d1.ts`.
- **Rule**: Keep all database operations routed through `src/lib/d1.ts` and `/api/data`.

---

## 2. Cloudflare R2 Egress and Storage URL Rewriting
- **Discovery**: Cloudflare R2 serves all assets from the public CDN base `https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev`. `src/lib/r2.ts` automatically rewrites any legacy URL patterns to this CDN.
- **Rule**: Reference all presentation slides and deliverables through Cloudflare R2.

---

## 3. Hero Stage Video & Background Dissolve
- **Discovery**: Setting `#hero-stage` background to any dark color (`bg-[#111111]` or `bg-[#141310]`) causes a visible dark underlayer to appear behind the video and promotional banners, especially as `videoOpacity` fades down during scroll.
- **Rule**: Always keep `#hero-stage` canvas background as `bg-[#FFF9E8]` and use a bottom gradient feather (`from-transparent via-[#FFF9E8]/70 to-[#FFF9E8]`) so the hero section blends seamlessly into Section 2/3.

---

## 4. CSS Grid vs Multi-Column Masonry
- **Discovery**: Using CSS multi-column (`columns-2 sm:columns-3 ...`) for dynamic template catalogs causes cards to flow vertically down each column. When items are added or filtered to counts not evenly divisible by the column number, visible gaps and ragged bottoms appear.
- **Rule**: Enforce standard CSS Grid (`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 items-start gap-4`) for all marketplace feeds.

---

## 5. Cloudflare Pages SPA Routing vs Serverless API
- **Discovery**: In Cloudflare Pages, client-side routing fallback (`/index.html`) must not interfere with edge function endpoints in `functions/api/`.
- **Rule**: All backend functions must reside strictly under `functions/api/*.ts` to guarantee proper edge routing precedence over the static SPA bundle.

---

## 6. Razorpay Currency Unit Normalization
- **Discovery**: Razorpay expects order amounts in the lowest currency subdivision (e.g. paise for INR: `price * 100`, cents for USD: `price * 100`).
- **Rule**: Always ensure amount integers are rounded before passing to Razorpay options to avoid fractional currency validation errors.
