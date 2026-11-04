# Workflow: Session Handoff

Follow this procedure before ending an AI coding session:

```text
1. Update Task Management:
   - Mark finished task as COMPLETED in .agent/tasks/INDEX.md and .agent/tasks/COMPLETED.md.
   - Clear .agent/tasks/ACTIVE.md.

2. Update Project Memory:
   - Update .agent/memory/STATE.md with new completed features or changes.
   - Record significant decisions in .agent/memory/DECISIONS.md.
   - Record technical edge cases in .agent/memory/LEARNINGS.md.

3. Prepare Handoff Document:
   - Fill out .agent/memory/HANDOFF.md with:
     * Current task summary
     * What was done
     * What was verified
     * What remains
     * Known issues
     * Recommended next action
```
