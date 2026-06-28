# Hook: before-edit

Before writing or editing code.

- Understand the request and expected behavior.
- Judge task effort; recommend a cheaper model if warranted (`checklists/model-policy.md`).
- Inspect relevant files and existing patterns.
- For new code, apply `agents/architecture-guardian`: reuse or extend before creating (`checklists/architecture-gates.md`).
- Check root + nearest local `CLAUDE.md`.
- Identify the test needed first.
- Apply `agents/tdd-engineer`.
- If the task is a refactor, also apply `agents/refactoring-expert` (behavior-preserving; ensure a test safety net first).
- Plan smallest safe change. Avoid unrelated edits.
