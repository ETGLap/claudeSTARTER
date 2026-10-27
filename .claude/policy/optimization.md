# Unified optimization workflow

Default sequence: understand → prepare → retrieve → route → implement → respond.
Apply these decisions within the existing task; do not narrate a second checklist, launch a
rewriting model, or run every helper for every task. User-requested detail and accuracy win.

## Prepare input

Keep the original request authoritative. Before making an outgoing model/subagent request,
retain the outcome, every constraint, exact technical values, negative requirements,
acceptance criteria and relevant evidence. Remove repeated prose and unrelated history;
organize as objective, constraints, evidence and expected result. Compare against the original
before dispatch. Preserve code, quotations, paths, identifiers and uncertainty verbatim when
meaning depends on them. If unsure whether text matters, keep it.

The native host has already received the user's prompt before these instructions run. This
policy cannot intercept or replace that transmission. `prepare` in the tools manual removes
only JSON formatting whitespace from caller-owned requests, with no semantic rewriting.
Do not compress legal text, source code or natural language using word-deletion rules.

## Retrieve context

For a known small area, search/read directly. For repeated or broad code discovery, use
`node .claude/tools/optimize.js graph "symbol or path"` before reopening many files.
It returns locations, imports, dependents and lexical hints. Read relevant source and tests
to confirm relationships. Missing matches and partial coverage require focused search;
never conclude that code is absent from graph results alone. No background refresh is needed.

For verbose commands, capture logs outside chat and use the summarizer from the tools manual.
Read the full failure region if excerpts omit necessary evidence. Keep the original command's
exit status. Do not filter generated artifacts or machine-readable output needed downstream.

## Route a new model call

Honor an explicit model choice first. Classify simple, standard, complex or deep, considering
ambiguity and failure impact rather than file count. Security, destructive changes and broad
architecture need at least complex capability. Use the cheapest candidate validated for the
project's task class, available on this host, and compatible with the expected context.

When the project supplies a verified model catalog, use `route` for an explicit decision.
Published capabilities are starting hypotheses: Haiku for bounded low-risk work, Sonnet for
ordinary coding, Opus for complex work, Fable for demanding reasoning. Host-specific
alternatives need their own evaluation. Do not assume Anthropic models are available in Codex.

On a failed model attempt, retain the failure evidence and advance to a stronger validated
tier; after the highest tier, stop escalating and identify missing evidence. Permission,
network and tool failures need their own remedy, not automatically a bigger model. The
existing two-attempt/no-new-evidence stopping rule remains in force.

The helper recommends; it does not switch the active conversation, launch paid calls or
create tasks. Apply its choice only through a supported host control for a new call. Otherwise
retain the host's selected model and report the limitation when routing matters. Unknown
prices or access are not proof of cheapness. Never restart a task just to change its model.

## Implement and respond

Prefer direct code, early returns and cohesive files. Introduce a helper, interface or layer
only when current reuse, complexity or a concrete requirement justifies it. No arbitrary
line-count target: fewer lines alone do not establish a simpler design.

Generate concise answers initially: lead with the result, show relevant verification and
remaining gaps, and explain non-obvious decisions briefly. Remove repeated plans, filler and
duplicate summaries. Preserve important uncertainty, warnings, exact commands and required
implementation detail. Do not imitate broken grammar or post-process a completed response
with another model; already-generated output tokens cannot be recovered.

## Boundaries

Semantic preservation, simplicity and reliable capability classification are advisory model
judgments. Helpers enforce only their documented deterministic contracts. No global prompt
rewrite, automatic model switch, secret scanner for arbitrary log content, or universal code
parser is claimed. See [tools](../tools/README.md) for formats, limits and failure recovery.
