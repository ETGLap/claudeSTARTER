# Architecture

Reuse before create; keep the system consistent. Runs at plan time (reuse decision) and
review time (placement). Check `docs-vault/architecture.md` "Shared building blocks" (the
reuse map) first if present; on a large codebase, search via the read-only `discovery` agent;
greenfield → there is nothing to reuse yet, so the question is placement, not reuse:
take the starting structure from `.claude/reference/architectures.md` (`/start` does this).

- [ ] Searched existing code for an equivalent (logic · UI · UX · structure).
- [ ] Record reasoning only for material architectural choices.
- [ ] Shared-worthy code placed in the shared lib, not feature-local.
- [ ] Follows existing architecture, design system, and naming; no new duplicate of an
      existing pattern or component.
- [ ] Extract shared code when required by the authorized change; keep unrelated refactors out.
