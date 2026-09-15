# 0002 — Lean defaults

Date: 2026-09-15
Status: accepted

## Context

The reliability pass made hooks safer but retained duplicate verification, per-prompt scans,
spec authorship tracking and overlapping skill/agent catalogs. The user approved removing
unnecessary automatic work before evaluating further token-saving helpers.

## Decision

Refine [[0001-canonical-kit]]: register only startup guidance and safety guards by default.
Keep test blocking, per-edit formatting and notifications as explicit opt-ins. Remove the
spec scanner and authorship ledger. Keep six workflow skills and discovery active; move
specialist agents to optional templates and review lenses to ordinary references. Fold
requirements/spec/TDD reminders into their workflows. Generate only runtime hook wrappers.

## Consequences

Tests remain required for relevant behavior but no Stop hook automatically reruns them in
lean installs. High-risk independent review remains required when available; unavailable
review is a reported gap. Installation of optional automation requires registration and
configuration. Upgrades must review old registrations and local settings explicitly.
No new runtime dependencies, profile manager or token-accounting machinery is introduced.
Actual cost savings require representative measurements; see [[token-costs]].
