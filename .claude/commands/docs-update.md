# /docs-update

Generate or update project docs in `docs-vault/` (Obsidian-style; create lazily, flat
structure, wiki-links). Use templates in `.claude/templates/docs/`.

- Scan recent changes (`git diff`, recent commits) and the code to find what needs documenting.
- Propose the updates first; write only after confirmation.
- Never overwrite human-written prose without asking. ADRs (`decisions/`) are append-only.
- Link, don't duplicate. Keep concrete: real names, IDs, env var names (never secrets).
