---
name: nextjs
description: Next.js App Router conventions. Use when building or reviewing routes, server components, server actions, or data fetching in a Next.js project.
---

<!-- Stack pack — knowledge, not a generator. Enable by copying:
     mkdir -p .claude/skills/nextjs && cp .claude/templates/stacks/nextjs.md .claude/skills/nextjs/SKILL.md -->

# Next.js stack pack

Informs the spec→test→implement pipeline; never scaffolds code on its own.

## Patterns

- Server Components by default. Add `"use client"` only where interactivity or browser APIs
  demand it, and push it to the leaf — a client boundary high in the tree drags the subtree
  with it.
- Data fetching happens in the server component that needs it, not in a parent that passes
  it down. Colocate the query with its consumer.
- Mutations go through Server Actions with validation inside the action — the action is a
  public endpoint, not an internal function.
- `route.ts` handlers are for external consumers and webhooks. Do not build an internal API
  the app's own server components could call directly.
- Keep domain logic in `lib/` so it is callable without a request. If a test needs a
  `Request` object to check business logic, the boundary is wrong.

## Spec considerations (/sdd)

- State outcomes as what the user sees per route, including the loading and error states —
  `loading.tsx` and `error.tsx` are behavior, not polish.
- Note whether a route is static, dynamic, or revalidated; it changes the verification.

## Reviewer hints

- Security: Server Actions and route handlers both need auth checked inside them. Never
  trust that the calling page checked. Keep server-only secrets out of any module a client
  component imports.
- Performance: watch for waterfalls from sequential awaits — parallelize with
  `Promise.all`. Confirm caching and revalidation are deliberate, not accidental defaults.
- Accessibility: `next/link` for navigation; announce route transitions where they matter.

## Test strategy

Unit-test `lib/` directly. Integration-test Server Actions and route handlers by calling
them, not over HTTP. One end-to-end pass through the primary flow and the auth path.
Do not snapshot-test server component markup — it tests the framework, not your code.
