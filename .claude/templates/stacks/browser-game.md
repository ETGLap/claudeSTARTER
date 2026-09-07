---
name: browser-game
description: Browser game conventions (canvas or WebGL). Use when building or reviewing a game loop, entity state, rendering, input handling, or collision logic.
---

<!-- Stack pack — knowledge, not a generator. Enable by copying:
     mkdir -p .claude/skills/browser-game && cp .claude/templates/stacks/browser-game.md .claude/skills/browser-game/SKILL.md -->

# Browser game stack pack

Informs the spec→test→implement pipeline; never scaffolds code on its own.

## Patterns

- Separate update from render. `update(dt)` mutates state and touches no canvas; `render()`
  draws and mutates nothing. This split is what makes the logic testable at all.
- Fixed timestep for simulation, interpolated for drawing. Frame-rate-dependent physics is
  the defect that only appears on someone else's machine.
- Input is sampled into a state object once per frame, not handled inline in listeners.
- Keep the game state a plain serializable object — save, replay, and debugging all follow
  from it for free.
- No allocation in the hot loop. Pool objects rather than creating per frame.

## Spec considerations (/sdd)

- Outcomes are rules, not feel: "colliding with a hazard ends the run" is testable;
  "the jump feels good" is not.
- Tag feel, timing, and animation outcomes **manual** explicitly. This is the clearest case
  in the kit of a spec whose verification is legitimately not automated.

## Reviewer hints

- Security: validate anything that comes back from storage or a server — a saved game is
  untrusted input.
- Performance: profile before optimizing; measure frame time, not intuition. Watch GC
  pauses from per-frame allocation.
- Accessibility: keyboard alternatives to mouse-only controls, a pause, respect
  `prefers-reduced-motion`, and never signal state by color alone.

## Test strategy

Unit-test the pure layer — collision math, scoring, state transitions, save/load round-trip.
Game feel and rendering are **manual verification, documented**. Do not chase coverage on
the render path; it costs real effort and catches nothing a playthrough would not.
