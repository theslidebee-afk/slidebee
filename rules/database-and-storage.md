# Database and Storage Architectural Rules

**Scope**: Supabase tables, storage buckets, migration scripts, and frontend data fetching.

---

## 1. Supabase Storage Standards

- **Bucket Organization**: Public presentation assets must be stored in the dedicated public bucket `examples`.
- **Direct CDN Delivery**: All slide preview images, thumbnails, and portfolio case studies must be referenced via full CDN URLs:
  `https://whwyfqtvuubkfypmgosi.supabase.co/storage/v1/object/public/examples/<asset-name>.jpg`
- **Never Rely on Local Relative Paths**: Do not reference `/examples/*.jpg` expecting local static bundling, as CDN-hosted assets avoid Cloudflare Pages bundle limits and ensure instantaneous global caching.
- **Image Formats**: Use high-definition 16:9 widescreen images (`1920x1080` JPEG or WebP) optimized for fast loading under 250 KB per slide.

---

## 2. Supabase Database Rules

- **Dynamic CMS via `site_config`**: All marketing copy, portfolio decks (`portfolio_cms`), services marquees (`services_marquee_cms`), and hero settings must be dynamic and stored in `public.site_config`. Never hardcode static portfolio or pricing data in component files.
- **Row-Level Security (RLS)**:
  - `profiles`: Public read for authentication validation, user-restricted update.
  - `orders`: Authenticated or admin-only inspection.
  - `site_config`: Public read, authenticated/admin write.
- **Auditing**: Authentication actions (logins, registrations) must be safely recorded in `public.auth_logs`.
