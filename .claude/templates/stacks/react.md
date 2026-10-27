---
name: react
description: React SPA conventions (Vite or CRA). Use when building or reviewing components, hooks, state, or client-side routing in a React single-page app.
---

<!-- Stack pack — knowledge, not a generator. Enable by copying:
     mkdir -p .claude/skills/react && cp .claude/templates/stacks/react.md .claude/skills/react/SKILL.md -->

# React SPA stack pack

Informs the spec→test→implement pipeline; never scaffolds code on its own.

## Patterns

- Server state and client state are different problems. Use a query library for the former;
  do not put fetched data in a global store and hand-manage its staleness.
- Custom hooks hold reusable logic; components render. A component with more than a couple
  of `useEffect`s is usually hiding a hook.
- Lift state only as far as the nearest common ancestor. Reaching for a global store to
  avoid passing one prop trades a small annoyance for a large one.
- Every `useEffect` needs a reason it cannot be derived during render. Most cannot.
- Route-level code splitting when the bundle is measurably slow — not before.

## Spec considerations (/sdd)

- Outcomes are user-visible: what appears, what is interactive, what happens on failure.
- Name the loading and empty states explicitly; they are the states most often skipped.

## Reviewer hints

- Security: never render unsanitized HTML; `dangerouslySetInnerHTML` needs a justification
  in the review. Tokens live in memory or httpOnly cookies, never `localStorage`.
- Performance: memoize only after measuring. Watch for unstable object/array props that
  defeat memoization, and for lists rendering without virtualization.
- Accessibility: use real buttons and links. Manage focus on route change and modal open.

## Test strategy

Unit-test hooks and `lib/`. Component-test interactive pieces through the testing library,
querying by role and label rather than test ids. One end-to-end pass through the primary
flow. Do not assert on markup structure — it breaks on refactors that changed nothing.
