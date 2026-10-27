# 0001 — Reliable, proportional Conductor workflows

Status: implemented
Classification: behavior-changing refactor
Approval: user requested implementation of the preceding audit recommendations on 2026-09-15.
Related: [[architecture]]

## 1. Outcomes

- Test results are never reused merely because Git reports the same modified filenames.
- Independent projects and sessions do not share retry counters.
- Failed checks are visible; placeholder environment examples can be maintained.
- Claude and Codex use one maintained implementation and consistent workflow guidance.
- Small tasks require less repeated context and ceremony without weaker verification.

## 2. Scope boundaries

In: hook fixes and regression coverage; concise instructions; task-sized workflows;
Codex adapters; validation, version/upgrade guidance, and a cost-measurement baseline.
Out: new MCPs, paid model experiments, new specialist roles, application scaffolding,
repository commits/pushes, and a universal shell parser or security sandbox.

## 3. Constraints

Zero runtime dependencies. Preserve existing files and the blank portable context template.
Changes must be testable without modifying the real kit configuration or session state.
Hook protection is limited to supported events and input shapes. Cached tests are opt-in;
external services, ignored files and environment-dependent suites need caching disabled.

## 4. Prior decisions

The canonical kit is `.claude/`. Reuse its pure decision functions, hook JSON envelopes,
seven read-only agents, twelve skills, and Node test runner. See [[architecture]].

## 5. Task breakdown

- Reliable content-aware cache, session-scoped retries and visible failure recovery.
- Working formatter checks, placeholder examples, and targeted shell guard coverage.
- Bounded session context, isolated host fixtures, and integration tests.
- Shared platform adapters and automated wiring/drift validation.
- Proportional SDD/TDD, consistent documentation and commit rules, smaller core context.
- Starter documentation, upgrade contract and repeatable cost comparison procedure.

## 6. Verification criteria

- [x] Repeated tracked/untracked edits and changed commands rerun configured tests — automated.
- [x] Separate projects/sessions, failure recovery and retry exhaustion are isolated — automated.
- [x] Real formatter success/failure and divergent working directories are exercised — automated.
- [x] Example files pass; real secret paths and supported risky commands remain guarded — automated.
- [x] Codex patch payloads and supported output envelopes reach the shared logic — automated.
- [x] Context is bounded and repeated unchanged state is quiet within a session — automated.
- [x] Imports, hook paths, generated adapters and kit configuration validate in CI — automated.
- [x] Core instructions are smaller; policies and platform limitations match code — review.
- [x] A clean copied host fixture passes smoke tests; real interactive harness behavior is
      reported separately — automated / manual.

## Verification evidence

- 100 automated tests passed on the local macOS Node 22 runtime.
- Regression tests first reproduced unsafe caching, path collisions, formatter failures,
  configuration/payload failures, guard gaps and missing adapter behavior before fixes.
- Isolated copied-host smoke tests exercised actual generated Codex commands from a nested
  directory, including a protected patch and a configured failing test gate.
- Wiring/import/resource/budget checks and Codex TOML parsing passed; adapters match sources.
- Core instruction text: 20,258 → 5,433 characters, about 73% smaller (not a billing claim).
- Independent hook and documentation reviews were completed and their findings addressed.
- Not verified: interactive Claude/Codex hook loading/trust and native desktop notifications;
  remote CI has not run. No paid model benchmark or MCP integration was part of this scope.
