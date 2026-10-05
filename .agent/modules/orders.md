# Orders Module

## Responsibility
Captures project briefs, service requests, turnaround requirements, and deliverable handoffs for SlideBee's custom design studio.

## Current Status
IMPLEMENTED

## Source Locations
- `src/pages/OrderNow.tsx`
- `src/pages/Contact.tsx`
- `src/features/admin/inquiries/AdminInquiries.tsx`
- `src/features/admin/inquiries/InquiryDetailModal.tsx`
- `src/components/UserModernDashboard.tsx`
- `src/modules/OrderFulfillmentHub/`
- `functions/api/fulfill-order.ts`

## Database Entities
- `orders` (Dual role: Custom design briefs `SB-2026-XXXXX` and Inbound Quote Inquiries `INQ-XXXXXX`)
- `profiles`
- `waitlist` (Backup lead intake)

## APIs / Server Actions
- Cloudflare Pages Function `/api/fulfill-order.ts`
- Cloudflare Pages Function `/api/send-email.ts`
- Cloudflare D1 client (`src/lib/d1.ts`)

## Dependencies
- `lucide-react`: Form icons (`FileText`, `Clock`, `Sparkles`, `Upload`, `ShieldCheck`, `MessageSquareQuote`).
- `src/lib/email/templates/orderEmails.ts`: Dual Zoho Mail notifications to client and studio leadership (`vizhalsuresh@gmail.com`, `admin@theslidebee.com`).

## Important Business Rules
- Order status flow for custom briefs: `pending` -> `in_review` -> `in_progress` -> `completed` -> `cancelled`.
- Inbound inquiries use `status: "inquiry"`, `service_type: "Inbound Quote Request"`, and reference prefix `INQ-`.
- Inbound inquiries are managed directly in the dedicated Admin Studio tab: "Inquiries & Quotes".
- Order reference must be unique and human-readable (`SB-2026-XXXXX` or `INQ-XXXXXX`).
- Clients can track their order and download completed deliverables in their customer dashboard (`/login` -> User Dashboard).

## Current Implementation
- Multi-step intake configurator at `/ordernow` with timeline tiers (24 Hours, 48 Hours, 3-5 Days), slide counts (1-10, 11-20, 21-40, 40+), and deliverable formats.
- Inbound quote form at `/contact` saving structured inquiries to `orders` and `waitlist`.
- Admin "Inquiries & Quotes" portal (`src/features/admin/inquiries/AdminInquiries.tsx`) with search, filter, status update, and detail inspection modals.
- Dual email notifications dispatched via Zoho Mail to customer and admin (`vizhalsuresh@gmail.com`, `admin@theslidebee.com`).

## Known Issues
- None.

## Related Tasks
- Pillar 2: Inbound Leads Hub & Communications Admin Page

## Related Decisions
- ADR-004: Hybrid Storage Strategy
- ADR-008: Dual-Role Orders & Inbound Communications Pipeline

