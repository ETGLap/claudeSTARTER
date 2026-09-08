---
name: review-accessibility-native
description: Accessibility gates for React Native / Expo UI — accessibilityRole and accessibilityLabel, touch target size, screen-reader grouping, OS font scaling, and reduced-motion. Apply while reviewing or writing native mobile interface code.
when_to_use: The change renders or restyles a React Native screen or component. Native primitives differ from the web — divs, CSS contrast rules and aria-* do not apply.
paths:
  - "**/*.{ios,android}.{tsx,jsx}"
  - "**/screens/**/*.{tsx,jsx}"
  - "app/**/*.native.{tsx,jsx}"
---

# Accessibility — native

Usable by everyone, on a device. React Native has no DOM: the web checklist does not
transfer, and applying it here produces confident, wrong advice.
Applies only to React Native / Expo UI; otherwise skip and note.

- [ ] Interactive elements carry `accessibilityRole` and a meaningful
      `accessibilityLabel` — a `Pressable` wrapping a `View` announces nothing on its own.
- [ ] Touch targets are at least 44x44pt.
- [ ] Related elements are grouped with `accessible` so the screen reader reads them as one
      unit rather than word by word.
- [ ] State is exposed via `accessibilityState` (selected, disabled, checked), not by
      styling alone.
- [ ] Layout survives OS font scaling — no fixed heights around scalable text.
- [ ] Contrast checked against the rendered theme, including dark mode.
- [ ] `prefers-reduced-motion` (via `AccessibilityInfo`) respected for non-essential motion.
- [ ] Screen changes and async results are announced (`AccessibilityInfo.announceForAccessibility`)
      where they matter.
