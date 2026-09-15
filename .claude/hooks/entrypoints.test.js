"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { host } = require("./fixtures/host");
const context = (result) => result.json?.hookSpecificOutput?.additionalContext || "";
const decision = (result) => result.json?.hookSpecificOutput?.permissionDecision;

// Every executable runs from a copied kit; no test reads or restores a live ledger.
test("write guard emits the supported envelope for secrets, ADRs, specs and ordinary writes", (t) => {
  const h = host(t);
  h.write("docs-vault/decisions/0001-a.md", "# ADR");
  h.write("docs-vault/specs/0001-a.md", "Status: implemented");
  for (const [file_path, expected] of [[".env", "deny"], ["docs-vault/decisions/0001-a.md", "ask"], ["docs-vault/specs/0001-a.md", "ask"], ["src/app.js", undefined]]) {
    const result = h.run("guard-writes.js", { tool_input: { file_path } });
    assert.equal(result.code, 0); assert.equal(decision(result), expected);
    if (expected) assert.equal(result.json.hookSpecificOutput.hookEventName, "PreToolUse");
  }
});

test("shell guard reads the branch from a nested payload cwd", (t) => {
  const h = host(t, { git: true }); h.write("nested/.keep", "");
  assert.equal(decision(h.run("guard-bash.js", { cwd: path.join(h.dir, "nested"), tool_input: { command: 'git commit -m "work"' } })), "ask");
  assert.equal(decision(h.run("guard-bash.js", { tool_input: { command: "git push --force" } })), "ask");
  assert.equal(h.run("guard-bash.js", { tool_input: { command: "npm test" } }).json, null);
});

test("session start distinguishes genesis, retrofit, and configured projects", (t) => {
  const h = host(t);
  assert.match(context(h.run("session-start.js")), /\/start/);
  h.write("package.json", "{}");
  assert.match(context(h.run("session-start.js")), /maintain project/);
  h.write("CLAUDE.md", "@.claude/CLAUDE.md");
  assert.doesNotMatch(context(h.run("session-start.js")), /maintain project|\/start/);
  assert.equal(h.run("session-start.js").json, null);
  assert.equal(fs.existsSync(path.join(h.kit, ".state")), false);
});

test("unconfigured formatter and notifier remain silent", (t) => {
  const h = host(t); h.write("file.txt", "unchanged");
  assert.equal(h.run("format.js", { tool_input: { file_path: "file.txt" } }).json, null);
  assert.equal(h.run("notify.js").json, null);
});

test("every hook survives malformed JSON without a process failure", (t) => {
  const h = host(t);
  for (const hook of ["guard-writes", "guard-bash", "session-start", "format", "test-gate", "notify"]) {
    assert.equal(h.run(`${hook}.js`, "}{ not json").code, 0, hook);
  }
});
