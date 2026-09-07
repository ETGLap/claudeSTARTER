"use strict";

const test = require("node:test");
const assert = require("node:assert");
const { buildContext, buildSessionStart } = require("./lib/context.js");

// The pipeline lives in CLAUDE.md, which is already in context every turn. Restating it
// per prompt bought nothing and cost tokens on every single turn forever.
test("buildContext: does not restate the pipeline that CLAUDE.md already carries", () => {
  const text = buildContext({ branch: "dev" });
  assert.doesNotMatch(text, /spec-worthy work/);
  assert.doesNotMatch(text, /reuse-check/);
});

test("buildContext: returns null when there is nothing session-specific to say", () => {
  assert.strictEqual(buildContext({ testGate: { enabled: true, command: "npm test" } }), null);
});

test("buildContext: flags the default branch, stays quiet on a feature branch", () => {
  const onMain = buildContext({ branch: "main", defaultBranch: "main" });
  assert.match(onMain, /default branch/);

  const onFeature = buildContext({ branch: "feat/x", defaultBranch: "main" });
  assert.match(onFeature, /Branch: feat\/x/);
  assert.doesNotMatch(onFeature, /default branch/);
});

test("buildContext: no longer reports gate arming — that is a session-level fact", () => {
  assert.strictEqual(buildContext({ testGate: { enabled: true, command: "npm test" }, branch: "dev" }).includes("Test gate armed"), false);
});

test("buildContext: surfaces approved specs waiting to be implemented", () => {
  const text = buildContext({ approvedSpecs: ["0003-checkout", "0004-search"] });
  assert.match(text, /0003-checkout, 0004-search/);
});

test("buildContext: says nothing about specs when there are none", () => {
  assert.doesNotMatch(buildContext({ approvedSpecs: [] }) || "", /awaiting/);
  assert.doesNotMatch(buildContext({}) || "", /awaiting/);
});

// Bootstrap state is a per-session fact, so it moved to SessionStart. Repeating it on
// every prompt was pure duplication.
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

test("buildSessionStart: says once that the test gate is unarmed", () => {
  assert.match(buildSessionStart({ testGate: { enabled: true, command: "" } }), /not armed/);
  assert.doesNotMatch(buildSessionStart({ testGate: { enabled: true, command: "npm test" } }) || "", /not armed/);
});

// Assert on the warning sentence itself rather than on "/clear", so the test stays honest
// about which line fired.
const WARNING = /(Spec|Specs) .+ (was|were) written in this session\./;

test("buildContext: warns when a spec was written in this very session", () => {
  const text = buildContext({ sameSessionSpecs: ["0004-checkout"] });
  assert.match(text, WARNING);
  assert.match(text, /0004-checkout/);
  assert.match(text, /Commit it and \/clear before \/implement/);
});

test("buildContext: pluralises the warning for several specs", () => {
  const text = buildContext({ sameSessionSpecs: ["0004-a", "0005-b"] });
  assert.match(text, WARNING);
  assert.match(text, /0004-a, 0005-b were written/);
});

test("buildContext: no same-session warning when the spec came from elsewhere", () => {
  assert.doesNotMatch(buildContext({ sameSessionSpecs: [] }) || "", WARNING);
  assert.doesNotMatch(buildContext({}) || "", WARNING);
});

test("buildContext: a same-session spec is not also listed as simply pending", () => {
  // Both lines would otherwise fire for the same spec, and the warning is the useful one.
  const text = buildContext({
    approvedSpecs: ["0004-checkout", "0005-other"],
    sameSessionSpecs: ["0004-checkout"],
  });
  assert.match(text, /Approved specs awaiting \/implement: 0005-other\./);
  assert.match(text, /0004-checkout was written in this session/i);
});
