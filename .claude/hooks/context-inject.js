#!/usr/bin/env node
"use strict";

// UserPromptSubmit hook: injects live session state (branch, test gate, pending specs)
// into every turn. Message composition lives in lib/context.js; this file gathers facts.
// Budget matters — UserPromptSubmit hooks default to a 30s timeout, so this stays on
// plain fs reads with no subprocess.

const fs = require("node:fs");
const path = require("node:path");
const { run, additionalContext } = require("./lib/io.js");
const { loadConfig } = require("./lib/config.js");
const { currentBranch } = require("./lib/git.js");
const { buildContext } = require("./lib/context.js");

const SPECS_DIR = "docs-vault/specs";
const MAX_SPECS_SCANNED = 40;
const PROJECT_CONTEXT = path.join(__dirname, "..", "context", "project-context.md");

/** Spec slugs whose front block says `Status: approved`. */
function approvedSpecs(cwd) {
  try {
    return fs
      .readdirSync(path.join(cwd, SPECS_DIR))
      .filter((name) => name.endsWith(".md"))
      .slice(0, MAX_SPECS_SCANNED)
      .filter((name) => {
        const text = fs.readFileSync(path.join(cwd, SPECS_DIR, name), "utf8").slice(0, 800);
        return /^\s*Status:\s*approved\b/im.test(text);
      })
      .map((name) => name.replace(/\.md$/, ""));
  } catch {
    return []; // no docs-vault yet — nothing to report
  }
}

/** True while project-context.md still holds its unfilled placeholders. */
function contextUnfilled() {
  try {
    return /<what this project is>/.test(fs.readFileSync(PROJECT_CONTEXT, "utf8"));
  } catch {
    return false;
  }
}

/** The repo's default branch, best-effort from the origin HEAD ref. */
function defaultBranch(cwd) {
  for (const candidate of ["main", "master"]) {
    if (fs.existsSync(path.join(cwd, ".git", "refs", "heads", candidate))) return candidate;
  }
  return "main";
}

run((payload) => {
  const config = loadConfig();
  if (config.injectContext === false) return null;

  const cwd = payload.cwd || process.cwd();
  const text = buildContext({
    branch: currentBranch(cwd),
    defaultBranch: defaultBranch(cwd),
    testGate: config.testGate,
    approvedSpecs: approvedSpecs(cwd),
    contextUnfilled: contextUnfilled(),
  });

  return additionalContext("UserPromptSubmit", text);
});
