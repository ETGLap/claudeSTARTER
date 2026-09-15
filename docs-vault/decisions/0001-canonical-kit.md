# 0001 — Canonical kit with generated adapters and proportional workflows

- Status: accepted
- Date: 2026-09-15
- Related: [[architecture]], [[specs/0001-kit-reliability]]

## Context

The kit had independently copied Codex hooks and skills, missing resource paths, unsafe
status-only test caching, and instructions imposing a full workflow on small changes.
The user approved implementing the audit recommendations before adding cost-saving helpers.

## Decision

Keep `.claude/` canonical. Generate platform wiring/instructions and forward Codex execution
to shared hooks. Preserve the seven agent roles. Use a concise core and on-demand reviewers,
with light/standard workflows plus high-risk controls. Existing user authorization carries
through documentation, and commits/fresh sessions are not mandatory workflow steps.

Disable test caching by default. Opt-in caching hashes tracked/non-ignored file contents
and the command; retry state uses full project/session identity. Check failures remain
visible while hooks retain the zero-exit, supported-JSON contract.

## Consequences

Adapters need the canonical kit installed alongside them. Host upgrades merge customizations;
there is no destructive installer. Codex ask decisions become an explicit block because
its current protocol cannot request confirmation from that hook. This differs from Claude.

Static instruction size is measurable, but paid token savings require representative task
experiments. Preserve correctness while evaluating future helpers; see [[token-costs]].
