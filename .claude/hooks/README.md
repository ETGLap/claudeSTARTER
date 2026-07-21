# Hooks — the deterministic layer

`CLAUDE.md` is advisory: Claude follows it most of the time, which is fine for "prefer the
smallest change" and useless for "always run the formatter". Anything that must happen
**every** time lives here instead. Hooks are shell commands the harness runs on specific
events — they execute whether or not Claude thinks they are relevant.

Everything is configured in [`../conductor.config.json`](../conductor.config.json) and
wired in [`../settings.json`](../settings.json).

## What ships

| Hook | Event · matcher | What it guarantees |
| --- | --- | --- |
| `context-inject.js` | `UserPromptSubmit` | Injects live session state each turn: branch (flagged when it's the default), whether the test gate is armed, specs awaiting `/implement`, whether a spec was written in *this* session, and whether the project is un-bootstrapped. Deliberately *not* a paraphrase of `CLAUDE.md` — that is already in context. |
| `spec-session.js` | `PostToolUse` · `Write\|Edit\|MultiEdit` | Records which session authored each spec, so the fresh-session test is enforceable. Writes only to `.claude/.state/spec-sessions.json`; emits nothing. |
| `guard-writes.js` | `PreToolUse` · `Write\|Edit\|MultiEdit\|NotebookEdit` | ADRs stay append-only · specs marked `Status: implemented` are superseded rather than rewritten · secret files (`.env*`, `*.pem`, `*.key`, `id_rsa*`) are never written. |
| `guard-bash.js` | `PreToolUse` · `Bash` | Force pushes, commits on `main`/`master`, and recursive force deletes ask before running. |
| `format.js` | `PostToolUse` · `Write\|Edit\|MultiEdit` | Runs the project formatter on the file just written. Tells Claude only when the file actually changed. No-op until `format.command` is set. |
| `test-gate.js` | `Stop` | Blocks "done" while the test command exits non-zero. The one place the kit refuses to trust judgment — it reads an exit code and makes no semantic call. |
| `notify.js` | `Stop`, `Notification` | Desktop notification when Claude finishes or needs you. Opt-in. |

Guards use `permissionDecision: "ask"` rather than `"deny"`, so you stay the authority and
see which rule fired — only secret material is denied outright.

## The fresh-session test

Writing a spec and implementing it in the same session carries invisible context: the
exploration, the alternatives you rejected, the assumptions you never wrote down. The
implementation may work for reasons the spec never captured — which means the spec would
fail for anyone else, and you would not find out.

`spec-session.js` records the authoring session id against each spec slug. When
`context-inject.js` sees that an approved spec's author matches the current session, it
says so before you build:

> ⚠ Spec 0004-checkout was written in this session. Commit it and /clear before /implement
> — implementing here reuses the context that wrote it, so a spec with gaps would still
> appear to work.

The ledger lives in `.claude/.state/spec-sessions.json` (gitignored, capped at 50 entries,
first author wins so a later typo fix cannot launder authorship). Turning off
`injectContext` disables both the recording and the warning.

## Configuration

```jsonc
{
  "testGate": { "enabled": true, "command": "npm test", "maxBlocks": 2 },
  "format":   { "enabled": true, "command": "npx prettier --write" },
  "guards":   { "adrAppendOnly": true, "implementedSpecs": true,
                "secretFiles": true, "gitSafety": true },
  "notify":   { "enabled": false, "sound": true,
                "events": { "stop": true, "notification": true },
                "includeProjectName": true,
                "messages": { "stop": "✅ Task complete", "notification": null } },
  "injectContext": true
}
```

| Key | Default | Meaning |
| --- | --- | --- |
| `testGate.command` | `""` | Shell command the Stop gate runs. Empty = no-op. |
| `testGate.maxBlocks` | `2` | Consecutive red blocks before the gate yields to you. |
| `format.command` | `""` | Formatter, invoked as `<command> <file>`. Empty = no-op. |
| `guards.*` | `true` | Each guard rule is individually disableable. |
| `notify.enabled` | `false` | Opt-in — notifications are a personal preference, not a gate. |
| `injectContext` | `true` | Per-turn session-state injection. |

`/maintain project` sets `testGate.command` and `format.command` on its first run.

`settings.json` also carries a `permissions.deny` block so secret files cannot be *read*
either. Drop entries from it if your project legitimately needs to read one.

## Design contract

Every hook is **zero-dependency, never throws, and always exits 0** — a broken config or a
missing binary can never break your session. Two conventions keep that true:

- **Judgment is separated from I/O.** All decision logic lives in `lib/guards.js`,
  `lib/config.js`, `lib/context.js` and `lib/git.js` as pure functions. Hook entry points
  only read stdin and write stdout. That is what makes the rules unit-testable.
- **No subprocesses on the hot path.** `lib/git.js` reads `.git/HEAD` directly rather than
  spawning git, because `UserPromptSubmit` runs on every single turn.

Scripts are referenced as `node "${CLAUDE_PROJECT_DIR}/.claude/hooks/<name>.js"`. The
placeholder matters: hooks run in the session's current working directory, which changes
across `cd` and worktrees, so a relative path would eventually resolve to nothing.

## Tests

The kit preaches TDD, so its own guards are tested:

```sh
node --test .claude/hooks/*.test.js
```

The explicit glob is required — Node's test discovery skips dot-directories, so
`node --test .claude/hooks/` finds nothing and fails.

Manual smoke tests (each must exit 0):

```sh
echo '{"tool_input":{"file_path":".env"}}'            | node .claude/hooks/guard-writes.js   # deny
echo '{"tool_input":{"command":"git push --force"}}'  | node .claude/hooks/guard-bash.js     # ask
echo '{}'                                             | node .claude/hooks/context-inject.js # context
```

## Platform support for notifications

- **macOS** — built-in `osascript`; sound via the system "Glass" tone.
- **Linux** — needs `notify-send` (libnotify). Sound is best-effort via `canberra-gtk-play`.
- **Windows** — PowerShell toast via `BurntToast` if installed, else a balloon-tip fallback.

If the native notifier is missing the popup is silently skipped. `Stop` fires at the end of
**every** turn, not only long tasks — set `notify.events.stop: false` if that is too chatty.

## Adding a hook

1. Put the decision logic in `lib/` as a pure function and write its test first.
2. Add a thin entry point that uses `lib/io.js`'s `run()` helper.
3. Wire it in `settings.json` with `${CLAUDE_PROJECT_DIR}` and a `timeout`.
4. Gate it behind a key in `conductor.config.json` so a host project can turn it off.
