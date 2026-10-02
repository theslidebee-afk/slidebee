# Downloads Module

## Responsibility
Regulates template asset delivery, enforces daily free download quotas, tracks download history, and generates secure pre-signed Cloudflare R2 links for PowerPoint presentation packages.

## Current Status
IMPLEMENTED

## Source Locations
- `src/pages/TemplateDetail.tsx`
- `src/lib/r2.ts`
- `functions/api/r2-storage.ts`
- `functions/api/trial-guard.ts`
- `functions/api/redeem-pro-template.ts`
- `functions/api/entitlement.ts`

## Database Entities
- `public.templates` (`download_url`)
- `public.download_logs`
- `public.profiles` (`downloads_today`, `last_download_date`, `quota_remaining`)

## APIs / Server Actions
- Cloudflare Pages Function `/api/r2-storage.ts`
- Cloudflare Pages Function `/api/trial-guard.ts`
- Cloudflare Pages Function `/api/redeem-pro-template.ts`

## Dependencies
- Cloudflare R2 bucket bindings (`R2_BUCKET = "slidebee"`).
- `src/lib/r2.ts` storage helper.

## Important Business Rules
- Free users are restricted to 3 template downloads per calendar day.
- Pro subscribers are entitled to 30 deck downloads per month.
- PowerPoint binaries (`.pptx`) must never be publicly exposed via open unauthenticated URLs.
- Downloads are logged in `public.download_logs` with timestamp and template ID.

## Current Implementation
- Client initiates download request from `TemplateDetail.tsx`.
- Edge function `/api/trial-guard.ts` or `/api/redeem-pro-template.ts` validates user entitlement.
- Generates a short-lived signed R2 URL or streams file directly to the browser with `Content-Disposition: attachment`.

## Known Issues
- None.

## Related Tasks
- TASK-005

## Related Decisions
- ADR-004: Hybrid Storage Strategy
