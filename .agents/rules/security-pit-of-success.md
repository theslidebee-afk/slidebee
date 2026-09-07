# Security Policy: Pit of Success & Access Control Invariants

**Scope**: All database schemas, views, stored procedures (RPC), API routes, serverless functions, and frontend modules across SlideBee.
**Framework Alignment**: Trail of Bits Security Guidelines (Insecure Defaults, Sharp Edges, Vulnerability Triage Brocards).

---

## 1. Core Security Invariants

### 1.1 Insecure Direct Object Reference (IDOR) Elimination
- **Never expose paid or sensitive asset URLs in public catalog views.**
  - `v_storefront_catalog` and `v_free_credit_library` must never project `download_url` or private object keys.
  - Public visitors and search crawlers must only receive display metadata (title, category, slide previews, slide count, price).
- **Post-Purchase Deliverable Fulfillment**:
  - Deliverable links (`download_url`) must only be generated or released via `SECURITY DEFINER` RPC functions after verified payment (`fn_fulfill_template_order`) or authenticated credit redemption (`fn_redeem_template_credit`).
- **Session Identity Verification on RPCs**:
  - Any function that modifies balances, claims credits, or mutates client data must verify that `auth.jwt() ->> 'email'` matches the target user email, or that the caller holds an authorized administrator role.
  - Anonymous callers must be strictly rejected with `AUTHENTICATION_REQUIRED`.

---

## 2. Supabase Row-Level Security (RLS) Policies

### 2.1 Least-Privilege by Default
- Every table created in `public` schema must have Row-Level Security enabled immediately:
  `ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;`
- **Strict Prohibition of `USING (true)` on Sensitive Tables**:
  - Never use `CREATE POLICY ... FOR ALL USING (true)` on `profiles`, `orders`, `templates`, `auth_logs`, or any table handling client records or credentials.
  - Read access to `profiles` and `orders` must be restricted to the authenticated resource owner (`id = auth.uid()` or `email = auth.jwt() ->> 'email'`) or verified administrators (`role IN ('admin', 'super_admin')`).
  - Write access to `templates` and `site_config` is restricted exclusively to verified administrators.

### 2.2 Table-Specific Access Rules
| Table | SELECT Access | INSERT Access | UPDATE / DELETE Access |
| :--- | :--- | :--- | :--- |
| `public.profiles` | Owner or Admin | Authenticated Owner or Trigger | Owner (non-sensitive fields) or Admin |
| `public.orders` | Owner or Admin | Open to Anon & Authenticated | Admin Only |
| `public.templates` | Admin Only (Public uses `v_storefront_catalog`) | Admin Only | Admin Only |
| `public.site_config` | Public (Read-Only) | Admin Only | Admin Only |
| `public.auth_logs` | Admin Only | Open to Anon & Authenticated | Admin Only |

---

## 3. Storage & Cloudflare Pages Functions (`/api/*`)

### 3.1 Cloudflare R2 API Protection (`/api/r2-storage`)
- Non-idempotent operations (`POST` upload/overwrite, `DELETE` file removal) must strictly require administrator authorization.
- Requests without a valid `x-slidebee-admin-key` header or valid Bearer token must be rejected immediately with HTTP 401 Unauthorized.
- Telemetry endpoints (`GET`) must sanitize private keys and sensitive file paths before returning responses.

### 3.2 Transactional Email Protection (`/api/send-email`)
- The email dispatch endpoint must never operate as an unauthenticated open relay.
- All requests must supply a valid `x-slidebee-app-token` header or administrator token.
- Senders must be strictly validated against approved SlideBee domains (`hello@theslidebee.com`, `design@theslidebee.com`, `admin@theslidebee.com`, `notifications@theslidebee.com`, `support@theslidebee.com`, `onboarding@resend.dev`). Requests attempting to spoof third-party domains must be rejected with HTTP 403 Forbidden.

---

## 4. Zero-Cost Billing Hard Invariants

- **Cloudflare R2**:
  - Hard storage ceiling: 9.90 GB (guaranteeing 100 MB buffer below Cloudflare 10.00 GB free tier).
  - Maximum presentation file size: 50 MB per `.pptx`.
  - Maximum slide image file size: 10 MB per image.
  - Immutable edge caching headers: `Cache-Control: public, max-age=31536000, immutable` must be applied on all uploads to minimize Class B read operation costs.
- **Resend Transactional Email**:
  - Daily safety circuit breaker: 80 emails/day hard limit (safely under 100 emails/day free allowance).
  - Reset daily at 00:00 UTC.

---

## 5. Security Verification Checklist for Future Changes

Before merging database schema changes, edge functions, or checkout workflows:
1. Confirm that no public view or GraphQL/REST response exposes `.pptx` download URLs to unauthenticated users.
2. Verify that all mutation endpoints require explicit authorization tokens or authenticated session JWTs.
3. Verify that RLS is enabled on all tables with no permissive `USING (true)` leaks.
4. Run the end-to-end security test suite (`npx tsx tests/e2e_workflows.test.ts`) and confirm 100% pass rate across all access control assertions.
