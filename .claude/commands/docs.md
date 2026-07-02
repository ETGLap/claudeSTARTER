# /docs

Audit docs against current code, then update `docs-vault/` (Obsidian-style; flat, wiki-links)
from `.claude/templates/docs/`.

- Audit first: find outdated, missing, or inconsistent docs (api, db, setup, architecture).
- Scan recent changes (`git diff`, recent commits) and the code to find what needs documenting.
- Propose the diffs; write only after confirmation.
- Never overwrite human-written prose without asking. ADRs (`decisions/`) are append-only.
- Link, don't duplicate. Keep concrete: real names, IDs, env var names (never secrets).
- Keep `architecture.md` "Shared building blocks" (the reuse map) current.
