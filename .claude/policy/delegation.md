# Policy: delegation

Keep the main context for decisions and implementation; offload exploration.

Delegate to a read-only subagent (`Explore`) when a step is information-gathering:
locating code or usages, understanding an existing feature or architecture, finding
reusable code, mapping dependencies, reviewing docs/tests/config, researching libraries
or APIs. Independent questions → parallel subagents, one per aspect; combine their
summaries before deciding.

Subagents return a concise brief — findings · file paths/symbols · risks ·
recommendation — never the exploration log.

Stay in the main session for: edits, new code, refactors, running implementation steps,
and anything that depends on decisions already made this session.
