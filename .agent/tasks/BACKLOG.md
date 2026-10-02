# SlideBee — Verified Task Backlog

Only concrete tasks derived from codebase analysis, warnings, and existing documentation are listed below. No imaginary tasks are included.

---

## TASK-007: Vite Config __dirname Migration
- **Description**: Vite logs a deprecation warning regarding `__dirname` at `vite.config.ts:1070:25` under Vite 8 / future native config loaders.
- **Requirement**: Replace `__dirname` with `import.meta.dirname` in `vite.config.ts`.
- **Affected Files**: `vite.config.ts`.
- **Verification**: Run `npm run build` and ensure the deprecation notice disappears.

---

## TASK-008: Admin.tsx Subcomponent Modularization
- **Description**: `src/pages/Admin.tsx` contains ~580KB of code with multiple inline sections (Hero editor, Template CRUD, Category management, Testimonials editor).
- **Requirement**: Extract modular child components into `src/pages/admin/` or `src/modules/OrderFulfillmentHub/` to enhance maintainability and reduce bundle chunk size.
- **Affected Files**: `src/pages/Admin.tsx`.
- **Verification**: `npm run build` and test all Admin CRUD operations.

---

## TASK-009: Razorpay Subscription Webhook Cancellation Handler
- **Description**: When a Pro subscriber cancels their membership directly in Razorpay, a webhook event should update `public.subscriptions.status` and `public.profiles.plan_tier` to 'free'.
- **Requirement**: Implement Cloudflare Pages Function `/api/razorpay-webhook.ts` validating webhook signatures and updating database state.
- **Affected Files**: `functions/api/`, `docs/DATABASE.md`.
- **Verification**: Simulate webhook events with Razorpay CLI and verify database record updates.
