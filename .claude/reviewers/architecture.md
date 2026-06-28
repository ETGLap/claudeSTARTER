# Architecture

Reuse before create; keep the system consistent. Runs before-edit (reuse/extend decision)
and after-edit (placement). On a large codebase, search via a read-only `Explore` subagent;
greenfield → note nothing to reuse yet and proceed. Read the reuse map in
`docs-vault/architecture.md` ("Shared building blocks") first if present. Lens, then gate.

- [ ] Searched existing code for an equivalent (logic · UI · UX · structure).
- [ ] Can't reuse or extend an existing component/util/service/hook — said why.
- [ ] Decision recorded: reuse · extend · promote-to-shared · justified-new.
- [ ] Shared-worthy code placed in the shared lib, not feature-local.
- [ ] Follows existing architecture, design system, and naming.
- [ ] No new duplicate of an existing pattern or component.
- [ ] Promoting existing code to shared is a refactor — on explicit request, not smuggled in.
