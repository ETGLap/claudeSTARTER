# Conductor

A quality system for [Claude Code](https://claude.com/claude-code). Drop it into any
repository and every build or change Claude makes runs through a TDD-centered pipeline
with reuse, quality, security, and architecture gates — automatically, no command needed.

This file is the kit's manual for humans and travels with the `.claude/` folder; the
host project's root `README.md` stays its own.

Conductor is **not an app generator**. It adds zero runtime dependencies to your project:
markdown instructions, four workflow skills, read-only specialist agents, and six tiny
zero-dependency Node hooks that shape *how* Claude works in your codebase.

## The spectrum map

Claude Code offers four primitives, and they are not interchangeable. Conductor places
every instruction in exactly one, chosen by what the instruction needs:

| Need | Primitive | Where | Why |
| --- | --- | --- | --- |
| Judgment, conventions, context | `CLAUDE.md` | `.claude/CLAUDE.md` + imported gates | Always in context; followed most of the time. Right for "prefer the smallest change", wrong for "always format". |
| Must happen every time | **Hook** | `.claude/hooks/` | Executes on every matching event regardless of what the model decides. |
| Scoped, occasional instructions | **Skill** | `.claude/skills/` | Description is cheap and always visible; the body costs nothing until relevant. |
| Isolated exploration | **Subagent** | `.claude/agents/` | Own context window, own tool limits; returns a brief instead of flooding the session. |

The rule the kit follows: **a "never" or "always" written as prose is a bug.** If it must
hold every time, it belongs in `hooks/`. `/maintain` re-checks this mapping.

This is also why enforcement is split by what can be trusted:

- *Semantic* judgments (is this minimal? secure? a duplicate?) stay **advisory** — gates
  the model applies.
- *Deterministic* checks are **real hooks** — the test gate reads your test command's exit
  code, the write guard reads a path, and neither asks the model's opinion.

## How it works

**One automatic pipeline**, defined in `.claude/CLAUDE.md`:

1. **Context** — kit manual + always-loaded gates · project context · nearest local `CLAUDE.md`
2. **Plan** — spec first if the change is feature-sized (`/sdd`, built via `/implement`) ·
   analyze the requirement · run existing tests (green baseline) · reuse-first discovery ·
   plan tests · write the failing test (Red)
3. **Code** — smallest change that passes (Green)
4. **Review** — refactor the change just made · quality · security · placement ·
   scope-gated lenses (performance · accessibility · compatibility · documentation) ·
   re-run tests
5. **Finish** — final gate · propose `/docs` if behavior changed · flag stale context
6. **Report** — changed · tested · not verified · risks

**Gates** (`.claude/reviewers/` + `.claude/policy/delegation.md`) are `@`-imported by the kit
manual, so they are genuinely in context every session rather than a path the model might
read: architecture (reuse before create), TDD, quality, security, refactoring, spec, final.
Because subagents load `CLAUDE.md`, they inherit these too.

**Scope-gated lenses** are skills instead, because they only sometimes apply.
`review-accessibility` declares `paths:` globs so the harness activates it only on UI
files; `review-performance`, `review-compatibility` and `review-documentation` trigger from
their descriptions.

**Agents** (`.claude/agents/`) are read-only specialists Claude delegates discovery and
audits to — spec-analyst (SDD discovery), architecture-scout, and
security/performance/accessibility/docs/test auditors. Each returns a concise brief
(findings · paths · risks · recommendation) and never implements; code changes — including
writing the tests themselves — stay in the main session so Red→Green stays coupled.

**Hooks** (`.claude/hooks/`) make the non-negotiables real — see
[`hooks/README.md`](hooks/README.md).

## Quick start

### New project

1. Copy the `.claude/` folder into your repo root — that's the whole kit. Its
   `CLAUDE.md` manual loads automatically; your project's own root `CLAUDE.md`
   (philosophy, conventions, domain rules) is generated later by `/maintain project`
   and imports the kit via `@.claude/CLAUDE.md`.
2. Set your commands in `.claude/conductor.config.json`:

   ```json
   { "testGate": { "command": "npm test" }, "format": { "command": "npx prettier --write" } }
   ```

3. *(Optional)* Desktop notifications — set `notify.enabled: true` in the same file.
4. Start Claude Code. The pipeline and the guards are automatic.

### Existing project

Do the steps above, then run `/maintain project`: its first run is a deliberate, gated
retrofit — map → establish context and docs → repo-wide read-only audit → prioritized
plan → apply on approval in small, behavior-preserving, test-gated steps. Re-run it
periodically to keep the architecture and structure healthy as the project grows.

## Layout

```text
CLAUDE.md                     Project-owned: philosophy · conventions · domain rules
                              (generated from templates/claude-root.md; imports the kit)
.claude/
├── CLAUDE.md                 Kit manual: rules + the canonical 6-step pipeline + @imports
├── README.md                 This file — the kit's manual for humans
├── conductor.config.json     One config for every hook
├── settings.json             Hook wiring + permissions.deny for secret files
├── hooks/                    Deterministic layer (see hooks/README.md)
│   ├── lib/                  Pure decision logic — guards · config · context · git · io
│   ├── context-inject.js     UserPromptSubmit — live session state
│   ├── guard-writes.js       PreToolUse — ADRs, implemented specs, secret files
│   ├── guard-bash.js         PreToolUse — force push, commit on main, rm -rf
│   ├── format.js             PostToolUse — run the project formatter
│   ├── test-gate.js          Stop — blocks "done" while tests are red
│   ├── notify.js             Stop/Notification — desktop notifier (opt-in)
│   └── *.test.js             node --test, zero dependencies
├── reviewers/                Always-on gates, @imported by the kit manual
│   ├── architecture.md       Reuse before create; placement and consistency
│   ├── tdd.md                Red → Green → Refactor; green baseline first
│   ├── quality.md            Smallest, cleanest change; error handling
│   ├── security.md           Proportional to risk
│   ├── refactoring.md        Own-change automatic; pre-existing code on request only
│   ├── spec.md               Six elements; behavior not implementation
│   └── final.md              Last gate before the response
├── skills/                   On-demand layer
│   ├── sdd · implement · docs · maintain        The four workflows
│   └── review-performance · review-accessibility · review-compatibility ·
│       review-documentation                     Scope-gated lenses
├── agents/                   Read-only specialists: discovery + audits, never implement
├── policy/
│   └── delegation.md         Exploration → read-only subagents; implementation → main session
├── context/
│   └── project-context.md    Stable project facts (stack, commands, risks)
└── templates/                spec.md + claude-root.md + docs/ skeletons + stacks/ packs
```

## Skills

| Skill | What it does |
| --- | --- |
| `/sdd <idea>` | Idea → read-only discovery → interactive interview → six-element spec (outcomes · scope · constraints · prior decisions · tasks · verification) in `docs-vault/specs/`. |
| `/implement [spec]` | Build an approved spec through the TDD pipeline — verification criteria become the failing tests. No arg: pick from the approved-spec list. |
| `/docs` | Audit docs against code, then update `docs-vault/` (Obsidian-style, wiki-linked) from the templates. Proposes before writing; ADRs are append-only. |
| `/maintain` | Trim the `.claude/` system and refresh `project-context.md`. `/maintain project`: recurring gated audit of architecture, structure, reuse, and scalability — its first run retrofits an existing codebase. |
| `review-*` | Four scope-gated lenses. Loaded automatically when in scope; also invocable by name. |

Because these are skills rather than legacy `commands/` files, Claude can reach for them on
its own when a request matches the description — you do not have to type the slash command.

Everything else — reuse checks, TDD, refactoring the change just made, security review,
docs proposals — happens automatically inside the pipeline.

## Stack packs

Optional stack-specific *knowledge* (never generators) lives in `.claude/templates/stacks/`.
Enable one by copying it into skills, e.g.:

```sh
mkdir -p .claude/skills/htmx && cp .claude/templates/stacks/htmx.md .claude/skills/htmx/SKILL.md
```

Disable by deleting the skill directory. Packs inform specs, reviews, and implementation;
nothing scaffolds code outside spec→test→implement. `htmx` ships as the example.

## Extending

Pick the primitive by what the addition needs, not by which file is easiest to edit:

- **A judgment or convention** → a gate in `.claude/reviewers/` (a principle line +
  `- [ ]` gates), then `@`-import it from `.claude/CLAUDE.md`.
- **Something that must happen every time** → a hook. Decision logic goes in
  `hooks/lib/` as a pure function with a test; the entry point only does I/O. Clone the
  contract: zero-dep, never throw, always exit 0.
- **Scoped or occasional instructions** → a skill in `.claude/skills/<name>/SKILL.md`.
  Write the `description` for the model, not for yourself — it decides activation. Add
  `paths:` when the scope is reliably a file type; leave it off when it isn't, because
  `paths` *restricts* activation and a glob that misses your layout silently disables it.
- **Exploration or an audit** → an agent in `.claude/agents/` (`tools: Read, Glob, Grep` —
  read-only, always), body: mission + brief contract. Use `skills:` to preload its lens.
- **Scaling rule** — add only on repeated need: reusable, prevents future mistakes, worth
  the tokens. The instruction set is deliberately small; run `/maintain` to keep it that way.

## Requirements

The Claude Code CLI. Hooks and their tests run on the Node runtime that ships with it —
nothing is installed into your project.
