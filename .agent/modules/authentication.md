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
- Master admin account (`admin@theslidebee.com`) must never show "No registered account found".
- Every authenticated user automatically receives a `public.profiles` record with plan tier defaults (`free`, `quota_remaining: 3`).
- Passwords must be at least 8 characters and are hashed using WebCrypto PBKDF2 (SHA-256, 600,000 iterations).
- Existing legacy SHA-256 hashes are verified transparently and automatically upgraded to PBKDF2 on login.
- Login attempts are rate-limited server-side (locks after 10 failed attempts within 15 minutes).
- Google OAuth ID tokens must be cryptographically verified against `https://oauth2.googleapis.com/tokeninfo`.
- OAuth redirects are handled via `/auth/callback` (`AuthCallback.tsx`) and sanitized against open redirect protocols (`//`).

## Current Implementation
- Full modal and dedicated page authentication.
- Supports Google One-Tap, Google OAuth, and Passwordless Magic Links.
- Persistent session ledger updates `useClientLedger` store with live quota and profile attributes.
- Transparent PBKDF2 password migration and rate-limiting enforcement in `functions/api/auth/login.ts`.

## Known Issues
- None.

## Related Tasks
- TASK-001: Router Modernization
- TASK-011: Vibe Coder Security Framework 75-Vulnerabilities Hardening

## Related Decisions
- ADR-001: HTML5 BrowserRouter Migration
- ADR-012: Vibe Coder Security Framework 75 Vulnerabilities Hardening
