# Workflow: Task Planning

Follow this procedure before modifying any files:

```text
1. Understand Requirements:
   - Identify inputs, expected outputs, and constraints.
   - Re-confirm zero unicode emojis rule and brand design system.

2. Identify Affected Modules:
   - Determine which domains are impacted (e.g. catalog, payments, storefront).

3. Identify Target Files:
   - List exact file paths to create or edit.

4. Evaluate Dependencies & Risks:
   - Assess breaking changes to database schemas, API contracts, or routing.
   - Verify backwards compatibility.

5. Form Atomic Execution Plan:
   - Break implementation into small, testable chunks.
   - Document plan in .agent/tasks/ACTIVE.md if task is non-trivial.
```
