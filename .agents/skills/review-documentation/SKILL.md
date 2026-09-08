---
name: review-documentation
description: Documentation gates for changes to behavior, interfaces, commands, or schema — identifying affected docs-vault/ pages, proposing /docs, requiring an ADR for architectural decisions, and keeping spec status and project-context current.
when_to_use: The change alters observable behavior, a public interface or endpoint, a command, or the database schema — or adds a dependency that changes setup.
---

# Documentation

Docs move with the code, never silently.
Applies when behavior, interfaces, commands, or schema changed; otherwise skip and note.

- [ ] Affected `docs-vault/` pages identified.
- [ ] `/docs` proposed — never written without confirmation.
- [ ] Architectural decisions get an ADR (append-only, `decisions/`).
- [ ] The governing spec's status and verification checkboxes are current.
- [ ] `project-context.md` flagged if stack, commands, architecture, or deps changed.
