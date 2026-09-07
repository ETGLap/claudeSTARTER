"use strict";

// Red-phase tests for the spec-authorship ledger. This is what makes the fresh-session
// test enforceable rather than advisory: knowing which session wrote a spec is the only
// way to detect that you are about to implement it with the writing context still loaded.

const test = require("node:test");
const assert = require("node:assert");
const { specSlug, recordAuthor, authorOf, MAX_ENTRIES } = require("./lib/spec-state.js");

test("specSlug: extracts the slug from a spec path", () => {
  assert.strictEqual(specSlug("docs-vault/specs/0004-checkout.md"), "0004-checkout");
  assert.strictEqual(
    specSlug("/Users/x/proj/docs-vault/specs/0012-search-panel.md"),
    "0012-search-panel"
  );
});

test("specSlug: ignores anything that is not a spec", () => {
  for (const path of [
    "docs-vault/decisions/0001-a.md",
    "docs-vault/architecture.md",
    "src/specs/thing.md",
    "docs-vault/specs/nested/deep.md",
    "README.md",
    "",
    null,
  ]) {
    assert.strictEqual(specSlug(path), null, String(path));
  }
});

test("specSlug: normalises Windows separators", () => {
  assert.strictEqual(specSlug("docs-vault\\specs\\0004-checkout.md"), "0004-checkout");
});

test("recordAuthor: records a slug against the session that wrote it", () => {
  const state = recordAuthor({}, "0004-checkout", "session-a");
  assert.strictEqual(authorOf(state, "0004-checkout"), "session-a");
});

test("recordAuthor: does not mutate the state it was given", () => {
  const original = {};
  recordAuthor(original, "0004-checkout", "session-a");
  assert.deepStrictEqual(original, {});
});

test("recordAuthor: the first author wins — later edits do not reassign it", () => {
  // Why: the fresh-session test asks who *wrote* the spec. A later typo fix from the
  // implementing session must not launder the spec into looking externally authored.
  let state = recordAuthor({}, "0004-checkout", "session-a");
  state = recordAuthor(state, "0004-checkout", "session-b");
  assert.strictEqual(authorOf(state, "0004-checkout"), "session-a");
});

test("recordAuthor: keeps only the most recent entries", () => {
  let state = {};
  for (let i = 0; i < MAX_ENTRIES + 10; i += 1) {
    state = recordAuthor(state, `spec-${i}`, `session-${i}`);
  }
  const slugs = Object.keys(state);
  assert.strictEqual(slugs.length, MAX_ENTRIES);
  assert.strictEqual(authorOf(state, `spec-${MAX_ENTRIES + 9}`), `session-${MAX_ENTRIES + 9}`);
  assert.strictEqual(authorOf(state, "spec-0"), null); // oldest evicted
});

test("authorOf: unknown slugs and junk state yield null", () => {
  assert.strictEqual(authorOf({}, "0004-checkout"), null);
  assert.strictEqual(authorOf(null, "0004-checkout"), null);
  assert.strictEqual(authorOf({ "0004-checkout": "s" }, "nope"), null);
});

test("recordAuthor: ignores a missing slug or session id", () => {
  assert.deepStrictEqual(recordAuthor({}, null, "session-a"), {});
  assert.deepStrictEqual(recordAuthor({}, "0004-checkout", null), {});
});
