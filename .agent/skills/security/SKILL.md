# Security & Auth Skill

This skill defines the security protocols for authentication, payment processing, and secret protection in SlideBee.

---

## Procedure

1. **Protect Environment Secrets**:
   - Never commit API secrets (Razorpay Key Secret, Google OAuth Client Secret, Zoho Mail app passwords).
   - Only expose client-safe variables prefixed with `VITE_` (`VITE_RAZORPAY_KEY_ID`, `VITE_GOOGLE_CLIENT_ID`).

2. **Cryptographic Authentication & Password Hardening**:
   - Hash all passwords using WebCrypto PBKDF2 with SHA-256, 600,000 iterations (`functions/api/auth/utils.ts`).
   - Automatically upgrade legacy SHA-256 hashes upon successful login.
   - Enforce server-side rate-limiting on login (10 failed attempts / 15 minutes lockout in `functions/api/auth/login.ts`).
   - Verify all Google OAuth ID tokens via `https://oauth2.googleapis.com/tokeninfo`. Never trust unverified client-parsed JWT claims.

3. **Database Gatekeeper & Anti-SQL Injection (`/api/data`)**:
   - Permanently blacklist `users` and `auth_logs` tables from `/api/data`. Return HTTP 403 Forbidden.
   - Enforce regex `/^[a-zA-Z0-9_]{1,64}$/` and table schema column maps on all column and filter identifiers.
   - Restrict catalog, site config, asset, and subscription mutations to verified admin sessions.
   - Strip protected columns (`role`, `tier`, `credits_balance`) on user profile updates to eliminate mass assignment privilege escalation.

4. **Deliverable Paywall & Internal R2 Streaming (`/api/download`)**:
   - Never return public Cloudflare R2 CDN URLs directly to client browsers for proprietary presentations.
   - Stream deliverables through `/api/download` using internal Cloudflare R2 bucket bindings (`env.R2_BUCKET.get()`).
   - Enforce HTTP 401 Unauthorized for anonymous download requests on premium templates.
   - Enforce HTTP 403 Forbidden for authenticated users without an active Pro plan or individual purchase record.

5. **Dependency Hygiene & Navigation Security**:
   - Run `npm audit` and ensure 0 vulnerabilities. Never retain unmaintained packages with known CVEs.
   - Reject protocol-relative URLs (`//evil.com`) in auth redirect flows (`useAuthPage.ts`).
   - Run `npm test` (`tests/security_vibe_audit.test.ts`) before committing to verify all 15 security checks pass.

