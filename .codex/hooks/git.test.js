"use strict";

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { parseHead, currentBranch } = require("./lib/git.js");

test("parseHead: a symbolic ref yields the branch name", () => {
  assert.strictEqual(parseHead("ref: refs/heads/main\n"), "main");
  assert.strictEqual(parseHead("ref: refs/heads/feat/nested-name\n"), "feat/nested-name");
});

test("parseHead: a detached HEAD has no branch", () => {
  assert.strictEqual(parseHead("9fceb02d0ae598e95dc970b74767f19372d61af8\n"), null);
});

test("parseHead: junk never throws", () => {
  for (const input of ["", null, undefined, "ref: nonsense"]) {
    assert.strictEqual(parseHead(input), null);
  }
});

test("currentBranch: reads .git/HEAD from a repo directory", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "conductor-git-"));
  fs.mkdirSync(path.join(dir, ".git"));
  fs.writeFileSync(path.join(dir, ".git", "HEAD"), "ref: refs/heads/develop\n");
  assert.strictEqual(currentBranch(dir), "develop");
  fs.rmSync(dir, { recursive: true, force: true });
});

test("currentBranch: follows a worktree .git file to the real gitdir", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "conductor-wt-"));
  const gitdir = path.join(dir, "realgit");
  fs.mkdirSync(gitdir);
  fs.writeFileSync(path.join(gitdir, "HEAD"), "ref: refs/heads/wt-branch\n");
  fs.writeFileSync(path.join(dir, ".git"), `gitdir: ${gitdir}\n`);
  assert.strictEqual(currentBranch(dir), "wt-branch");
  fs.rmSync(dir, { recursive: true, force: true });
});

test("currentBranch: a non-repo directory yields null, never a throw", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "conductor-norepo-"));
  assert.strictEqual(currentBranch(dir), null);
  fs.rmSync(dir, { recursive: true, force: true });
});
