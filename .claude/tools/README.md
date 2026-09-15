# Local optimization helpers

Node built-ins and Git only. Run from the host project root. No daemon, MCP, paid calls or
startup hooks. The default [workflow](../policy/optimization.md) chooses helpers when useful.
Unlike hooks, these commands exit nonzero on errors. Do not treat failed helpers as evidence.

## Structured prompt preparation

```sh
node .claude/tools/optimize.js prepare request.json
```

Prints JSON without whitespace outside strings; stderr reports character counts. All tokens,
including exact numeric literals and repeated keys, remain unchanged. This is useful before
sending caller-owned structured input to a model; it does not rewrite native chat messages.
Plain-text prompt preparation is governed by the shared policy. No guaranteed token reduction
is claimed from character counts. Input must be a regular file, at most 5 MiB.

## Code discovery

```sh
node .claude/tools/optimize.js graph "verifyUser"
node .claude/tools/optimize.js graph "src/auth" /absolute/project/root
```

Returns at most eight ranked file records and 16,000 JSON characters. Locations describe
JS/TS/Python lexical functions/classes, potential calls and route/model lines. Relative JS/TS
imports link files and reverse dependents, including tests that import production code.
Components appear as functions/classes; configuration appears when it is source code.
This is a partial navigation index, not a parser-complete semantic graph. Methods, overloads,
multiline definitions, dynamic imports/calls, aliases, Python import resolution and framework
semantics can be missed or misclassified. Query a known symbol/path; verify the source.

Git lists tracked and non-ignored untracked files. Secret paths, symlinks, dependency/build
folders and `.state/` are excluded. At most 2,000 source files, 256,000 bytes per file and
20 MiB total are read. Unsupported and skipped inputs are counted. Individual record lists
are capped and `partial`/`detailsLimited` signal incomplete coverage. No result is proof
that a symbol is absent; use focused search for missing/unsupported relationships.

Each query hashes current content and reuses unchanged extraction. Deletions disappear on the
next query. The kit's fixed `.state/code-graph.json` cache stores locations/names, not source
bodies; it is ignored and disposable. Invalid caches rebuild; unavailable writes warn and
leave the current query usable. Concurrent source changes require rerunning before relying
on results. No watcher or separate session ledger is needed.

## Model routing

```sh
node .claude/tools/optimize.js route task.json models.json
```

Task shape:

```json
{"host":"claude","complexity":"simple","risk":"normal","inputTokens":2000,"outputTokens":500,"failedModels":[]}
```

Complexity is `simple`, `standard`, `complex`, or `deep`. Risk is `normal` or `high`.
The catalog is an array like [models.example.json](../templates/models.example.json).
Copy it to a project-owned location and verify rates, context limits and account access;
set `available` and `validated` only after checking the model and its task class. Example
candidates are disabled. `verifiedAt` covers price/access/task validation and expires after
30 days. A model's tier is the highest task class the project has validated (1–4).

For one consistent billing/context mode, supply input/output USD per million tokens and
usable context limits. Rates must include applicable platform/tier adjustments; subscription
allocation is not API spend. The helper minimizes estimated input plus output cost among
eligible candidates. It excludes unknown pricing, stale/unavailable/unvalidated entries and
insufficient context. Failure IDs raise the minimum tier; exhausted candidates return null.
Revalidate when access or prices change even within 30 days. Token estimates do not prove
that the actual request fits; the dispatching host must enforce its real model limits.

Output is a recommendation with `dispatch: false`. Use supported host selection for new calls
only. No account credentials, global model settings or paid benchmark runs are changed.

## RTK-inspired log filtering

Capture a known verbose command normally, retaining its exit code, then filter its saved log.
Example for a shell that continues after a nonzero test result:

```sh
mkdir -p .claude/.state
log_file=$(mktemp .claude/.state/test-output.XXXXXX)
command_status=0
npm test >"$log_file" 2>&1 || command_status=$?
node .claude/tools/optimize.js summarize "$log_file" "$command_status"
```

The summarizer exits with the original status (0–255), keeps the raw log unchanged and prints
its path. Short output passes through; long output yields numbered opening/closing lines and
error-adjacent excerpts with omission notices. Excerpts are capped at 8,000 characters before
metadata. Logs larger than 5 MiB require a focused diagnostic range instead. Filtering can
miss failures: recover the raw evidence before diagnosing an omitted detail. Do not put
secrets in captured logs. Clean up task-created logs after they are no longer needed; no
automatic deletion of user artifacts occurs. This helper never wraps or executes commands,
so existing host permission checks still see the original command.

## Verify

```sh
node --test .claude/tools/*.test.js
```

Tests use temporary projects and synthetic catalogs. They validate contracts, not model
capability or real billed savings. Keep runtime logic local and dependency-free.
