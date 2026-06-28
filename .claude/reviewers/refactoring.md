# Refactoring

Improve structure without changing behavior. Two modes:
- In-pipeline (automatic): clean the code you just wrote, while tests are green — the
  Refactor step of TDD. Scope = your own change only.
- Standalone (opt-in): pre-existing or unrelated code, only on an explicit request —
  never unprompted; clarify goal/scope/risk if unclear.

- [ ] Behavior preserved: same tests pass before and after.
- [ ] Scope contained: only the target; no feature/fix/unrelated code smuggled in.
- [ ] Duplication removed; logic simplified; nesting reduced; early returns.
- [ ] Names clear and consistent; stale comments fixed; survivors explain *why*.
- [ ] No dead code or stray files; small reversible steps.
- [ ] Any performance change is measured and its behavior risk justified.
