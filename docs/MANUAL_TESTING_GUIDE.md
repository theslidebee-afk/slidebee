# SlideBee — Production Manual Testing & Regression QA Protocol

This protocol provides a comprehensive, step-by-step checklist to verify all critical user and administrative workflows before client handoff or production deployments.

---

## 1. Test Environment & Credentials

- **Staging URL**: `https://dev.slidebee.pages.dev`
- **Production URL**: `https://theslidebee.com`
- **Authorized Admin Account**:
  - Email: `admin@theslidebee.com`
  - Password: `SlideBee@Admin2026!`
- **Razorpay Sandbox Test Credentials**:
  - Card Number: `4111 1111 1111` (any 16-digit valid test format)
  - Expiry: Any future date (e.g. `12/28`)
  - CVV: `123`
  - OTP Simulation: `1234`
- **Department Routing Inboxes**:
  - E-Commerce Orders & Store Briefs: `vizhalsuresh@gmail.com`
  - Presentation Design Service Briefs: `design@theslidebee.com`
  - General & Admin Backup: `admin@theslidebee.com`

---

## 2. Workflow 1: Free Community Deck Download & Quota Enforcement

### Objective
Verify that Free Community Decks download without charging any payment, enforce the 3 downloads/day ceiling, and never reveal raw storage URLs.

| Step | Action | Expected Result | Pass / Fail |
| :--- | :--- | :--- | :---: |
| 1.1 | Navigate to Homepage (`/`) or Marketplace (`/templates`). | Catalog displays templates. | [ ] |
| 1.2 | Select a **Free Community Deck** (e.g. SKU `SLD-113` Creative Studio Portfolio). | Detail page loads. Pricing shows **100% Free** in emerald text. Zero money/currency symbols (`₹`, `$`) appear in the price section. | [ ] |
| 1.3 | If not logged in, observe the action button. | Displays "Login to get free templates for free (.pptx)". Clicking directs to `/login` with redirect parameter. | [ ] |
| 1.4 | Log in with a free client account and return to the template. | Action button updates to: `"Download Free Community Deck (.pptx) • 3 Left Today"`. | [ ] |
| 1.5 | Open Chrome DevTools (`F12` > Network tab) and click the download button. | Download triggers immediately. The network request is sent to `/api/download?id=SLD-113`. **No `pub-*.r2.dev` link is exposed in the browser.** | [ ] |
| 1.6 | Inspect the downloaded file on your computer. | File is named properly and opens as a genuine, uncorrupted PowerPoint presentation (.pptx). | [ ] |
| 1.7 | Check the user's registered email inbox. | Receipt email arrives thanking the user. **Contains zero file download links**, noting the single-browser delivery policy. | [ ] |
| 1.8 | Repeat download 3 times on the same day. | After 3 downloads, the button disables: `"Daily Free Limit Reached (3/3 Used)"`. Prevents further free downloads until next calendar day. | [ ] |
| 1.9 | Open User Dashboard (`/dashboard` > Purchased Items). | Item appears with "Commercial License Active". **No direct re-download button is provided** (explains single-download policy). | [ ] |

---

## 3. Workflow 2: Premium Template Purchase & Single-Download Delivery

### Objective
Verify that Premium templates charge via Razorpay, stream the genuine deliverable at the moment of checkout, withhold download links in emails, and block free re-downloading in the dashboard.

| Step | Action | Expected Result | Pass / Fail |
| :--- | :--- | :--- | :---: |
| 2.1 | Navigate to a **Premium Template** (e.g. SKU `SLD-180` Construction Infographic Light). | Price is displayed (e.g. ₹499 / $9). Features and slide count are shown. | [ ] |
| 2.2 | Click "Buy Standalone Commercial License". | Razorpay test checkout modal opens with exact template title and price. | [ ] |
| 2.3 | Complete test payment using test card details. | Payment succeeds. Modal closes. | [ ] |
| 2.4 | Observe browser behavior immediately after payment. | The browser **automatically triggers native file download** of `Construction Infographic Light.pptx` (approx. 1.08 MB). | [ ] |
| 2.5 | Inspect the downloaded file. | Open in PowerPoint / Keynote. **Must be the genuine Construction Infographic presentation** (NOT Accenture or any fallback deck). | [ ] |
| 2.6 | Check the buyer's email inbox. | Payment receipt arrives with order breakdown and commercial license confirmation. **Contains zero file links.** | [ ] |
| 2.7 | Open User Dashboard (`/dashboard` > Purchased Items tab). | Template is listed with date and "Commercial License Active". Direct re-download is disabled, prompting to use Pro quota or acquire a new license. | [ ] |

---

## 4. Workflow 3: Pro VIP Membership Quota Redemption

### Objective
Verify that Pro subscribers can redeem included templates from their monthly allowance without payment, with quota accurately deducted.

| Step | Action | Expected Result | Pass / Fail |
| :--- | :--- | :--- | :---: |
| 3.1 | Log in with an active Pro membership account. | Dashboard shows VIP badge and quota (e.g. "29 of 30 Downloads Left"). | [ ] |
| 3.2 | Open any Premium template detail page. | Action panel displays "Included with Pro Membership" and "Free with Pro" with the original price struck through. | [ ] |
| 3.3 | Click "Use Pro Quota • Download Master PPTX". | File streams immediately to the browser via `/api/download`. | [ ] |
| 3.4 | Refresh the page and dashboard. | Quota remaining decrements by 1 (e.g. 28 of 30 left). | [ ] |
| 3.5 | If a Pro member consumes all quota (0 remaining). | Action panel informs the user that monthly quota is exhausted and offers standalone commercial purchase. | [ ] |

---

## 5. Workflow 4: Security & R2 Storage Privacy Verification

### Objective
Verify that Cloudflare R2 bucket URLs and internal database credentials are never leaked to the client browser.

| Step | Action | Expected Result | Pass / Fail |
| :--- | :--- | :--- | :---: |
| 4.1 | Open Chrome DevTools (`F12` > Network tab) on `/templates/:id`. | Filter by "Fetch/XHR" and inspect requests. | [ ] |
| 4.2 | Trigger a template download. | Request URL is strictly `https://dev.slidebee.pages.dev/api/download?id=...`. | [ ] |
| 4.3 | Check response headers. | `Content-Disposition: attachment; filename="..."`<br/>`Content-Type: application/vnd.openxmlformats...`<br/>`Cache-Control: private, no-cache, no-store`. | [ ] |
| 4.4 | Search all Network traffic for `pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev`. | Zero occurrences found for deliverable decks. Only public preview images may reference the CDN. | [ ] |
| 4.5 | Attempt to curl `/api/download` with an invalid ID: `curl https://dev.slidebee.pages.dev/api/download?id=INVALID`. | Returns `404 Not Found` with structured JSON error. **Never returns a fallback corporate deck (`accenture.pptx`).** | [ ] |

---

## 6. Workflow 5: Admin Panel & Storage Integrity Guard

### Objective
Verify that admin template creation and editing enforces server-side R2 file existence checks, preventing typos or broken file links from entering the database.

| Step | Action | Expected Result | Pass / Fail |
| :--- | :--- | :--- | :---: |
| 5.1 | Log in at `/login` with `admin@theslidebee.com` / `SlideBee@Admin2026!`. | Directs cleanly to `/admin/overview`. Displays Admin Studio navigation. | [ ] |
| 5.2 | Navigate to `/admin/templates`. | Template inventory loads with SKU badges, tier tags (Free vs Premium), and action buttons. | [ ] |
| 5.3 | Click "Edit Template" on an existing template. | Modal opens with pre-filled title, SKU, pricing, previews, and attached PPTX filename. | [ ] |
| 5.4 | Toggle Tier to "Free Community Deck". | Price fields automatically lock to ₹0 / $0. | [ ] |
| 5.5 | Upload a new `.pptx` presentation from local computer. | Progress indicator shows upload to Cloudflare R2. Displays green checkmark with filename. | [ ] |
| 5.6 | Click "Save Changes". | Server verifies file presence on R2 (`head` check) and commits to Cloudflare D1. Success toast displays. | [ ] |
| 5.7 | Check storefront for updated template. | Detail page immediately reflects changes. Download delivers the newly uploaded deck. | [ ] |

---

## 7. Workflow 6: Admin Dual Session vs Client Single Session Guard

### Objective
Ensure standard users are restricted to 1 active device session, while `admin@theslidebee.com` is permitted up to 2 concurrent sessions without displacement.

| Step | Action | Expected Result | Pass / Fail |
| :--- | :--- | :--- | :---: |
| 6.1 | Open Browser A (e.g. Chrome) and log in as `admin@theslidebee.com`. | Admin session active. Access to `/admin` granted. | [ ] |
| 6.2 | Open Browser B (e.g. Firefox or Incognito) and log in as `admin@theslidebee.com`. | Second admin session active. | [ ] |
| 6.3 | Return to Browser A and refresh or navigate between admin tabs. | **Browser A remains fully authenticated.** Neither session is logged out. | [ ] |
| 6.4 | Log in as a standard client user in Browser A. | Client dashboard loads. | [ ] |
| 6.5 | Log in as the same client user in Browser B. | Client session created in Browser B. | [ ] |
| 6.6 | Return to Browser A and refresh. | **Browser A session is displaced**, redirecting to login with message: *"Account accessed from another device."* | [ ] |

---

## 8. Workflow 7: Quote Intake Funnel & Department Email Routing

### Objective
Verify mandatory phone validation, deposit notice visibility, and automated email routing between design and e-commerce desks.

| Step | Action | Expected Result | Pass / Fail |
| :--- | :--- | :--- | :---: |
| 7.1 | Navigate to `/contact` or `/ordernow`. | Form loads with service picker, slide count/catalog inputs, and file upload fields. | [ ] |
| 7.2 | Check for Commercial Terms Notice. | Displays prominent badge: *"COMMERCIAL TERMS: 50% advance deposit is required upon brief sign-off to initiate work."* | [ ] |
| 7.3 | Attempt to submit the form without entering a Phone Number. | Browser HTML5 validation prevents submission and highlights phone field as required. | [ ] |
| 7.4 | Submit an **E-Commerce Store Launch** brief. | Success screen displays. Email notification is routed directly to `vizhalsuresh@gmail.com` (with admin backup). | [ ] |
| 7.5 | Submit an **Executive Presentation Design** brief. | Success screen displays. Email notification is routed directly to `design@theslidebee.com` (with admin backup). | [ ] |
| 7.6 | Open `/admin/inquiries` as Admin. | Both submitted briefs appear with customer details, phone number, and brief description. | [ ] |

---

## 9. QA Sign-Off Checklist

- [ ] All 7 core workflows tested and passed on `https://dev.slidebee.pages.dev`
- [ ] Confirmed zero unicode emojis across UI, code, and outgoing emails
- [ ] Deliverable files verified as genuine Master PowerPoint decks (.pptx)
- [ ] Cloudflare R2 bucket URLs verified as hidden behind `/api/download`
- [ ] No regression detected across mobile and desktop viewports
- [ ] Ready for final client handoff and production DNS transition
