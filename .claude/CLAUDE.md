# Conductor

Portable engineering workflow. Root project instructions and
`.claude/context/project-context.md` hold project-specific facts. Scaffold only at genesis.

## Working rules

- Deliver the requested behavior with the smallest maintainable change. Search for existing
  code before adding it; introduce abstractions for concrete requirements or reuse.
- Honor the user's authorization and constraints. Ask only when missing information changes
  behavior, scope, safety or an expensive choice. Reuse prior answers; resolve routine details
  from evidence. Surface material conflicts between project, stack and general guidance.
- Test changed behavior against independent expectations: failing test → minimal fix →
  refactor while green. Existing tests can protect behavior-preserving edits; use manual
  checks where automation adds little value. Never weaken a test merely to pass.
- Validate inputs and authorization at boundaries. Keep secrets out of source and output.
  Destructive actions require user authorization; hooks protect only documented operations.
- Update affected documentation with the change. Keep stable project context current;
  preserve human intent and supersede ADRs by adding new decisions.
- Commit/push only under user or project authorization. Separate Red/Green commits are optional;
  exclude others' changes. Report results, relevant verification, material decisions and gaps.
  Failed/skipped checks or a hook returning control are not proof of success.

## Workflow by scope

| Scope | Process |
| --- | --- |
| Light: small fix, docs, behavior-preserving edit | Focused plan, applicable checks and review. No required spec or delegation. |
| Standard: feature, endpoint, UI flow, schema/infra change | `/sdd` six-element spec → `/implement`; existing scope approval counts. |
| High risk: auth, sensitive data, destructive work, broad architecture | Add risk/rollback criteria and independent review when available; report unavailable review. A fresh session is optional when testing the handoff helps. |

Use `/start` for an empty project, `/debug` for an unknown defect, `/docs` for documentation,
and `/maintain` for upkeep/adoption. Genesis, time-boxed spikes and no-behavior edits do not
need artificial failing tests. High-risk fixes still use `/debug`; features use SDD.

## Efficient execution

Understand → prepare concise outgoing instructions → retrieve context → select a verified
model for new calls → implement simply → respond concisely. Preserve every constraint,
exact technical value, negative requirement and acceptance criterion; the original request
remains authoritative. No separate rewriting model or narrated optimization checklist.

Search relevant symbols/paths, read focused sections, and expand to callers/tests/contracts
when needed. Reuse findings until evidence changes. Batch independent lookups. Bound output
without hiding exit status or failures; retain full diagnostic logs for recovery.

For broad or repeated discovery, use the local graph; for verbose logs, use recoverable
excerpts. Read `.claude/policy/optimization.md` for routing/helper decisions and
`.claude/tools/README.md` for commands and limits. Native prompt replacement and active-model
switching depend on the host. Trivial tasks need no helper call or delegation.

Review once for correctness, scope, errors and security; use only relevant references in
`.claude/reviewers/`. Format coherent edits together, then verify. Repeat checks only after
relevant changes or new evidence. If an approach fails twice without new evidence, change
approach or identify what's missing. Finish when the requested behavior and checks are complete.

## Load only relevant guidance

- `.claude/rules/` and `.claude/templates/stacks/`: file conventions and optional stack packs.
- `.claude/policy/delegation.md`: bounded discovery, optional specialists and compact handoffs.
  Keep temporary progress out of permanent instructions.
- `.claude/hooks/README.md`: hook configuration, guarantees and limitations. Startup guidance
  and safety guards are default; automated testing, formatting and notifications are opt-in.
- `.claude/README.md`: installation and maintenance manual; not required for ordinary tasks.
