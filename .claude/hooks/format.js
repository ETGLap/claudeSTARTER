#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const { spawnSync } = require("node:child_process");
const { run, additionalContext } = require("./lib/io");
const { loadConfig, configWarning } = require("./lib/config");
const { resolveTarget, targetsOf } = require("./lib/paths");
const { PROJECT_ROOT } = require("./lib/state");

const quote = (value) => "'" + value.replace(/'/g, "'\\''") + "'";
const failed = (file, cause) => `Formatter failed for ${file} (${cause}). Formatting is unverified.`;

function formatFile(file, command, remaining) {
  try {
    if (!fs.existsSync(file)) return null; // A deleted or moved patch source has no output to format.
    if (remaining <= 0) return failed(file, "hook time budget exhausted");
    const before = fs.readFileSync(file, "utf8");
    const result = spawnSync(`${command} ${quote(file)}`, {
      cwd: PROJECT_ROOT, shell: true, encoding: "utf8", timeout: remaining,
      maxBuffer: 1024 * 1024,
    });
    if (result.status !== 0) return failed(file, result.error?.code || `exit ${result.status}`);
    const after = fs.readFileSync(file, "utf8");
    return before === after ? null : `${file} was reformatted. Re-read it before further edits.`;
  } catch (error) { return failed(file, error.code || "file could not be checked"); }
}

run((payload) => {
  const warning = configWarning();
  if (warning) return additionalContext("PostToolUse", warning);
  const { format } = loadConfig();
  if (!format.enabled || !format.command.trim()) return null;
  // One budget for the whole patch leaves time to deliver output before the host timeout.
  const deadline = Date.now() + 20000;
  const messages = targetsOf(payload).map((target) => {
    const file = resolveTarget(payload.cwd, target);
    return file ? formatFile(file, format.command, Math.max(0, deadline - Date.now())) : null;
  }).filter(Boolean);
  return messages.length ? additionalContext("PostToolUse", messages.join("\n").slice(0, 4000)) : null;
});
