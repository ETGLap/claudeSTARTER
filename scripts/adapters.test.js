"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { host } = require("../.claude/hooks/fixtures/host");
const { generatedFiles, staleGeneratedFiles } = require("./sync-adapters");
const ROOT = path.resolve(__dirname, "..");

test("checked-in adapters match the canonical source", () => {
  assert.deepEqual(staleGeneratedFiles(), []);
  for (const [file, expected] of generatedFiles()) {
    assert.equal(fs.readFileSync(path.join(ROOT, file), "utf8"), expected, file);
  }
});

test("installed Codex hook commands work in a copied Git host from a nested cwd", (t) => {
  const h = host(t, { git: true });
  fs.cpSync(path.join(ROOT, ".codex"), path.join(h.dir, ".codex"), { recursive: true });
  h.write("nested/.keep", "");
  let hooks = JSON.parse(fs.readFileSync(path.join(h.dir, ".codex/hooks.json"), "utf8")).hooks;
  function run(event, index, payload) {
    const command = hooks[event][index].hooks[0].command;
    const result = spawnSync(command, { shell: true, cwd: path.join(h.dir, "nested"),
      encoding: "utf8", input: JSON.stringify({ cwd: h.dir, session_id: "smoke", ...payload }), timeout: 15000 });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim() ? JSON.parse(result.stdout) : null;
  }
  const denied = run("PreToolUse", 1, { tool_name: "Bash", tool_input: { command: "git push --force" } });
  assert.equal(denied.hookSpecificOutput.permissionDecision, "deny");
  const patch = "*** Begin Patch\n*** Add File: .env.local\n+x\n*** End Patch";
  assert.equal(run("PreToolUse", 0, { tool_name: "apply_patch", tool_input: { command: patch } }).hookSpecificOutput.permissionDecision, "deny");
  hooks = JSON.parse(fs.readFileSync(path.join(h.dir, ".codex/hooks.optional.json"), "utf8")).hooks;
  h.configure({ testGate: { enabled: true, command: `${JSON.stringify(process.execPath)} -e "process.exit(1)"` } });
  assert.equal(run("Stop", 0, {}).decision, "block");
});

test("default wiring has no per-prompt, per-edit or Stop automation", () => {
  for (const file of [".claude/settings.json", ".codex/hooks.json"]) {
    const { hooks } = JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
    assert.deepEqual(Object.keys(hooks).sort(), ["PreToolUse", "SessionStart"]);
  }
});
