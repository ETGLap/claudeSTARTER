# Accessibility — native

Usable by everyone, on a device. React Native has no DOM: the web checklist does not
transfer, and applying it here produces confident, wrong advice.
Applies only to React Native / Expo UI; otherwise skip.

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
