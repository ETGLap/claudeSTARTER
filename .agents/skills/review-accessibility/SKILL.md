---
name: review-accessibility
description: Accessibility gates for UI-facing changes — semantic elements, keyboard reachability, labels and alt text, contrast, and announced dynamic content. Apply while reviewing or writing any user-facing interface code.
when_to_use: The change renders or restyles something a person sees or operates — components, templates, forms, modals, navigation, stylesheets.
paths:
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/*.vue"
  - "**/*.svelte"
  - "**/*.astro"
  - "**/*.html"
  - "**/*.css"
  - "**/*.scss"
---

# Accessibility

Usable by everyone, not just mouse-and-vision users.
Applies only to UI-facing changes; otherwise skip and note.

- [ ] Semantic elements/roles — not divs styled as controls.
- [ ] Everything reachable by keyboard; focus visible and in a sane order.
- [ ] Inputs have labels; images have meaningful alt (or empty for decorative).
- [ ] Text contrast meets WCAG AA.
- [ ] No information conveyed by color alone.
- [ ] Dynamic content changes are announced (e.g. `aria-live`) where they matter.
