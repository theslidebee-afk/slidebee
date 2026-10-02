# Deployment Skill

This skill outlines the procedures for building and deploying SlideBee to Cloudflare Pages.

---

## Procedure

1. **Verify Clean Git Status**:
   - Confirm current working branch is `dev`:
     ```bash
     git status
     ```
   - Never deploy uncommitted or unverified changes.

2. **Execute Full Production Build**:
   - Run:
     ```bash
     npm run build
     ```
   - Ensure the `dist/` directory is generated with `index.html`, assets, and functions intact.

3. **Deploy to Staging Preview (Branch `dev`)**:
   - Run:
     ```bash
     npx wrangler pages deploy dist --project-name slidebee --branch dev
     ```
   - Verify deployment output URL (`https://dev.slidebee.pages.dev`).

4. **Smoke Test Staging Environment**:
   - Verify homepage loads with 3D hero video and template grid.
   - Test search bar focus and curtain lift.
   - Confirm routing operates on clean HTML5 paths without 404s.
