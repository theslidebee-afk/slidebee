# SlideBee Repository Agent Directives & Rules

This project enforces strict development standards across all code generation and pair-programming tasks.

## Mandatory Rules

1. **NO EMOJIS ANYWHERE**:
   - Do NOT use unicode emojis in any UI elements, text strings, emails, commit messages, or chat responses.
   - Use clean Lucide React SVG icons (`<Lock />`, `<Zap />`, `<Check />`, `<Star />`, `<ArrowRight />`, `<ShieldCheck />`, etc.) or clean text badges instead.
   - Consult `rules/no-emojis.md` for full specification.

2. **BRAND DESIGN SYSTEM**:
   - Primary light canvas: `#FFF9E8` (Warm Milk Cream)
   - Accents: `#FCBF14` (Honey Gold), `#D99B00` (Primary Amber)
   - Text & Dark surfaces: `#111111` (Deep Charcoal)
   - Maintain high-end presentation studio aesthetic. No cartoonish or noisy visual elements.
   - Consult `rules/brand-and-design-system.md`.

3. **SUPABASE STORAGE & DATA**:
   - All presentation assets and slide previews must use full Supabase Storage CDN URLs from the `examples` bucket.
   - Dynamic marketing content must read from `site_config`.
   - Consult `rules/database-and-storage.md`.

4. **ADMIN AUTHENTICATION**:
   - Never show "No registered account found" for admin emails.
   - Support admin logins with `admin@theslidebee.com` and `admin@slidebee.com` and master PIN `2026`.
   - Consult `rules/authentication-and-roles.md`.

5. **ADDING FUTURE RULES**:
   - Document new rules in `rules/<rule-name>.md` following `rules/future-rules-template.md` and update `rules/README.md`.
