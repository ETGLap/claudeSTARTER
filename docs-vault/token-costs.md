# Token-cost measurements

Related: [[architecture]], [[optimization-research]], [[audit]].

## Recorded baselines

| Stage | Imported instruction characters | Approximate tokens (characters / 4) |
| --- | ---: | ---: |
| Original starter | 20,258 | 5,065 |
| Reliability pass | 5,433 | 1,359 |
| Lean defaults (0.3) | 5,653 | 1,414 |
| Context discipline | 6,181 | 1,546 |
| Optimization helpers (0.4) | 7,366 | 1,842 |
| Whole-project audit (0.4.1) | 6,128 | 1,532 |

Run `node scripts/validate-kit.js` for current size. CI's 8,000-character budget covers root
instructions and recursive imports, not skill/agent descriptions, scoped context, tool schemas
or conversation history. Text-size estimates do not measure billed tokens or cache behavior.

The lean pass reduced active skill/agent description text from 4,553 to 1,217 characters,
and default hook commands from nine to three. Six skills and discovery remain active.
Specialist templates and optional hooks do not run until selected. Default instructions
avoid repeated reviews, checks, forced session resets and unnecessary delegation.

## Helper evidence

Synthetic fixtures: JSON preparation reduced 183 to 149 characters while preserving tokens
and values. Log filtering initially reduced 79,251 to 828 excerpt characters with the fixture
failure retained; recovery metadata is additional. These are examples, not task-cost claims.
Graph tests verify extraction reuse and detection of same-size edits with restored timestamps.

Incoming native chat replacement and active-session model switching remain host-dependent.
The helpers make no provider calls; routing requires verified prices/access/capabilities.
See [[optimization-research]] for design evidence and limitations, and [[audit]] for the latest
regression results. Historical specs preserve the checks completed at each release.

## Evaluate future helpers

Compare a small regression fix, a feature with a spec and an architecture/security audit
from the same revision. Set acceptance criteria first, keep model/settings fixed and vary
one helper at a time. Repeat runs to expose variability.

Record actual host usage, including subagents: input, cached input, output/reasoning tokens
where available, cost, elapsed time, tool calls, retries, human interventions and acceptance
results. Missing metrics stay unavailable. Include new catalogs, instructions and context
reconstruction in the cost. Adopt a helper only when complete tasks improve without lowering
correctness, security or maintainability. No paid benchmark was run for these baselines.
