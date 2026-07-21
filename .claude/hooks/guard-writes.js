#!/usr/bin/env node
"use strict";

// PreToolUse guard for file writes. Turns three prose rules into enforced ones:
//   ADRs are append-only · implemented specs are superseded, not rewritten ·
//   secret material is never written by Claude.
// Judgment lives in lib/guards.js; this file only does I/O.

const fs = require("node:fs");
const path = require("node:path");
const { run, preToolUse } = require("./lib/io.js");
const { loadConfig } = require("./lib/config.js");
const { decideWrite } = require("./lib/guards.js");

// Write/Edit/MultiEdit use file_path; NotebookEdit uses notebook_path.
const targetOf = (input) =>
  typeof input?.file_path === "string"
    ? input.file_path
    : typeof input?.notebook_path === "string"
      ? input.notebook_path
      : null;

/** Read a file only when it is small enough to be a spec — never slurp a binary. */
function readIfSmall(filePath) {
  try {
    if (fs.statSync(filePath).size > 256 * 1024) return null;
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

run((payload) => {
  const filePath = targetOf(payload.tool_input);
  if (!filePath) return null;

  // Match on the path as written (patterns are suffix-based) but hit the disk on the
  // resolved one, so a relative file_path still works if cwd ever diverges.
  const resolved = path.resolve(payload.cwd || process.cwd(), filePath);
  const exists = fs.existsSync(resolved);

  const decision = decideWrite({
    filePath,
    exists,
    content: exists ? readIfSmall(resolved) : null,
    config: loadConfig().guards,
  });

  return decision ? preToolUse(decision) : null;
});
