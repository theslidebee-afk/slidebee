# Rule: Terminology and Copywriting Guidelines

This rule defines the strict separation between internal technical engineering jargon and client-facing executive language across SlideBee platforms, interfaces, transactional emails, and collateral.

---

## 1. Core Principle
SlideBee is a premier presentation design studio serving venture capital, founders, C-suite executives, and enterprise operators. All client-facing interfaces must speak the language of high-stakes corporate presentations, design mastery, and operational speed. Technical engineering concepts must remain under the hood.

---

## 2. Terminology Mapping

| Internal / Technical Concept | Client-Facing / Executive Term | Strictly Forbidden on Frontend |
| :--- | :--- | :--- |
| Supabase Auth / User UID | **Client Account / Studio Access** | "Supabase", "Auth ID", "UUID", "DB Row" |
| Credits Balance in DB | **Studio Credit Balance / Design Credits** | "Credit Integer", "Tokens in DB" |
| Credit Ledger / History Table | **Credit Ledger / Usage History** | "Transactions table", "credit_ledger" |
| Template Row in Database | **Master Deck / Executive Presentation Template** | "Template record", "row #12" |
| Downloadable PPTX binary | **Master PowerPoint Presentation (.pptx)** | "PPT zip asset", "blob", "S3 key", "bucket object" |
| Razorpay Gateway Webhook | **Secure Instant Checkout** | "Razorpay Webhook Handler", "signature verification" |
| Storage Bucket / CDN | **SlideBee Secure Asset Vault / High-Resolution Deliverables** | "Supabase Storage bucket", "public CDN URL" |
| Get a Quote form | **Custom Presentation Brief / Request Executive Quote** | "Submission form", "payload generator" |
| Welcome Email Trigger | **Executive Welcome & Studio Access Onboarding** | "Resend API trigger", "auth hook email" |

---

## 3. Formatting & Voice Guidelines
1. **Capitalization**: Capitalize deliverable formats cleanly: "Master PowerPoint Presentation (.pptx)".
2. **Clarity**: State clearly what the client receives: full slide deck, editable vector graphics, custom corporate typography.
3. **No Geek-Speak**: Never expose database error messages, stack traces, or schema fields (`JSONB`, `created_at`, `sku_hash`) in user alerts or toast notifications. Use helpful, reassuring, executive error messages (e.g., *"We were unable to locate your studio account. Please verify your email or create a new access profile."*).
