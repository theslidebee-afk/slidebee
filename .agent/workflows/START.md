# Workflow: Session Start

Follow this procedure at the beginning of every AI coding session:

```text
1. Read Project Identity:
   - Read AGENTS.md
   - Read .agent/core/PROJECT.md

2. Read Current State:
   - Read .agent/memory/STATE.md
   - Check if an active task exists in .agent/tasks/ACTIVE.md

3. Identify Requested Task:
   - Analyze user prompt against existing features.
   - Clarify any ambiguous requirements before modifying code.

4. Load Only Relevant Context:
   - Load specific .agent/modules/<domain>.md files matching the task.
   - Do NOT load all files across the repository.

5. Inspect Implementation:
   - View relevant source files using view_file or targeted regex searches.
   - Confirm current implementation reality before planning changes.
```
