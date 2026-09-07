"use strict";

// Branch lookup without spawning git.
//
// Why no subprocess: the UserPromptSubmit hook runs on every turn under a 30s budget, and
// spawning git costs ~10ms plus a process each time. `.git/HEAD` is a one-line file — read
// it directly and stay inside the zero-dependency, never-throw hook contract.

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
    const gitDir = resolveGitDir(cwd);
    if (!gitDir) return null;
    return parseHead(fs.readFileSync(path.join(gitDir, "HEAD"), "utf8"));
  } catch {
    return null;
  }
}

module.exports = { parseHead, currentBranch };
