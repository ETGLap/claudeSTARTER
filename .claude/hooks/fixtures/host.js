"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

function host(t, { git = false, parent } = {}) {
  const dir = fs.mkdtempSync(path.join(parent || os.tmpdir(), "conductor-host-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const kit = path.join(dir, ".claude");
  fs.cpSync(path.resolve(__dirname, ".."), path.join(kit, "hooks"), {
    recursive: true,
    filter: (source) => !source.endsWith(".test.js") && path.basename(source) !== "fixtures",
  });
  fs.mkdirSync(path.join(kit, "context"));
  fs.writeFileSync(path.join(kit, "context/project-context.md"), "Purpose: <what this project is>\n");
  fs.writeFileSync(path.join(dir, ".gitignore"), ".claude/.state/\nignored/\n");
  function write(file, content) {
    const target = path.join(dir, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
  function configure(config = {}) { write(".claude/conductor.config.json", JSON.stringify(config)); }
  function gitRun(...args) {
    const result = spawnSync("git", ["-c", "core.hooksPath=/dev/null", "-c", "commit.gpgsign=false", ...args], {
      cwd: dir, encoding: "utf8",
      env: { ...process.env, GIT_AUTHOR_NAME: "Fixture", GIT_AUTHOR_EMAIL: "fixture@example.invalid",
        GIT_COMMITTER_NAME: "Fixture", GIT_COMMITTER_EMAIL: "fixture@example.invalid" },
    });
    if (result.status !== 0) throw new Error(result.stderr);
    return result.stdout;
  }
  function run(name, payload = {}, options = {}) {
    const result = spawnSync(process.execPath, [path.join(kit, "hooks", name)], {
      input: typeof payload === "string" ? payload : JSON.stringify({ cwd: dir, session_id: "fixture-session", ...payload }),
      cwd: options.cwd || dir, encoding: "utf8", timeout: 15000,
      env: { ...process.env, ...options.env },
    });
    const output = result.stdout?.trim();
    return { code: result.status, json: output ? JSON.parse(output) : null, stderr: result.stderr };
  }
  configure();
  if (git) { gitRun("init", "-q", "-b", "main"); gitRun("add", "."); gitRun("commit", "-qm", "fixture baseline"); }
  return { dir, kit, write, configure, run, git: gitRun };
}

module.exports = { host };
