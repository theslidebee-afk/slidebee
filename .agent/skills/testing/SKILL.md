# Testing & Verification Skill

This skill defines the verification checklist for confirming codebase integrity.

---

## Procedure

1. **Static Type Checking**:
   - Run:
     ```bash
     npx tsc -b
     ```
   - Must exit with code 0. Resolve all type mismatches, missing props, or invalid imports.

2. **Bundle Build Verification**:
   - Run:
     ```bash
     npm run build
     ```
   - Validates that Vite can bundle all assets, dynamic imports, and CSS modules without runtime errors.

3. **Lint Verification**:
   - Run:
     ```bash
     npm run lint
     ```
   - Ensures oxlint standards and rules are adhered to.

4. **Zero-Emoji Check**:
   - Verify that no unicode emojis were introduced into any modified file or commit message.
