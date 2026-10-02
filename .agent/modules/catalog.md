# Catalog Module

## Responsibility
Manages template fetching, category aggregation, search filtering, tier filtering (All / Free / Premium), and template detail view (`/template/:id` and `/templates`).

## Current Status
IMPLEMENTED

## Source Locations
- `src/pages/Templates.tsx`
- `src/pages/TemplateDetail.tsx`
- `src/modules/StudioStoreClient/useStudioStore.ts`
- `src/modules/StudioStoreClient/TemplateCard.tsx`

## Database Entities
- `public.templates`
- `public.site_config` (`template_categories`, `trending_templates`)

## APIs / Server Actions
- Cloudflare D1 client (`src/lib/d1.ts`)
- Cloudflare Pages Function `/api/data.ts`

## Dependencies
- `useStudioStore`: Zustand-style custom hook caching all published templates.
- `lucide-react`: Icons (`Crown`, `Download`, `Eye`, `Star`, `Check`, `FileText`).

## Important Business Rules
- Only templates where `is_published = true` are shown to public users.
- Free templates display swallowtail yellow ribbons and require no payment.
- Premium templates require Pro plan membership or one-time purchase.
- Slide counts and formats must default to PowerPoint (`.pptx`) 30+ slides.

## Current Implementation
- `useStudioStore` fetches all published templates upon application mount and caches them in memory.
- `filteredCatalog` computes dynamic subsets matching query, tier, and category in linear time.
- `/template/:id` renders detailed deck breakdown, slide preview grid, and action buttons.

## Known Issues
- None.

## Related Tasks
- TASK-005

## Related Decisions
- ADR-002: Standard CSS Grid for Template Marketplace Feed
