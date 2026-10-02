# Checkout Module

## Responsibility
Manages transactional purchase flows for single template purchases, Pro plan upgrades, and bespoke design briefs (`/ordernow`).

## Current Status
IMPLEMENTED

## Source Locations
- `src/pages/OrderNow.tsx`
- `src/pages/Pricing.tsx`
- `src/pages/ThankYou.tsx`
- `src/modules/StudioStoreClient/useTemplateCheckout.ts`

## Database Entities
- `public.orders`
- `public.subscriptions`
- `public.profiles`

## APIs / Server Actions
- Razorpay Payment Gateway API
- Cloudflare Pages Function `/api/subscribe-pro.ts`
- Cloudflare Pages Function `/api/fulfill-order.ts`

## Dependencies
- `src/lib/razorpay.ts`
- `src/lib/email.ts`

## Important Business Rules
- Prices are dynamically localized based on user preference or geo-location (INR / USD).
- Order references follow format `SB-2026-XXXXX`.
- Successful payments trigger automatic confirmation receipts via Zoho Mail.

## Current Implementation
- Seamless modal checkout powered by Razorpay Checkout JS SDK.
- Support for Credit/Debit cards, UPI, Net Banking, and international cards.
- Redirection to `/thankyou` with order confirmation and deliverable tracker.

## Known Issues
- None.

## Related Tasks
- TASK-001

## Related Decisions
- ADR-003: Direct Checkout & Quota Model Over Complex Shopping Cart
