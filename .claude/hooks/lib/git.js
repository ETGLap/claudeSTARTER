"use strict";

// Read branch metadata directly, including nested directories and worktrees.

const fs = require("node:fs");
const path = require("node:path");

const HEAD_REF = /^ref:\s*refs\/heads\/(.+)$/;

/** Extract a branch name from the contents of .git/HEAD. Detached HEAD => null. */
function parseHead(text) {
  if (typeof text !== "string") return null;
  const match = text.trim().match(HEAD_REF);
  return match ? match[1].trim() : null;
}

/** Resolve the real git directory: `.git` is a dir normally, a pointer file in worktrees. */
function resolveGitDir(cwd) {
  const dotGit = path.join(cwd, ".git");
  const stats = fs.statSync(dotGit); // throws when absent — caller catches
  if (stats.isDirectory()) return dotGit;

  const pointer = fs.readFileSync(dotGit, "utf8").trim();
  const match = pointer.match(/^gitdir:\s*(.+)$/);
  if (!match) return null;
  const target = match[1].trim();
  return path.isAbsolute(target) ? target : path.resolve(cwd, target);
}

/** Current branch for a working directory, or null if unknown (never throws). */
function currentBranch(cwd = process.cwd()) {
  try {
    let root = path.resolve(cwd);
    while (!fs.existsSync(path.join(root, ".git"))) {
      const parent = path.dirname(root);
      if (parent === root) return null;
      root = parent;
    }
    const gitDir = resolveGitDir(root);
    if (!gitDir) return null;
    return parseHead(fs.readFileSync(path.join(gitDir, "HEAD"), "utf8"));
  } catch {
    return null;
  }
}

module.exports = { parseHead, currentBranch, resolveGitDir };
