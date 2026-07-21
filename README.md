# Conductor Starter

A portable quality system for [Claude Code](https://claude.com/claude-code): copy the
[`.claude/`](.claude/) folder into any repository and every change Claude makes runs
through a spec- and TDD-centered pipeline with reuse, quality, security, and
architecture gates.

It ships as one instruction manual with always-loaded gates, four workflow skills, four
scope-gated review lenses, seven read-only specialist agents, and seven zero-dependency
Node hooks — each rule placed in the Claude Code primitive that can actually hold it:
advisory guidance in `CLAUDE.md`, non-negotiables in hooks, occasional instructions in
skills, exploration in subagents.

Conductor does **not** generate applications. It shapes *how* Claude works in a codebase
you own.

---

## Step 1 — Install

Copy the `.claude/` folder into the root of your repository. That is the entire kit; it
adds no dependencies and no build step.

```sh
cp -r /path/to/claudeSTARTER/.claude /path/to/your-project/
cd /path/to/your-project
```

## Step 2 — Bootstrap

**Existing codebase** — start Claude Code and run:

```text
/maintain project
```

Its first run is a deliberate, gated retrofit. It maps your stack and structure, writes
`.claude/context/project-context.md`, generates a project-owned root `CLAUDE.md`, creates
the `docs-vault/` documentation, sets your test and format commands, then runs a read-only
audit and proposes a prioritized plan. Nothing is changed without your approval.

**New/empty project** — there is nothing to map yet, so just set your commands in
[`.claude/conductor.config.json`](.claude/conductor.config.json):

```json
{
  "testGate": { "enabled": true, "command": "npm test" },
  "format":   { "enabled": true, "command": "npx prettier --write" }
}
```

Run `/maintain project` later, once the codebase has a shape worth mapping.

> Until this step is done, Claude tells you every turn that the project is not bootstrapped.

## Step 3 — Build a feature

This is the main loop. Five steps, and the discipline is in the gaps between them.

### 3.1 Write the spec

```text
/sdd add a detail panel showing an elevator's inspection history
```

Read-only agents first survey what already exists, so the spec builds on your codebase
instead of ignoring it. Then Claude interviews you through the six spec elements **one at a
time** — outcomes, scope boundaries, constraints, prior decisions, task breakdown,
verification criteria. You are the domain expert; Claude drafts, you approve.

The result lands in `docs-vault/specs/NNNN-slug.md` as `Status: draft`, and flips to
`approved` only when you say so.

### 3.2 Commit the spec, then clear the session

```sh
git add docs-vault/specs/0004-detail-panel.md
git commit -m "docs: spec for elevator detail panel"
```

```text
/clear
```

**Do not skip this.** Implementing in the session that wrote the spec reuses the
exploration, the rejected alternatives, and every assumption that never made it into the
document — so a spec with gaps still appears to work. A cleared session is the only way to
find out whether the spec stands on its own, which is what it must do for anyone else.

Conductor records which session authored each spec and will warn you if you try to build in
that same session.

### 3.3 Implement

```text
/implement 0004-detail-panel
```

In the fresh session Claude works from the spec plus your `CLAUDE.md` and nothing else:

1. runs your existing tests to establish a green baseline
2. turns the spec's verification criteria into **failing tests**, shows you the failure,
   and commits the test files alone — so git proves test-first actually happened
3. writes the smallest code that passes
4. refactors its own change while tests stay green
5. reviews for quality, security, and placement, plus performance / accessibility /
   compatibility / documentation when the change is in their scope
6. marks the spec `Status: implemented` and reports: changed · tested · not verified · risks

If the spec turns out to be ambiguous, that is a spec defect. Claude asks rather than
guesses, and reports what the spec was missing so you can fix it.

### 3.4 Update the docs

```text
/docs
```

Audits `docs-vault/` against the code and proposes diffs. Never overwrites your prose
without asking; ADRs are append-only.

### 3.5 Keep it healthy

Periodically, as the project grows:

| Command | When |
| --- | --- |
| `/maintain` | Trim the `.claude/` kit, refresh `project-context.md` |
| `/maintain project` | Recurring architecture and structure audit → plan → gated refactors |

## Step 4 — Everything else: just ask

Bug fixes, spikes, refactors, and docs-only changes **skip the spec** — say what you want in
plain language. The pipeline still applies: reuse-check before creating anything, a failing
test first, review, and an honest report. Ceremony scales to risk.

---

## What runs whether you ask or not

These are hooks, so they execute every time their condition is met — no reliance on Claude
remembering:

| When | What happens |
| --- | --- |
| Every turn | Live state injected: branch, whether the test gate is armed, specs awaiting `/implement`, and a warning if a spec was written in this session |
| Before a file write | ADRs stay append-only · implemented specs must be superseded, not rewritten · secret files (`.env`, `*.pem`, `*.key`, `id_rsa*`) are blocked |
| Before a shell command | Force pushes, commits on `main`/`master`, and recursive force deletes ask first |
| After a file write | Your formatter runs on the file |
| When Claude says "done" | Blocked while your test suite is red |

Everything the model *judges* — is this minimal, secure, a duplicate? — stays advisory.
Everything a script can *decide* is a hook. That split is the whole design.

Guards ask rather than block, so you always stay the authority. Tune or disable any of them
in `.claude/conductor.config.json`.

## Worked example

```text
you   /sdd users should be able to export the inspection table as CSV
      … agents survey existing export code, Claude interviews you element by element …
      → docs-vault/specs/0007-csv-export.md   Status: approved

you   (in your shell) git commit -m "docs: spec for CSV export"
you   /clear

you   /implement 0007-csv-export
      → baseline green (24 tests)
      → Red: 3 failing tests from the spec's verification criteria
             commit "test: CSV export includes all visible columns (red)"
      → Green: implemented, 27 tests pass
             commit "feat: CSV export for the inspection table"
      → reviewed: quality · security · architecture · performance (large result sets)
      → spec marked implemented
      → report: changed · tested · not verified · risks

you   /docs
```

## Where to read more

- **The kit's full manual:** [`.claude/README.md`](.claude/README.md) — layout, the
  primitive spectrum, configuration, and how to extend it. Travels with the kit.
- **The hooks:** [`.claude/hooks/README.md`](.claude/hooks/README.md) — what each one
  guarantees and how to add your own.
- **What Claude actually reads:** [`.claude/CLAUDE.md`](.claude/CLAUDE.md).

This root README belongs to the starter repo only and is not part of the kit; host
projects keep their own root `README.md` and generate their own root `CLAUDE.md`
(`/maintain project`, first run).
