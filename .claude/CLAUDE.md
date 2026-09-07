# Conductor

Quality system around Claude the builder: verify code before, during, and after changes.
The kit scaffolds **once**, at project genesis (`/start`), and never again. After that
establishes a toolchain and a test runner, every subsequent change goes through spec → test
→ implement. There are no feature/CRUD/component generators, ever.

This file is the portable kit manual; it lives in `.claude/` and travels with the kit.
Project-specific knowledge lives in the root `CLAUDE.md`, generated per project from
`templates/claude-root.md` — its first line imports this manual.

## Where a rule belongs

Every instruction in this kit lives in exactly one primitive, chosen by what it needs:

- **Advisory → this file.** Judgment, conventions, the pipeline. Followed most of the
  time, which is right for "prefer the smallest change" and wrong for "always format".
- **Scoped to a file pattern → a rule** (`rules/`). Conventions true only for a layer —
  components, routes, migrations, tests. `paths:` frontmatter loads them when Claude
  touches a matching file and costs nothing otherwise.
- **Guaranteed → a hook** (`hooks/`). Anything that must happen every time: the test gate,
  the write and shell guards, the formatter. Executes on every matching event, no judgment.
- **On-demand → a skill** (`skills/`). Scoped instructions that cost nothing until they
  are relevant: the four workflows and the scope-gated review lenses.
- **Isolated → a subagent** (`agents/`). Read-only exploration and audits that would
  otherwise flood this context.

Never write a "must happen every time" rule here — it belongs in a hook. `/maintain`
re-checks this mapping.

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
  global constraints live in the root `CLAUDE.md` and `project-context.md`, never
  repeated per spec.
- Stack-specific knowledge is opt-in: copy a pack from `.claude/templates/stacks/` to
  `.claude/skills/<stack>/SKILL.md` (`/start` copies the matching one). Packs inform the
  pipeline; they are knowledge, never generators.
- Scale ceremony to risk: no-behavior changes (docs, comments, config text) and project
  genesis (`/start`) skip Red-Green but still get verification and the report.
- Reuse first: search for existing code and patterns to reuse or extend; a duplicate is
  the last resort.
- Delegate exploration: information-gathering runs in read-only subagents that return a
  concise brief; implementation stays in the main session.
- Follow existing project patterns and naming.
- Run tests/lint/build when available; read the output. Tests must pass before done — the
  Stop hook enforces this whenever `testGate.command` is configured.
- Never claim verification that did not occur; report unverified parts honestly.
- Prefer the cheapest model that fits: `haiku` for mechanical edits and lookups, `sonnet`
  for reviews, tests, and single-file work, `opus` or higher for architecture, cross-cutting
  changes, debugging, and security-sensitive or ambiguous work. Claude cannot switch the
  session model — suggest it in one line and proceed. Never downgrade security work.

## Pipeline (automatic, every build/change)

Reviewers are lenses while you work, gates before you move on.

1. Context — this file (with the gates imported below) · root `CLAUDE.md`
   (project-specific) · `.claude/context/project-context.md` · nearest local `CLAUDE.md`.
2. Plan — if spec-worthy, write or locate the spec (`/sdd`); its verification criteria seed
   the tests. A spec written this session is committed and built after `/clear`, so
   `/implement` tests whether it stands alone · analyze the requirement and expected
   behavior · run relevant existing tests (green baseline) · discover & reuse/extend · if
   the change site needs restructuring first, propose a prep refactor · plan tests · write
   the failing test and commit it before any implementation (Red).
3. Code — smallest change that passes (Green).
4. Review — refactor your own change while green · quality · security · placement ·
   conditional lenses, only in scope: `review-performance` (hot paths) ·
   `review-accessibility-web` / `-native` (UI) · `review-compatibility` (multi-platform) ·
   `review-documentation` (behavior/interfaces changed) · re-run tests.
5. Finish — final gate · propose `/docs` if behavior or interfaces changed · flag stale
   `project-context.md` if stack/commands/architecture/deps changed.
6. Report — changed · tested · not verified · risks. Short and honest.

Refactor freely within your own change (step 4). Pre-existing or unrelated code only on
explicit request — behavior-preserving and test-gated.

## Skills (`.claude/skills/`)

- `/start <what to build>` — project genesis: classify → triage requirements → decide the
  stack (ADR) → scaffold the toolchain → wire the test gate → hand off to `/sdd`. The one
  time the kit scaffolds; empty/new projects only.
- `/sdd <idea>` — idea → discovery → interview → six-element spec in `docs-vault/specs/`;
  the source of truth for `/implement`.
- `/implement [spec]` — build an approved spec through the TDD pipeline; no separate
  /tdd — verification criteria become the failing tests.
- `/docs` — audit docs vs code, update `docs-vault/` from `.claude/templates/docs/`
  (propose first; never overwrite human prose; ADRs append-only).
- `/maintain` — trim the `.claude/` system + refresh `project-context.md` ·
  `project` scope: recurring architecture/structure audit → plan → gated refactors;
  first run on an existing codebase bootstraps context and docs (the retrofit).
- `review-performance` · `review-accessibility-web` · `review-accessibility-native` · `review-compatibility` ·
  `review-documentation` — scope-gated lenses that load only when a change is in scope.

## Agents (`.claude/agents/`)

Read-only specialists for discovery and audits (discovery, stack-advisor, security/performance/accessibility/docs/test auditors). They return concise
briefs and never implement. They inherit this file, so the gates below apply to them too —
the built-in `Explore` and `Plan` agents do not; see `policy/delegation.md`.

## Hooks (`.claude/hooks/`, wired in `settings.json`)

- `context-inject.js` (UserPromptSubmit) — injects live session state: branch, test-gate
  status, approved specs awaiting `/implement`, and a warning when a spec was authored in
  this session.
- `spec-session.js` (PostToolUse) — records which session authored each spec, so the
  fresh-session test is enforceable rather than advisory.
- `guard-writes.js` (PreToolUse) — ADRs stay append-only · implemented specs are
  superseded, not rewritten · secret files are never written.
- `guard-bash.js` (PreToolUse) — force pushes, commits on the default branch, and
  recursive force deletes ask first.
- `format.js` (PostToolUse) — runs the configured formatter on every file written.
- `test-gate.js` (Stop) — blocks "done" while tests are red.
- `notify.js` (Stop/Notification) — desktop notification, opt-in.

All are configured in `.claude/conductor.config.json`.

## Where knowledge lives (the category test)

Four layers, disjoint by construction. Ask of any sentence: **would it be identical in every
project that installs this kit?**

- **Yes** → `.claude/CLAUDE.md` or a reviewer. Always loaded.
- **No, but true everywhere in *this* project** → the root `CLAUDE.md`. Always loaded.
- **No, true only for files matching a pattern** → `.claude/rules/<name>.md` with `paths:`.
  Loads in scope only.
- **No, and no glob can express it** → a folder-local `CLAUDE.md`. Loads when Claude reads
  that directory.

Each sentence has exactly one home; writing it in two is a category error. Rules ship with
the kit, so they work in a project whose directories do not exist yet — which a folder-local
`CLAUDE.md` cannot do.

## Project CLAUDE.md files

- Root `CLAUDE.md` — owned by the project, not the kit: philosophy, conventions, domain
  rules. Generated from `templates/claude-root.md` on the first `/maintain project` run;
  keeps `@.claude/CLAUDE.md` as its first line so this manual always loads.
- Folder-local `CLAUDE.md` — only where a folder has unique rules: architecture,
  framework, local commands, security, naming, or domain logic. Content: purpose ·
  conventions · commands · risks. Don't repeat root or kit rules.

## Scaling

Add to `.claude/` only on repeated need — reusable, prevents future mistakes, worth the
tokens. Never for one-offs. Put it in the primitive that matches the need, not the one
that is easiest to edit.

## Always-loaded gates

These apply to every change. Imported, not linked, so they are always in context.

@reviewers/requirements.md
@reviewers/tdd.md
@reviewers/quality.md
@reviewers/security.md
@reviewers/architecture.md
@reviewers/spec.md
@policy/delegation.md
