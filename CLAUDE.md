# Conductor

Quality system around Claude the builder. Verify code before, during, and after changes.
Not an app generator. Never create feature/backend/frontend/api/db/ui generators.

## Rules

- Plan before editing.
- Prefer TDD: failing test before production code. If impossible, document manual verification.
- Smallest safe change. No unrelated edits or refactors. No new files/deps without reason.
- Follow existing project patterns and naming.
- Run tests/lint/build when available; read the output.
- Never claim verification that did not occur.
- Report unverified parts and limitations honestly. Keep responses short.

## Lifecycle

Hooks trigger. Agents review. Checklists gate. Context remembers.

1. Read this file + `.claude/context/project-context.md`.
2. Read nearest local `CLAUDE.md` if present.
3. `hooks/before-edit.md` → apply `tdd-engineer`.
4. Plan smallest safe change (`checklists/change-rules.md`); pick the model for the effort (`checklists/model-policy.md`).
5. Write/edit code.
6. `hooks/after-edit.md` → apply `quality-reviewer` + `security-reviewer`.
7. `hooks/before-final.md` → apply `final-reviewer`.
8. Report changed · tested · not verified · risks.

Refactoring is opt-in. When (and only when) a refactor is requested, run `/refactor` →
apply `agents/refactoring-expert`, gated by `checklists/refactoring-gates.md`. It proceeds
on trivial, well-scoped refactors and questions you when goal, scope, behavior, or risk is
unclear. Never refactor unprompted.

## Local CLAUDE.md

Create one only when a folder has unique rules: architecture, framework, local
test/lint/build commands, security, naming, or domain logic.
Include only: purpose · local conventions · local commands (if different) · local risks.
Don't repeat root rules.

## Scaling

Starter is minimal. Add to `.claude/` (agents, hooks, checklists, local `CLAUDE.md`,
MCP) only on **repeated need**, never one-offs. Before adding, confirm: needed more
than once · reusable · reduces future mistakes · worth the tokens. Avoid unnecessary growth.

## Maintenance commands (manual)

`/maintain-claude` · `/update-context` · `/verify-docs` (audit) · `/docs-update` (write
docs to `docs-vault/` from `.claude/templates/docs/`) · `/refactor` (apply
`refactoring-expert`; opt-in). Match effort to risk.

## Optional: desktop notifications

`.claude/notify/` fires a desktop popup on task complete / input needed via `Stop` +
`Notification` hooks in `.claude/settings.json`. Disabled by default — see
`.claude/notify/README.md`.
