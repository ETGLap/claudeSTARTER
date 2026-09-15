@.claude/CLAUDE.md

# Conductor Starter

Development repository for the portable `.claude/` kit, not a host application.
The optional Codex adapters share that canonical source. See `docs-vault/README.md`.

## Project conventions

- Zero runtime dependencies: Node built-ins only. No host package.json or install step.
- Keep hook decisions testable in `.claude/hooks/lib/`; entry points handle execution.
  Hooks exit 0 and use supported JSON responses. Important failures must be visible.
- Test with `node --test .claude/hooks/*.test.js`; use the explicit glob for the dot-directory.
  Validate wiring and generated adapters with `node scripts/validate-kit.js`.
- Shared implementation lives in `.claude/`; regenerate `.codex/` and `.agents/` adapters
  with `node scripts/sync-adapters.js`. Do not independently edit generated files.
- Conventional Commits when authorized. Do not commit directly to main or rewrite history
  without approval. Keep edits limited to the requested work.

## Shipping boundaries

- `.claude/context/project-context.md` stays blank: it is the host-project template.
- Everything under `.claude/` travels; starter-only tools and evidence belong in root
  `scripts/` and `docs-vault/`. No machine-local paths in distributed files.
- Root README describes kit development; `.claude/README.md` explains host usage.
- Validate hook settings after changes. Prefer narrow supported guards to broad regexes;
  every widened pattern needs a positive regression and harmless negative examples.
- `.claude/.state/` is disposable session bookkeeping, ignored by Git. Tests use isolated
  copies and must not read, back up, or overwrite the live ledger.
