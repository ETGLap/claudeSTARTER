# Conductor

Version: see [VERSION](VERSION). Portable engineering instructions and Node hooks for Claude
Code, with optional Codex adapters. Zero runtime package dependencies. Requires Node 22+
on PATH; hooks do not assume the assistant's own bundled runtime is exposed as `node`.
Hook commands are tested on macOS/Linux shells. Windows shell command portability is not
verified; notification code has a best-effort Windows implementation.

## Install

1. Copy this `.claude/` directory into the target project, excluding `.state/` and
   `settings.local.json`. Merge existing settings and custom extensions; do not blindly
   overwrite the host's files. Templates are starting material, not project facts.
2. Empty project: `/start <idea>` establishes a toolchain, test runner, stack decision and
   project instructions. Existing code: `/maintain project` adopts the workflow.
3. Record the real test and formatter commands in project context. Run them explicitly
   during implementation. Automatic testing/formatting is disabled and unregistered by default.
4. Run the configured checks, inspect their output, and inspect the assistant's hook
   diagnostics. Host trust/permission settings control whether hooks actually execute.

## Workflows

| Task | Workflow |
| --- | --- |
| Small fix, docs, local behavior-preserving change | Focused plan and verification; no forced spec, delegation, or commit |
| Substantial feature, endpoint, UI flow, schema/infra change | `/sdd` defines six elements; `/implement` builds and verifies the approved behavior |
| Bug with unknown cause | `/debug`: reproduce, isolate, failing regression, fix, verify |
| High-risk work | Add risk/rollback criteria and independent specialist review to the applicable workflow |
| Documentation | `/docs` updates affected knowledge under the implementation's authorization |
| Kit or project upkeep | `/maintain` or `/maintain project` |

A six-element spec contains outcomes, scope, constraints, prior decisions, tasks and
verification. Existing approval to implement an agreed proposal counts; questions resolve
material gaps rather than repeating an interview. Fresh sessions are useful for high-risk
handoffs but optional. Commits follow user/project authorization, not skill invocation alone.

## Context and tool costs

Use a fresh session for unrelated work. Before leaving unfinished work, preserve the compact
[handoff](policy/delegation.md#session-handoffs); retain decisions and evidence, not a transcript.
Do not reset merely because a timer or fixed context percentage has elapsed.

In Claude Code, `/context` identifies context overhead; current documentation uses `/usage`
for session tokens and plan usage. An optional status line can make usage visible without
asking the model to report it every turn. Commands vary by installed version. Subscription
allocation, estimated API cost and context occupancy are different measurements.
See the [official cost guide](https://code.claude.com/docs/en/costs).

Enable tools for an actual project need. Prefer an available CLI when it completes the task
clearly with less overhead; choose MCP when structured access or its capabilities help.
Deferred tool loading means MCP definitions are not universally loaded in full upfront.
Inspect the actual footprint before disconnecting tools, and do not install redundant
integrations. See [MCP guidance](https://code.claude.com/docs/en/mcp).

Supply the outcome, constraints and relevant file references together when known. Start with
focused evidence, then expand if needed. Bound routine command output while retaining full
failure diagnostics and the original exit status. Do not hide errors behind a successful
output-filtering command.

Choose models and delegation by measured total task cost and correctness. Fixed model quotas,
file-count delegation rules and assumed savings multipliers are not kit policy. Evaluate one
helper at a time on comparable tasks; include retries and subagent usage in the result.

## Where knowledge lives

- `CLAUDE.md`: concise core principles and workflow routing, loaded with the root import.
- Root project `CLAUDE.md`: project-owned constraints; preserve it during upgrades.
- `context/project-context.md`: stable host facts; fill during adoption and keep current.
- `rules/`: path-specific conventions. Applicable stack guidance refines generic defaults.
- `skills/`: six workflows, loaded on demand.
- `reviewers/`: optional references for relevant risks; no separate review-skill listing.
- `agents/`: discovery only. Specialist definitions live in `templates/agents/`; copy only
  those needed into `agents/`. Tests/code stay in the main session unless requested otherwise.
- `templates/`: specs, project instructions, document skeletons and optional stack packs.
  Enable a stack by copying its pack into `.claude/skills/<stack>/SKILL.md`.
- `hooks/`: checks for supported tool events; [coverage and limits](hooks/README.md).
- Host `docs-vault/`: living knowledge, shared-building-block map, specs and append-only ADRs.

`.env.example` is a public template: variable names and empty/obviously fake values only.
Real env files and key material remain protected on supported direct read/write operations.
This path convention is not a content-based secret scanner.

## Optional automation

The default wiring registers only startup guidance and safety guards. It has no prompt scan,
per-edit formatter, Stop test runner or notifier. For a requested automation:

1. Merge only its hook entry from `templates/hooks.optional.json` into `settings.json`,
   preserving existing groups. Do not copy every optional entry.
2. Enable its config section and set the real command when required. The example below
   illustrates opting into testing and formatting; it is not the shipping default.
3. Restart the host and verify the chosen hook. Remove its registration to avoid process
   launches when disabling it again.

Config alone does not register a hook. Normal workflow verification remains required even
when all optional automation is disabled.

```json
{
  "testGate": {
    "enabled": true,
    "command": "npm test",
    "maxBlocks": 2,
    "cache": false,
    "timeoutMs": 300000
  },
  "format": { "enabled": true, "command": "npx --no-install prettier --write" },
  "notify": { "enabled": false },
  "injectContext": true
}
```

Use a formatter already installed by the project. Commands run at the kit's project root;
write targets resolve against the tool payload's working directory. Caching is off by
default. Enable it only for suites determined by tracked/non-ignored files and the command.
Ignored inputs, environment changes, dependencies, clocks and external services are outside
that cache contract. The gate hashes file contents and verifies the snapshot stayed stable
during the run; unsupported/large trees rerun the suite. It is not a universal test oracle.

After `maxBlocks` failed continuation attempts, the gate returns control with an explicit
verification-failed message. It does not mark the task verified. Format/configuration errors
are also reported. Notifications are opt-in and report a stopped turn, not verified success.

## Codex

Install `.claude/`, the optional `.codex/` adapters and `.agents/skills/` together. The root
AGENTS.md in the starter describes this development repository: **do not copy it into a
host project**. Merge [templates/agents-root.md](templates/agents-root.md) into the host's
AGENTS.md instead. Codex needs explicit guidance to read the shared core and applicable
rules; it does not rely on Claude's @import or path-rule loading.

- Hook commands resolve through the Git root; initialize a Git repository first. Existing
  hook trust/settings remain in control; this kit does not disable permission checks.
- `.codex/hooks/` forwards to the canonical implementation and configuration in `.claude/`.
- Bash and standard `apply_patch` payloads are supported, including multiple files, deletes
  and moves. Hook checks also recognize direct `Read`/`Write`/`Edit` payloads when supplied.
- Codex currently does not support a PreToolUse `ask` response. The adapter turns a guarded
  ask into a deny with an explanation. Review and run an approved operation manually, or
  explicitly configure its guard; the adapter cannot open a confirmation prompt.
- Codex agents have a read-only sandbox and inherit the configured model. Claude-specific
  model aliases and preloaded-skill fields are not copied into Codex TOML.
- Optional hook entries are in `.codex/hooks.optional.json`; merge only the chosen entries
  into `.codex/hooks.json` and enable their shared config. No Notification event is supported.
- Optional specialist TOML files are in `.codex/agents.optional/`; copy selected files into
  `.codex/agents/`. Keep unused templates outside the active agent directory.
- Restart a session after changing skills/agents/hooks and verify the hooks were loaded.

The adapter targets the [documented hook contract](https://learn.chatgpt.com/docs/hooks)
and [custom-agent format](https://learn.chatgpt.com/docs/agent-configuration/subagents),
reviewed on 2026-09-15. Automated subprocess tests verify payload/output behavior; an actual
interactive Claude/Codex session must still verify installation and trust on each host.

## Upgrade

1. Record the installed VERSION and save a reviewed working-tree checkpoint.
2. Compare the new kit against the installed one. Preserve host config, root instructions,
   project context, local settings and custom rules/skills/agents. Do not copy `.state/`.
3. Merge changed kit-owned files; review removed/renamed files manually. This kit has no
   destructive updater. Version changes do not automatically replace host customizations.
4. If using Codex, install the matching generated adapters alongside the canonical files.
5. Validate JSON, run `node --test .claude/hooks/*.test.js`, then run the host's actual test
   and formatter commands. Check hook startup and one harmless protected-operation preview.

### Changes in 0.3.0

Lean defaults: startup and guards only; testing, formatting and notifications are opt-in.
Spec authorship tracking and per-prompt context injection were removed. Review lenses moved
from skills into references; six specialist agents moved into optional templates.

On upgrade, remove old `UserPromptSubmit` context-inject and `PostToolUse` spec-session
registrations, including local settings. Remove duplicate local Stop test hooks. Review
existing formatter/test/notifier registrations explicitly; copying a disabled config alone
still leaves hook processes launching. Remove obsolete generated library/test wrappers and
old review-skill/agent copies only after preserving project customizations.

### Changes in 0.2.0

Content-aware optional test caching, isolated retry state, visible check failures, public
example env files, quote-aware literal shell checks, shared Codex adapters, proportional
workflows and shorter core context. Existing installs must opt in again to test caching.

## Extend

Keep semantic judgment in concise guidance, occasional procedures in skills, and supported
mechanical checks in hooks. New checks need a meaningful regression and a documented
coverage boundary. Add agents and integrations for repeated, measured need. Smaller context
and cheaper agents are hypotheses about cost until representative tasks establish savings.
