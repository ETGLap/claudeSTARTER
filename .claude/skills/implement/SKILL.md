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
2. Context — the CLAUDE.md files (kit `.claude/CLAUDE.md` + project root) ·
   `.claude/context/project-context.md` · the spec · its linked prior decisions and ADRs.
3. Baseline — run existing tests green before touching code.
4. Red — delegate test-landscape discovery to the `test-auditor` agent (reusable fixtures,
   patterns, placement), then derive failing tests from the spec's §6 verification
   criteria: automated ones become tests; manual/acceptance ones are noted for the report.
5. Green — smallest change that passes; reuse before create.
6. Refactor — your own change only, tests stay green.
7. Review — always: quality · security · architecture. By classification, invoke the
   matching scope-gated skill: `review-performance` (hot paths/data volume) ·
   `review-accessibility` (UI-facing) · `review-compatibility` (multi-platform) ·
   `review-documentation` (behavior/interfaces changed).
8. Finish — final gate · propose `/docs` · mark the spec `Status: implemented` and check
   off its verification criteria · report: changed · tested · not verified · risks.
