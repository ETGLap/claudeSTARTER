# Policy: model selection

Recommend the cheapest model that meets the task's effort. Claude cannot switch the main
session's model — suggest it in one line ("Low-effort task — consider `/model sonnet`")
and proceed on the current model if the user doesn't switch.

- `haiku` — formatting, renames, mechanical edits, lookups, short Q&A.
- `sonnet` — reviews, tests, docs, single-file edits with a clear spec.
- `opus` and higher — architecture, multi-file or cross-cutting changes, debugging,
  security-sensitive or ambiguous work.

In doubt → stay on the current model. Never downgrade security-sensitive work.
Subagents run on their own declared `model:` — delegate mechanical work to cheaper models.
Model names and pricing drift — verify against current Anthropic docs when cost matters.
