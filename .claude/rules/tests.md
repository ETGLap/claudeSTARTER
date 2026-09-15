---
paths:
  - "**/*.{test,spec}.{js,jsx,ts,tsx,py,go,rb}"
  - "tests/**"
  - "__tests__/**"
---

# Test conventions

Applies when writing or changing tests.

- One behavior per test, named for the behavior — not for the function. A reader who sees
  only the test name should know what broke.
- Expected values come from the spec or the user, never from running the code and pasting
  what it produced. That inverts the point of the test.
- Test through the public surface. A test that reaches into internals will fail on a
  refactor that changed nothing a caller can see.
- Reuse the existing fixtures and helpers before adding new ones; a third near-duplicate
  setup is a shared fixture.
- Each test sets up and tears down its own state. Tests that must run in order are a defect.
- Assert on behavior, not on log output or call counts, unless the call itself is the
  contract.
- Fix the implementation to meet independent expectations. Correct a mistaken test only
  against requirements or another independent oracle; explain the evidence and preserve coverage.
