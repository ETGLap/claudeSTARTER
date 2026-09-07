# Policy: delegation

Keep the main context for decisions and implementation; offload exploration.

Delegate to a read-only subagent when a step is information-gathering: locating code or
usages, understanding an existing feature or architecture, finding reusable code, mapping
dependencies, reviewing docs/tests/config, researching libraries or APIs. Independent
questions → parallel subagents, one per aspect; combine their summaries before deciding.

**Use the named specialists in `.claude/agents/`** (discovery, stack-advisor, security/performance/accessibility/docs/test auditors). They load the kit
manual, so every gate above applies inside them; all are read-only and return the same
brief format.

The built-in `Explore` and `Plan` agents deliberately **skip `CLAUDE.md`** to stay fast, so
they arrive with none of the gates — no reuse rule, no architecture gate, no project
context. Use `Explore` only for cheap literal lookups ("where is X defined?") where no
judgment is needed, and pass any rule it must apply explicitly in its prompt.

Writing tests is implementation: the test-auditor maps the landscape, the main session
writes the tests.

Subagents return a concise brief — findings · file paths/symbols · risks ·
recommendation — never the exploration log.

Stay in the main session for: edits, new code, refactors, running implementation steps,
and anything that depends on decisions already made this session.
