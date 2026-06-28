# /refactor

Apply `agents/refactoring-expert` to the named target as a behavior-preserving refactor.
Refactoring is opt-in — run only when explicitly requested.

- Proceed directly when the refactor is trivial and well-scoped; otherwise ask one focused
  question (goal, scope, behavior to preserve, risk) before editing.
- Confirm a test safety net first; if missing, add characterization tests or document
  manual verification (`agents/tdd-engineer`).
- Improve code, comments, and structure; change behavior in zero ways. For performance
  work, question whether it's measured and worth the behavior risk before optimizing.
- Keep scope to the target; no features or fixes. Work in small, reversible steps.
- Gate with `checklists/refactoring-gates.md`. Run tests before and after; read the output.
