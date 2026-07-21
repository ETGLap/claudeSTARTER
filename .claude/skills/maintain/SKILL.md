---
name: maintain
description: Keep the .claude/ kit and the project's architecture healthy. Bare `/maintain` trims the kit and refreshes project-context.md; `/maintain project` runs a gated architecture and structure audit, and on first run bootstraps an existing codebase into Conductor (context, root CLAUDE.md, docs, test command).
when_to_use: Setting the kit up in an existing repo, or periodic upkeep. Trigger phrases: "set up Conductor here", "audit the architecture", "refresh the project context", "clean up .claude".
argument-hint: [project]
---

# /maintain

Keep the `.claude/` system and the project's architecture healthy. Two scopes; never mix
them in one run.

## `/maintain` — tend the `.claude/` system

- Trim `.claude/CLAUDE.md`, reviewers, policy, agents, skills, templates: remove
  duplication, keep files low-token. The root `CLAUDE.md` is project-owned — propose trims,
  never rewrite it silently.
- Refresh `.claude/context/project-context.md` (stack, commands, architecture, risks);
  remove outdated facts.
- Check each instruction still sits in the right primitive: advisory → `CLAUDE.md` ·
  guaranteed → a hook · on-demand → a skill · isolated → a subagent.
- Add new files only on repeated need; keep cross-references valid after any change.

## `/maintain project` — tend the project architecture & structure

Recurring structural upkeep. The first run on an existing codebase doubles as the
Conductor retrofit — as if the project were built with the Starter from day one.

1. Detect — first run? (`.claude/context/project-context.md` unfilled or no `docs-vault/`.)
   If so, bootstrap: map stack, structure, entry points, tests, docs (large repo → fan
   out read-only agents) · init `project-context.md` · generate the root `CLAUDE.md`
   from `.claude/templates/claude-root.md` (imports the kit manual + project-context; never
   overwrite an existing root CLAUDE.md without asking) · generate docs via `/docs`
   (incl. the "Shared building blocks" reuse map) · set `testGate.command` and
   `format.command` in `.claude/conductor.config.json`.
2. Audit (read-only) — fan out the `architecture-scout` agent plus relevant auditors:
   folder structure, reuse/duplication, UI/theme consistency, database layer,
   frontend/backend organization, quality + refactoring debt, test gaps, security,
   scalability as the project grows. Prioritize findings.
3. Plan — present a prioritized behavior-preserving refactor plan + deferred backlog;
   wait for approval.
4. Apply (gated) — standalone refactoring mode: characterization tests before any
   refactor, small test-gated steps, small commits, never one sweep.
5. Report — changed · deferred · residual risks · backlog for the next run.

Never overwrite human-written docs without asking.
