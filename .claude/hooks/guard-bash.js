#!/usr/bin/env node
"use strict";

// PreToolUse guard for shell commands: force pushes, commits on the default branch, and
// recursive force deletes all surface a confirmation instead of happening silently.
// Judgment lives in lib/guards.js; this file only does I/O.

const { run, preToolUse } = require("./lib/io.js");
const { loadConfig } = require("./lib/config.js");
const { decideBash } = require("./lib/guards.js");
const { currentBranch } = require("./lib/git.js");

run((payload) => {
  const command = payload.tool_input?.command;
  if (typeof command !== "string") return null;

  const decision = decideBash({
    command,
    branch: currentBranch(payload.cwd || process.cwd()),
    config: loadConfig().guards,
  });

  return decision ? preToolUse(decision) : null;
});
