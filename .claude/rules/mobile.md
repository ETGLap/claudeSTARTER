---
paths:
  - "**/*.{ios,android}.{ts,tsx,js,jsx}"
  - "app.json"
  - "app.config.{js,ts}"
  - "**/screens/**"
---

# Mobile conventions

Applies when working on a React Native / Expo target.

- Shared by default. Platform-specific code exists only where the platforms genuinely
  differ, isolated behind an interface — and each divergence is recorded in the spec or an
  ADR per the compatibility gate.
- Accessibility uses native primitives: `accessibilityRole`, `accessibilityLabel`,
  `accessible`. Web semantics (`role` on a div, CSS contrast rules) do not apply here.
- Touch targets are at least 44×44pt. A tappable area smaller than a fingertip is a defect.
- Lists that can grow use a virtualized list, never a mapped array in a scroll view.
- Anything requiring a permission handles the denial path. Denied is a normal state, not an
  error case to skip.
- Device behavior — permissions, deep links, notifications, background state — is verified
  manually on a device or simulator and documented. Do not fake it in a unit test and call
  it covered.
