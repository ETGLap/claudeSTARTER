# Refactoring

Improve structure without changing behavior. Two modes:
- In-pipeline (automatic): the Refactor step of TDD — clean the code you just wrote while
  tests are green. Scope = your own change only.
- Standalone: pre-existing or unrelated code, on explicit request only — never unprompted;
  clarify goal/scope/risk if unclear.

- [ ] Behavior preserved: same tests pass before and after.
- [ ] Scope contained: no feature/fix/unrelated code smuggled in.
- [ ] Result meets `quality.md` gates; names clear; stale comments fixed (survivors
      explain *why*).
- [ ] Small reversible steps; any performance change measured and justified.
