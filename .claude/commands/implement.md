---
description: Implement an approved spec via TDD
argument-hint: [spec]
---

# /implement

Build an approved spec through the full pipeline. TDD is embedded — there is no separate
/tdd command; the spec's verification criteria become the failing tests.

1. Select — with `$ARGUMENTS`: resolve the spec by number or slug in `docs-vault/specs/`.
   Without: list specs with `Status: approved`, ask which. Refuse `draft` (offer to run the
   `reviewers/spec.md` gate first); warn before re-running an `implemented` one.
2. Context — `CLAUDE.md` · `context/project-context.md` · the spec · its linked prior
   decisions and ADRs.
3. Baseline — run existing tests green before touching code (`reviewers/tdd.md`).
4. Red — derive failing tests from the spec's §6 verification criteria: automated ones
   become tests; manual/acceptance ones are noted for the report.
5. Green — smallest change that passes; reuse before create (`reviewers/architecture.md`).
6. Refactor — your own change only, tests stay green (`reviewers/refactoring.md`).
7. Review — always: quality · security · architecture. By classification: performance
   (hot paths/data volume) · accessibility (UI-facing) · compatibility (multi-platform) ·
   documentation (behavior/interfaces changed).
8. Finish — final gate (`reviewers/final.md`) · propose `/docs` · mark the spec
   `Status: implemented` and check off its verification criteria · report: changed ·
   tested · not verified · risks.
