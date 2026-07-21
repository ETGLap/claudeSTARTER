# Conductor Starter

A portable quality system for [Claude Code](https://claude.com/claude-code): copy the
[`.claude/`](.claude/) folder into any repository and every change Claude makes runs
through a spec- and TDD-centered pipeline with reuse, quality, security, and
architecture gates.

It ships as one instruction manual with always-loaded gates, four workflow skills, four
scope-gated review lenses, seven read-only specialist agents, and six zero-dependency Node
hooks — each rule placed in the Claude Code primitive that can actually hold it: advisory
guidance in `CLAUDE.md`, non-negotiables in hooks, occasional instructions in skills,
exploration in subagents.

- **Full documentation:** [`.claude/README.md`](.claude/README.md) — it travels with
  the kit, so target projects keep it too.
- **The kit manual Claude follows:** [`.claude/CLAUDE.md`](.claude/CLAUDE.md).

This root README belongs to the starter repo only and is not part of the kit; host
projects keep their own root `README.md` and generate their own root `CLAUDE.md`
(`/maintain project`, first run).
