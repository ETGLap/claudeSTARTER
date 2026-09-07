# Conductor Starter

The development repo for **Conductor** — a portable quality system for
[Claude Code](https://claude.com/claude-code). The kit is the [`.claude/`](.claude/)
folder; copy it into any repository and every change Claude makes runs through a
spec- and TDD-centered pipeline with reuse, quality, security, and architecture gates.

```sh
cp -r claudeSTARTER/.claude your-project/
```

Then, in Claude Code:

| Your project | Run | What happens |
| --- | --- | --- |
| Empty / new | `/start <what to build>` | Classifies it, separates what you asked for from what it professionally requires, recommends a stack and records it as an ADR, scaffolds the toolchain, wires your test command — then hands off and never scaffolds again. |
| Existing codebase | `/maintain project` | Gated retrofit: maps the stack, writes the project context and root `CLAUDE.md`, generates docs, then audits and proposes a prioritized plan. |

From there the loop is `/sdd` → commit → `/clear` → `/implement` → `/docs`.

**The full manual lives in [`.claude/README.md`](.claude/README.md)** — layout, the
primitive spectrum, the workflows, configuration, and how to extend it. It travels with
the kit, so it is also what a host project gets. Start there.

- [`.claude/CLAUDE.md`](.claude/CLAUDE.md) — what Claude actually reads every session
- [`.claude/hooks/README.md`](.claude/hooks/README.md) — what each hook guarantees

---

## About this repository

This repo builds and tests the kit; it is not an application. Its own root `CLAUDE.md`
is the starter's project layer, and `.claude/context/project-context.md` stays blank on
purpose — it is the template that ships to host projects.

```sh
node --test .claude/hooks/*.test.js
```

The explicit glob is required: Node's test discovery skips dot-directories, so passing the
bare directory finds nothing and silently reports success.
