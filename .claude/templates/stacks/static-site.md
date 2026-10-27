---
name: static-site
description: Static site conventions (Astro, Eleventy, plain HTML). Use when building or reviewing marketing pages, docs sites, or any site with no server-side state.
---

<!-- Stack pack — knowledge, not a generator. Enable by copying:
     mkdir -p .claude/skills/static-site && cp .claude/templates/stacks/static-site.md .claude/skills/static-site/SKILL.md -->

# Static site stack pack

Informs the spec→test→implement pipeline; never scaffolds code on its own.

## Patterns

- Ship zero JavaScript by default; add it per-component, only where it earns its place.
- Semantic HTML first. Most of what a marketing site needs is headings, lists, and links
  used correctly.
- Content lives in content files, not in markup, once a non-developer needs to edit it or
  the page count passes ~15.
- One shared layout with slots beats copied page shells. Extract on the third repeat, not
  the first.
- Images get explicit dimensions and modern formats — layout shift is the main perceived
  defect on this kind of site.

## Spec considerations (/sdd)

- Outcomes are pages and their content, plus the responsive behavior that matters.
- Verification is mostly **manual** or acceptance: it renders, it is readable, links
  resolve, Lighthouse clears the bar. Tag them honestly rather than inventing unit tests.

## Reviewer hints

- Security: no secrets in the bundle — a static site has no server to hide them. Third-party
  embeds are supply chain; pin and justify each one.
- Performance: budget the page weight. Preload fonts, avoid render-blocking scripts.
- Accessibility: this is the main quality axis here — heading order, contrast, focus
  visibility, alt text, and a keyboard-reachable nav.

## Test strategy

Build success plus link checking is the automated tier, and it is usually enough.
Accessibility and visual review are manual and documented; avoid unit tests that only
restate static markup.
