# Payments Module

## Responsibility
Interfaces with payment gateways, generates payment orders, verifies payment signatures, and records payment transaction IDs.

## Current Status
IMPLEMENTED

## Source Locations
- `src/lib/razorpay.ts`
- `functions/api/subscribe-pro.ts`
- `src/pages/Pricing.tsx`
- `src/pages/OrderNow.tsx`

## Database Entities
- `public.orders` (`payment_id`)
- `public.subscriptions` (`razorpay_subscription_id`)

## APIs / Server Actions
- Razorpay Orders API (`https://api.razorpay.com/v1/orders`)
- Razorpay Subscriptions API (`https://api.razorpay.com/v1/subscriptions`)
- Cloudflare Pages Function `/api/subscribe-pro.ts`

## Dependencies
- Razorpay client script loaded dynamically in browser (`https://checkout.razorpay.com/v1/checkout.js`).

## Important Business Rules
- Amounts passed to Razorpay must be formatted in lowest currency units (paise/cents: `amount * 100`).
- Signatures should be verified server-side using Razorpay Key Secret.
- Never expose Razorpay Key Secret in client bundles (`VITE_RAZORPAY_KEY_ID` only).

## Current Implementation
- `initializeRazorpayPayment()` loads script and launches modal with theme color `#FCBF14` and brand logo.
- Handlers capture `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature`.

## Known Issues
- Webhook signature validation for automated renewal cancellation is in backlog (TASK-009).

## Related Tasks
- TASK-009: Razorpay Subscription Webhook Cancellation Handler

## Related Decisions
- ADR-003: Direct Checkout & Quota Model Over Complex Shopping Cart
