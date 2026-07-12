# /maintain

Keep the `.claude/` system and the project's architecture healthy. Two scopes; never mix
them in one run.

## `/maintain` — tend the `.claude/` system

- Trim CLAUDE.md, reviewers, policy, agents, templates: remove duplication, keep files
  low-token.
- Refresh `.claude/context/project-context.md` (stack, commands, architecture, risks);
  remove outdated facts.
- Verify `policy/model-policy.md` against the current model lineup.
- Add new files only on repeated need; keep cross-references valid after any change.

## `/maintain project` — tend the project architecture & structure

Recurring structural upkeep. The first run on an existing codebase doubles as the
Conductor retrofit — as if the project were built with the Starter from day one.

1. Detect — first run? (`context/project-context.md` unfilled or no `docs-vault/`.)
   If so, bootstrap: map stack, structure, entry points, tests, docs (large repo → fan
   out read-only agents) · init `project-context.md` · generate docs via `/docs` (incl.
   the "Shared building blocks" reuse map) · set `testCommand` in
   `.claude/pipeline.config.json`.
2. Audit (read-only) — fan out `agents/architecture-scout` plus relevant auditors:
   folder structure, reuse/duplication, UI/theme consistency, database layer,
   frontend/backend organization, quality + refactoring debt, test gaps, security,
   scalability as the project grows. Prioritize findings.
3. Plan — present a prioritized behavior-preserving refactor plan + deferred backlog;
   wait for approval.
4. Apply (gated) — per `reviewers/refactoring.md` standalone mode: characterization
   tests before any refactor, small test-gated steps, small commits, never one sweep.
5. Report — changed · deferred · residual risks · backlog for the next run.

Never overwrite human-written docs without asking.
