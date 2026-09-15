# Token-cost preparation

Related: [[architecture]], [[specs/0001-kit-reliability]].

## Baseline

Before this change, the starter's root Claude instructions and recursive imports contained
20,258 characters (roughly 5,064 tokens at four characters per token). This is a text-size
estimate, not measured model usage, prompt-cache behavior or dollar cost.

After the reliability pass, the same always-loaded layer was about 5,433 characters (~1,359 tokens
by the same estimate), about 73% less instruction text.

Run `node scripts/validate-kit.js` for current core size. CI uses an 8,000-character review
budget for the root and recursively imported core. Detailed reviewers are now on demand;
agent/skill discovery descriptions and scoped/project context are additional overhead.

## Changes ready for measurement

- Core instructions no longer import all reviewer checklists on every session.
- Small lookups stay local; delegation needs a bounded independently useful question.
- Short agent briefs and selective review avoid repeated searches and irrelevant context.
- The lean pass removes prompt-state scans and authorship hints completely.
- Default wiring has three hook commands instead of nine; Stop and per-edit automation
  require explicit opt-in. Six workflow skills and one agent replace twelve skills/seven agents.
- Review references load only for applicable risks. Format after coherent edits; reuse valid
  passing checks. Repeated failures without new evidence require a changed approach.
- Routine docs, commits and session resets no longer force additional conversational steps.

## Lean baseline (0.3.0)

The imported instruction layer is 5,653 characters (~1,414 tokens by the same rough estimate).
It includes the explicit completion rule. Active skill/agent description text falls from
4,553 to 1,217 characters (~73% less); host listing wrappers and actual tokenization are
not included. There are six skills, one active agent and three registered hook commands.
Optional templates do not belong in the active catalog until a project selects them.

Validation: 79 tests pass after removing tests for retired spec-scanning/authorship behavior.
The suite covers disabled defaults, optional verification/formatting, guards, configuration,
state isolation and copied-host Codex execution. Wiring, adapter parity and active/optional
agent TOML also validate. Interactive host loading remains a separate installation check.

## Evaluate future helpers

Use the same three tasks on the same starting revision: one small regression fix, one
feature with a spec, and one architecture/security audit. Define acceptance criteria before
running either workflow. Preserve the same model and settings while comparing one helper
at a time; repeat runs to expose variability.

Record from actual host usage reports (including subagents): input tokens, cached input,
output/reasoning tokens where reported, total cost when available, elapsed time, tool calls,
retry count, human interventions and acceptance results. Missing metrics stay unavailable.

Do not equate shorter instructions with a guaranteed billing reduction. A helper is useful
when the total completed task is cheaper or faster without lowering acceptance quality.
MCP catalogs, added instructions and extra agents can add overhead; measure that as part of
the task. No paid benchmark or third-party helper was installed by the reliability change.

## Context discipline follow-up

The starter now adds progressive reading and bounded command output to the shared core.
The existing delegation policy holds an on-demand handoff format; the manual covers usage
inspection and CLI/MCP selection. The architecture reference includes optional deletion,
interface and abstraction checks only for requested design reviews.

No skill, agent, hook or dependency was added. Context thresholds, confidence percentages,
model quotas and fixed savings claims remain outside kit policy. These are advisory practices,
not enforced runtime limits. Run the validator for the current imported instruction size;
the 0.3.0 measurements above record the earlier lean baseline.

## Unified layer (0.4.0)

The imported starter instruction layer is 7,366 characters (~1,842 tokens by the rough
four-character estimate); this includes routing to the on-demand optimization policy.
Default hooks remain three, skills six and active agents one. Added helpers are local Node
commands; there are no provider calls, new dependencies, model-dispatch loops or background scans.

Synthetic observations (not representative billed savings): a formatted JSON request fell
from 183 to 149 characters with tokens/values preserved. A repetitive 79,251-character log
produced an 828-character excerpt retaining the fixture failure; recovery metadata is extra.
These examples measure whitespace removal and selected context, not comprehension quality,
model usage or end-to-end cost. The graph fixture confirms cached extraction is reused and
same-size edits with restored timestamps still refresh through content hashing.

Native incoming chat rewriting and active-session model switching are not implemented:
those require host support. Preparation/generation are default instructions; routing is a
verified-catalog recommendation for new calls. No account capability benchmark was run.
See [[optimization-research]] and [[specs/0002-optimization-layer]].
