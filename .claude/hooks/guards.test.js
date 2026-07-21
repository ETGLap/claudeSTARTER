"use strict";

// Red-phase tests for the guard decision logic. Pure functions only — no session, no fs,
// no subprocess — so the deterministic rules the kit used to state as prose are provable.

const test = require("node:test");
const assert = require("node:assert");
const { decideWrite, decideBash } = require("./lib/guards.js");

const ON = {
  adrAppendOnly: true,
  implementedSpecs: true,
  secretFiles: true,
  gitSafety: true,
};
const OFF = {
  adrAppendOnly: false,
  implementedSpecs: false,
  secretFiles: false,
  gitSafety: false,
};

test("decideWrite: ADRs are append-only once they exist", (t) => {
  const hit = decideWrite({
    filePath: "docs-vault/decisions/0001-use-postgres.md",
    exists: true,
    config: ON,
  });
  assert.strictEqual(hit.permissionDecision, "ask");
  assert.match(hit.permissionDecisionReason, /append-only/i);
});

test("decideWrite: a brand-new ADR is allowed through", () => {
  assert.strictEqual(
    decideWrite({
      filePath: "docs-vault/decisions/0002-new.md",
      exists: false,
      config: ON,
    }),
    null
  );
});

test("decideWrite: ADR rule matches absolute paths too", () => {
  const hit = decideWrite({
    filePath: "/Users/x/proj/docs-vault/decisions/0001-a.md",
    exists: true,
    config: ON,
  });
  assert.strictEqual(hit.permissionDecision, "ask");
});

test("decideWrite: implemented specs are not silently rewritten", () => {
  const hit = decideWrite({
    filePath: "docs-vault/specs/0007-checkout.md",
    exists: true,
    content: "# 0007\n\nStatus: implemented\n",
    config: ON,
  });
  assert.strictEqual(hit.permissionDecision, "ask");
  assert.match(hit.permissionDecisionReason, /supersede/i);
});

test("decideWrite: draft and approved specs stay editable", () => {
  for (const status of ["draft", "approved"]) {
    assert.strictEqual(
      decideWrite({
        filePath: "docs-vault/specs/0007-checkout.md",
        exists: true,
        content: `Status: ${status}\n`,
        config: ON,
      }),
      null
    );
  }
});

test("decideWrite: secret material is denied, not merely questioned", () => {
  const secrets = [
    ".env",
    ".env.local",
    "config/.env.production",
    "certs/server.pem",
    "certs/server.key",
    "/home/u/.ssh/id_rsa",
  ];
  for (const filePath of secrets) {
    const hit = decideWrite({ filePath, exists: true, config: ON });
    assert.ok(hit, `expected a decision for ${filePath}`);
    assert.strictEqual(hit.permissionDecision, "deny", filePath);
  }
});

test("decideWrite: ordinary source files are untouched", () => {
  for (const filePath of ["src/index.js", "README.md", "environment.ts"]) {
    assert.strictEqual(decideWrite({ filePath, exists: true, config: ON }), null);
  }
});

test("decideWrite: every rule is individually disableable", () => {
  assert.strictEqual(
    decideWrite({
      filePath: "docs-vault/decisions/0001-a.md",
      exists: true,
      config: OFF,
    }),
    null
  );
  assert.strictEqual(
    decideWrite({ filePath: ".env", exists: true, config: OFF }),
    null
  );
});

test("decideBash: force-push asks first", () => {
  for (const command of [
    "git push --force",
    "git push -f origin main",
    "git push --force-with-lease",
  ]) {
    const hit = decideBash({ command, branch: "feature", config: ON });
    assert.ok(hit, command);
    assert.strictEqual(hit.permissionDecision, "ask");
    assert.match(hit.permissionDecisionReason, /force/i);
  }
});

test("decideBash: a plain push is fine", () => {
  assert.strictEqual(
    decideBash({ command: "git push origin feature", branch: "feature", config: ON }),
    null
  );
});

test("decideBash: committing on the default branch asks first", () => {
  for (const branch of ["main", "master"]) {
    const hit = decideBash({ command: 'git commit -m "x"', branch, config: ON });
    assert.ok(hit, branch);
    assert.strictEqual(hit.permissionDecision, "ask");
  }
});

test("decideBash: committing on a feature branch is fine", () => {
  assert.strictEqual(
    decideBash({ command: 'git commit -m "x"', branch: "feat/thing", config: ON }),
    null
  );
});

test("decideBash: recursive force delete asks first", () => {
  for (const command of ["rm -rf build", "rm -fr ./dist", "rm --recursive --force x"]) {
    const hit = decideBash({ command, branch: "feature", config: ON });
    assert.ok(hit, command);
    assert.strictEqual(hit.permissionDecision, "ask");
  }
});

test("decideBash: non-recursive or non-forced rm passes", () => {
  for (const command of ["rm file.txt", "rm -r tmpdir", "rm -f stale.log"]) {
    assert.strictEqual(decideBash({ command, branch: "feature", config: ON }), null);
  }
});

test("decideBash: guarded verbs are only matched as commands, not as substrings", () => {
  for (const command of [
    "echo 'do not rm -rf anything'",
    "grep -r 'git push --force' docs/",
  ]) {
    assert.strictEqual(decideBash({ command, branch: "main", config: ON }), null, command);
  }
});

test("decideBash: chained commands are inspected segment by segment", () => {
  const hit = decideBash({
    command: "npm run build && rm -rf node_modules",
    branch: "feature",
    config: ON,
  });
  assert.ok(hit);
  assert.strictEqual(hit.permissionDecision, "ask");
});

test("decideBash: gitSafety off disables the git rules", () => {
  assert.strictEqual(
    decideBash({ command: "git push --force", branch: "main", config: OFF }),
    null
  );
});
