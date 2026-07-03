# Spec

Force clear thinking before building: a sound spec on behavior, not implementation.

- [ ] Change is spec-worthy — if a bug fix, spike, reverse-engineering, docs-only, or
      behavior-preserving refactor, skipped and noted instead.
- [ ] All six elements present: outcomes, scope, constraints, prior decisions, tasks,
      verification.
- [ ] Outcomes are observable and testable — no implementation detail.
- [ ] Scope has an explicit Out list, not just In.
- [ ] Constraints are feature-specific; global/standing ones linked, not copied.
- [ ] Prior decisions link the architecture, files, or ADRs the spec depends on.
- [ ] Task breakdown describes what should exist, not how to build it.
- [ ] Every outcome has at least one verification criterion, tagged automated/manual/acceptance.
- [ ] Status current (draft → approved → implemented → superseded); never silently rewritten
      once implemented — supersede with a new spec instead.
