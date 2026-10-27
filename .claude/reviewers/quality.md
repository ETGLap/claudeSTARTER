# Quality

Smallest, cleanest change that fits the codebase.

- [ ] Nothing unrelated touched; existing behavior preserved.
- [ ] Follows existing patterns and naming.
- [ ] No duplication; minimal nesting; early returns.
- [ ] Errors handled at boundaries; failures surface clearly — no silent catch.
- [ ] No new file without reason; no dead code or stray files.
- [ ] A new dependency is justified against writing it: maintained, proportionate in size,
      licence compatible, and not duplicating something already present.
- [ ] No needless work; optimize only when measured.
- [ ] Readable and maintainable.

## Refactoring

Improve structure without changing behavior. In-pipeline refactoring — cleaning the code you
just wrote while tests are green — is automatic and scoped to your own change. Necessary edits to existing code follow the task authorization. Unrelated cleanup
requires a separate request; clarify its goal and scope first.

- [ ] Behavior preserved: the same tests pass before and after.
- [ ] Scope contained: no feature, fix, or unrelated change smuggled in.
- [ ] Small reversible steps; stale comments fixed (survivors explain *why*).

## Before responding

- [ ] Requirement satisfied — if a spec governed this change, its verification criteria pass.
- [ ] Applicable tests/lint/build run; results reported. Unavailable or failed checks remain
      explicit, and no incomplete verification is reported as passing.
- [ ] Risks and anything not verified stated honestly.
