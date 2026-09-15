"use strict";
const test = require("node:test");
const assert = require("node:assert");
const { buildSessionStart } = require("./lib/context");

test("buildSessionStart: nudges bootstrap only while the project is un-bootstrapped", () => {
  assert.match(buildSessionStart({ needsBootstrap: "retrofit" }), /maintain project/);
  assert.strictEqual(buildSessionStart({ needsBootstrap: false, testGate: { enabled: true, command: "npm test" } }), null);
});

// An empty project and an un-retrofitted codebase need opposite advice: /maintain project
// maps a codebase, and there is nothing to map before one exists. Sending genesis there is
// the dead end the audit found, so the two paths must stay distinguishable.
test("buildSessionStart: sends an empty project to /start, not to /maintain project", () => {
  const genesis = buildSessionStart({ needsBootstrap: "genesis" });
  assert.match(genesis, /\/start/);
  assert.doesNotMatch(genesis, /maintain project/);
});

test("buildSessionStart: treats a bare `true` as the retrofit path", () => {
  // Back-compat: the flag used to be boolean. Defaulting to retrofit is the safe read —
  // it never tells someone with a real codebase to scaffold over it.
  assert.match(buildSessionStart({ needsBootstrap: true }), /maintain project/);
  assert.doesNotMatch(buildSessionStart({ needsBootstrap: true }), /\/start/);
});

test("configured projects need no repeated test reminder", () => {
  assert.strictEqual(buildSessionStart({ needsBootstrap: false }), null);
});
