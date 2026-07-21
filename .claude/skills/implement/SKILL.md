---
name: implement
description: Build an approved spec through the full TDD pipeline — the spec's verification criteria become the failing tests. Use when the user asks to build, implement, or start work on a spec that already exists in docs-vault/specs/.
when_to_use: An approved spec exists and the user wants it built. Trigger phrases: "implement the spec", "build 0004", "let's do the checkout spec", "start on that feature".
argument-hint: [spec-number-or-slug]
---

# /implement

Build an approved spec through the full pipeline. TDD is embedded — there is no separate
/tdd command; the spec's verification criteria become the failing tests.

1. Select — with `$ARGUMENTS`: resolve the spec by number or slug in `docs-vault/specs/`.
   Without: list specs with `Status: approved`, ask which. Refuse `draft` (offer to run the
   Spec gate first); warn before re-running an `implemented` one.
   If the injected context flags this spec as written in the current session, say so and
   recommend `/clear` first — the fresh-session test only means something in a fresh
   session. Proceed if the user declines, and note it in the final report.
2. Context — deliberately narrow: the spec, the CLAUDE.md files (kit `.claude/CLAUDE.md` +
   project root), `.claude/context/project-context.md`, and the spec's linked prior
   decisions and ADRs. Nothing else. If the spec is ambiguous, that is a spec defect, not
   something to resolve by guessing — ask, then fix the spec.
3. Baseline — run existing tests green before touching code.
4. Red — delegate test-landscape discovery to the `test-auditor` agent (reusable fixtures,
   patterns, placement), then derive failing tests from the spec's §6 verification
   criteria: automated ones become tests; manual/acceptance ones are noted for the report.
   Expected values come from the spec, never from running the code. Run them, show the
   failure, then commit **the test files only**:
   `git commit -m "test: <behavior> (red)"` — git is the record that test-first happened.
5. Green — smallest change that passes; reuse before create. A red test is fixed in the
   implementation, never by weakening the test. Commit when green.
6. Refactor — your own change only, tests stay green.
7. Review — always: quality · security · architecture. By classification, invoke the
   matching scope-gated skill: `review-performance` (hot paths/data volume) ·
   `review-accessibility` (UI-facing) · `review-compatibility` (multi-platform) ·
   `review-documentation` (behavior/interfaces changed).
8. Finish — final gate · propose `/docs` · mark the spec `Status: implemented` and check
   off its verification criteria · report: changed · tested · not verified · risks.
   Report every gap the spec had — ambiguous terms, missing data details, undefined edge
   cases, assumed knowledge of existing code. Each one is a spec defect the fresh session
   exposed; fix the spec, and say what it was missing.

This is the only workflow in the kit that commits on its own, and only for the Red and
Green steps described above.
