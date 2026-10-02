# Storefront Module

## Responsibility
Serves the customer-facing landing experience, including the 3D video hero stage, promotional split banners, interactive live search bar, category filters, and continuous template feed.

## Current Status
IMPLEMENTED

## Source Locations
- `src/pages/Home.tsx`
- `src/components/Navbar.tsx`
- `src/components/Footer.tsx`
- `src/components/CustomBeeCursor.tsx`
- `src/components/MagneticButton.tsx`

## Database Entities
- `public.templates`
- `public.site_config` (keys: `hero`, `home_banner_1`, `home_banner_2`, `template_categories`, `trending_templates`, `testimonials`)

## APIs / Server Actions
- Cloudflare D1 queries via `src/lib/d1.ts` (`POST /api/data`).

## Dependencies
- `framer-motion`: Scroll parallax, kinetic search expansion, spring transitions.
- `lucide-react`: Icons (`Search`, `Zap`, `Sparkles`, `Crown`, `Eye`, `Flame`).
- `react-router-dom`: SPA routing to `/template/:id`, `/ordernow`, etc.

## Important Business Rules
- Canvas background must be `#FFF9E8` with `.large-hex-grid`.
- Strictly zero unicode emojis across all copy and components.
- Banners and headline must collapse when search or category filter is active (`isFilterActive`).
- Outside-click or Escape key resets search query and restores banners.

## Current Implementation
- Hero section houses a 3D isometric cube background video (`/hero_section.mp4`) with smooth scroll-driven opacity fade down.
- Below the hero stage, `#templates` slides up in direct sync with scrolling.
- Showcase cards display full cover previews and SlideEgg-style 3-column subgrids of inner slides.

## Known Issues
- None.

## Related Tasks
- TASK-005: Hero Stage Black Underlayer Removal & Scroll Animation

## Related Decisions
- ADR-002: Standard CSS Grid for Template Marketplace Feed
- ADR-005: Strict Zero-Emoji Engineering Rule
