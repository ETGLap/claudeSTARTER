#!/usr/bin/env node
"use strict";

// PostToolUse hook: run the project formatter on the file Claude just wrote.
//
// This is the rule CLAUDE.md cannot keep — "always format after editing" is an execution
// guarantee, not a preference. No-ops until `format.command` is set, so the kit stays inert
// in a project that has not configured one.

const fs = require("node:fs");
const { spawnSync } = require("node:child_process");
const { run, additionalContext } = require("./lib/io.js");
const { loadConfig } = require("./lib/config.js");
const { resolveTarget } = require("./lib/paths.js");

const FORMAT_TIMEOUT_MS = 20000;

const quote = (value) => `'${value.replace(/'/g, `'\\''`)}'`;

run((payload) => {
  const { format } = loadConfig();
  if (!format.enabled || !format.command.trim()) return null;

  // Resolve against the payload cwd, exactly as guard-writes.js does: a relative path with
  // a diverged cwd would otherwise miss and the formatter would silently do nothing.
  const filePath = resolveTarget(payload.cwd, payload.tool_input?.file_path);
  if (!filePath || !fs.existsSync(filePath)) return null;

  const before = fs.readFileSync(filePath, "utf8");
  spawnSync(`${format.command} ${quote(filePath)}`, {
    shell: true,
    encoding: "utf8",
    timeout: FORMAT_TIMEOUT_MS,
  });
  const after = fs.readFileSync(filePath, "utf8");

  // Only speak up when the file actually changed — PostToolUse context is not free, and a
  // silent no-op formatter should stay silent.
  if (before === after) return null;

  return additionalContext(
    "PostToolUse",
    `${filePath} was reformatted by \`${format.command}\`. Re-read it before further edits.`
  );
});
