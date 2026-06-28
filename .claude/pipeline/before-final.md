# Pipeline: before-final

Layers 11, 13, 14. Before the final response.

- Final check (`reviewers/final.md`); confirm tests/lint/build results.
- If behavior or interfaces changed, propose `/docs` (propose, don't auto-write).
- If the change altered stack/commands/architecture/deps, flag stale `project-context.md`.
- Report: changed · tested · not verified · risks. Keep it short and honest.
