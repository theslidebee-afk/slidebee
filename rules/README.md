# SlideBee Project Rules and Standards

This directory serves as the centralized, authoritative repository of design rules, architectural constraints, and engineering standards for the SlideBee platform.

All human developers and AI pair programmers working on this repository MUST consult and adhere to the guidelines documented here.

---

## Active Rule Index

| Rule File | Description | Status |
| :--- | :--- | :--- |
| [no-emojis.md](./no-emojis.md) | Strictly prohibits unicode emojis across UI, emails, code, and agent responses. Mandates Lucide SVG icons. | **Enforced** |
| [terminology-and-copywriting.md](./terminology-and-copywriting.md) | Differentiates internal technical jargon from executive client-facing language. | **Enforced** |
| [templates-and-deliverables.md](./templates-and-deliverables.md) | Exclusive .pptx format, single/spreadsheet upload rules, and metrics visibility toggles. | **Enforced** |
| [brand-and-design-system.md](./brand-and-design-system.md) | Color palette, typography, visual hierarchy, luxury aesthetic, and layout rules. | **Enforced** |
| [database-and-storage.md](./database-and-storage.md) | Supabase schema standards, CDN storage bucket usage, RLS policies, and asset conventions. | **Enforced** |
| [authentication-and-roles.md](./authentication-and-roles.md) | Auth flow, master PIN bypass, role permissions, client credits, and error handling. | **Enforced** |
| [future-rules-template.md](./future-rules-template.md) | Standardized template and procedure for documenting new rules. | **Template** |

---

## How to Add a New Rule

Whenever a new requirement, constraint, or design principle is established:
1. Copy the structure from [future-rules-template.md](./future-rules-template.md).
2. Create a new markdown file in `rules/<rule-name>.md`.
3. Add the rule to the index table in this `README.md`.
4. Mirror the rule in `.agents/rules/` and update `AGENTS.md` so AI coding assistants automatically enforce it during code generation.
