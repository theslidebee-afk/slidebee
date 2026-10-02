# Frontend Modification Skill

This skill provides the procedural checklist for making frontend changes to SlideBee.

---

## Procedure

1. **Verify Design System & Rules**:
   - Check `.agent/core/RULES.md`.
   - Confirm canvas is `#FFF9E8`, accent is `#FCBF14`, dark text is `#111111`, and font is **Manrope**.
   - Ensure strictly **zero unicode emojis** are used. Use Lucide React icons.

2. **Inspect Existing Component Hierarchy**:
   - Trace props, state hooks, and Framer Motion layout animations.
   - For marketplace grid cards: enforce CSS Grid (`grid grid-cols-...`), never CSS `columns-*`.

3. **Check Responsive Breakpoints**:
   - Verify layout on mobile (`sm:`, `<640px`), tablet (`md:`, `768px`), and desktop (`lg:`, `1024px`, `xl:`, `1280px`).
   - Ensure touch targets are at least 44px on mobile devices.

4. **Preserve SEO & Metadata**:
   - If adding or updating a page, integrate `usePageSEO` hook with title, description, canonical URL, and Open Graph tags.

5. **Verify Build & Types**:
   - Run `npm run build` (`tsc -b && vite build`) to confirm zero TypeScript or JSX syntax errors.
