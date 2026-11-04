# Subscriptions Module

## Responsibility
Manages recurring Pro memberships, plan entitlements, payment cycles, monthly quota allowances, and subscription state synchronization.

## Current Status
IMPLEMENTED

## Source Locations
- `src/pages/Pricing.tsx`
- `src/components/UserModernDashboard.tsx`
- `functions/api/subscribe-pro.ts`
- `functions/api/entitlement.ts`

## Database Entities
- `public.subscriptions`
- `public.profiles` (`plan_tier`, `subscription_status`, `quota_remaining`)

## APIs / Server Actions
- Razorpay Subscriptions API
- Cloudflare Pages Function `/api/subscribe-pro.ts`
- Cloudflare Pages Function `/api/entitlement.ts`

## Dependencies
- `src/lib/razorpay.ts`
- `src/modules/ClientLedgerAuth/useClientLedger.ts`

## Important Business Rules
- Pro membership is $5 / 499 INR per month.
- Entitles subscriber to 30 deck downloads each billing period.
- Active Pro status bypasses one-off payment checkout on all premium marketplace templates.
- Cancellation downgrades `plan_tier` to `free` at the conclusion of the billing cycle.

## Current Implementation
- Pricing plans displayed with dynamic currency toggle (INR / USD) on `/pricing`.
- Razorpay subscription checkout creates record in `public.subscriptions` and elevates user profile.
- Client ledger reflects live Pro status badge and remaining monthly download credits.

## Known Issues
- Automated webhook listener for Razorpay direct dashboard cancellations is queued in backlog (TASK-009).

## Related Tasks
- TASK-009: Razorpay Subscription Webhook Cancellation Handler

## Related Decisions
- ADR-003: Direct Checkout & Quota Model Over Complex Shopping Cart
