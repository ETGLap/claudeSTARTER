# /modernize

One-time retrofit of an existing project to Conductor standards — as if built with the
Starter from day one. Repo-wide and deliberate, not for day-to-day work; orchestrates the
existing reviewers and commands, never duplicates them.

1. Map — inventory stack, structure, entry points, tests, docs, existing Claude context.
   Large repo → fan out read-only `Explore` subagents.
2. Audit (read-only) — apply each reviewer across the codebase: architecture + reuse/
   duplication, quality + refactoring debt, test gaps, security. Fan out the
   `.claude/agents/` auditors for independent areas. Prioritize findings.
3. Plan — present a sequenced modernization plan + deferred backlog; wait for approval.
4. Establish context — init `.claude/context/project-context.md`; generate docs via `/docs`
   (incl. the "Shared building blocks" reuse map); set `testCommand` in
   `.claude/pipeline.config.json`.
5. Apply (gated, on approval) — characterization tests before any refactor; behavior-
   preserving steps per `reviewers/refactoring.md`; tests after each step; small commits.
6. Report — changed · deferred · residual risks · next-steps backlog.

Never overwrite human-written docs without asking; land small reviewable steps, never one sweep.
