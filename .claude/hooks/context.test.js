"use strict";
const test = require("node:test");
const assert = require("node:assert");
const { buildSessionStart, needsBootstrap } = require("./lib/context");

test("bootstrap checks require a filled purpose and an explicit supported workflow reference", () => {
  const state = { hasCodebase: true, context: "- **Purpose:** Track inventory.\n" };
  for (const instructions of ["@.claude/CLAUDE.md", "@./.claude/CLAUDE.md\n", "Read `.claude/CLAUDE.md` for the shared workflow."]) {
    assert.strictEqual(needsBootstrap({ ...state, instructions }), false);
    for (const context of ["", "- **Purpose:** <what this project is>", "- **Purpose:**\n- **Stack:** Node", "# Project context\n"]) {
      assert.strictEqual(needsBootstrap({ ...state, instructions, context }), "retrofit");
    }
  }
  for (const instructions of ["", "# Existing instructions", "The file .claude/CLAUDE.md is not imported.", "@.claude/CLAUDE.md.backup", "Read `.claude/CLAUDE.md.backup` for history.", "Read .claude/CLAUDE.md.example for history."]) {
    assert.strictEqual(needsBootstrap({ ...state, instructions }), "retrofit");
  }
  assert.strictEqual(needsBootstrap({ isStarter: true, hasCodebase: true }), "retrofit");
  assert.strictEqual(needsBootstrap(), "genesis");
});

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
