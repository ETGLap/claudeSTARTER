# 0002 — Unified optimization layer

Status: implemented
Authorization: user explicitly requested implementation of all six strategies, 2026-09-15.
Related: [[architecture]], [[optimization-research]], [[decisions/0002-lean-defaults]].

## 1. Outcomes

- Default workflow preserves intent, retrieves targeted context, uses simple code and concise responses.
- Local helpers compact structured prompts, query fresh code relationships, select eligible
  low-cost models and shorten captured output with recoverable diagnostics.
- Unsupported host interception/model switching and unverified savings remain explicit.

## 2. Scope boundaries

In: Node-only local CLI, bounded lexical graph, cost/capability routing decision, log
summarizer, shared/root instructions, research and tests.
Out: paid model calls, autonomous model switching inside existing sessions, universal semantic
prompt rewriting, parser-complete call graph, MCP installation, background indexing.

## 3. Constraints

Follow root instructions. Preserve raw request/log evidence. No new dependencies or active
hooks. Exclude secrets, ignored paths and symlinks from indexing; bound data and output.
No claim of reliable routing without task validation and account/rate verification.

## 4. Prior decisions

Build on [[decisions/0001-canonical-kit]] and [[decisions/0002-lean-defaults]]. Reuse secret-path
checks and adapter generation. Research and architecture precede integration.

## 5. Task breakdown

- [x] Local helpers and conservative failure behavior.
- [x] Default workflow plus on-demand operating reference.
- [x] Verification and documented limits/measurement evidence.

## 6. Verification criteria

- [x] JSON values/literals and quoted whitespace survive compaction; invalid input fails. (automated)
- [x] Graph query finds imports, symbols and dependents; edits/deletions refresh, and secrets,
  ignored files, symlinks, unsupported/oversize inputs are excluded or reported. (automated)
- [x] Router selects cheapest eligible model, escalates on failure and rejects stale/unavailable,
  unvalidated or context-incompatible candidates. Invalid inputs fail explicitly. (automated)
- [x] Log excerpts are bounded, omissions visible, raw files unchanged and exit codes retained. (automated)
- [x] Adapter/config validation and full test suite pass. (automated)
- [x] No new hook, dependency or automatic paid call; source-based limits documented. (manual)

## Verification record

2026-09-15: 90 tests pass (79 existing, 11 optimization tests). Wiring/import budget,
generated-adapter parity, JSON parsing and diff whitespace checks pass. Research was recorded
before implementation. No new active hooks, dependencies or model calls were introduced.
Native prompt replacement, automatic active-model switching and real model-cost benchmarks
remain outside the implemented host-independent scope, as defined above.
