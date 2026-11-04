# Cart Module

## Responsibility
Multi-item shopping cart functionality. In SlideBee's current business model, this module is intentionally replaced by direct one-click deck unlocking and subscription quota redemption.

## Current Status
NOT_APPLICABLE / PLACEHOLDER

## Source Locations
- `src/modules/StudioStoreClient/useTemplateCheckout.ts` (Direct single-item checkout flow)

## Database Entities
- None currently. If implemented in the future, would require `carts` and `cart_items` tables.

## APIs / Server Actions
- None.

## Dependencies
- None.

## Important Business Rules
- Digital presentation assets are purchased individually on demand or unlocked via monthly Pro subscription quotas (30 decks/month).
- Complex multi-item shopping carts introduce friction for digital download products.

## Current Implementation
- Users click "Download Free", "Unlock with Pro", or "Buy Now" directly on `/template/:id`, triggering immediate checkout or quota redemption.

## Known Issues
- None.

## Related Tasks
- None.

## Related Decisions
- ADR-003: Direct Checkout & Quota Model Over Complex Shopping Cart
