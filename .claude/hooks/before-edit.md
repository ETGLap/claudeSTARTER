# Hook: before-edit

Before writing or editing code.

- Understand the request and expected behavior.
- Judge task effort; recommend a cheaper model if warranted (`checklists/model-policy.md`).
- Inspect relevant files and existing patterns.
- Check root + nearest local `CLAUDE.md`.
- Identify the test needed first.
- Apply `agents/tdd-engineer`.
- Plan smallest safe change. Avoid unrelated edits.
