# /reuse

Reuse-first discovery before building. Apply `agents/architecture-guardian` to find what
already exists to reuse or extend, so new code is the last resort.

- Search four layers — logic, UI components, UX patterns, structure — for equivalents. On a
  large codebase, search via a read-only `Explore` subagent.
- Read `docs-vault/architecture.md` ("Shared building blocks") first if present, then verify
  against code.
- Report options: reuse · extend · promote-to-shared · justified-new — each with target
  file(s) and why.
- Gate with `checklists/architecture-gates.md`. Recommend, don't auto-edit; promotion goes
  through `/refactor`.
