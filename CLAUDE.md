# Conductor

Quality system around Claude the builder: verify code before, during, and after changes.
Not an app generator — never create feature/backend/frontend/api/db/ui generators.

## Rules

- Plan before editing. Smallest safe change; no unrelated edits or refactors; new files
  or deps need a reason.
- Ambiguous, conflicting, or missing requirement → ask one focused question before coding;
  never guess.
- TDD is the center: a failing test before production code (Red → Green → Refactor). If a
  test is impossible, document manual verification.
- Spec before building: features, endpoints, UI flows, schema/infra changes, commands, and
  behavior-changing refactors get a six-element spec first (`/sdd` → `docs-vault/specs/`).
  Bug fixes, spikes, reverse-engineering, docs-only, and behavior-preserving refactors skip
  it; when unsure, a one-paragraph mini-spec. Specs describe behavior, not implementation;
  global constraints live here and in `project-context.md`, never repeated per spec.
- Stack-specific knowledge is opt-in: copy a pack from `.claude/templates/stacks/` to
  `.claude/skills/<stack>/SKILL.md`. Packs inform the pipeline; nothing ever scaffolds
  code outside spec→test→implement.
- Scale ceremony to risk: no-behavior changes (docs, comments, config text) skip Red-Green
  but still get verification and the report.
- Reuse first: search for existing code and patterns to reuse or extend; a duplicate is
  the last resort.
- Delegate exploration: information-gathering runs in read-only subagents that return a
  concise brief; implementation stays in the main session (`policy/delegation.md`).
- Follow existing project patterns and naming.
- Run tests/lint/build when available; read the output. Tests must pass before done.
- Never claim verification that did not occur; report unverified parts honestly.

## Pipeline (automatic, every build/change)

Reviewers are lenses while you work, gates before you move on.

1. Context — this file · `.claude/context/project-context.md` · nearest local `CLAUDE.md`.
2. Plan — if spec-worthy, write or locate the spec (`/sdd`, `reviewers/spec.md`; build
   approved specs via `/implement`); its verification criteria seed the tests · analyze
   the requirement and expected behavior ·
   run relevant existing tests (green baseline) · discover & reuse/extend
   (`reviewers/architecture.md`) · if the change site needs restructuring first, propose a
   prep refactor · plan tests (`reviewers/tdd.md`) · judge effort (`policy/model-policy.md`) ·
   write the failing test (Red).
3. Code — smallest change that passes (Green).
4. Review — refactor your own change while green (`reviewers/refactoring.md`) · quality
   (`reviewers/quality.md`) · security (`reviewers/security.md`) · placement
   (`reviewers/architecture.md`) · conditional lenses, only in scope: performance (hot
   paths) · accessibility (UI) · compatibility (multi-platform) · documentation
   (behavior/interfaces changed) · re-run tests.
5. Finish — final gate (`reviewers/final.md`) · propose `/docs` if behavior or interfaces
   changed · flag stale `project-context.md` if stack/commands/architecture/deps changed.
6. Report — changed · tested · not verified · risks. Short and honest.

Refactor freely within your own change (step 4). Pre-existing or unrelated code only on
explicit request — behavior-preserving and test-gated (`reviewers/refactoring.md`).

## Commands

- `/sdd <idea>` — idea → discovery → interview → six-element spec in `docs-vault/specs/`;
  the source of truth for `/implement`.
- `/implement [spec]` — build an approved spec through the TDD pipeline; no separate
  /tdd — verification criteria become the failing tests.
- `/docs` — audit docs vs code, update `docs-vault/` from `.claude/templates/docs/`
  (propose first; never overwrite human prose; ADRs append-only).
- `/maintain` — trim the `.claude/` system + refresh `project-context.md` ·
  `project` scope: recurring architecture/structure audit → plan → gated refactors;
  first run on an existing codebase bootstraps context and docs (the retrofit).

## Agents (`.claude/agents/`)

Read-only specialists for discovery and audits (spec-analyst, architecture-scout,
security/performance/accessibility/docs/test auditors). They return concise briefs and
never implement — delegation rules in `policy/delegation.md`.

## Hooks (`.claude/settings.json`)

- `UserPromptSubmit` → `pipeline-inject.js` — keeps the pipeline in context every turn.
- `Stop` → `test-gate.js` — blocks "done" while tests are red; opt-in via
  `.claude/pipeline.config.json` (`testCommand` + `enabled:true`).
- `Stop`/`Notification` → `notify.js` — desktop notify, opt-in (see `.claude/notify/README.md`).

## Local CLAUDE.md

Create one only where a folder has unique rules: architecture, framework, local commands,
security, naming, or domain logic. Content: purpose · conventions · commands · risks.
Don't repeat root rules.

## Scaling

Add to `.claude/` only on repeated need — reusable, prevents future mistakes, worth the
tokens. Never for one-offs.
