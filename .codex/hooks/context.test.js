"use strict";

const test = require("node:test");
const assert = require("node:assert");
const { buildContext, PIPELINE } = require("./lib/context.js");

test("buildContext: always carries the pipeline reminder", () => {
  assert.ok(buildContext({}).includes(PIPELINE));
});

test("buildContext: flags the default branch, stays quiet on a feature branch", () => {
  const onMain = buildContext({ branch: "main", defaultBranch: "main" });
  assert.match(onMain, /default branch/);

  const onFeature = buildContext({ branch: "feat/x", defaultBranch: "main" });
  assert.match(onFeature, /Branch: feat\/x/);
  assert.doesNotMatch(onFeature, /default branch/);
});

test("buildContext: reports whether the test gate is armed", () => {
  const armed = buildContext({ testGate: { enabled: true, command: "npm test" } });
  assert.match(armed, /Test gate armed: `npm test`/);

  const idle = buildContext({ testGate: { enabled: true, command: "" } });
  assert.match(idle, /not armed/);

  const off = buildContext({ testGate: { enabled: false, command: "npm test" } });
  assert.match(off, /not armed/);
});

test("buildContext: surfaces approved specs waiting to be implemented", () => {
  const text = buildContext({ approvedSpecs: ["0003-checkout", "0004-search"] });
  assert.match(text, /0003-checkout, 0004-search/);
});

test("buildContext: says nothing about specs when there are none", () => {
  assert.doesNotMatch(buildContext({ approvedSpecs: [] }), /awaiting/);
  assert.doesNotMatch(buildContext({}), /awaiting/);
});

test("buildContext: nudges bootstrap only while the project is un-bootstrapped", () => {
  assert.match(buildContext({ needsBootstrap: true }), /maintain project/);
  assert.doesNotMatch(buildContext({ needsBootstrap: false }), /maintain project/);
});

// Assert on the warning sentence itself, not on "/clear" — the standing pipeline line
// mentions /clear too, so matching that would pass whether or not the warning fired.
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
  assert.doesNotMatch(buildContext({ sameSessionSpecs: [] }), WARNING);
  assert.doesNotMatch(buildContext({}), WARNING);
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
