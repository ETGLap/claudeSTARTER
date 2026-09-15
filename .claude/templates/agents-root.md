# <Project name>

Read `.claude/CLAUDE.md` for the shared workflow and
`.claude/context/project-context.md` for stable project facts. Read only the applicable
`.claude/rules/` and stack/review guidance. Codex does not use Claude's @import mechanism.

## Project constraints

- <purpose, domain rules, conventions and risks unique to this project>

## Integration

Skills live in `.agents/skills/`; agents and hooks in `.codex/` depend on `.claude/`.
See `.claude/README.md` for supported hook behavior and platform limits.
