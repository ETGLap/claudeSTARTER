# Architecture

Reuse before create; keep the system consistent. Runs at plan time (reuse decision) and
review time (placement). Check `docs-vault/architecture.md` "Shared building blocks" (the
reuse map) first if present; on a large codebase, search via a read-only `Explore` subagent;
greenfield → note nothing to reuse yet and proceed.

- [ ] Searched existing code for an equivalent (logic · UI · UX · structure).
- [ ] Decision recorded with reasoning: reuse · extend · promote-to-shared · justified-new.
- [ ] Shared-worthy code placed in the shared lib, not feature-local.
- [ ] Follows existing architecture, design system, and naming; no new duplicate of an
      existing pattern or component.
- [ ] Promoting existing code to shared is a refactor — explicit request only.
