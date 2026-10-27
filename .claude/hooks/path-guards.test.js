"use strict";
const test = require("node:test");
const assert = require("node:assert");
const ON = { adrAppendOnly: true, implementedSpecs: true, secretFiles: true };
const OFF = { adrAppendOnly: false, implementedSpecs: false, secretFiles: false };
const { decideWrite } = require("./lib/guards");

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

test("example env files are public templates, other env files remain protected", () => {
  assert.equal(decideWrite({ filePath: "config/.env.example" }), null);
  for (const filePath of [".env.example.local", ".env.production", "config/.env"]) {
    assert.equal(decideWrite({ filePath }).permissionDecision, "deny");
  }
});
