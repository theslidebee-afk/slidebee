# SlideBee — Engineering Directives & Rules

All AI agents and developers working in this repository must strictly adhere to these rules without exception.

---

## 1. Zero Unicode Emojis (MANDATORY)

- **Rule**: Never use unicode emojis anywhere in this project.
- **Scope**:
  - React components & JSX text strings
  - HTML attributes, titles, placeholders, and tooltips
  - Code comments and JSDoc blocks
  - Console logs and debug messages
  - Transactional emails and notifications
  - Git commit messages
  - Agent chat responses and summaries
- **Alternative**: Always use Lucide React SVG icons (`<Zap />`, `<Lock />`, `<Check />`, `<Crown />`, `<Star />`, `<ArrowRight />`, etc.) or clean typographic tags.

---

## 2. Brand Identity & Design System

- **Color Palette**:
  - Primary Canvas: `#FFF9E8` (Warm Milk Cream)
  - Honey Accent: `#FCBF14` (Honey Gold)
  - Primary Amber: `#D99B00`
  - Text & Charcoal: `#111111`
  - Card Highlights: `#FFFDF5` / `#FFFFFF`
  - Subtle Borders: `#111111]/10` or `#FCBF14]/40`
- **Background Patterns**: Use `.large-hex-grid` on page wrappers.
- **Typography**: The **Manrope** font family must be used for all headings, body text, buttons, and badges. Do NOT import conflicting external fonts.
- **Tone**: High-end presentation studio aesthetic. Avoid playful, cartoonish, or cluttered visual elements.

---

## 3. Git & Branch Discipline

- **Active Branch**: Development takes place on branch `dev`.
- **Main Branch**: Never push or commit directly to `main` without verification on `dev`.
- **Commit Messages**: Follow conventional commits (e.g. `feat(catalog): ...`, `fix(hero): ...`) with ZERO unicode emojis.

---

## 4. Database & Storage Architecture (Cloudflare D1 & R2)

- **Client Imports**: Always import `{ d1 }` from `src/lib/d1`. Use native edge database clients.
- **Storage CDNs**: Presentation previews and Master PowerPoint (`.pptx`) decks must use Cloudflare R2 CDN URLs (`https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev`).
- **No Destructive Operations**: Do NOT alter table schemas or drop columns without explicit user sign-off.

---

## 5. Verification Protocol

- Before concluding any task or committing changes, verify the TypeScript build:
  ```bash
  npm run build
  ```
  Both `tsc -b` and `vite build` must exit with code 0.
- Verify that no lint errors are introduced (`npm run lint`).
- Maintain documentation integrity: do not delete existing comments, types, or docstrings unless explicitly asked.

---

## 6. Admin Authentication Rules

- Valid admin email addresses: `admin@theslidebee.com` and `admin@slidebee.com`.
- Never show "No registered account found" for admin emails.
- Never hardcode production secrets or tokens in documentation or client-side bundles.
