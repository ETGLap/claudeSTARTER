# /modernize

One-time modernization of an existing project so it follows Conductor standards and is ready
for AI-assisted development — as if built with the Starter from day one. Deliberate and
repo-wide; not for day-to-day work. Audit first, propose a plan, then apply on approval in
safe gated steps. Orchestrates the existing reviewers and commands — it does not duplicate them.

1. Map — inventory stack, structure, entry points, existing tests, docs, and any Claude
   context. On a large repo, fan out read-only `Explore` subagents.
2. Audit (repo-wide, read-only) — apply each reviewer across the codebase: architecture +
   reuse/duplication (`reviewers/architecture.md`), debt + simplification
   (`reviewers/quality.md`, `reviewers/refactoring.md`), test gaps + critical untested paths
   (`reviewers/tdd.md`), security (`reviewers/security.md`). Collect prioritized findings.
3. Plan — present a prioritized, sequenced modernization plan + deferred backlog. Wait for
   approval; nothing destructive without sign-off.
4. Establish Claude context — initialize `.claude/context/project-context.md`; generate docs
   via `/docs` (architecture + the "Shared building blocks" reuse map, setup, conventions,
   api, shared utilities); seed project memory with stable facts.
5. Apply (incremental, gated, on approval) — characterization tests before any refactor (TDD);
   dedup and behavior-preserving refactors via `reviewers/refactoring.md`; folder/structure
   changes only with explicit confirmation. Run tests after each step; small reversible commits.
6. Report — changed · deferred · residual risks · next-steps backlog.

Safety: behavior-preserving by default; never overwrite human-written docs without asking;
land changes in small reviewable steps, never one sweep.
