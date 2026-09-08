---
name: review-accessibility-web
description: Accessibility gates for web UI — semantic elements and roles, keyboard reachability, labels and alt text, WCAG AA contrast, and announced dynamic content. Apply while reviewing or writing browser-rendered interface code.
when_to_use: The change renders or restyles something a person sees or operates in a browser — components, templates, forms, modals, navigation, stylesheets.
paths:
  - "**/*.vue"
  - "**/*.svelte"
  - "**/*.astro"
  - "**/*.html"
  - "**/*.css"
  - "**/*.scss"
  - "src/components/**/*.{tsx,jsx}"
  - "src/pages/**/*.{tsx,jsx}"
  - "app/**/*.{tsx,jsx}"
  - "components/**/*.{tsx,jsx}"
---

# Accessibility — web

Usable by everyone, not just mouse-and-vision users.
Applies to browser-rendered UI. For React Native, use `review-accessibility-native`
instead — its primitives and rules are different, not a subset of these.

- [ ] Semantic elements/roles — not divs styled as controls.
- [ ] Everything reachable by keyboard; focus visible and in a sane order.
- [ ] Inputs have labels; images have meaningful alt (or empty for decorative).
- [ ] Text contrast meets WCAG AA.
- [ ] No information conveyed by color alone.
- [ ] Dynamic content changes are announced (e.g. `aria-live`) where they matter.
- [ ] Focus is managed on route change, and moved into and out of modals.
