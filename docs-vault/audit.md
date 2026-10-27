# Whole-project optimization audit

Date: 2026-09-15. Authorization: user's complete audit-and-implementation request.
Related: [[architecture]], [[token-costs]].

## Initial review and plan (before implementation)

Reviewed the 131 tracked-file inventory, canonical hooks/helpers/tests, workflow and review
instructions, all stack/document/agent templates, configuration, generator/validation/CI,
and vault history. Generated counterparts match canonical sources. No runtime dependency
manifest or tracked logs/build/cache artifacts exist. Local settings contain only a comment;
the old `.tmp/` directory is empty. Disposable state was not read as project truth.
Baseline: 90 tests pass; wiring and adapter checks pass. Imported instructions: 7,366
characters. Main manual: 202 lines/12,318 characters. Guards tests: 242 lines.

### Critical

- Generator pruning uses a marker substring anywhere in a file, so an unowned custom file
  quoting that text can be deleted. Require the generated header in its expected position.

### High value

- Graph cache validates arrays but not their elements: valid JSON containing malformed
  symbol/call entries can crash a query instead of rebuilding. Validate cached record shape.
- A long opening log line consumes the excerpt budget before a later diagnostic is reached.
  Bound each selected line, keep omissions explicit and preserve full-log recovery.
- Shared core, manual, hook manual and optimization policy repeat operating details.
  Keep core decisions short; use canonical references for commands and limits.
- `/docs` names an auditor now optional. Make availability/fallback explicit.

### Medium value

- Write guard rereads identical config for every patch target. Load once per invocation.
- Config validation repeats checks already performed recursively. Remove the duplication.
- Internal `io.block` and `CONDUCTOR_HOST` injection have no consumers. Remove them.
- `gitSafety` branch has only pure-test callers; config drops this obsolete key before the
  runtime sees it. Remove this dead compatibility path; keep real per-rule flags.
- Separate path-guard and shell-guard tests by responsibility; preserve live behavior coverage.
- Remove stale comments and redundant/irrelevant ignore entries. Keep ignores for actual
  caches and common generated output; do not hide lockfiles.

### Low value / deliberately deferred

- Do not split the 176-line guard implementation or the 183-line host tests solely for size.
- Keep small independent templates, six optional specialists, six adapters and all workflow
  skills: they are documented extension points, not proven dead files.
- Keep parser-complete graph support, automatic model switching, host permission redesign
  and real billing benchmarks outside this behavior-preserving audit.
- Preserve append-only ADRs and implemented specs as historical evidence.

## File disposition

| Area | Disposition |
| --- | --- |
| Root/shared instructions and host manual | Condense; preserve policy and platform boundaries |
| Hooks/lib and helper modules | Targeted fixes/dead-code removal; no wholesale rewrite |
| Guard test file | Replace with path/shell suites; remove only obsolete compatibility cases |
| Other tests | Retain; add regressions for reproduced risks |
| Workflows/reviewers/stack packs | Retain; fix specific stale or conflicting wording |
| Agent/skill/platform adapters | Retain required generated integrations; regenerate |
| Document and context templates | Retain on-demand extension points |
| Research/ADRs/specs | Retain history; link current manual rather than rewrite decisions |
| Ignore rules and local comment-only settings | Simplify/remove confirmed inert leftovers |
| Generator/validator/CI | Harden pruning; verify documentation links and current checks |

## Acceptance

Preserve existing active hooks, helper commands, workflow scope and optional integrations.
New regression tests must fail before fixes and pass afterward. Run all tests, JS syntax,
configuration/import/link/adapter checks and diff whitespace validation; inspect the final
inventory, file sizes, removals and instruction footprint. No dependency installs or commits.

## Implementation and second review

Completed the prioritized changes. Three new regressions cover malformed graph records,
log-excerpt crowding and generated-header ownership. The remaining live guard tests retain
their expectations; two tests of the unreachable `gitSafety` compatibility branch were removed.
Config is now loaded once per write-hook invocation instead of once per patch target.

| Measure | Before | After |
| --- | ---: | ---: |
| Imported instruction characters | 7,366 | 6,128 |
| Approximate instruction tokens | 1,842 | 1,532 |
| Host manual lines / characters | 202 / 12,318 | 110 / 6,967 |
| Portable kit characters (including tests) | 190,591 | 182,603 |
| Largest maintained source/instruction file | 202-line manual | 168-line guard implementation |
| Tests | 90 | 91 |

Character counts are not billing measurements. The overall portable kit is about 4% smaller;
the reductions concentrate on the default instructions and installation manual. The audit
record and targeted regressions intentionally add evidence rather than runtime overhead.

Removed: original `guards.test.js`, replaced by `path-guards.test.js` (105 lines) and
`shell-guards.test.js` (110 lines); local comment-only settings and the empty `.tmp/` directory.
Removed code: unused block helper, unused host environment injection and unreachable legacy
master-switch behavior. Reference checks found no remaining runtime consumers. No supported
hook, CLI helper, workflow, optional agent, stack pack or documentation template was removed.

Retained larger files: `host.test.js` (183 lines) exercises shared copied-host behavior;
`lib/guards.js` (168 lines) keeps related path and shell decisions together. Graph indexing
remains one module because its collection/cache/query stages share a single bounded snapshot.
No artificial modules were added to satisfy size limits.

Validation: 91 tests pass; 39 JavaScript files pass syntax checks; JSON/TOML parse; wiring,
imports, generated parity, 33 local Markdown links and diff whitespace checks pass. No linter,
TypeScript project or application build is configured, so those checks are not applicable.
The final inventory has no maintained source/instruction file over 200 lines, no tracked
runtime artifacts and no newly introduced dependencies. Interactive host loading/native
notifications and real model-cost/capability benchmarks remain manual/outside this audit.

Remaining recommendations: keep graph results advisory; add language parsers only for measured
need. Validate host model access/rates before enabling routing. Review stack advice against
the chosen project's versions. Maintain explicit host permission coverage instead of expanding
shell regexes into an interpreter. Preserve the historical ADR/spec record.

## Confirmed reliability and consistency fixes — 2026-10-26

Authorization: implement the six confirmed findings from the follow-up audit, preserve the
architecture and testing safeguards, avoid speculative changes, update docs and verify.
This is a focused correction pass; the prior decisions and historical acceptance records
above remain unchanged. Related: [[architecture]], [[token-costs]].

- Shared hook exceptions: report a fixed, non-blocking unverified-check warning. Never emit
  exception messages, stack traces or payload data. Existing guard decisions are unchanged.
- Startup: require the documented root workflow reference plus a filled context purpose;
  check the active host's Claude or Codex root template, not the other host's wiring.
  Keep the starter's shipping template blank,
  recognizing the source checkout by its two root maintenance scripts. Inspect only root
  instruction/context files and fixed markers; no recursive scan or state writes.
- Security reviewer: distinguish salted adaptive password hashing from retrievable secrets
  stored in a secret manager or encrypted with separately protected keys. Sources:
  [OWASP password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
  and [cryptographic storage](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html).
- Discovery: align its advertised trigger with bounded delegation; small lookups remain local.
  This removes contradictory guidance, not a measured claim of model-cost savings.
- Rules: include conventional Go/Python `_test`, Python `test_` and Ruby `_spec` filenames.
  Adoption checks actual host layouts; unrelated source files must not activate test rules.
- Adapters: tolerate whitespace changes in required `/start` translations and reject missing
  or duplicate matches. Test platform meaning separately from generated-file parity.

Verification plan: reproduce changed runtime behavior before fixing; run the complete kit
suite, adapter parity, wiring/import/config validation, JavaScript syntax and TOML/JSON
parsing, and diff whitespace checks. Review the scoped diff independently for safety and
correctness. Interactive host loading remains a separate manual check; no new host session
or paid workflow benchmark is part of this pass.

Results: the initial focused run failed on all six expected regression cases. Independent
review then found cross-host setup masking and a shared-core filename suffix false positive;
both were reproduced with failing checks and corrected. The follow-up review found no
remaining concrete issues. Final verification: 98 tests pass, none skipped (about 5.7 seconds
locally); all 39 tracked JavaScript files pass syntax checks; six JSON and seven agent TOML
files parse; generated adapters match; wiring/import/resource/configuration and whitespace
checks pass. The always-loaded instruction footprint remains 6,128 characters. No runtime
dependencies, default hook registrations, guard decisions or testing-policy requirements
changed. Generated adapters were regenerated from canonical sources. Live host loading and
OS notification behavior were not exercised; copied-host subprocess integration checks pass.
