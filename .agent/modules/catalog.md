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
- Free templates (`is_premium: 0` or `price_inr: 0`) require no payment and are marked with Free Tier badges. Exactly 2 templates are 100% Free.
- Premium templates require Pro plan membership credit redemption (`is_credit_eligible: 1`) or one-time purchase.
- All templates must have a valid `.pptx` file URL pointing to Cloudflare R2 (`/templates/decks/*.pptx`).
- Slide counts and formats must default to PowerPoint (`.pptx`) 25-30+ slides.

## Current Implementation
- `useStudioStore` fetches all published templates upon application mount and caches them in memory.
- `filteredCatalog` computes dynamic subsets matching query, tier, and category in linear time.
- `/template/:id` renders detailed deck breakdown, slide preview grid, and action buttons.
- Admin Studio supports Bulk CSV Import with explicit `pptx_file_url` column header, validation badges, and parsed row deletion.

## Known Issues
- None.

## Related Tasks
- Pillar 4: Bulk CSV Import Enhancements & Asset Deletion
- Pillar 5: Template CSV & Admin Table Free Tier Keyword Consistency

## Related Decisions
- ADR-002: Standard CSS Grid for Template Marketplace Feed
- ADR-007: Strict PPTX Deliverable Validation & Zero Silent Image Fallbacks
- ADR-009: Strict Free Tier vs Pro Credit Classification

