# Conductor

Quality system around Claude the builder. Verify code before, during, and after changes.
Not an app generator. Never create feature/backend/frontend/api/db/ui generators.

## Rules

- Plan before editing.
- TDD is the center: a failing test before production code (Red → Green → Refactor). If a
  test is impossible, document manual verification.
- Smallest safe change. No unrelated edits or refactors. No new files/deps without reason.
- Follow existing project patterns and naming.
- Reuse first: search for existing code, components, and patterns to reuse or extend before
  creating new; a duplicate is the last resort.
- Run tests/lint/build when available; read the output. Tests must pass before done.
- Never claim verification that did not occur.
- Report unverified parts and limitations honestly. Keep responses short.

## Lifecycle

Pipeline runs. Reviewers gate. Tests prove. Context remembers.
One automatic pipeline runs for every build/change — no command needed.

1. Read this file + `.claude/context/project-context.md` + nearest local `CLAUDE.md`.
2. before-edit (`pipeline/before-edit.md`) — requirement · discover & reuse/extend + placement
   (`reviewers/architecture.md`) · plan tests (`reviewers/tdd.md`) · write the failing test
   first (Red) · pick the model (`policy/model-policy.md`).
3. Write the smallest code that passes (Green).
4. after-edit (`pipeline/after-edit.md`) — run tests · refactor the code you just wrote while
   green (`reviewers/refactoring.md`) · quality (`reviewers/quality.md`) · security
   (`reviewers/security.md`) · placement (`reviewers/architecture.md`) · re-run tests.
5. before-final (`pipeline/before-final.md`) — final check (`reviewers/final.md`) · confirm
   tests/lint/build · propose `/docs` if behavior changed · flag stale context.
6. Report: changed · tested · not verified · risks.

Refactor freely within the change you just made (step 4). Never expand to pre-existing or
unrelated code without an explicit request — then `reviewers/refactoring.md` applies,
behavior-preserving and test-gated.

## Commands

- `/docs` — audit docs vs code, then update `docs-vault/` from `.claude/templates/docs/`
  (propose first; never overwrite human prose; ADRs append-only).
- `/maintain` — trim the `.claude/` system + refresh `project-context.md`.

Everything else is automatic: reuse, TDD, refactor-your-own-change, security, docs proposals.

## Real automation hooks (`.claude/settings.json`)

- `UserPromptSubmit` → `pipeline-inject.js` — keeps the pipeline in context every turn.
- `Stop` → `test-gate.js` — runs your test command; blocks "done" while red. Opt-in via
  `.claude/pipeline.config.json` (`testCommand` + `enabled:true`).
- `Stop` / `Notification` → `notify.js` — desktop notify, opt-in via `notify.config.json`
  (see `.claude/notify/README.md`).

## Local CLAUDE.md

Create one only when a folder has unique rules: architecture, framework, local
test/lint/build commands, security, naming, or domain logic.
Include only: purpose · local conventions · local commands (if different) · local risks.
Don't repeat root rules.

## Scaling

Starter is minimal. Add to `.claude/` (reviewers, pipeline, policy, local `CLAUDE.md`,
MCP) only on **repeated need**, never one-offs. Before adding, confirm: needed more
than once · reusable · reduces future mistakes · worth the tokens. Avoid unnecessary growth.
