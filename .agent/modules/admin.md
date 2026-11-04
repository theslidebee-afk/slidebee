# Admin Module

## Responsibility
Provides studio administration, template catalog management (CRUD, bulk uploads), site configuration controls, live promotional banner updates, and trending deck pinning.

## Current Status
IMPLEMENTED

## Source Locations
- `src/pages/Admin.tsx`
- `src/features/admin/inquiries/AdminInquiries.tsx`
- `src/features/admin/templates/` (TableView, BulkImportModal, useTemplateEdit)
- `src/features/admin/customization/` (CmsHomepagePanel, CmsBlogPanel, CmsPortfolioPanel, CmsAboutPanel, CmsContactPanel)
- `src/features/admin/shared/RouteUrlSelector.tsx`
- `functions/api/admin-template.ts`

## Database Entities
- `templates`
- `site_config`
- `orders` (Custom briefs + Inbound inquiries)
- `profiles`

## APIs / Server Actions
- Cloudflare Pages Function `/api/admin-template.ts`
- Cloudflare R2 upload API (`/api/r2-storage.ts`, `src/lib/r2.ts`)
- Cloudflare D1 client (`src/lib/d1.ts`)

## Dependencies
- `lucide-react`: Admin dashboard icons.
- `src/lib/d1.ts`

## Important Business Rules
- Access restricted to authenticated administrator (`admin@theslidebee.com`).
- Uploaded slides, covers, and portfolio slides generate public Cloudflare R2 CDN URLs.
- All CTA buttons and destination links in CMS panels use `RouteUrlSelector` with preset routes and live test link.
- Inbound client inquiries and quote requests are tracked and managed in "Inquiries & Quotes".
- Dynamic homepage fields saved to `site_config` take effect immediately on frontend refresh.

## Current Implementation
- Modularized studio back-office on `/admin` organized by domain feature components.
- Dedicated "Inquiries & Quotes" tab for reviewing external communication from "Get a Quote" submissions.
- Portfolio Case Study manager supporting multi-file slide uploads from local computer to Cloudflare R2 with reordering and deletion.
- Bulk CSV Import with explicit `pptx_file_url` header, row removal, asset queue removal, and tier tagging.
- Shared `RouteUrlSelector` component across all CMS panels.

## Known Issues
- None.

## Related Tasks
- Pillar 2: Inbound Leads Hub & Communications Admin Page
- Pillar 3: Portfolio Multi-Slide Previews via Local Computer Upload to R2
- Pillar 4: Bulk CSV Import Enhancements & Asset Deletion
- Pillar 7: Reusable Route / Destination URL Selector in Admin CMS

## Related Decisions
- ADR-005: Strict Zero-Emoji Engineering Rule
- ADR-008: Dual-Role Orders & Inbound Communications Pipeline
- ADR-010: Reusable Route & Destination URL Selector in CMS

