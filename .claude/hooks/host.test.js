"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { host } = require("./fixtures/host");

const node = JSON.stringify(process.execPath);
const gate = (h, session_id = "s1") => h.run("test-gate.js", { session_id }).json;
const message = (result) => result?.hookSpecificOutput?.additionalContext || result?.systemMessage || "";
function countingSuite(h, cache = true) {
  h.write("suite.js", "const fs=require('node:fs');const p='ignored/runs';fs.mkdirSync('ignored',{recursive:true});fs.appendFileSync(p,'x');process.exit(fs.readFileSync('input.txt','utf8').includes('bad')?1:0);");
  h.write("input.txt", "good");
  h.configure({ testGate: { enabled: true, command: `${node} suite.js`, cache, maxBlocks: 2 } });
  return () => fs.readFileSync(path.join(h.dir, "ignored/runs"), "utf8").length;
}

test("configured gate reruns repeated tracked and untracked edits, and caches unchanged green", (t) => {
  const h = host(t, { git: true });
  const runs = countingSuite(h);
  h.git("add", "."); h.git("commit", "-qm", "suite");
  h.write("input.txt", "good modified");
  assert.equal(gate(h), null); assert.equal(runs(), 1);
  assert.equal(gate(h), null); assert.equal(runs(), 1);
  h.write("input.txt", "good modified again");
  assert.equal(gate(h), null); assert.equal(runs(), 2);
  h.write("extra.txt", "one"); gate(h); assert.equal(runs(), 3);
  h.write("extra.txt", "two"); gate(h); assert.equal(runs(), 4);
  h.write("input.txt", "bad");
  assert.equal(gate(h).decision, "block"); assert.equal(runs(), 5);
});

test("test command changes invalidate a green cache", (t) => {
  const h = host(t, { git: true }); countingSuite(h); gate(h);
  h.configure({ testGate: { enabled: true, cache: true, command: `${node} -e "process.exit(1)"` } });
  assert.equal(gate(h).decision, "block");
});

test("caching is opt-in for suites with external or ignored inputs", (t) => {
  const h = host(t, { git: true }); const runs = countingSuite(h, undefined);
  h.configure({ testGate: { enabled: true, command: `${node} suite.js` } });
  gate(h); gate(h); assert.equal(runs(), 2);
});

test("cache is invalidated when the suite changes its own inputs", (t) => {
  const h = host(t, { git: true });
  h.write("suite.js", "const fs=require('node:fs');fs.writeFileSync('input.txt',fs.existsSync('input.txt')?'two':'one');");
  h.configure({ testGate: { enabled: true, cache: true, command: `${node} suite.js` } });
  gate(h); gate(h);
  assert.equal(fs.readFileSync(path.join(h.dir, "input.txt"), "utf8"), "two");
});

test("failure limit reports unverified work, rechecks recovery, and resets for a new session", (t) => {
  const h = host(t, { git: true }); countingSuite(h); h.write("input.txt", "bad");
  assert.equal(gate(h).decision, "block"); assert.equal(gate(h).decision, "block");
  const yielded = gate(h);
  assert.notEqual(yielded?.decision, "block"); assert.match(message(yielded), /verification failed/i);
  assert.equal(gate(h, "new-session").decision, "block");
  h.write("input.txt", "good"); assert.equal(gate(h), null);
  h.write("input.txt", "bad again"); assert.equal(gate(h).decision, "block");
});

test("sibling projects never share retry counters", (t) => {
  const a = host(t), b = host(t);
  for (const h of [a, b]) h.configure({ testGate: { enabled: true, command: `${node} -e "process.exit(1)"` } });
  gate(a); gate(a);
  assert.equal(gate(b).decision, "block");
});

test("gate executes from the kit root even when the shell and payload are in a subdirectory", (t) => {
  const h = host(t, { git: true }); const runs = countingSuite(h);
  h.write("nested/.keep", "");
  const sub = path.join(h.dir, "nested");
  assert.equal(h.run("test-gate.js", { cwd: sub }, { cwd: sub }).json, null);
  assert.equal(runs(), 1);
});

test("formatter runs a real command at the kit root and safely handles quoted file names", (t) => {
  const h = host(t);
  h.write("formatter.js", "const fs=require('node:fs');if(!fs.existsSync('root-marker'))process.exit(2);fs.writeFileSync(process.argv[2],'formatted');");
  h.write("root-marker", ""); h.write("nested/quote's file.txt", "raw");
  h.configure({ format: { enabled: true, command: `${node} formatter.js` } });
  const result = h.run("format.js", { tool_input: { file_path: "nested/quote's file.txt" } }, { cwd: os.tmpdir() });
  assert.equal(result.code, 0); assert.match(message(result.json), /reformatted/);
  assert.equal(fs.readFileSync(path.join(h.dir, "nested/quote's file.txt"), "utf8"), "formatted");
});

test("formatter failures are visible even if no file changed", (t) => {
  const h = host(t); h.write("input.txt", "raw");
  h.configure({ format: { enabled: true, command: `${node} -e "process.exit(2)"` } });
  const result = h.run("format.js", { tool_input: { file_path: "input.txt" } });
  assert.equal(result.code, 0); assert.match(message(result.json), /formatter failed/i);
});

test("malformed configuration warns rather than silently disarming the gate", (t) => {
  const h = host(t); h.write(".claude/conductor.config.json", "{broken");
  assert.match(message(gate(h)), /configuration/i);
});

test("patch payloads protect every file including moves and allow public examples", (t) => {
  const h = host(t);
  const runPatch = (command) => h.run("guard-writes.js", { tool_name: "apply_patch", tool_input: { command } }).json;
  const patch = "*** Begin Patch\n*** Add File: fine.txt\n+ok\n*** Add File: .env.local\n+x\n*** End Patch";
  assert.equal(runPatch(patch).hookSpecificOutput.permissionDecision, "deny");
  h.write("docs-vault/decisions/0001-a.md", "# Decision\n");
  assert.equal(runPatch("*** Begin Patch\n*** Update File: docs-vault/decisions/0001-a.md\n*** Move to: moved.md\n@@\n-old\n+new\n*** End Patch").hookSpecificOutput.permissionDecision, "ask");
  assert.equal(runPatch("*** Begin Patch\n*** Add File: .env.example\n+API_KEY=\n*** End Patch"), null);
});

test("read checks protect real env files without blocking example files or ADR reads", (t) => {
  const h = host(t);
  for (const file_path of [".env.example", "docs-vault/decisions/0001-a.md"]) {
    h.write(file_path, "placeholder");
    assert.equal(h.run("guard-writes.js", { tool_name: "Read", tool_input: { file_path } }).json, null);
  }
  assert.equal(h.run("guard-writes.js", { tool_name: "Read", tool_input: { file_path: "config/.env.local" } }).json.hookSpecificOutput.permissionDecision, "deny");
});

test("formatter processes every surviving file in a patch", (t) => {
  const h = host(t); h.write("a.txt", "raw"); h.write("b.txt", "raw");
  h.write("formatter.js", "require('node:fs').writeFileSync(process.argv[2],'formatted')");
  h.configure({ format: { enabled: true, command: `${node} formatter.js` } });
  const command = "*** Begin Patch\n*** Update File: a.txt\n@@\n-x\n+y\n*** Update File: b.txt\n@@\n-x\n+y\n*** Delete File: missing.txt\n*** End Patch";
  h.run("format.js", { tool_name: "apply_patch", tool_input: { command } });
  for (const name of ["a.txt", "b.txt"]) assert.equal(fs.readFileSync(path.join(h.dir, name), "utf8"), "formatted");
});

test("Codex adapter translates unsupported ask decisions to an explicit block", (t) => {
  const h = host(t);
  h.write(".claude/hooks/codex-test.js", "require('./lib/codex').runCodexHook('guard-bash.js')");
  const result = h.run("codex-test.js", { tool_name: "Bash", tool_input: { command: "git push --force" } });
  assert.equal(result.code, 0);
  assert.equal(result.json.hookSpecificOutput.permissionDecision, "deny");
  assert.match(result.json.hookSpecificOutput.permissionDecisionReason, /Codex.*confirmation/);
});

test("Codex adapter sends multi-file patch content through canonical write guards", (t) => {
  const h = host(t);
  h.write(".claude/hooks/codex-test.js", "require('./lib/codex').runCodexHook('guard-writes.js')");
  const command = "*** Begin Patch\n*** Add File: .env.production\n+API_KEY=\n*** End Patch";
  const result = h.run("codex-test.js", { tool_name: "apply_patch", tool_input: { command } });
  assert.equal(result.code, 0); assert.equal(result.json.hookSpecificOutput.permissionDecision, "deny");
});

test("invalid gate booleans and non-object payloads cannot silently skip verification", (t) => {
  const h = host(t);
  h.configure({ testGate: { enabled: 0, command: `${node} -e "process.exit(1)"` } });
  assert.match(message(gate(h)), /configuration/i);
  h.configure({ testGate: { enabled: true, command: `${node} -e "process.exit(1)"` } });
  assert.equal(h.run("test-gate.js", "null").json.decision, "block");
});

test("formatter reports a disappeared target and continues with later patch files", (t) => {
  const h = host(t); h.write("a.txt", "raw"); h.write("b.txt", "raw");
  h.write("formatter.js", "const fs=require('node:fs');const p=process.argv[2];if(p.endsWith('a.txt'))fs.renameSync(p,p+'.moved');else fs.writeFileSync(p,'formatted');");
  h.configure({ format: { enabled: true, command: `${node} formatter.js` } });
  const command = "*** Begin Patch\n*** Update File: a.txt\n@@\n-x\n+y\n*** Update File: b.txt\n@@\n-x\n+y\n*** End Patch";
  const result = h.run("format.js", { tool_name: "apply_patch", tool_input: { command } });
  assert.match(message(result.json), /formatter failed/i);
  assert.equal(fs.readFileSync(path.join(h.dir, "b.txt"), "utf8"), "formatted");
});

test("unwritable retry state cannot create an endless failing Stop loop", (t) => {
  const h = host(t);
  h.write(".claude/.state", "not a directory");
  h.configure({ testGate: { enabled: true, command: `${node} -e "process.exit(1)"` } });
  const result = gate(h);
  assert.notEqual(result?.decision, "block");
  assert.match(message(result), /verification failed/i);
  assert.match(message(result), /retry state/i);
});

test("lean defaults do not execute configured test or format commands", (t) => {
  const h = host(t);
  h.write("input.txt", "raw");
  const command = `${node} -e "require('node:fs').writeFileSync('unexpected-run','yes')"`;
  h.configure({ testGate: { command }, format: { command } });
  assert.equal(gate(h), null);
  assert.equal(h.run("format.js", { tool_input: { file_path: "input.txt" } }).json, null);
  assert.equal(fs.existsSync(path.join(h.dir, "unexpected-run")), false);
});
