"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { instructionGraph, checkWiring } = require("./validate-kit");

test("validation rejects missing hooks and machine-specific commands", () => {
  const config = { hooks: { Stop: [{ hooks: [{ command: "node /Users/someone/project/.claude/hooks/missing.js" }] }] } };
  const errors = checkWiring(config, () => false);
  assert.equal(errors.length, 2);
  assert.ok(errors.some((s) => /missing hook/.test(s)));
});

test("instruction validation follows nested imports and rejects cycles or missing files", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "conductor-imports-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, "CLAUDE.md"), "@core.md\nRoot\n");
  assert.throws(() => instructionGraph(root, "CLAUDE.md"), /ENOENT/);
  fs.writeFileSync(path.join(root, "core.md"), "Core\n");
  assert.match(instructionGraph(root, "CLAUDE.md"), /Core/);
  fs.writeFileSync(path.join(root, "core.md"), "@CLAUDE.md\n");
  assert.throws(() => instructionGraph(root, "CLAUDE.md"), /Import cycle/);
});
