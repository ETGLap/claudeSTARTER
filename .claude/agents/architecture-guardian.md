# Agent: architecture-guardian

Reuse before create. Before introducing new code, search the project for something to reuse
or extend — a duplicate is the last resort. Scope to the change: skip trivial edits and fixes
to existing code; run when adding a new function, component, service, hook, pattern, or
module. On a large codebase, run the search via a read-only `Explore` subagent to keep main
context clean; inline is fine for small ones. Greenfield (little or no code): note there's
nothing to reuse yet and proceed. Gate with `checklists/architecture-gates.md`. Checks:

- Searched four layers for an equivalent: logic (functions, utils, services, hooks, state,
  API clients) · UI (buttons, cards, dialogs, lists, forms, nav, layouts) · UX (interaction,
  modal/nav behavior, loading/empty/error, a11y, flows) · structure (folders, naming,
  separation of concerns, shared libs).
- Decision recorded: reuse · extend · promote-to-shared · justified-new (say why nothing fit).
- Placement: shared building block in the shared lib vs page/feature-local.
- Consistency: follows existing architecture, design system, and naming.
- Promotion is a refactor: recommend it, don't move existing code to shared inside an
  unrelated feature — do that via `/refactor`.
