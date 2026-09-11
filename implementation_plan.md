# Implementation Plan: Comprehensive SlideBee Admin Panel & Dynamic CMS Overhaul

Based on the deep audit of `Admin.tsx` (7,024 lines), the 10 frontend pages, database schema, and serverless functions, this plan provides a complete, structured roadmap to transform SlideBee into a fully dynamic platform where all website customizations made in the Admin dashboard reflect consistently and immediately across the entire site.

---

## User Review Required

> [!IMPORTANT]
> **Scope & Phase Sequence**:
> This is a comprehensive overhaul spanning 8 key areas identified in the deep audit:
> 1. **Phase 1 (Critical)**: Field Name Harmonization & Immediate Working Admin Toggles (Hero, About, Contact, Pricing Retainer).
> 2. **Phase 2 (High)**: Live Data Wiring & Dead Tab Remediation (Assets tab mapped to Cloudflare R2 inventory, Subscriptions ghost tab resolution, dynamic Navbar credit balance).
> 3. **Phase 3 (High - Deep CMS)**: Dynamic Content Migration for Hardcoded Sections (Pricing plan feature lists & FAQs, Services tier descriptions & guarantees, About core values, Home categories).
> 4. **Phase 4 (High - Security & Persistence)**: Server-First Migration of Gateway & Email Config (Migrate Razorpay and Zoho settings from browser `localStorage` to Supabase `site_config` source-of-truth).
> 5. **Phase 5 (Governance & Consistency)**: Global Brand Consistency (Ensure footer, social links, guarantees, and contact channels propagate to all routes including `ComingSoon.tsx`).

> [!WARNING]
> **Zero Emojis & Zero Billing**:
> All implementation steps strictly maintain the project-wide **zero unicode emojis** requirement and enforce the **$0.00 zero-cost billing invariants** (10.00 GB Cloudflare R2 ceiling, 80 emails/day Resend circuit breaker).

---

## Proposed Changes

### Phase 1: Critical Field Harmonization & Working Toggles

#### [MODIFY] [Home.tsx](file:///home/revenant/xyz_templates/src/pages/Home.tsx)
* Update `heroConfig` resolution to support both key conventions bidirectionally:
  * Badge: `heroConfig.badgeText || heroConfig.badge || "SlideBee Design Studio"`
  * Headline: `heroConfig.headline || heroConfig.title || "Present Better. Faster."`
  * Subheadline: `heroConfig.subheadline || heroConfig.subtitle`
  * Primary CTA: `heroConfig.ctaText || heroConfig.ctaPrimary`
  * Secondary CTA: `heroConfig.secondaryCtaText || heroConfig.ctaSecondary`
  * Guarantee: Render `heroConfig.guarantee` beneath or beside the badge if set by Admin.

#### [MODIFY] [Admin.tsx](file:///home/revenant/xyz_templates/src/pages/Admin.tsx)
* **Homepage Hero Customizer**:
  * Update `handleSaveConfig("hero", ...)` to write both sets of keys (`title` and `headline`, `badge` and `badgeText`, `subtitle` and `subheadline`, `ctaPrimary` and `ctaText`, `ctaSecondary` and `secondaryCtaText`, `guarantee`) so any existing data and new edits work interchangeably.
* **About CMS Sub-Tab**:
  * Add inputs for **Page Main Headline** (`headline`) and **Supporting Subheadline** (`subheadline`) above the story paragraphs so the hero of `/about` is dynamically editable.
* **Contact CMS Sub-Tab**:
  * Add inputs for **Contact Headline** (`headline`) and **Contact Subheadline** (`subheadline`) above the email/WhatsApp channel fields.
* **Pricing CMS Sub-Tab**:
  * Add numeric inputs for **Enterprise Retainer USD** (`monthly_retainer_usd`) and **Enterprise Retainer INR** (`monthly_retainer_inr`).

---

### Phase 2: Live Data Wiring & Dead Tab Remediation

#### [MODIFY] [Admin.tsx](file:///home/revenant/xyz_templates/src/pages/Admin.tsx)
* **Media Assets Tab Transformation**:
  * Replace the query against the nonexistent `assets` table with live Cloudflare R2 inventory (`storageStats.objects`).
  * Display real image previews, master PPTX deck cards, file size in MB, structured folder badges (`templates/decks/`, `templates/slides/`, `marquee/`), and a functional 1-click **"Copy CDN URL"** button.
* **Subscriptions Tab Resolution**:
  * If the `subscriptions` table does not exist in the database, gracefully handle it with an informative "Enterprise Retainer & Client Accounts" view reading active clients from `profiles` where `role = 'client'` and showing actual project/credit activity rather than broken ghost metrics.

#### [MODIFY] [Navbar.tsx](file:///home/revenant/xyz_templates/src/components/Navbar.tsx)
* Replace the hardcoded `const [credits] = useState(5)` with a dynamic hook into the authenticated user's `profiles.credits_balance` (and reactive updates on login/redemption).

---

### Phase 3: Deep CMS Dynamic Content Migration

#### [MODIFY] [Pricing.tsx](file:///home/revenant/xyz_templates/src/pages/Pricing.tsx)
* Load plan tier descriptions, feature checklists, and the 6 FAQ items from `siteConfigs["pricing"]` with graceful default fallbacks so the admin can modify tier features and add/edit FAQs without redeploying code.

#### [MODIFY] [Services.tsx](file:///home/revenant/xyz_templates/src/pages/Services.tsx)
* Wire `servicesData` dictionary (titles, turnaround times, before/after deliverables, guarantees) to read from `siteConfigs["services_cms"]`.

#### [MODIFY] [About.tsx](file:///home/revenant/xyz_templates/src/pages/About.tsx)
* Wire the 4 core principle cards (`values` array: Clarity, Speed, Confidentiality, Editable Vectors) to read from `siteConfigs["about_cms"].values` with default fallbacks.

#### [MODIFY] [Admin.tsx](file:///home/revenant/xyz_templates/src/pages/Admin.tsx)
* Provide editing controls in the respective CMS sub-tabs for:
  * Pricing plan features and FAQs.
  * Services guarantees and tier turnaround details.
  * About core value cards.

---

### Phase 4: Server-First Gateway & Mail Configuration

#### [MODIFY] [Admin.tsx](file:///home/revenant/xyz_templates/src/pages/Admin.tsx)
* Update initial state for Razorpay Gateway (`razorpayKeyId`, `razorpayKeySecret`, `razorpayMode`) and Zoho Mail (`zohoDeliverableEmail`, `zohoInquiriesEmail`, `zohoBillingEmail`) to populate directly from `siteConfigs["razorpay_settings"]` and `siteConfigs["zoho_mail_settings"]` as primary source-of-truth.
* Saving updates writes to `site_config` first, keeping `localStorage` only as an optional local cache.

---

### Phase 5: Global Theme & Brand Consistency

#### [MODIFY] [ComingSoon.tsx](file:///home/revenant/xyz_templates/src/pages/ComingSoon.tsx)
* Connect footer social channels and brand contact emails to `siteConfigs["footer_cms"]` and `siteConfigs["contact_cms"]` so changes made in the Admin panel propagate even to the Coming Soon view.

---

## Verification Plan

### Automated Tests
- `npx tsx tests/e2e_workflows.test.ts`: Ensure all 27 core workflows and security invariants pass 100%.
- `npm run build`: Confirm `tsc -b && vite build` completes cleanly with 0 type errors or bundle issues.

### Manual Verification Matrix
1. **Hero CMS**: Modify headline, badge, and guarantee in Admin -> Click Save -> Verify `/home` reflects changes immediately.
2. **About CMS**: Modify About headline and core value in Admin -> Click Save -> Verify `/about` reflects changes.
3. **Contact CMS**: Modify Contact headline and WhatsApp hotline in Admin -> Click Save -> Verify `/contact` reflects changes.
4. **Pricing CMS**: Modify tier rates and Enterprise Retainer in Admin -> Click Save -> Verify `/pricing` displays new pricing.
5. **Assets Tab**: Open Admin -> Assets tab -> Verify real Cloudflare R2 items (slides, decks) appear with previews and working "Copy CDN URL" buttons.
6. **Navbar Credits**: Sign in with an account -> Redeem 5 credits -> Verify Navbar updates live to "0 Credits".
