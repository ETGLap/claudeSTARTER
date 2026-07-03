# /spec

Draft or verify a spec before building — force clear thinking on outcomes, scope, and
verification before code. Specs describe behavior, not implementation.

1. Decide — is this spec-worthy (feature, endpoint, UI flow, schema/infra, command,
   behavior-changing refactor)? If not (bug fix, spike, reverse-engineering, docs-only,
   behavior-preserving refactor), say so and skip. When unsure, write a one-paragraph
   mini-spec (Outcomes + Verification only).
2. Gather (read-only) — delegate discovery to `Explore` subagents (`policy/delegation.md`):
   existing patterns, reusable code, prior decisions, relevant constraints.
3. Draft — copy `.claude/templates/spec.md` to `docs-vault/specs/NNNN-<slug>.md`; fill all
   six elements. Keep global constraints as links, not copies. Ask one focused question on
   any genuine ambiguity — never guess.
4. Review — apply `reviewers/spec.md`: outcomes observable/testable, scope has an explicit
   Out list, constraints feature-specific, prior decisions linked, tasks behavioral (no how),
   every outcome has a verification criterion. Present the draft; write only after confirmation.
5. Build — hand off to the normal pipeline: verification criteria become the failing tests
   (Red → Green → Refactor). No separate implement command.
6. Verify & evolve — when the change lands, re-run the verification criteria and check the
   boxes. Gaps, contradictions, or missing decisions found while building → update the spec
   in place and note it. Material change of direction → mark the spec superseded and open a
   new one; never silently rewrite an implemented spec.
