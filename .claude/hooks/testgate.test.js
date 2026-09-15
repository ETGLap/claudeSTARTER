"use strict";

const test = require("node:test");
const assert = require("node:assert");
const { shouldRunTests, treeSignature } = require("./lib/testgate.js");

test("shouldRunTests: runs when there is no record of a previous run", () => {
  assert.strictEqual(shouldRunTests({ signature: "abc", last: null }), true);
});

test("shouldRunTests: skips when nothing changed since the last green run", () => {
  assert.strictEqual(
    shouldRunTests({ signature: "abc", last: { signature: "abc", green: true } }),
    false
  );
});

test("shouldRunTests: runs when the tree changed since the last green run", () => {
  assert.strictEqual(
    shouldRunTests({ signature: "def", last: { signature: "abc", green: true } }),
    true
  );
});

// Red must never be allowed to go quiet: an unchanged tree that failed last time is still
// failing, and the whole point of the gate is that "done" stays blocked until it passes.
test("shouldRunTests: re-runs an unchanged tree when the last run was red", () => {
  assert.strictEqual(
    shouldRunTests({ signature: "abc", last: { signature: "abc", green: false } }),
    true
  );
});

// Fail safe, never fail open. If the signature cannot be computed for any reason, run the
// suite — a skipped gate is worse than a slow one.
test("shouldRunTests: runs when the signature is unavailable", () => {
  assert.strictEqual(shouldRunTests({ signature: null, last: { signature: "abc", green: true } }), true);
  assert.strictEqual(shouldRunTests({ signature: "", last: { signature: "", green: true } }), true);
});

test("treeSignature: stable for identical input, different when the tree moves", () => {
  const a = treeSignature("deadbeef", " M src/app.js\n", [["src/app.js", "digest"]], "node test.js");
  assert.strictEqual(a, treeSignature("deadbeef", " M src/app.js\n", [["src/app.js", "digest"]], "node test.js"));
  assert.notStrictEqual(a, treeSignature("deadbeef", " M src/other.js\n", [["src/app.js", "digest"]], "node test.js"));
  assert.notStrictEqual(a, treeSignature("cafebabe", " M src/app.js\n", [["src/app.js", "digest"]], "node test.js"));
});

test("treeSignature: null when git state is unavailable", () => {
  assert.strictEqual(treeSignature(null, null), null);
});

test("malformed green values never reuse cached verification", () => {
  for (const green of ["false", 1, {}, []]) {
    assert.equal(shouldRunTests({ signature: "x", last: { signature: "x", green } }), true);
  }
});
