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

test("test rules cover conventional supported filenames without matching ordinary source", {
  skip: typeof path.matchesGlob !== "function" && "Node 22.5+ supplies the built-in glob matcher",
}, () => {
  const rules = fs.readFileSync(path.resolve(__dirname, "../.claude/rules/tests.md"), "utf8");
  const patterns = [...rules.matchAll(/^  - "([^"]+)"$/gm)].map((match) => match[1]);
  const matches = (file) => patterns.some((pattern) => path.matchesGlob(file, pattern));
  for (const file of ["src/math.test.js", "src/view.spec.tsx", "src/math_test.go", "src/test_math.py", "src/math_test.py", "spec/math_spec.rb", "tests/check.py", "__tests__/view.tsx"]) {
    assert.equal(matches(file), true, file);
  }
  for (const file of ["src/math.go", "src/math.py", "src/latest_math.py", "src/math.rb", "src/view.tsx"]) {
    assert.equal(matches(file), false, file);
  }
});
