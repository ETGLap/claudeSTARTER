#!/usr/bin/env node
"use strict";

// UserPromptSubmit hook: injects the state that can change between turns — branch and
// pending specs. Session-fixed facts (bootstrap status, test-gate arming) live in
// session-start.js instead. Message composition lives in lib/context.js; this gathers facts.
// Budget matters — UserPromptSubmit hooks default to a 30s timeout, so this stays on
// plain fs reads with no subprocess.

const fs = require("node:fs");
const path = require("node:path");
const { run, additionalContext } = require("./lib/io.js");
const { loadConfig } = require("./lib/config.js");
const { currentBranch } = require("./lib/git.js");
const { buildContext } = require("./lib/context.js");
const { authorOf, loadLedger } = require("./lib/spec-state.js");

const SPECS_DIR = "docs-vault/specs";
const MAX_SPECS_SCANNED = 40;

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
  const pending = approvedSpecs(cwd);
  const ledger = loadLedger();

  const text = buildContext({
    branch: currentBranch(cwd),
    defaultBranch: defaultBranch(cwd),
    approvedSpecs: pending,
    sameSessionSpecs: pending.filter((slug) => authorOf(ledger, slug) === payload.session_id),
  });

  return text ? additionalContext("UserPromptSubmit", text) : null;
});
