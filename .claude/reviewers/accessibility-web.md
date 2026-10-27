# Accessibility — web

Usable by everyone, not just mouse-and-vision users.
Applies to browser-rendered UI. For React Native, use `.claude/reviewers/accessibility-native.md`
instead — its primitives and rules are different, not a subset of these.

- [ ] Semantic elements/roles — not divs styled as controls.
- [ ] Everything reachable by keyboard; focus visible and in a sane order.
- [ ] Inputs have labels; images have meaningful alt (or empty for decorative).
- [ ] Text contrast meets WCAG AA.
- [ ] No information conveyed by color alone.
- [ ] Dynamic content changes are announced (e.g. `aria-live`) where they matter.
- [ ] Focus is managed on route change, and moved into and out of modals.
