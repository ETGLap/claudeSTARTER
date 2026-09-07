---
name: expo
description: Expo / React Native conventions. Use when building or reviewing screens, navigation, native permissions, or platform-specific code in a mobile app.
---

<!-- Stack pack — knowledge, not a generator. Enable by copying:
     mkdir -p .claude/skills/expo && cp .claude/templates/stacks/expo.md .claude/skills/expo/SKILL.md -->

# Expo / React Native stack pack

Informs the spec→test→implement pipeline; never scaffolds code on its own.

## Patterns

- Shared by default. A `.ios.tsx` / `.android.tsx` split is a real divergence and gets
  recorded in the spec or an ADR — not a convenience.
- Prefer an Expo SDK module over a bare native module. Going bare is a one-way door for the
  build pipeline; make it a decision, not a drift.
- Virtualize any list that can grow (`FlatList`, `FlashList`). A `.map()` inside a
  `ScrollView` renders every row.
- Every permission has a denial path, and denial is a normal state with its own UI.
- Keep navigation state serializable so deep links and state restoration work.

## Spec considerations (/sdd)

- State the platforms in scope and any deliberate feature-parity divergence.
- Device-dependent outcomes (permissions, notifications, deep links, background) are
  **manual** verification criteria. Tag them that way — do not pretend they are automated.

## Reviewer hints

- Security: tokens go in `expo-secure-store`, never `AsyncStorage`. Nothing in `app.json`
  extra is a secret — it ships in the bundle.
- Performance: keep work off the JS thread; watch re-renders on scroll; measure on a real
  low-end device, not the simulator.
- Accessibility: `accessibilityRole`, `accessibilityLabel`, `accessible` — **not** web
  semantics. Touch targets ≥ 44×44pt. Respect the OS font-scaling setting.

## Test strategy

Unit-test `lib/` and hooks. Component-test screens with the native testing library.
Device behavior is manual on a simulator or device and documented in the spec — faking a
permission dialog in a unit test verifies the mock, not the app.
