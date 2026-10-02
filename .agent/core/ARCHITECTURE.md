# SlideBee — Technical Architecture Specification

This document details the architectural boundaries, runtime environments, data flows, and external integrations of SlideBee.

---

## 1. Technology Stack

- **Runtime & Language**: Node.js 20+, TypeScript (~6.0.2).
- **Frontend Core**: React 19 (`19.2.8`), React DOM (`19.2.8`).
- **Build & Dev Tooling**: Vite (`^8.2.2`), `@vitejs/plugin-react` (`^6.1.0`), Oxlint (`^1.79.0`).
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite ^4.3.3`, `tailwindcss ^4.3.3`), `clsx`, `tailwind-merge`.
- **Motion & Interactivity**: Framer Motion (`^13.1.1`), Three.js (`^0.185.1`).
- **Icons**: Lucide React (`^1.38.0`).
- **Routing**: React Router DOM v7 (`^7.18.3`, HTML5 `BrowserRouter`).
- **Serverless / Edge**: Cloudflare Pages Functions (`functions/api/*.ts`).
- **Database**: Cloudflare D1 (SQLite Edge Database, binding `DB`, database `slidebee-db`).
- **Object Storage**: Cloudflare R2 (`slidebee` bucket, public CDN `pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev`).
- **Payment Gateway**: Razorpay JS SDK + Cloudflare Functions for Pro subscriptions and order payments.
- **Serverless Edge**: Complete edge architecture with zero external database dependencies.

---

## 2. Application Architecture & Boundaries

```text
CLIENT BROWSER (React 19 SPA)
  │
  ├── UI Pages (`src/pages/*`)
  ├── Core Navigation & Shell (`Navbar.tsx`, `Footer.tsx`, `UserModernDashboard.tsx`)
  ├── Modular Store Clients (`src/modules/StudioStoreClient/*`, `OrderFulfillmentHub/*`, `ClientLedgerAuth/*`)
  │
  └── [Serverless Edge APIs & Queries]
          ↓
      Cloudflare Pages Functions (`functions/api/*`)
          ├── `/api/data.ts`          -> Cloudflare D1 Query Engine (`d1.from(...)`)
          ├── `/api/auth.ts`          -> Cloudflare D1 Edge Auth Engine (`users`, `sessions`)
          ├── `/api/subscribe-pro.ts` -> Razorpay recurring Pro subscriptions
          ├── `/api/fulfill-order.ts` -> Order delivery processing
          ├── `/api/admin-template.ts`-> Protected template CRUD in D1
          ├── `/api/send-email.ts`    -> Zoho Mail notification dispatch
          ├── `/api/r2-storage.ts`    -> Cloudflare R2 object storage management
          ├── `/api/trial-guard.ts`   -> Daily free download quota verification
          └── `/api/redeem-pro-template.ts` -> Pro quota deduction in D1
```

---

## 3. Data Flows

### A. Template Catalog Discovery Flow
1. Visitor loads `/` (`Home.tsx`) or `/templates` (`Templates.tsx`).
2. `useStudioStore()` calls `d1.from("templates").select("*")`.
3. Client dispatches `POST /api/data` to Cloudflare Pages Function `functions/api/data.ts`.
4. The edge function executes a prepared statement on Cloudflare D1 (`env.DB`), deserializes JSON columns (`formats`, `slides`, `features`), and returns records.
5. Site configuration (`site_config`) is fetched in parallel to populate categories, trending IDs, and promotional banners.
6. User interactions trigger live filtering in the 6-column CSS grid.

### B. Single-Deck Download & Quota Flow
1. User clicks template card -> navigates to `/template/:id` (`TemplateDetail.tsx`).
2. Free Template:
   - Client checks `profiles.downloads_today` and `profiles.last_download_date` via `useClientLedger`.
   - If quota < 3: increments counter in D1, logs in `download_logs`, and initiates direct download from Cloudflare R2 CDN.
   - If quota exhausted: triggers login / upgrade prompt modal.
3. Pro Template:
   - Verifies active Pro subscription in `subscriptions` and `profiles.quota_remaining`.
   - Calls `/api/redeem-pro-template.ts` to deduct quota and generate secure R2 `.pptx` download token.

### C. Custom Brief & Order Submission Flow
1. Client completes order configurator at `/ordernow` (`OrderNow.tsx`).
2. Inserts record into `orders` via `d1.from("orders").insert(...)`.
3. Dispatches `/api/send-email.ts` to trigger dual Zoho Mail notifications to client and studio admins.

---

## 4. Authentication Architecture

- Engine: Cloudflare Pages Serverless Auth (`functions/api/auth.ts`).
- Tables: Stored directly in Cloudflare D1 `users`, `sessions`, and `profiles`.
- Password Hashing: SHA-256 with unique cryptographic salt per user.
- OAuth: Direct Google OAuth (`https://accounts.google.com/o/oauth2/v2/auth`) with token normalization in `src/pages/AuthCallback.tsx`.
- Session Management: Handled via `src/lib/sessionGuard.ts` and `src/modules/ClientLedgerAuth/useClientLedger.ts`.

---

## 5. Storage Architecture (Cloudflare R2)

- **Bucket**: `slidebee`
- **Public CDN Base**: `https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev`
- **Content**: Slide preview images, thumbnails, Master PowerPoint `.pptx` decks, and client deliverables.
- **Egress Fees**: $0 bandwidth egress across all downloads.

---

## 6. Deployment Architecture

- **Platform**: Cloudflare Pages.
- **Project Name**: `slidebee`
- **Environments**:
  - Production: Branch `main` -> `https://slidebee.com`
  - Staging / Dev: Branch `dev` -> `https://dev.slidebee.pages.dev`
- **Build Command**: `npm run build` (`tsc -b && vite build`)
- **Deploy Command**: `npx wrangler pages deploy dist --project-name slidebee --branch dev`
