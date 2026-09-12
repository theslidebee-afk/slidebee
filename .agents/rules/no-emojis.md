# Strict Rule: No Emojis Anywhere

**Scope**: All source code, user interfaces, email templates, notifications, documentation, commit messages, and assistant responses across the entire SlideBee project.

---

## 1. Core Mandate

**Do NOT use unicode emojis anywhere in this project.**

This applies unconditionally to:
- Frontend user interfaces (buttons, banners, badges, alerts, toasts, placeholders, tooltips).
- Page headers, titles, descriptions, and metadata.
- Admin dashboard tabs, action buttons, status labels, and dropdowns.
- Transactional emails and notifications (Zoho Mail, Resend, WhatsApp templates).
- Console logs, error messages, and system alerts.
- Git commit messages and pull request descriptions.
- AI assistant chat responses, plans, and walkthroughs.

---

## 2. Approved Alternatives

SlideBee is an executive-level, bespoke presentation design agency serving Fortune 500 enterprises, venture capital firms, and high-growth leadership teams. Visuals must be refined, professional, and minimal.

Instead of emojis, always use:

| Instead of Emoji | Use Approved Solution | Example Code |
| :--- | :--- | :--- |
| Lock emoji | Lucide React `<Lock />` or `<ShieldCheck />` | `<Lock size={12} className="text-[#FCBF14]" />` |
| Lightning emoji | Lucide React `<Zap />` | `<Zap size={11} className="text-amber-600" />` |
| Checkmark emoji | Lucide React `<Check />` or clean text badge | `<Check size={12} className="text-emerald-600" />` |
| Star emoji | Lucide React `<Star />` | `<Star size={12} className="text-amber-500 fill-amber-500" />` |
| Sparkle / celebration | Lucide React `<Zap />`, `<Flame />`, or clean copy | `<Zap size={13} className="text-primary" />` |
| Arrow symbol | Lucide React `<ArrowRight />` | `<ArrowRight size={13} />` |
| Cross / close | Lucide React `<X />` | `<X size={14} className="text-red-500" />` |
| Bee emoji | Official `SlideBeeLogo` SVG component | `<SlideBeeLogo variant="light" size="sm" />` |
| Country flags | Standard ISO currency/country text | `USD ($)`, `INR (₹)` |
| Social icons | Clean inline SVG or Lucide brand icon | Standard SVG path |

---

## 3. Enforcement Checklist for Developers & AI Agents

Before committing code or deploying:
1. Run static checks for unicode emojis in `src/`.
2. Inspect all text strings inside `.tsx` and `.ts` files.
3. Verify that all notification copy in `src/lib/email.ts` and `src/config/whatsapp.ts` is clean of emoji characters.
4. Ensure assistant responses maintain an executive, objective tone without decorative emoji prefixes.
