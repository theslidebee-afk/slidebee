# 🐝 SlideBee — Complete Zoho Mail Setup & User Management Guide

This document is the official, step-by-step guide for configuring mailboxes, aliases, user accounts, and spam-proof security on **`theslidebee.com`** via **Zoho Mail**.

---

## 📋 Table of Contents
1. [Initial Setup: Primary Super Admin Account](#1-initial-setup-primary-super-admin-account)
2. [Creating Additional User Mailboxes](#2-creating-additional-user-mailboxes)
3. [Setting Up Email Aliases & Group Inboxes (Free Tier Hack)](#3-setting-up-email-aliases--group-inboxes-free-tier-hack)
4. [DNS Security Mapping: SPF, MX & DKIM Setup](#4-dns-security-mapping-spf-mx--dkim-setup)
5. [Website & Backend SMTP Integration](#5-website--backend-smtp-integration)
6. [Accessing Email on Web & Mobile Apps](#6-accessing-email-on-web--mobile-apps)

---

## 1. Initial Setup: Primary Super Admin Account

Immediately after domain verification succeeds in Zoho:

1. **Create Organization Admin User**:
   - Enter your preferred username (e.g. `admin` or your first name).
   - Email address created: **`admin@theslidebee.com`** (or `hello@theslidebee.com`).
   - Set a strong password and save it in a secure password manager.
2. Click **Proceed to Setup Users** (or **Setup Groups**).

---

## 2. Creating Additional User Mailboxes

Zoho Mail's Forever Free plan gives you **up to 5 free user mailboxes** (5GB storage each):

### Recommended Mailbox Distribution:
| Mailbox Address | User / Role | Purpose |
| :--- | :--- | :--- |
| **`hello@theslidebee.com`** | Primary Team / Intake | Main point of contact for clients, template questions, and lead forms. |
| **`design@theslidebee.com`** | Design Department | Client slide assets, revisions, and deliverable handoffs. |
| **`billing@theslidebee.com`** | Accounts & Finance | Razorpay receipts, invoices, and accounting. |
| **`founder@theslidebee.com`** | Executive / Personal | Personal business correspondence and partnerships. |

### Steps to Add Users:
1. Open the [Zoho Mail Admin Console](https://mailadmin.zoho.in/).
2. In the left sidebar, click **Users** ➔ Click the **Add User** (or `+`) button.
3. Fill in:
   - **First Name & Last Name**
   - **Email Address**: (e.g., `design` `@theslidebee.com`)
   - **Password**: Create a temporary password (the user can change it upon first login).
4. Click **Add**.

---

## 3. Setting Up Email Aliases & Group Inboxes (Free Tier Hack)

> [!TIP]
> **Don't waste separate user seats on generic addresses!**  
> You can create unlimited **Email Aliases** pointing to a single inbox for free. For example, emails sent to `contact@theslidebee.com`, `support@theslidebee.com`, and `info@theslidebee.com` can all land in your main `hello@theslidebee.com` inbox!

### How to Add Email Aliases:
1. In the Zoho Admin Console, go to **Users**.
2. Click on the user you want to add aliases for (e.g., `hello@theslidebee.com`).
3. Click **Mail Settings** ➔ **Email Aliases**.
4. Click **Add New Alias** and type:
   - `contact` (creates `contact@theslidebee.com`)
   - `info` (creates `info@theslidebee.com`)
   - `support` (creates `support@theslidebee.com`)
   - `quote` (creates `quote@theslidebee.com`)
5. Click **Save**.

---

## 4. DNS Security Mapping: SPF, MX & DKIM Setup

Your DNS records on Cloudflare ensure emails are delivered directly to user inboxes (and never spam).

### A. Records Already Configured in Cloudflare ✅:
- **MX 1**: `theslidebee.com` ➔ `mx.zoho.in` (Priority: 10)
- **MX 2**: `theslidebee.com` ➔ `mx2.zoho.in` (Priority: 20)
- **MX 3**: `theslidebee.com` ➔ `mx3.zoho.in` (Priority: 50)
- **SPF**: `theslidebee.com` ➔ `v=spf1 include:zoho.in ~all`

### B. Configuring DKIM (DomainKeys Identified Mail):
DKIM adds a cryptographic signature to every email sent from `theslidebee.com` so Gmail, Apple Mail, and Outlook mark your emails as 100% trusted.

1. In Zoho Admin Console, go to **DNS Mapping** (or **Email Configuration** ➔ **DKIM**).
2. Click **Add Selector**:
   - **Selector Name**: `zmail`
3. Zoho will generate a long TXT value starting with `v=DKIM1; k=rsa; p=MIGfMA...`.
4. Copy that value, open Cloudflare DNS, and add:
   - **Type**: `TXT`
   - **Name**: `zmail._domainkey`
   - **Content**: *(Paste the long key from Zoho)*
   - **TTL**: Auto
5. Click **Verify** in Zoho and toggle the selector to **Active**.

---

## 5. Website & Backend SMTP Integration

To allow the SlideBee website (e.g., `/ordernow` form submissions or template purchase receipts) to send automated emails directly from `hello@theslidebee.com`:

### SMTP Credentials for Code:
- **SMTP Host**: `smtppro.zoho.in` (or `smtp.zoho.in`)
- **Port**: `465` (SSL) or `587` (TLS)
- **Username**: `hello@theslidebee.com`
- **Password**: *Zoho App Password* (see below)

### How to Generate a Zoho App Password (for backend security):
1. Log into `hello@theslidebee.com` at [accounts.zoho.in](https://accounts.zoho.in/).
2. Go to **Security** ➔ **App Passwords** ➔ Click **Generate New Password**.
3. Name it `SlideBee Website Backend`.
4. Copy the generated 16-character password and store it in `.env` as `ZOHO_SMTP_PASSWORD`.

---

## 6. Accessing Email on Web & Mobile Apps

### Web Access:
- **URL**: [https://mail.zoho.in](https://mail.zoho.in)
- **Login**: `yourname@theslidebee.com` + your password.

### Mobile Apps (Instant Lead Alerts):
Download the official **Zoho Mail** app for iOS and Android:
- [Zoho Mail on Apple App Store](https://apps.apple.com/app/zoho-mail-email-and-calendar/id909262651)
- [Zoho Mail on Google Play Store](https://play.google.com/store/apps/details?id=com.zoho.mail)

Log in with your `@theslidebee.com` credentials to receive instant push notifications on your phone whenever a client requests a design quote or buys a template!

---

*Document compiled exclusively for the SlideBee Production Team.*
