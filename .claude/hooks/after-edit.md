# Hook: after-edit

After files are changed.

- Review changed files.
- Run or identify the relevant tests.
- Run lint/build if available; read output.
- Apply `agents/quality-reviewer`.
- Apply `agents/security-reviewer`.
- Remove dead/unnecessary code.
- Document what was verified and what was not.
- If a feature was added or changed, consider `/docs-update` (suggest, don't auto-run).
