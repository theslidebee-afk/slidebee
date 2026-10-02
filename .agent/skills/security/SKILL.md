# Security & Auth Skill

This skill defines the security protocols for authentication, payment processing, and secret protection in SlideBee.

---

## Procedure

1. **Protect Environment Secrets**:
   - Never commit API secrets (Razorpay Key Secret, Google OAuth Client Secret, Zoho Mail app passwords).
   - Only expose client-safe variables prefixed with `VITE_` (`VITE_RAZORPAY_KEY_ID`, `VITE_GOOGLE_CLIENT_ID`).

2. **Server-Side Verification**:
   - Payment signatures and Pro subscription renewals must be validated in Cloudflare Pages Functions (`functions/api/`).
   - Deliverable presentation files (`.pptx`) stored in Cloudflare R2 must never be served via unauthenticated public URLs.

3. **Admin Privilege Guarding**:
   - Verify admin claims through serverless session guards (`functions/api/auth.ts`, `functions/api/session-guard.ts`).
   - Master admin addresses: `admin@theslidebee.com` and `admin@slidebee.com`.

4. **Input Sanitization**:
   - Validate and sanitize order brief inputs on `/ordernow` before persisting to `orders` in D1.
