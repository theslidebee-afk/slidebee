# Authentication and Role Management Rules

**Scope**: Login flows, signup forms, password recovery, session handling, and role-based routing.

---

## 1. Master Admin Credentials & Access

- **Admin Account Recognition**: Both `admin@theslidebee.com` and `admin@slidebee.com` (and any email starting with `admin@`) are recognized as administrator accounts.
- **Master PIN Bypass**: Admins may authenticate with master PINs (`2026`, `SlideBee@Admin2026!`, or `admin`) for rapid access to the Studio Hub (`#/admin`).
- **Profile Persistence**: Admin accounts must always have persistent rows in `public.profiles` with `role = 'super_admin'` so database operations and role checks succeed.

---

## 2. Client Authentication & Credits

- **Default Starter Credits**: Every newly registered client receives **5 complimentary slide credits** (`credits_total = 5`, `credits_balance = 5`, `credits_used = 0`).
- **Unregistered Account Handling**:
  - When an unauthenticated visitor attempts login with an email not found in `profiles`, gracefully switch to the Sign Up tab and display:
    `"No registered account found for <email>"`
  - **Exception**: NEVER display "No registered account found" for an administrator email. Always prompt for valid admin credentials or master PIN.

---

## 3. Session Synchronization

- Multi-tab authentication events must be synchronized via `BroadcastChannel` in `src/lib/authSync.ts`.
- When logging out, clear both Supabase session and local keys (`slidebee_client_user`, `slidebee_admin_session`, `slidebee_admin_email`).
