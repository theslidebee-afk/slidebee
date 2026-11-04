# Workflow: Verification & Testing

Follow this procedure after completing code edits:

```text
1. TypeScript Compilation:
   - Run `npm run build` (`tsc -b && vite build`).
   - Must exit with code 0 without type or bundling errors.

2. Linting:
   - Run `npm run lint` (`oxlint`).
   - Ensure clean code standards.

3. Functional Verification:
   - Check rendered DOM, event handlers, and responsive states.
   - Verify network calls and API payloads where applicable.

4. Security & Safety Check:
   - Ensure no credentials or keys are exposed.
   - Confirm RLS policies or session guards protect new endpoints.

5. Zero-Emoji Scan:
   - Verify no unicode emojis were introduced.
```
