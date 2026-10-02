# Database and Storage Architectural Rules

**Scope**: Cloudflare D1 tables, Cloudflare R2 storage bucket, migration scripts, and edge data fetching.

---

## 1. Cloudflare R2 Storage Standards

- **Bucket Organization**: Public presentation slide images, thumbnails, and portfolio case studies are stored in the dedicated bucket `slidebee` (`R2_PUBLIC_BASE_URL: https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev`).
- **Direct CDN Delivery**: All slide preview images, thumbnails, and master presentation decks (.pptx) are referenced via Cloudflare R2 CDN URLs.
- **Never Rely on Local Relative Paths**: Do not reference `/examples/*.jpg` expecting local static bundling, as CDN-hosted assets avoid Cloudflare Pages bundle limits and ensure instantaneous global edge caching.
- **Zero Egress Fees**: Cloudflare R2 provides 10 GB free tier with $0 egress bandwidth costs.
- **Image Formats**: Use high-definition 16:9 widescreen images (`1920x1080` JPEG or WebP) optimized for fast loading under 250 KB per slide.

---

## 2. Cloudflare D1 Database Rules

- **Database Engine**: Cloudflare D1 SQLite (`binding = "DB"`, database `slidebee-db`).
- **Data Engine Layer**: Client interactions run through `functions/api/data.ts` and `src/lib/d1.ts` (`d1.from(table)`).
- **Dynamic CMS via `site_config`**: All marketing copy, portfolio decks, promotional banners, and hero settings must be dynamic and stored in table `site_config`. Never hardcode static portfolio or pricing data in component files.
- **Security & Authorization**: Access is guarded server-side in Cloudflare Pages Functions (`/api/auth`, `/api/session-guard`, `/api/data`).
- **Serverless Edge Mandate**: The platform runs 100% on Cloudflare D1 and Cloudflare R2. Do not introduce external vendor databases or SDKs.
