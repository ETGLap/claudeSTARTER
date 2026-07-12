# /maintain

Two scopes; never mix them in one run.

## `/maintain` — tend the `.claude/` system

- Trim CLAUDE.md, reviewers, policy, agents, templates: remove duplication, keep files
  low-token.
- Refresh `.claude/context/project-context.md` (stack, commands, architecture, risks);
  remove outdated facts.
- Verify `policy/model-policy.md` against the current model lineup.
- Add new files only on repeated need; keep cross-references valid after any change.

## `/maintain project` — tend the project structure

- Audit (read-only) — fan out `agents/architecture-scout` plus relevant auditors: folder
  structure, UI/theme consistency, database layer, frontend/backend organization,
  reusable-component opportunities, scalability as the project grows.
- Plan — present a prioritized list of behavior-preserving refactors; wait for approval.
- Apply (gated) — per `reviewers/refactoring.md` standalone mode: characterization tests
  first, small test-gated steps, never one sweep.
