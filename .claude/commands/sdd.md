---
description: Idea → interview → six-element spec
argument-hint: <idea>
---

# /sdd

Turn a rough idea into an approved six-element spec — the source of truth every later
workflow references. Specs describe behavior, not implementation.

1. Analyze — restate the idea (`$ARGUMENTS`); decide spec-worthiness. Bug fix, spike,
   reverse-engineering, docs-only, or behavior-preserving refactor → say so and skip;
   when unsure, offer a one-paragraph mini-spec (Outcomes + Verification only).
2. Discover (read-only) — delegate to `agents/spec-analyst` and `agents/architecture-scout`
   (`policy/delegation.md`): existing behavior, reusable code, prior decisions, constraints.
   Independent questions → parallel agents.
3. Interview — ask focused, batched questions until you understand: business objectives ·
   user experience · functional requirements · edge cases · constraints · scalability ·
   future extensibility. Never guess; never ask what discovery already answered. Stop when
   another answer would not change the spec.
4. Classify — feature / endpoint / UI flow / schema change / command / infra. Note the
   classification in the spec; it drives which conditional reviewers apply at `/implement`.
5. Draft — copy `.claude/templates/spec.md` to `docs-vault/specs/NNNN-<slug>.md` (next
   number); fill all six elements. Global constraints linked, not copied.
6. Gate & present — apply `reviewers/spec.md`; present the draft with `Status: draft`.
   Flip to `approved` only on user approval, then hand off: "implement with
   `/implement NNNN-<slug>`".

Gaps found later during implementation → update the spec in place and note it. Material
change of direction → mark it superseded and open a new spec; never silently rewrite an
implemented spec.
