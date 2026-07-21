"use strict";

// Integration tests for the hook entry points: spawn each one exactly as the harness does
// (JSON on stdin) and assert the documented output envelope. The unit tests prove the
// rules; these prove the wiring — payload parsing, path resolution, and the never-throw,
// always-exit-0 contract.

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const HOOKS = __dirname;

/** Run a hook with a payload; returns { code, json } where json is null on empty stdout. */
function runHook(name, payload, args = []) {
  const result = spawnSync(process.execPath, [path.join(HOOKS, name), ...args], {
    input: typeof payload === "string" ? payload : JSON.stringify(payload),
    encoding: "utf8",
  });
  const out = (result.stdout || "").trim();
  return { code: result.status, json: out ? JSON.parse(out) : null };
}

/** A throwaway repo with an existing ADR and an implemented spec. */
function fixtureRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "conductor-e2e-"));
  fs.mkdirSync(path.join(dir, "docs-vault", "decisions"), { recursive: true });
  fs.mkdirSync(path.join(dir, "docs-vault", "specs"), { recursive: true });
  fs.mkdirSync(path.join(dir, ".git"));
  fs.writeFileSync(path.join(dir, ".git", "HEAD"), "ref: refs/heads/main\n");
  fs.writeFileSync(path.join(dir, "docs-vault", "decisions", "0001-a.md"), "# ADR\n");
  fs.writeFileSync(
    path.join(dir, "docs-vault", "specs", "0002-done.md"),
    "# 0002\n\nStatus: implemented\n"
  );
  fs.writeFileSync(
    path.join(dir, "docs-vault", "specs", "0003-open.md"),
    "# 0003\n\nStatus: approved\n"
  );
  return dir;
}

const cleanup = (dir) => fs.rmSync(dir, { recursive: true, force: true });

test("guard-writes: denies a secret file with the documented envelope", () => {
  const { code, json } = runHook("guard-writes.js", {
    tool_input: { file_path: ".env" },
  });
  assert.strictEqual(code, 0);
  assert.strictEqual(json.hookSpecificOutput.hookEventName, "PreToolUse");
  assert.strictEqual(json.hookSpecificOutput.permissionDecision, "deny");
  assert.ok(json.hookSpecificOutput.permissionDecisionReason.length > 0);
});

test("guard-writes: resolves a relative path against the payload cwd", () => {
  const dir = fixtureRepo();
  const { code, json } = runHook("guard-writes.js", {
    cwd: dir,
    tool_input: { file_path: "docs-vault/decisions/0001-a.md" },
  });
  assert.strictEqual(code, 0);
  assert.strictEqual(json.hookSpecificOutput.permissionDecision, "ask");
  assert.match(json.hookSpecificOutput.permissionDecisionReason, /append-only/i);
  cleanup(dir);
});

test("guard-writes: an implemented spec asks, an approved one does not", () => {
  const dir = fixtureRepo();
  const blocked = runHook("guard-writes.js", {
    cwd: dir,
    tool_input: { file_path: "docs-vault/specs/0002-done.md" },
  });
  assert.strictEqual(blocked.json.hookSpecificOutput.permissionDecision, "ask");

  const allowed = runHook("guard-writes.js", {
    cwd: dir,
    tool_input: { file_path: "docs-vault/specs/0003-open.md" },
  });
  assert.strictEqual(allowed.json, null);
  cleanup(dir);
});

test("guard-writes: ordinary files produce no output", () => {
  const { code, json } = runHook("guard-writes.js", {
    tool_input: { file_path: "src/app.js" },
  });
  assert.strictEqual(code, 0);
  assert.strictEqual(json, null);
});

test("guard-bash: force push asks", () => {
  const { code, json } = runHook("guard-bash.js", {
    tool_input: { command: "git push --force origin main" },
  });
  assert.strictEqual(code, 0);
  assert.strictEqual(json.hookSpecificOutput.permissionDecision, "ask");
});

test("guard-bash: committing on main asks, using the branch from the payload cwd", () => {
  const dir = fixtureRepo();
  const { json } = runHook("guard-bash.js", {
    cwd: dir,
    tool_input: { command: 'git commit -m "wip"' },
  });
  assert.strictEqual(json.hookSpecificOutput.permissionDecision, "ask");
  assert.match(json.hookSpecificOutput.permissionDecisionReason, /main/);
  cleanup(dir);
});

test("guard-bash: a harmless command produces no output", () => {
  const { code, json } = runHook("guard-bash.js", {
    tool_input: { command: "npm run build" },
  });
  assert.strictEqual(code, 0);
  assert.strictEqual(json, null);
});

test("context-inject: reports branch and pending approved specs", () => {
  const dir = fixtureRepo();
  const { code, json } = runHook("context-inject.js", { cwd: dir });
  assert.strictEqual(code, 0);
  assert.strictEqual(json.hookSpecificOutput.hookEventName, "UserPromptSubmit");
  const text = json.hookSpecificOutput.additionalContext;
  assert.match(text, /default branch/); // fixture HEAD is main
  assert.match(text, /0003-open/); // approved, awaiting /implement
  assert.doesNotMatch(text, /0002-done/); // implemented, not pending
  cleanup(dir);
});

test("format: stays silent when no formatter is configured", () => {
  const { code, json } = runHook("format.js", {
    tool_input: { file_path: path.join(HOOKS, "format.js") },
  });
  assert.strictEqual(code, 0);
  assert.strictEqual(json, null);
});

test("every hook survives a malformed payload and still exits 0", () => {
  for (const hook of [
    "guard-writes.js",
    "guard-bash.js",
    "context-inject.js",
    "format.js",
  ]) {
    const { code } = runHook(hook, "}{ not json");
    assert.strictEqual(code, 0, `${hook} must exit 0 on garbage input`);
  }
});

test("spec-session + context-inject: the fresh-session test is actually enforced", (t) => {
  const { LEDGER_PATH } = require("./lib/spec-state.js");
  const saved = fs.existsSync(LEDGER_PATH) ? fs.readFileSync(LEDGER_PATH, "utf8") : null;
  t.after(() => {
    if (saved === null) fs.rmSync(LEDGER_PATH, { force: true });
    else fs.writeFileSync(LEDGER_PATH, saved);
  });

  const dir = fixtureRepo();

  // Session S1 writes an approved spec...
  const recorded = runHook("spec-session.js", {
    session_id: "S1",
    cwd: dir,
    tool_input: { file_path: path.join(dir, "docs-vault", "specs", "0003-open.md") },
  });
  assert.strictEqual(recorded.code, 0);
  assert.strictEqual(recorded.json, null, "the recorder must stay silent");

  // ...so S1 is warned off implementing it here...
  const sameSession = runHook("context-inject.js", { session_id: "S1", cwd: dir });
  const warned = sameSession.json.hookSpecificOutput.additionalContext;
  assert.match(warned, /Spec 0003-open was written in this session\./);
  assert.match(warned, /Commit it and \/clear before \/implement/);

  // ...while a fresh session sees it as an ordinary pending spec.
  const freshSession = runHook("context-inject.js", { session_id: "S2", cwd: dir });
  const clean = freshSession.json.hookSpecificOutput.additionalContext;
  assert.match(clean, /Approved specs awaiting \/implement: 0003-open\./);
  assert.doesNotMatch(clean, /was written in this session/);

  cleanup(dir);
});

test("spec-session: ignores writes that are not specs", (t) => {
  const { LEDGER_PATH } = require("./lib/spec-state.js");
  const before = fs.existsSync(LEDGER_PATH) ? fs.readFileSync(LEDGER_PATH, "utf8") : null;
  t.after(() => {
    if (before === null) fs.rmSync(LEDGER_PATH, { force: true });
  });

  runHook("spec-session.js", {
    session_id: "S1",
    tool_input: { file_path: "src/app.js" },
  });
  const after = fs.existsSync(LEDGER_PATH) ? fs.readFileSync(LEDGER_PATH, "utf8") : null;
  assert.strictEqual(after, before, "a non-spec write must not touch the ledger");
});

test("context-inject: the bootstrap nag keys on the root CLAUDE.md, not the blank template", () => {
  const dir = fixtureRepo();

  const bare = runHook("context-inject.js", { cwd: dir });
  assert.match(bare.json.hookSpecificOutput.additionalContext, /maintain project/);

  fs.writeFileSync(path.join(dir, "CLAUDE.md"), "@.claude/CLAUDE.md\n");
  const bootstrapped = runHook("context-inject.js", { cwd: dir });
  assert.doesNotMatch(
    bootstrapped.json.hookSpecificOutput.additionalContext,
    /maintain project/
  );

  cleanup(dir);
});

test("notify stays silent while disabled in config", () => {
  const { code, json } = runHook("notify.js", { cwd: process.cwd() }, ["stop"]);
  assert.strictEqual(code, 0);
  assert.strictEqual(json, null);
});
