---
name: docs
description: Audit docs-vault/ against the current code, then propose and apply updates from the kit's doc templates. Use when behavior, interfaces, commands, or schema changed, or when the user asks to update or check the documentation.
when_to_use: After a behavior-changing merge, or on request. Trigger phrases: "update the docs", "document this", "are the docs stale", "write an ADR".
argument-hint: [area]
---

# /docs

Audit docs against current code, then update `docs-vault/` (Obsidian-style; flat, wiki-links)
from `.claude/templates/docs/`.

- Audit first: find outdated, missing, or inconsistent docs (api, db, setup, architecture).
  Delegate the sweep to the `docs-auditor` agent.
- Scan recent changes and the code to find what needs documenting. The `docs-auditor` is
  read-only (Read/Glob/Grep) and cannot run git — gather `git diff` and recent commits in
  the main session and pass the summary into the agent's prompt.
- Propose the diffs; write only after confirmation.
- Never overwrite human-written prose without asking. ADRs (`decisions/`) are append-only —
  a hook will ask before any edit to an existing one; supersede instead.
- Link, don't duplicate. Keep concrete: real names, IDs, env var names (never secrets).
- Keep `architecture.md` "Shared building blocks" (the reuse map) current.
