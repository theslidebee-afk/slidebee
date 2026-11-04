# Authentication and Role Management Rules

**Scope**: Login flows, signup forms, password recovery, session handling, and role-based routing.

---

## 1. Master Admin Credentials & Access

- **Admin Account Recognition**: Only `admin@theslidebee.com` is recognized as the administrator account. No wildcards, prefix matching, or secondary admin addresses are permitted.
- **Admin Authentication**: Master admin authenticates securely via edge auth with password `SlideBee@Admin2026!`, gaining immediate access to the Studio Hub (`/admin`).
- **Profile Persistence**: The admin account must always have persistent rows in `public.profiles` with `role = 'super_admin'` so database operations and role checks succeed.

---

## 2. Client Authentication & Credits

- **Default Starter Credits**: Every newly registered client receives **5 complimentary slide credits** (`credits_total = 5`, `credits_balance = 5`, `credits_used = 0`).
- **Unregistered Account Handling**:
  - When an unauthenticated visitor attempts login with an email not found in `profiles`, gracefully switch to the Sign Up tab and display:
    `"No registered account found for <email>"`
  - **Exception**: NEVER display "No registered account found" for `admin@theslidebee.com`. Always prompt for valid admin credentials.

---

## 3. Session Synchronization

- Multi-tab authentication events must be synchronized via `BroadcastChannel` in `src/lib/authSync.ts`.
- When logging out, clear both edge auth session and local keys (`slidebee_client_user`, `slidebee_admin_session`, `slidebee_admin_email`).
