---
name: debug
description: Work a bug from symptom to verified fix — reproduce, isolate, form a hypothesis, capture the bug in a failing test, then fix it. Use when something is broken and the cause is not yet known.
when_to_use: A defect is reported or observed and the cause is unknown. Trigger phrases: "this is broken", "why does X fail", "there's a bug in", "it crashes when", "debug this".
argument-hint: <symptom>
---

# /debug

Find the cause before changing anything. A bug fix skips the spec (`/sdd` is for new
behavior), but not the failing test — the test is what proves you found the real cause
rather than a coincidence that made the symptom go away.

## 1. Reproduce

Restate the symptom (`$ARGUMENTS`) and reproduce it deterministically: exact input, state,
environment, and the observed versus expected result. **If you cannot reproduce it, say so
and stop** — everything past this point would be guesswork dressed as diagnosis. Ask for
what you need instead.

## 2. Isolate

Narrow to the smallest input and shortest code path that still fails. Bisect: by commit if
it used to work, otherwise by halving the path. Delegate read-only tracing to a specialist
agent rather than reading the whole subsystem into this session.

Note what you ruled *out* as you go. That list is what stops you circling back.

## 3. Hypothesize

State the suspected cause as one falsifiable sentence, and say what observation would
disprove it. If two causes fit the evidence equally, find the observation that separates
them — do not fix both and declare victory.

Symptoms are not causes. A null check that silences a crash without explaining the null is
a second bug, not a fix.

## 4. Capture (Red)

Write the smallest failing test that reproduces the bug at the level the bug lives — unit
if the logic is wrong, integration if the wiring is. Run it, read the failure, and confirm
it fails **for the reason your hypothesis predicts**. A test that fails for a different
reason has not captured this bug.

Commit the test alone: `git commit -m "test: <symptom> (red)"`.

The test gate blocks "done" while red, and red is exactly where you are — that is expected;
it yields after `maxBlocks`. Do not weaken the gate to get past your own failing test.

## 5. Fix (Green)

Smallest change that addresses the **cause**. Run the new test plus the full suite — a fix
that breaks something else is not finished.

## 6. Review and report

Quality and security gates as usual; conditional lenses if in scope. Then report: symptom ·
cause · fix · the test that now guards it · what you ruled out · anything still unverified.

If the bug reached production through a gap in the process rather than a slip, say which
gap. That is the more valuable half of the report.
