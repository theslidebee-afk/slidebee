# Authentication Module

## Responsibility
Provides customer and admin user authentication, session preservation, Google OAuth handling, Magic Link sign-in, and account ledger management.

## Current Status
IMPLEMENTED

## Source Locations
- `src/pages/Login.tsx`
- `src/pages/AuthCallback.tsx`
- `src/modules/ClientLedgerAuth/useClientLedger.ts`
- `src/modules/ClientLedgerAuth/index.ts`
- `src/lib/sessionGuard.ts`
- `src/lib/authSync.ts`
- `src/components/UserModernDashboard.tsx`

## Database Entities
- `users` (Cloudflare D1 internal)
- `sessions` (Cloudflare D1 session tokens)
- `profiles` (Cloudflare D1 profiles and credits)
- `auth_logs`

## APIs / Server Actions
- Cloudflare Pages Function `/api/auth.ts`
- Cloudflare Pages Function `/api/session-guard.ts`
- Direct Google OAuth endpoint (`https://accounts.google.com/o/oauth2/v2/auth`)

## Dependencies
- `src/lib/d1.ts` (`edgeAuth`)
- `src/lib/deviceFingerprint.ts`

## Important Business Rules
- Master admin accounts (`admin@theslidebee.com`, `admin@slidebee.com`) must never show "No registered account found".
- Every authenticated user automatically receives a `public.profiles` record with plan tier defaults (`free`, `quota_remaining: 3`).
- OAuth redirects are handled via `/auth/callback` (`AuthCallback.tsx`) and sanitized for clean HTML5 URL routing.

## Current Implementation
- Full modal and dedicated page authentication.
- Supports Google One-Tap, Google OAuth, and Passwordless Magic Links.
- Persistent session ledger updates `useClientLedger` store with live quota and profile attributes.

## Known Issues
- None.

## Related Tasks
- TASK-001: Router Modernization

## Related Decisions
- ADR-001: HTML5 BrowserRouter Migration
