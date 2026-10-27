# Conductor Starter

Development repository for **Conductor**, a portable engineering workflow for Claude Code
with optional Codex adapters. The reusable source is [`.claude/`](.claude/README.md).
The default setup includes six workflows, one discovery agent and three active hook entry
points. Specialist reviews and automation are optional.

## Use the kit

Copy `.claude/` into a project, excluding `.state/` and `settings.local.json`.
Merge with existing configuration rather than overwriting it. Use `/start` for a new
project or `/maintain project` to adopt an existing codebase. See the
[host manual](.claude/README.md) for configuration, Codex setup and upgrades.

Small changes use focused verification. Substantial features use `/sdd` → `/implement`.
High-risk work adds risk review; a fresh implementation session is recommended when useful.

## Develop the kit

Node 22 or later and Git are required; there are no runtime package dependencies.

```sh
node --test .claude/hooks/*.test.js .claude/tools/*.test.js scripts/*.test.js
node scripts/sync-adapters.js --check
node scripts/validate-kit.js
```

Use explicit test globs: Node's automatic discovery skips dot-directories.
Edit `.claude/` sources, then run `node scripts/sync-adapters.js` to update the optional
Codex adapters. Their files are generated; runtime hook logic is shared, not copied.
The generator is starter-only and does not overwrite host-project instructions. It removes
obsolete files carrying its generated marker; keep custom extensions unmarked.

The shipping project-context file intentionally remains blank. Starter decisions, scope,
verification and token-cost preparation live in [docs-vault](docs-vault/README.md).
