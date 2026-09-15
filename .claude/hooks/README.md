# Hooks

Three default entry points and three optional entry points, configured by [conductor.config.json](../conductor.config.json) and
[settings.json](../settings.json). Node built-ins only. Entry points return supported JSON
and exit 0; the host decides what to block or display. A missing Node executable, host
permission/trust decision, or host timeout can prevent a hook from completing.

## Coverage

| Hook | Event | Behavior |
| --- | --- | --- |
| session-start | SessionStart | Bootstrap guidance only when setup is incomplete; no session state writes |
| guard-writes | PreToolUse | Secret-path checks for direct reads/writes and standard patches; existing ADR/implemented-spec edits ask in Claude |
| guard-bash | PreToolUse | Supported literal force pushes, main/master commits and recursive force deletes ask in Claude |
| format (optional) | PostToolUse | Runs configured formatter on surviving write/patch targets; reports changes and failures |
| test-gate (optional) | Stop | Runs configured checks; bounded continuation requests on failure |
| notify (optional) | Stop / Claude Notification | Desktop notification; stopping a turn is not verified success |

Only startup and guards are registered by default. To opt in, merge the selected entry from
[optional hooks](../templates/hooks.optional.json) and enable its config section. Codex has
matching entries in `.codex/hooks.optional.json`. Register only the requested automation.
Normal workflows format changed files together and run appropriate tests explicitly.

Codex adapters convert `ask` to `deny`, since the current Codex contract does not support
asking from PreToolUse. See the [platform guide](../README.md#codex).

## Test gate

- `enabled`: **false by default**; both registration and an enabled, nonempty command are
  required. Enabling this gate adds suite executions at Stop, including discussion turns.
  It does not reuse test results from the assistant's own explicit commands.
- `cache`: **false by default**. Opt in only for checks whose inputs are tracked/non-ignored
  files. Cached records include the command, HEAD, index and file-content digests, and are
  scoped by full project path and session. Repeated edits to the same filename invalidate it.
- Ignored files, installed dependencies, environment, time and external services are outside
  the cache contract. Keep caching disabled when they matter.
- Symlinks, submodules, unreadable inputs, more than 10,000 paths or over 50 MiB of input
  prevent cache reuse. Unknown Git state also runs the suite.
- Inputs are compared before/after a green run; a changing snapshot is not cached as verified.
- `timeoutMs`: 300,000 by default, maximum 600,000. The host Stop timeout is 620 seconds.
- `maxBlocks`: 2 by default. After that many failed continuation requests, another failing
  result emits **Verification failed; returning control**. Subsequent attempts still run;
  a green result resets the counter. A new session gets its own counter.
- If retry state cannot be saved, a failed run reports that fact and returns control to
  avoid an endless continuation loop.
- Result/state writes are atomic, under ignored `.claude/.state/`. State is disposable,
  not project truth. Tests never read or restore the live state.

## Formatter

`format.command` runs at the project root with a shell-quoted absolute target appended.
The formatter is disabled and unregistered by default. An empty command is inert. A whole patch shares a 20-second execution budget within the
host's 30-second timeout. Nonzero exits, execution errors, exhausted budget and unreadable
post-format files produce a warning; remaining targets are considered independently.

The formatter's own subprocess output is not copied into the model context. This keeps
routine logs small and avoids reporting arbitrary file contents. Read diagnostics explicitly
when needed. A file removed by a patch is skipped; a formatter removing its own input fails.

## Guard boundaries

- Real `.env` variants and recognized key/certificate paths are denied for direct file
  operations. Exact `.env.example` paths are public templates and allowed. Placeholder-only
  content remains an instruction; no path checker can prove a file contains no secret.
- `Read` checks apply only to secret paths. Existing ADRs and implemented specs can be read;
  changes ask in Claude, including moves/deletes described by a standard patch.
- Commands are split with awareness of quotes. Literal executable paths such as `/bin/rm`
  and forced `+` Git refspecs are recognized. `--force-with-lease` also asks: it still rewrites
  history. Harmless quoted prose is not treated as an executable command.
- Branch protection covers main/master. Nested cwd lookup follows the owning Git repository.
  Commands changing directory, switching branches, using Git directory options or Git
  environment overrides make the branch uncertain and ask before a later commit.
- These checks are **not a shell interpreter or security boundary**. Shell redirects,
  scripts, aliases, command substitution, alternate tools, interactive stdin, symlink aliases
  and custom default branch names are not comprehensively protected. Use host permissions,
  sandbox controls and repository protections for enforcement beyond these patterns.
- Guard config flags disable individual checks. Invalid configuration warns at session
  start and check execution; conservative defaults keep path guards available.

## Context

`injectContext` controls bootstrap guidance at SessionStart. There is no per-prompt spec
scanner or authorship ledger. `/implement` resolves the requested spec from project files
on demand; fresh sessions remain an optional handoff technique for high-risk work.

## Verification

```sh
node --test .claude/hooks/*.test.js
```

Pure decision tests and isolated copied-host tests cover the configured test gate,
formatter, guards, context and Codex envelopes. They do not replace an interactive host
installation/trust smoke test. Native notifications require a manual check on the target OS.
