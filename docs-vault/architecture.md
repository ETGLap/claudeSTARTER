# Architecture

Conductor is a portable development workflow. `.claude/` is its canonical source; optional
Codex adapters reuse that source. The starter adds maintenance tooling and this vault.
See [[decisions/0001-canonical-kit]], [[decisions/0002-lean-defaults]] and
[[specs/0001-kit-reliability]].

## Ownership and flow

- `CLAUDE.md` owns starter-specific constraints and imports the concise shared core.
- `.claude/skills/`, `rules/`, `reviewers/`, `agents/` own reusable guidance.
- `.claude/hooks/lib/` owns reusable decisions and I/O helpers. Three entry points are
  registered by default (startup, two guards); three others are opt-in.
  `conductor.config.json` is the shared runtime config. No prompt scanner or authorship ledger remains.
- `scripts/sync-adapters.js` generates `.agents/skills/`, `.codex/agents/`, hook forwarders,
  Codex wiring and this starter's AGENTS.md. It prunes obsolete marked generated files.
  Only executable hook entry points get wrappers. It is a development tool, not a host updater.
- Six workflow skills and discovery are active. Specialized checklists are ordinary references;
  six specialist agents live in optional template directories until selected for a host.
- Codex hook wrappers invoke the canonical scripts. `lib/codex.js` adapts working-directory
  metadata and unsupported ask decisions. `lib/paths.js` understands standard multi-file patches.
- `.claude/.state/` contains disposable session records. All tests use temporary host copies.
- `.claude/context/project-context.md` remains a blank template by design.

## Shared building blocks

| Need | Reuse |
| --- | --- |
| Hook envelopes/payload reading | `.claude/hooks/lib/io.js` |
| Configuration/defaults/diagnostics | `.claude/hooks/lib/config.js` |
| Path extraction and patch targets | `.claude/hooks/lib/paths.js` |
| File/shell decisions | `.claude/hooks/lib/guards.js` |
| Branch lookup | `.claude/hooks/lib/git.js` |
| Content fingerprint and cache decision | `.claude/hooks/lib/fingerprint.js`, `testgate.js` |
| Atomic state and full identity hashes | `.claude/hooks/lib/state.js` |
| Isolated executable fixtures | `.claude/hooks/fixtures/host.js` |
| Wiring/import/budget validation | `scripts/validate-kit.js` |

## Verification

Run `node --test .claude/hooks/*.test.js scripts/*.test.js`, then
`node scripts/validate-kit.js`. CI uses Node 22 on Ubuntu and macOS, validates generated
adapter parity and parses Codex agent TOML. The blank shipped test command prevents the
kit's own tests from being mistaken for verification of a host application.

Subprocess tests exercise real configured commands, repeated edits, cache isolation,
malformed inputs, guard negatives and Codex payloads. An interactive host smoke test remains
separate: hook loading/trust, output display and OS notifications depend on the installed host.
The tested protocol follows the official [Codex hooks documentation](https://learn.chatgpt.com/docs/hooks).

## Limits

Opt-in caching covers file/command inputs only. Guards inspect supported operations, not
arbitrary shell behavior. Retry exhaustion reports failure rather than pretending success.
Static validation finds structural drift; contradictory prose still requires review.
See the [hook manual](../.claude/hooks/README.md) and [[token-costs]].
