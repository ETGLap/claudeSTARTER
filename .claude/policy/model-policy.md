# Policy: model selection

Pick the cheapest model that meets the task's effort. Default to Opus; downgrade
only when the task is well-scoped and low-risk. Claude cannot switch the main
session's model — recommend the switch; the user runs `/model`.

## Models (per 1M tokens · in / out)

- `opus` — Opus 4.8 · $5 / $25 · default. Architecture, multi-file or
  cross-cutting changes, debugging, security-sensitive or ambiguous work.
- `sonnet` — Sonnet 4.6 · $3 / $15 · ~1.7x cheaper. Reviews, tests, docs,
  single-file edits with a clear spec.
- `haiku` — Haiku 4.5 · $1 / $5 · 5x cheaper. Formatting, renames, mechanical
  edits, lookups, short Q&A.

## When to recommend a switch

Judge effort before planning (see `pipeline/before-edit.md`):

- [ ] Low effort + low risk + clear spec → recommend `sonnet` (or `haiku` if
      trivial) before doing the work.
- [ ] High effort, cross-cutting, risky, or unclear → stay on `opus`.
- [ ] In doubt → stay on `opus`. Never downgrade security-sensitive work.

Surface it in one line, e.g. "Low-effort task — consider `/model sonnet`."
Proceed on the current model if the user doesn't switch.

## Automatic savings (no `/model` needed)

Work delegated to a subagent runs on that subagent's declared model — e.g. reuse
discovery via a read-only `Explore` subagent. If you promote a reviewer to a real
subagent, give it a cheaper `model:`. Add only on repeated need.
