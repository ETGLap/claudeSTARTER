# Claude Quality Template

A minimal, framework-independent quality system for Claude Code. It surrounds Claude
(the builder) with an automatic pipeline, reviewers, gates, tests, memory, and maintenance
tools. **Not** an app generator.

## How to use

1. **Copy** `CLAUDE.md` + `.claude/` into your project root.
2. **Fill** `.claude/context/project-context.md` (or run `/maintain`) with your
   stack, commands, architecture, and risks.
3. **(Optional) enable the test-gate** — set `testCommand` + `enabled: true` in
   `.claude/pipeline.config.json` so finishing is blocked while tests are red.
4. **Work normally** — just describe the feature. One pipeline runs automatically, no
   command needed:

```
read CLAUDE.md + context
  → before-edit  : reuse-check · plan tests · write the failing test (Red)
  → write code   : smallest code that passes (Green)
  → after-edit   : refactor your own change · quality · security · re-run tests
  → before-final : final check · propose /docs if behavior changed
  → report: changed · tested · not verified · risks
```

## Layout

| Layer | What it does |
|-------|--------------|
| `CLAUDE.md` | Conductor — rules + lifecycle |
| `.claude/pipeline/` | Pipeline phases (before-edit, after-edit, before-final) |
| `.claude/reviewers/` | Reviewers + gates (tdd, quality, security, refactoring, architecture, final) |
| `.claude/policy/` | Reference policy (model selection) |
| `.claude/context/` | Stable project facts |
| `.claude/templates/docs/` | Doc scaffolds for `docs-vault/` |
| `.claude/commands/` | `/docs`, `/maintain` |
| `.claude/*.js` + `settings.json` | Real hooks: pipeline injector, test-gate, notify |

## Commands

- `/docs` — audit docs vs code, then update `docs-vault/` (propose first)
- `/maintain` — trim the `.claude/` system + refresh project-context.md

Everything else — reuse, TDD, refactoring your own change, security, docs proposals — is
automatic.

## Local CLAUDE.md

Add `<folder>/CLAUDE.md` only when a folder has unique rules (framework, commands,
security, naming, domain). Include only what differs from root.

## Scaling

Stays minimal by default. Add reviewers/pipeline/policy/MCP only on **repeated need** —
not one-offs. Keep every file low-token.
