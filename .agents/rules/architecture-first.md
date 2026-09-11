# Agent Policy: Mandatory Architecture & Email Workflow Alignment

**Scope**: All AI agents, contributors, and automated workflows interacting with the SlideBee repository.

---

## 1. Mandatory Architecture Review Before Code Changes

Before inspecting individual components or implementing new features, every agent MUST read and align with:

1. **[`architecture.md`](file:///home/revenant/xyz_templates/architecture.md)**
   - Explains the dual-engine architecture: Cloudflare R2 for all binary files (`templates/decks/`, `templates/slides/`, `marquee/`) vs Supabase for user data and metadata only.
   - Note: Supabase Storage is 100% purged (0 MB) and must NEVER be used for template storage.
   - Enforces the $0.00 zero-cost billing invariants (10.00 GB hard ceiling on R2, 80 emails/day circuit breaker on Resend).
2. **[`email_workflows.md`](file:///home/revenant/xyz_templates/email_workflows.md)**
   - Explains the complete transactional email delivery lifecycle across all five customer touchpoints.
   - Details authorization headers (`x-slidebee-app-token`), sender whitelisting, and delivery fallbacks.

---

## 2. Core Architectural Guardrails for AI Agents

1. **Do Not Reintroduce Supabase Storage**:
   - Never write code that uploads presentations, slides, or images to Supabase Storage.
   - All binary uploads must route through `uploadToR2()` in `src/lib/r2.ts` or `/api/r2-storage`.
2. **Preserve IDOR Prevention**:
   - Master presentation `.pptx` URLs (`download_url`) must never be projected in public views (`v_storefront_catalog`).
   - Deliverable links may only be issued post-fulfillment (`fn_fulfill_template_order`) or post-credit redemption (`fn_redeem_template_credit`).
3. **Strict Zero Emojis**:
   - Zero unicode emojis in commit messages, source code, comments, UI strings, and markdown artifacts.
4. **Enforce Security Definer Verification**:
   - Mutating RPCs must inspect `auth.jwt() ->> 'email'` rather than trusting raw client parameters.
5. **Always Validate End-to-End**:
   - Run `npx tsx tests/e2e_workflows.test.ts` to confirm 100% pass rate before committing any changes.
