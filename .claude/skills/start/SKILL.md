---
name: start
description: Take a new or empty project from a one-line description to a scaffolded, test-wired skeleton — classify, triage requirements, decide the stack as an ADR, scaffold the toolchain, then hand off to /sdd. Use when the repository has no application code yet, or when the user describes building something from scratch.
when_to_use: The project is empty or nearly so and the user says what they want built. Trigger phrases: "build me a", "start a new project", "set up a Next.js app", "I want to build X", "scaffold this".
argument-hint: <what to build>
---

# /start

Project genesis: from a description to a skeleton that a test command can run. This is the
**one** time the kit scaffolds. It never generates features — after the hand-off, everything
goes through `/sdd → commit → /clear → /implement`.

Genesis is exempt from Red-Green (`reviewers/tdd.md`) because a failing test cannot exist
before a test runner does. The exemption ends the moment step 5 passes; say so in the report.

**Do not run this on a project that already has application code** — that is `/maintain
project`, which retrofits an existing codebase. If `.claude/context/project-context.md` is
filled or a root `CLAUDE.md` exists, stop and say so.

## 1. Classify

Restate `$ARGUMENTS`. Establish, from the request where possible and by asking where not:

- **Type** — website · SPA · full-stack app · API · mobile · game · CLI/library
- **Intent** — prototype or production-oriented. This scales everything downstream.
- **Platform(s)** — and whether more than one is genuinely required
- **Scale** — rough size and expected lifetime

Ask only what the request does not answer, one focused question at a time. Do not guess:
an assumption made here propagates into every later decision.

## 2. Triage

Apply `reviewers/requirements.md`. Present three lists and **get confirmation before
deciding anything technical**:

- **Explicit** — what they asked for
- **Inferred** — what this type of application professionally requires. Say why each one is
  on the list. A prototype's list is shorter than a production app's; use the intent from
  step 1.
- **Optional** — worth having, not implied. Naming these is how they stay unbuilt.

The user may move items between lists. That is the point of showing them.

## 3. Decide

Delegate to the `stack-advisor` agent. Present its two or three candidates with trade-offs
and your recommendation, then let the user choose.

On approval, write the genesis ADR to `docs-vault/decisions/0001-stack.md` from
`.claude/templates/docs/decision.md`: context (the request and its constraints), decision
(the stack), consequences (what it costs and what it forecloses). This is the one
architectural decision every later spec inherits, so it gets a record.

## 4. Scaffold

Create the minimal skeleton for the chosen type from `.claude/reference/architectures.md`.

**Toolchain and structure only.** No feature code, no CRUD, no components beyond what the
framework's own entry point requires. Honour the "Do not create" list for that type — those
are abstractions that cost more to remove later than to add now.

Prefer the ecosystem's official scaffolder (`create-next-app`, `create-expo-app`, `npm init`)
over hand-writing config. Read what it generated; delete what the project does not need.

## 5. Wire the gates — this is the genesis exit condition

- Set `testGate.command` and `format.command` in `.claude/conductor.config.json`.
- Run the test command. An empty suite is fine; **it must exit 0.**
- Run the formatter once across the skeleton.

Until the test command exits 0, genesis is not finished — do not proceed to step 6.

## 6. Establish context

- Generate the root `CLAUDE.md` from `.claude/templates/claude-root.md`, keeping
  `@.claude/CLAUDE.md` as the first line. Philosophy, conventions, and domain rules only —
  never a directory listing or a dependency list, which Claude derives from the code.
- Fill `.claude/context/project-context.md`: purpose, stack, commands, architecture, risks.
- Copy the matching pack from `.claude/templates/stacks/` to
  `.claude/skills/<stack>/SKILL.md`. If no pack matches, say so — do not invent one.
- Check `.claude/rules/`: the shipped rules are path-scoped and activate on their own, but
  narrow a glob if this project's layout would miss it.

## 7. Hand off

Genesis is over. State that explicitly, and that Red-Green now applies to everything.

The first feature goes through `/sdd <idea>` → commit the spec → `/clear` → `/implement`.
Do not build a feature in this session — the fresh-session test starts now.

Report: created · decided (with the ADR link) · inferred-and-built (with why) ·
optional-not-built · not verified · risks.
