# TDD

Drive every change from a failing test: Red → Green → Refactor.

Order is the whole point. Tests written after the code verify the code, not the intent —
broken code plus tests written to match it passes cleanly. Writing the test first locks in
what correct means before an implementation exists to bias it.

- [ ] Expected behavior defined — verification criteria from the governing spec (if any) seed the tests.
- [ ] Expected values come from the spec or the user, never from running the code first.
- [ ] Relevant existing tests run first — green baseline established.
- [ ] Existing tests reused where possible; missing tests identified.
- [ ] Smallest failing test written before production code (Red), and its failure read.
- [ ] Failing test committed before any implementation code was written — git is the record
      that test-first actually happened.
- [ ] Minimal code makes it pass (Green); edge cases covered.
- [ ] A red test is fixed in the implementation — never by weakening, deleting, or
      rewriting the test to match what the code does.
- [ ] Tests run and output read; no regressions vs the baseline.
- [ ] If tests are impossible: manual verification documented.
