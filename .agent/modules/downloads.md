# Downloads Module

## Responsibility
Regulates template asset delivery, enforces daily free download quotas, tracks download history, and generates secure pre-signed Cloudflare R2 links for PowerPoint presentation packages.

## Current Status
IMPLEMENTED

## Source Locations
- `src/pages/TemplateDetail.tsx`
- `src/lib/templates.ts`
- `src/lib/r2.ts`
- `src/modules/StudioStoreClient/useTemplateCheckout.ts`
- `src/modules/StudioStoreClient/proRedemptionHelper.ts`
- `functions/api/r2-storage.ts`
- `functions/api/trial-guard.ts`
- `functions/api/redeem-pro-template.ts`
- `functions/api/entitlement.ts`

## Database Entities
- `templates` (`download_url`, `code`, `slug`)
- `download_logs`
- `profiles` (`downloads_today`, `last_download_date`, `quota_remaining`)

## APIs / Server Actions
- Cloudflare Pages Function `/api/download.ts` (Serverless Streaming Deliverable Proxy with internal R2 binding)
- Cloudflare Pages Function `/api/r2-storage.ts`
- Cloudflare Pages Function `/api/trial-guard.ts`
- Cloudflare Pages Function `/api/redeem-pro-template.ts`
- Cloudflare Pages Function `/api/entitlement.ts`

## Dependencies
- Cloudflare R2 bucket bindings (`R2_BUCKET = "slidebee"`).
- `src/lib/r2.ts` storage helper.
- `src/lib/templates.ts` presentation deliverable validation and download helper.

## Important Business Rules
- Free community templates (`is_premium = 0`) are freely downloadable by all visitors.
- Premium presentation deliverables require active authorization:
  - Anonymous requests return HTTP 401 Unauthorized.
  - Authenticated users without an active Pro plan or individual purchase return HTTP 403 Forbidden.
- ZERO PUBLIC R2 URL EXPOSURE: Master presentation binaries stream directly from internal R2 bucket bindings (`env.R2_BUCKET.get()`).
- STRICT PRESENTATION DELIVERABLE INTEGRITY: All template deliverables MUST be verified presentation decks (`.pptx`, `.ppt`, `.zip`).
- SILENT IMAGE FALLBACKS ARE STRICTLY PROHIBITED: Image files (`.jpg`, `.png`, `.webp`) are never renamed or substituted as presentations.
- PowerPoint binaries (`.pptx`) must never be corrupted with image data.
- Downloads are logged in `download_logs` with timestamp and template ID.

## Current Implementation
- Client initiates download request from `TemplateDetail.tsx`, `DashboardPurchasedTab.tsx`, or `proRedemptionHelper.ts` to `/api/download?id=<templateId>`.
- Edge function `/api/download.ts` verifies session authorization and D1 entitlements, then pipes binary stream directly from internal Cloudflare R2 bucket.
- Client browser receives direct attachment stream without exposing storage bucket URLs.

## Known Issues
- None.

## Related Tasks
- Pillar 1: Template PPTX Download Integrity & Strict No-Fallback Architecture
- TASK-011: Vibe Coder Security Framework 75-Vulnerabilities Hardening

## Related Decisions
- ADR-004: Hybrid Storage Strategy
- ADR-007: Strict PPTX Deliverable Validation & Zero Silent Image Fallbacks
- ADR-011: Serverless Deliverable Streaming Proxy (`/api/download`)
- ADR-012: Vibe Coder Security Framework 75 Vulnerabilities Hardening

