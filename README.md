# Conductor

A quality system for [Claude Code](https://claude.com/claude-code). Drop it into any
repository and every build or change Claude makes runs through a TDD-centered pipeline
with reuse, quality, security, and architecture gates — automatically, no command needed.

Conductor is **not an app generator**. It adds zero runtime dependencies to your project:
it is a set of markdown instructions, three slash commands, and three tiny zero-dependency
Node hooks that shape *how* Claude works in your codebase.

## How it works

**One automatic pipeline**, defined in `CLAUDE.md` and re-surfaced every turn by a hook:

1. **Context** — project context + nearest local `CLAUDE.md`
2. **Plan** — spec first if the change is feature-sized (`/spec`) · analyze the requirement ·
   run existing tests (green baseline) · reuse-first discovery · plan tests · write the
   failing test (Red)
3. **Code** — smallest change that passes (Green)
4. **Review** — refactor the change just made · quality · security · placement · re-run tests
5. **Finish** — final gate · propose `/docs` if behavior changed · flag stale context
6. **Report** — changed · tested · not verified · risks

**Reviewers** (`.claude/reviewers/`) are lenses while Claude works and gates before it moves
on: architecture (reuse before create), TDD, quality, security, refactoring, final.

**Enforcement is split by what can be trusted:**

- *Semantic* judgments (is this minimal? secure? a duplicate?) stay **advisory** — markdown
  reviewers the model applies.
- *Deterministic* checks become **real hooks** — the test gate reads your test command's
  exit code on the Stop event and blocks "done" while it's red.

## Quick start

### New project

1. Copy `.claude/` and `CLAUDE.md` into your repo root.
2. *(Optional)* Enable the test gate — edit `.claude/pipeline.config.json`:

   ```json
   { "enabled": true, "testCommand": "npm test" }
   ```

3. *(Optional)* Desktop notifications when Claude finishes or needs input — see
   [`.claude/notify/README.md`](.claude/notify/README.md).
4. Start Claude Code. The pipeline is automatic.

### Existing project

Do the steps above, then run `/modernize` once: a deliberate, gated retrofit —
map → repo-wide read-only audit → prioritized plan → establish context and docs →
apply on approval in small, behavior-preserving, test-gated steps.

## Layout

```text
CLAUDE.md                     Rules + the canonical 6-step pipeline (always in context)
.claude/
├── reviewers/                One concern per file: principle + checklist gates
│   ├── architecture.md       Reuse before create; placement and consistency
│   ├── tdd.md                Red → Green → Refactor; green baseline first
│   ├── quality.md            Smallest, cleanest change; error handling
│   ├── security.md           Proportional to risk
│   ├── refactoring.md        Own-change automatic; pre-existing code on request only
│   └── final.md              Last gate before the response
├── policy/
│   ├── model-policy.md       Recommend the cheapest model that fits the task
│   └── delegation.md         Exploration → read-only subagents; implementation → main session
├── commands/                 /spec · /docs · /maintain · /modernize
├── context/
│   └── project-context.md    Stable project facts (stack, commands, risks)
├── templates/                spec.md + docs/ skeletons for the docs-vault (architecture, api, db, ADR, …)
├── notify/                   Cross-platform desktop notifier (opt-in)
├── pipeline-inject.js        UserPromptSubmit hook — keeps the pipeline in context
├── test-gate.js              Stop hook — blocks "done" while tests are red (opt-in)
├── pipeline.config.json      Test-gate + inject configuration
└── settings.json             Hook wiring
```

## Commands

| Command | What it does |
| --- | --- |
| `/spec` | Draft or verify a spec (outcomes · scope · constraints · prior decisions · tasks · verification) before building a feature-sized change. Specs live in `docs-vault/specs/`; verification criteria seed the TDD tests. |
| `/docs` | Audit docs against code, then update `docs-vault/` (Obsidian-style, wiki-linked) from the templates. Proposes before writing; ADRs are append-only. |
| `/maintain` | Trim the `.claude/` system, refresh `project-context.md`, verify the model policy is current. |
| `/modernize` | One-time retrofit of an existing codebase to Conductor standards. |

Everything else — reuse checks, TDD, refactoring the change just made, security review,
docs proposals — happens automatically inside the pipeline.

## Configuration (`.claude/pipeline.config.json`)

| Key | Default | Meaning |
| --- | --- | --- |
| `enabled` | `false` | Master switch for the test gate. |
| `testCommand` | `""` | Shell command the gate runs (e.g. `npm test`). Empty = no-op. |
| `maxBlocks` | `2` | Consecutive red blocks before the gate yields to the user. |
| `injectPipeline` | `true` | Inject the one-line pipeline reminder every turn. |

Hooks are deliberately fail-safe: zero dependencies, never throw, always exit 0 — a broken
config or missing binary can never break your session.

## Extending

- **New reviewer** — one file in `.claude/reviewers/` (a principle line + `- [ ]` gates),
  wired into the right pipeline step in `CLAUDE.md`.
- **New hook** — clone the `notify.js` contract: zero-dep, never throw, always exit 0.
- **Scaling rule** — add to `.claude/` only on repeated need: reusable, prevents future
  mistakes, worth the tokens. The whole instruction set stays around 200 lines on purpose;
  run `/maintain` periodically to keep it that way.

## Requirements

The Claude Code CLI. Hooks run on the Node runtime that ships with it — nothing is
installed into your project.
