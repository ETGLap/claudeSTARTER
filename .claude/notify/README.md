# Attention Notifications

Desktop notification when Claude Code finishes a task or needs you — so you can step away
from the terminal (minimized window, watching a video) and still get pulled back.

## How it works

`.claude/settings.json` wires two real Claude Code harness hooks to `notify.js`:

| Event          | When it fires                                          | Popup           |
| -------------- | ------------------------------------------------------ | --------------- |
| `Stop`         | Claude finishes responding (task complete)             | ✅ Task complete |
| `Notification` | Claude needs a response / approval / input, or blocked | the harness message |

`notify.js` has **zero dependencies** — it uses the Node runtime that ships with Claude Code
and the OS-native notifier. It never throws and always exits 0, so a missing notifier can
never break your session.

## Enable / disable

**Disabled by default.** To turn on, edit `notify.config.json`:

```json
{ "enabled": true }
```

To turn off again, set `"enabled": false`. To remove the feature entirely, delete the
`hooks` block from `.claude/settings.json`.

## Configuration (`notify.config.json`)

| Key                  | Default              | Meaning                                            |
| -------------------- | -------------------- | -------------------------------------------------- |
| `enabled`            | `false`              | Master on/off switch.                              |
| `sound`              | `true`               | Play a sound with the popup.                       |
| `events.stop`        | `true`               | Notify when a task completes.                      |
| `events.notification`| `true`               | Notify when Claude needs input / is blocked.       |
| `includeProjectName` | `true`               | Append the project folder name to the title.       |
| `messages.stop`      | `"✅ Task complete"` | Custom title for the Stop event.                   |
| `messages.notification` | `null`            | Custom body; `null` uses the harness message.      |

## Platform support

- **macOS** — built-in `osascript`. Works out of the box; sound via the system "Glass" tone.
- **Linux** — needs `notify-send` (libnotify, usually preinstalled). Sound is best-effort via `canberra-gtk-play`.
- **Windows** — PowerShell toast via `BurntToast` if installed, otherwise a balloon-tip fallback.

If the native notifier is missing, the popup is silently skipped — nothing breaks.

## Test it

```bash
# Temporarily set "enabled": true in notify.config.json, then:
echo '{"message":"Claude needs your approval"}' | node .claude/notify/notify.js notification
echo '{"cwd":"'"$PWD"'"}' | node .claude/notify/notify.js stop

# Disabled path (set "enabled": false): the same commands produce no popup and exit 0.
```

## Notes / limitations

- `Stop` fires at the end of **every** turn, not only large tasks — use `events.stop: false`
  if that's too chatty.
- `.claude/settings.json` is committed, so the hook wiring is shared; the `enabled: false`
  default means it stays a silent no-op until someone opts in. For per-machine opt-in instead,
  move the `hooks` block to `.claude/settings.local.json` (git-ignored).
- The hook payload schema can vary across Claude Code versions; `notify.js` reads it
  defensively and falls back to sensible defaults.
