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

test("buildContext: nudges bootstrap only while project-context is blank", () => {
  assert.match(buildContext({ contextUnfilled: true }), /maintain project/);
  assert.doesNotMatch(buildContext({ contextUnfilled: false }), /maintain project/);
});
