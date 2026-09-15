# Optimization research and design

Research date: 2026-09-15. Related: [[architecture]], [[token-costs]],
[[specs/0002-optimization-layer]]. Findings recorded before implementation.

## Sources and useful principles

- [Caveman](https://github.com/JuliusBrussee/caveman) uses generation instructions for terse
  responses and offers a proxy. Adopt direct answers, no repeated setup and short evidence.
  Do not copy its grammar removal or removal of uncertainty: qualifiers can be essential.
- [RTK](https://github.com/rtk-ai/rtk) is a CLI proxy with command-specific output filters
  and recovery of full output. Its advertised reduction concerns command output, not total
  bills. Adopt bounded diagnostic selection and recoverable logs. Our first version reads
  an already captured log; it does not rewrite shell commands or bypass existing guards.
- [CodeGraph](https://github.com/ObunagaLabs/codegraph) indexes symbols and relationships
  for targeted exploration. Adopt indexed imports, symbol locations and bounded neighbor
  queries. A zero-dependency lexical index cannot reproduce parser-backed call resolution.
  Candidate calls, routes and models must be labeled hints and checked against source.
- [Claude hooks](https://code.claude.com/docs/en/hooks) provide event-specific contracts.
  Do not assume adding context replaces an incoming user message. No hook can refund tokens
  already consumed by a response. We use default instructions for semantic prompt preparation
  and concise generation, not a second paid rewriting pass.

## Model evidence

Installed Claude Code: 2.1.270. Its presence does not establish this account's access to
individual models. Local Codex catalog and this task's host tools advertise Astra, Sol,
Terra, Luna and GPT-5.5; hidden internal entries are excluded. No paid calls were made.

[Anthropic overview](https://platform.claude.com/docs/en/models/overview) describes Haiku
4.5 for fast work, Sonnet 5 for balanced work, Opus 5 for complex coding, and Fable 5.1 for
demanding reasoning. Fable is a real published model; account access remains unverified.
[Published standard API pricing](https://platform.claude.com/docs/en/about-claude/pricing),
USD per million input/output tokens: Haiku 4.5 1/5; Sonnet 5 2/10; Opus 5 5/25;
Fable 5.1 10/50. These are not subscription usage rates or measured task costs.

[OpenAI models](https://learn.chatgpt.com/docs/models) describes Luna as fast/affordable,
Terra as balanced, Sol as capable coding/reasoning and Astra for demanding work.
[API pricing](https://developers.openai.com/api/docs/pricing) separates processing tiers,
context sizes and caching. Do not import an API rate into a subscription recommendation.
The portable catalog ships with no account marked available and no capability benchmark
claimed. Host owners supply current rates for their mode and verify candidates on real tasks.

## Proposed architecture

One always-loaded workflow: understand requirements → prepare concise outgoing instructions →
retrieve relevant context → choose a verified model for a new call → simple implementation →
concise, evidence-bearing response. Preserve the user's original request as authoritative.

One Node CLI under `.claude/tools/` supplies four local operations:

1. `prepare`: lossless JSON whitespace compaction for caller-owned structured requests.
   String contents, numeric literals, ordering and repeated keys remain unchanged. Natural
   language is condensed by instruction with a requirement check, not destructive regexes.
2. `graph`: Git-aware bounded index/query of source files, imports and lexical symbols.
   Hash current contents on query; reuse extraction only for unchanged files. Cache is
   disposable, ignored, local and source-free. Unsupported syntax falls back to search.
3. `route`: deterministic least-estimated-cost selection among available, task-validated,
   recent models meeting the task tier and context size. Failed models raise the tier;
   exhausted/unknown candidates return a clear fallback. It recommends, never launches calls
   or silently changes a host session. Capability tiers are project policy, not benchmarks.
4. `summarize`: bounded excerpts from a captured log, omission counts, recovery notice,
   full-log path and original exit status. No shell proxy, daemon, telemetry or dependency.

No startup graph rebuilds, mandatory subagents, per-prompt scanners or output-rewriting
model calls. Root instructions import the shared workflow; local tool instructions describe
only tool-specific limits. Existing safety hooks remain unchanged.

## Expected savings and limitations

No guaranteed percentage. JSON compaction saves only formatting whitespace. Concise generation
can reduce output but cannot guarantee semantic preservation. Graph queries reduce source
text delivered to the model, while still performing bounded local reads to prove freshness.
Log filtering saves context only when raw output is kept out of chat; short outputs can cost
more after metadata. Routing depends on accurate task classification, recent account access,
prices, capability validation and token estimates. A cheaper failed run can cost more overall.

Evaluate fixed fixtures and representative host tasks. Report character deltas separately
from real billed tokens. Compare correctness, total usage (including retries), elapsed time,
and manual intervention. Do not claim measured model savings without actual usage evidence.
