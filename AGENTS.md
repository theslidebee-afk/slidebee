# SlideBee — AI Agent Developer Entrypoint & Protocol

Welcome to the SlideBee codebase. SlideBee is a high-end executive presentation design studio and curated template marketplace for PowerPoint (.pptx) and Google Slides.

This file is the single primary entrypoint for all AI coding agents working on this repository.

---

## 1. Persistent Context System Map

All persistent memory and domain context live in `.agent/` and `docs/`:

```text
.agent/
├── core/
│   ├── PROJECT.md          # Business model, goals, existing vs planned features
│   ├── RULES.md            # Mandatory engineering and brand rules (Zero emojis, etc.)
│   ├── ARCHITECTURE.md     # Full stack data flow, components, serverless routes
│   └── GLOSSARY.md         # Domain and architectural vocabulary
├── memory/
│   ├── STATE.md            # High-signal snapshot of current project status
│   ├── DECISIONS.md        # Architectural Decision Records (ADRs)
│   ├── LEARNINGS.md        # Technical discoveries and edge-case insights
│   └── HANDOFF.md          # Session-to-session baton pass
├── tasks/
│   ├── INDEX.md            # Master task catalog
│   ├── ACTIVE.md           # Currently ongoing task
│   ├── BACKLOG.md          # Verified pending tasks (no invented items)
│   ├── COMPLETED.md        # Verified finished tasks
│   └── BLOCKED.md          # Items waiting on external input or decisions
├── modules/                # Deep technical dossiers for each domain
│   ├── storefront.md
│   ├── catalog.md
│   ├── authentication.md
│   ├── cart.md
│   ├── checkout.md
│   ├── payments.md
│   ├── orders.md
│   ├── downloads.md
│   ├── subscriptions.md
│   └── admin.md
├── skills/                 # Procedural checklists for modifications
│   ├── frontend/SKILL.md
│   ├── database/SKILL.md
│   ├── security/SKILL.md
│   ├── testing/SKILL.md
│   └── deployment/SKILL.md
└── workflows/              # Step-by-step agent lifecycle protocols
    ├── START.md
    ├── PLAN.md
    ├── IMPLEMENT.md
    ├── VERIFY.md
    └── HANDOFF.md

docs/
└── DATABASE.md             # Complete Cloudflare D1 schema, tables, and R2 storage specs
```

---

## 2. Core Agent Protocol & Lifecycle

Do NOT load the entire repository or all documentation at once. Follow this lean, high-signal sequence:

```text
1. START:
   Read AGENTS.md -> Read .agent/core/PROJECT.md -> Read .agent/memory/STATE.md

2. TARGET CONTEXT:
   Identify user request -> Read relevant .agent/modules/*.md -> Check .agent/tasks/ACTIVE.md

3. PLAN:
   Inspect source code -> Check .agent/skills/ -> Form clear atomic plan

4. IMPLEMENT:
   Make smallest coherent changes -> Follow existing patterns -> Never refactor unrelated code

5. VERIFY:
   Run `npm run build` (`tsc -b && vite build`) -> Test functionality -> Verify zero emojis

6. HANDOFF:
   Update .agent/memory/STATE.md -> Update .agent/tasks/ -> Record in .agent/memory/HANDOFF.md
```

---

## 3. Strict Project Rules

1. **ZERO UNICODE EMOJIS**:
   - Absolutely NO unicode emojis in code, UI strings, comments, commit messages, or chat responses.
   - Always use Lucide React SVG icons (`<Zap />`, `<Check />`, `<Crown />`, etc.).
   - Full details in `.agent/core/RULES.md`.

2. **BRAND PALETTE & TYPOGRAPHY**:
   - Canvas: `#FFF9E8` (Warm Milk Cream) with `.large-hex-grid`
   - Accents: `#FCBF14` (Honey Gold), `#D99B00` (Primary Amber)
   - Dark surfaces / text: `#111111` (Deep Charcoal)
   - Typography: **Manrope** font family universally.

3. **BRANCH DISCIPLINE**:
   - Working branch is `dev`. Never commit or push directly to `main`.

4. **DATABASE & STORAGE ARCHITECTURE**:
   - **Database**: Cloudflare D1 SQLite (`binding = "DB"`, `slidebee-db`) queried via `src/lib/d1.ts` and `/api/data`.
   - **Storage**: Cloudflare R2 (`slidebee` bucket, `pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev`).
   - **Zero Vendor Lock-in**: 100% serverless Cloudflare native stack.

5. **ADMIN AUTHENTICATION**:
   - Admin access is strictly granted only to `admin@theslidebee.com` with password `SlideBee@Admin2026!`.
   - Never display "No registered account found" for the valid admin account.
