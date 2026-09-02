# SlideBee Domain & Zoho Custom Email Setup Guide

This guide walks you through acquiring the domain name for SlideBee and setting up professional custom email (`hello@theslidebee.com` / `contact@slidebee.in`) with 100% free forever hosting via Zoho Workplace.

---

## 1. Domain Registration Options

### Recommended Domain Names:
1. `theslidebee.com` (Global credibility, universal standard)
2. `slidebee.in` (Direct, clean, cost-effective for India & global operations)
3. `slidebee.co` / `slidebee.design`

### Where to Buy:
- **Option A (Recommended): Cloudflare Registrar**
  - **Price**: ~$9.77/year (at wholesale cost, zero markup, free WHOIS privacy & SSL).
  - **Steps**:
    1. Create account on [Cloudflare](https://dash.cloudflare.com/sign-up).
    2. Go to **Domain Registration** ➔ **Register Domain**.
    3. Search `theslidebee.com` and checkout.
- **Option B: Hostinger or Namecheap**
  - **Price**: ₹499 - ₹899/year.
  - Useful if buying `.in` TLDs directly with UPI.

---

## 2. Setting Up Free Zoho Custom Email (`hello@theslidebee.com`)

Zoho provides the **Forever Free Plan** for up to 5 custom domain mailboxes (5GB storage per user) with webmail and mobile app access.

### Step 1: Sign up for Zoho Mail
1. Visit [Zoho Mail Forever Free Plan](https://www.zoho.com/mail/zohomail-pricing.html) (Scroll to the bottom of pricing table and click **Sign Up** under "Forever Free Plan").
2. Enter your domain name (`theslidebee.com` or `slidebee.in`).
3. Set your primary admin address: `admin@theslidebee.com` or `hello@theslidebee.com`.

### Step 2: Add DNS Records to Cloudflare / Domain Registrar
In your Cloudflare DNS Management dashboard, add the following 4 records:

| Type | Name / Host | Value / Target | Priority |
| :--- | :--- | :--- | :--- |
| **TXT** | `@` | `zoho-verification=zbXXXXXXXX.zmverify.zoho.com` | - |
| **MX** | `@` | `mx.zoho.in` (or `mx.zoho.com`) | `10` |
| **MX** | `@` | `mx2.zoho.in` (or `mx2.zoho.com`) | `20` |
| **MX** | `@` | `mx3.zoho.in` (or `mx3.zoho.com`) | `50` |
| **TXT (SPF)** | `@` | `v=spf1 include:zoho.in ~all` | - |
| **TXT (DKIM)** | `zoho._domainkey` | *Generated in Zoho Mail Admin Console* | - |

---

## 3. Connecting Custom Domain to Cloudflare Pages

Once `theslidebee.com` is registered in Cloudflare:
1. Go to **Cloudflare Dashboard** ➔ **Workers & Pages**.
2. Click your project (`xyztemplates`).
3. Go to **Custom Domains** tab ➔ **Set up a custom domain**.
4. Enter `theslidebee.com` (and `www.theslidebee.com`).
5. Cloudflare will automatically configure the SSL certificate and point the site live within 60 seconds!
