@.Codex/AGENTS.md

# Conductor Starter

> The development repo for the Conductor kit — the `.Codex/` folder that gets copied into
> other projects. What lives here is the kit itself, not an application.

## Philosophy

- **Every rule lives in the primitive that can hold it.** Advisory judgment in `AGENTS.md`,
  guarantees in hooks, occasional instructions in skills, isolated exploration in
  subagents. A "never" or "always" written as prose is a bug — it belongs in `hooks/`.
- **The kit scaffolds once, at project genesis, and never again.** After `/start` establishes
  a toolchain and a test runner, every subsequent change goes through spec → test →
  implement. There are no feature/CRUD/component generators, ever.
- **Enforcement follows trust.** Semantic judgments (is this minimal? secure? a duplicate?)
  stay advisory. Deterministic checks (exit codes, file paths, session identity) become
  hooks that do not ask the model's opinion.

## Conventions

- **Zero runtime dependencies, ever.** Hooks use only the Node runtime that ships with
  Codex. No `package.json`, no installs into a host project.
- **Hooks separate judgment from I/O.** All decision logic goes in `.Codex/hooks/lib/` as
  pure functions with tests; entry points only read stdin and write stdout. Every hook is
  zero-dep, never throws, and always exits 0.
- **Tests run with `node --test .Codex/hooks/*.test.js`.** The explicit glob is required —
  Node's test discovery skips dot-directories, so passing the bare directory finds nothing.
- **Hook scripts are referenced as `${CLAUDE_PROJECT_DIR}/.Codex/hooks/<name>.js`**, never
  by relative path: hooks run in the session's cwd, which changes across `cd` and worktrees.
- Conventional Commits. Never commit directly to `main`.

## Domain rules

- **`.Codex/context/project-context.md` stays blank on purpose.** It is the template that
  ships to host projects; filling it here would pollute every copy. This file is the
  starter's own project layer instead.
- **Anything under `.Codex/` travels.** Before adding a file, ask whether every project
  that copies the kit needs it. Add only on repeated need.
- The root `README.md` documents the starter repo; `.Codex/README.md` is the kit's manual
  and travels with it. Keep the two from drifting into duplicates.

## Risks & no-go zones

- `.Codex/settings.json` wires every hook — a syntax error there silently disables the
  whole quality layer. Validate after editing.
- The guards in `.Codex/hooks/lib/guards.js` can block real work if their patterns get
  greedy. Widen them only with a test that proves the new match, and prefer `ask` over
  `deny`.
- `.Codex/.state/` is machine-local session bookkeeping. Never commit it, never read it as
  project truth.
