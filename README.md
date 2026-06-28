# Claude Quality Template

A minimal, framework-independent quality system for Claude Code. It surrounds Claude
(the builder) with reviewers, gates, memory, and maintenance tools. **Not** an app generator.

## How to use

1. **Copy** `CLAUDE.md` + `.claude/` into your project root.
2. **Fill** `.claude/context/project-context.md` (or run `/update-context`) with your
   stack, commands, architecture, and risks.
3. **Work normally** — just prompt Claude to build or change code. The system guides it:

```
read CLAUDE.md + context
  → before-edit  : tdd-engineer plans the smallest safe change
  → write/edit code
  → after-edit   : quality-reviewer + security-reviewer
  → before-final : final-reviewer
  → report: changed · tested · not verified · risks
```

## Layout

| Layer | What it does |
|-------|--------------|
| `CLAUDE.md` | Conductor — rules + lifecycle |
| `.claude/hooks/` | Lifecycle triggers (before-edit, after-edit, before-final) |
| `.claude/agents/` | Reviewers (tdd, quality, security, final, architecture-guardian) |
| `.claude/checklists/` | Gates (change-rules, quality, test, security, architecture) |
| `.claude/context/` | Stable project facts |
| `.claude/commands/` | Manual maintenance |

## Manual commands

- `/maintain-claude` — review & trim the `.claude/` system
- `/update-context` — refresh project-context.md
- `/verify-docs` — check docs against current code
- `/reuse` — reuse-first discovery before building

## Local CLAUDE.md

Add `<folder>/CLAUDE.md` only when a folder has unique rules (framework, commands,
security, naming, domain). Include only what differs from root.

## Scaling

Stays minimal by default. Add agents/hooks/checklists/MCP only on **repeated need** —
not one-offs. Keep every file low-token.
