# Orders Module

## Responsibility
Captures project briefs, service requests, turnaround requirements, and deliverable handoffs for SlideBee's custom design studio.

## Current Status
IMPLEMENTED

## Source Locations
- `src/pages/OrderNow.tsx`
- `src/components/UserModernDashboard.tsx`
- `src/modules/OrderFulfillmentHub/`
- `functions/api/fulfill-order.ts`

## Database Entities
- `public.orders`
- `public.profiles`

## APIs / Server Actions
- Cloudflare Pages Function `/api/fulfill-order.ts`
- Cloudflare Pages Function `/api/send-email.ts`
- Cloudflare D1 client (`src/lib/d1.ts`)

## Dependencies
- `lucide-react`: Form icons (`FileText`, `Clock`, `Sparkles`, `Upload`, `ShieldCheck`).
- `src/lib/email.ts`: Order confirmation emails.

## Important Business Rules
- Order status flow: `pending` -> `in_review` -> `in_progress` -> `completed` -> `cancelled`.
- Order reference must be unique and human-readable (`SB-2026-XXXXX`).
- Clients can track their order and download completed deliverables in their customer dashboard (`/login` -> User Dashboard).

## Current Implementation
- Multi-step intake configurator at `/ordernow` with timeline tiers (24 Hours, 48 Hours, 3-5 Days), slide counts (1-10, 11-20, 21-40, 40+), and deliverable formats.
- Insert into `public.orders` with RLS allowing public creation.
- Dual email notifications dispatched via Zoho Mail to customer and admin.

## Known Issues
- None.

## Related Tasks
- None.

## Related Decisions
- ADR-004: Hybrid Storage Strategy
