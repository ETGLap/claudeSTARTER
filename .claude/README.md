# Conductor

Portable engineering workflow for Claude Code, with optional Codex adapters. Version:
[VERSION](VERSION). Node 22+ on PATH and Git; zero runtime package dependencies.
Shell commands are tested on macOS/Linux. Windows shell portability and native notification
behavior require a host smoke test.

## Install

1. Copy `.claude/` into the host, excluding `.state/` and `settings.local.json`. Merge existing
   configuration and custom extensions. Templates are starting material, not project facts.
2. Use `/start <idea>` for an empty project or `/maintain project` for existing code.
3. Record actual test/formatter commands in project context and run them explicitly. Default
   hooks provide startup guidance and safety guards; optional automation requires registration.
4. Check hook diagnostics and one harmless protected-operation preview. Host trust and
   permissions determine whether hooks actually run.

## Workflows and navigation

Small changes use focused verification; substantial changes use `/sdd` → `/implement`.
High-risk work adds risk/rollback criteria and independent review. Approval already given
counts; commits and fresh sessions are not mandatory workflow steps.

| Need | Authoritative location |
| --- | --- |
| Default decisions and scope routing | [CLAUDE.md](CLAUDE.md), imported by root project instructions |
| Stable host facts | [context/project-context.md](context/project-context.md) |
| Genesis/spec/build/debug/docs/upkeep | [skills/](skills/) — six workflows |
| File conventions | [rules/](rules/) |
| Risk-specific review | [reviewers/](reviewers/) — load only relevant references |
| Bounded discovery and handoff | [policy/delegation.md](policy/delegation.md) |
| Input/output/model/context optimization | [policy/optimization.md](policy/optimization.md) |
| Local helper commands and limits | [tools/README.md](tools/README.md) |
| Hook execution, configuration and coverage | [hooks/README.md](hooks/README.md) |
| Optional specialists | [templates/agents/](templates/agents/) — copy selected definitions into `agents/` |
| Stack packs and document skeletons | [templates/](templates/) — create only what the project needs |
| Project knowledge and decisions | Host `docs-vault/`; stable decisions are append-only ADRs |

The active agent is discovery. Tests/code stay in the main session unless requested otherwise.
Enable a stack by copying its template into `.claude/skills/<stack>/SKILL.md`.
Real env/key files are protected on supported operations; `.env.example` holds only variable
names and empty/obviously fake values. Path checks cannot prove content is secret-free.

## Optional automation

1. Merge only the requested entry from [templates/hooks.optional.json](templates/hooks.optional.json)
   into [settings.json](settings.json), preserving existing groups.
2. Enable its section in [conductor.config.json](conductor.config.json); test/formatter commands
   must target the host application. Setting a command alone does not register or enable a hook.
3. Restart and verify the chosen hook. Remove registration when disabling it to avoid no-op
   process launches. See the [hook manual](hooks/README.md) for cache/retry/timeout contracts.

Use a formatter already installed by the host. Optional checks do not replace verification
of the requested behavior. Notifications indicate a stopped turn, not verified success.

## Context and cost inspection

Use `/context` to inspect context and the installed Claude version's usage display (`/usage`
in current documentation) for token/plan information. An optional status line avoids model
calls just to report usage. Context occupancy, API cost estimates and subscription allocation
are different measurements; see the [official guide](https://code.claude.com/docs/en/costs).

Start a fresh session for unrelated work; preserve a [handoff](policy/delegation.md#session-handoffs)
for unfinished work. CLI/MCP selection, model eligibility and helper limitations live in the
[optimization policy](policy/optimization.md). Measure complete tasks, including retries;
character reduction alone does not establish billing savings.

## Codex

Install `.claude/`, `.codex/` and `.agents/skills/` together. Merge
[templates/agents-root.md](templates/agents-root.md) into host AGENTS.md; **do not copy the
starter's root AGENTS.md**, which describes kit development. Codex reads the shared core and
applicable rules explicitly rather than using Claude's @imports or path-rule loading.

- Initialize Git first: hook commands resolve from its root. Existing trust controls apply.
- `.codex/hooks/` forwards to canonical `.claude/` implementations. Bash and standard multi-file
  `apply_patch` payloads are supported, plus direct file-operation payloads when supplied.
- Codex cannot request PreToolUse confirmation: adapters turn `ask` into `deny`. Review and run
  approved operations manually or explicitly configure the relevant guard.
- Merge chosen entries from `.codex/hooks.optional.json` and enable their shared config.
  No Codex Notification event is registered.
- Copy selected `.codex/agents.optional/` definitions into `.codex/agents/`. Agents are read-only
  and inherit the configured model; Claude aliases/preloaded-skill metadata are not copied.
- Restart after changing skills/agents/hooks and verify host loading and trust.

Contracts: [hooks](https://learn.chatgpt.com/docs/hooks) and
[custom agents](https://learn.chatgpt.com/docs/agent-configuration/subagents), reviewed 2026-09-15.
Subprocess tests cover behavior; interactive installation and OS notification checks remain manual.

## Upgrade

1. Record VERSION and save a reviewed checkpoint. Preserve root instructions, project context,
   config, local settings and custom rules/skills/agents; never copy `.state/`.
2. Merge changed kit files and matching Codex adapters. Review removals/renames and preserve
   customizations. There is no destructive host updater.
3. Validate JSON and run `node --test .claude/hooks/*.test.js .claude/tools/*.test.js`, then
   the host's actual checks. Verify hook startup and a protected-operation preview.

Migration notes: remove obsolete per-prompt context-inject, spec-session and duplicate local
Stop-test registrations. Review existing formatter/test/notifier registrations explicitly;
disabled config still leaves registered processes launching. Review obsolete library/test
wrappers and review-skill/agent copies before removing them. Existing installs must explicitly
opt into caching; preserve its documented input limitations. Version 0.4 adds the local tools;
copy tools and core/policy together. Example model candidates remain unverified until checked.

## Extend

Keep semantic judgment in guidance, occasional procedures on demand and deterministic checks
in hooks. Add meaningful regressions and coverage limits for new behavior. Add dependencies,
agents or integrations only for demonstrated need; prefer reuse over new machinery.
