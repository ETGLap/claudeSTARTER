# NNNN — <Spec title>

> One sentence: what behavior this spec defines and for whom.

Status: draft | approved | implemented | superseded
Related: [[architecture]] · ADR [[decisions/0000-title]]

## 1. Outcomes

Observable, testable statements of success — what a user or system can do that they couldn't
before. Not implementation; outcomes.

- [ ] <observable outcome 1>
- [ ] <observable outcome 2>

## 2. Scope boundaries

- In: <what this spec covers>
- Out: <explicitly excluded — deferred or never>

## 3. Constraints

Project-specific rules that limit *how* this may work — only ones unique to this feature.
Global/standing constraints live in the root `CLAUDE.md` / `project-context.md`; link,
don't repeat.

- <constraint, e.g. "must reuse the existing auth middleware">

## 4. Prior decisions

Existing architecture, conventions, files, or features this depends on. Link them.

- Depends on: [[architecture]], <file/module paths>, ADR [[decisions/NNNN-title]]

## 5. Task breakdown

Small tasks describing *what* should exist, not how to build it.

- [ ] <thing that should exist / behavior that should hold>
- [ ] <...>

## 6. Verification criteria

Concrete steps or tests proving each outcome. Each maps to an automated test, a manual
check, or an acceptance criterion. These seed the failing tests in the TDD pipeline.

- [ ] <check for outcome 1> — (automated | manual | acceptance)
- [ ] <check for outcome 2> — (automated | manual | acceptance)
