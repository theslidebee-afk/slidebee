# Admin Module

## Responsibility
Provides studio administration, template catalog management (CRUD, bulk uploads), site configuration controls, live promotional banner updates, and trending deck pinning.

## Current Status
IMPLEMENTED

## Source Locations
- `src/pages/Admin.tsx`
- `src/modules/OrderFulfillmentHub/useAdminTemplates.ts`
- `src/modules/OrderFulfillmentHub/useStorefrontMetrics.ts`
- `functions/api/admin-template.ts`

## Database Entities
- `public.templates`
- `public.site_config`
- `public.orders`
- `public.profiles`

## APIs / Server Actions
- Cloudflare Pages Function `/api/admin-template.ts`
- Cloudflare R2 upload API (`/api/r2-storage.ts`, `src/lib/r2.ts`)

## Dependencies
- `lucide-react`: Admin dashboard icons.
- `src/lib/d1.ts`

## Important Business Rules
- Access restricted to authenticated administrators (`admin@theslidebee.com`, `admin@slidebee.com`).
- Uploaded slides and covers must generate CDN-accessible image URLs.
- Dynamic homepage fields saved to `public.site_config` take effect immediately on frontend refresh.
- Retired fields (eyebrows/subtitles) are omitted from homepage rendering to preserve modern hero proportions.

## Current Implementation
- Full-featured studio back-office on `/admin`.
- Live template editor with title, slug, price (INR/USD), category, slide count, formats, cover image, and multi-slide preview uploader.
- Site Config manager for hero headline, split promotional banners (Banner 1 & Banner 2), categories list, and testimonials.
- Metrics overview showing total templates, orders, and downloads.

## Known Issues
- `Admin.tsx` is large (~580KB) and scheduled for modular component extraction in backlog (TASK-008).

## Related Tasks
- TASK-004: Admin Studio Cleanup of Retired Fields
- TASK-008: Admin.tsx Subcomponent Modularization

## Related Decisions
- ADR-005: Strict Zero-Emoji Engineering Rule
