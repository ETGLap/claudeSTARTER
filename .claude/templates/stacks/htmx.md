---
name: htmx
description: Server-rendered HTMX conventions. Use when building or reviewing endpoints that return HTML fragments, hx-* attributes, or server-driven UI flows.
---

<!-- Stack pack — knowledge, not a generator. Enable by copying:
     mkdir -p .claude/skills/htmx && cp .claude/templates/stacks/htmx.md .claude/skills/htmx/SKILL.md -->

# HTMX stack pack

Informs the spec→test→implement pipeline; never scaffolds code on its own.

## Patterns

- Endpoints return HTML fragments, not JSON; one fragment per swap target.
- Keep `hx-target`/`hx-swap` conventions consistent across the project — document them
  in `docs-vault/frontend.md` and reuse, don't invent per feature.
- Progressive enhancement: every route also works as a full page without JS.
- Branch full-page vs fragment on the `HX-Request` header, in one shared helper.

## Spec considerations (/sdd)

- Phrase outcomes as user-visible DOM changes ("clicking X updates panel Y").
- Verification criteria include the no-JS fallback path.

## Reviewer hints

- Security: fragment endpoints need the same auth + CSRF as full pages.
- Accessibility: swapped-in content is announced (`aria-live`) when it matters.
- Performance: keep fragments small; never re-render the full page into a swap.
