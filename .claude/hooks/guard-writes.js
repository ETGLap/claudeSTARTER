#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { run, preToolUse } = require("./lib/io.js");
const { loadConfig } = require("./lib/config.js");
const { decideWrite } = require("./lib/guards.js");
const { targetsOf } = require("./lib/paths.js");

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
  const targets = targetsOf(payload);
  if (payload.tool_name === "apply_patch" && targets.length === 0) {
    return preToolUse({ permissionDecision: "deny", permissionDecisionReason: "Cannot inspect this patch's file paths. Supply a standard apply_patch payload." });
  }
  const guards = loadConfig().guards;
  const config = payload.tool_name === "Read" ? { ...guards, adrAppendOnly: false, implementedSpecs: false } : guards;
  const decisions = targets.map((filePath) => {
    const resolved = path.resolve(payload.cwd || process.cwd(), filePath);
    const exists = fs.existsSync(resolved);
    const decision = decideWrite({
      filePath: resolved,
      exists,
      content: exists && /(^|\/)docs-vault\/specs\//.test(resolved) ? readIfSmall(resolved) : null,
      config,
    });
    return decision;
  }).filter(Boolean);
  const decision = decisions.find((item) => item.permissionDecision === "deny") || decisions[0];
  return decision ? preToolUse(decision) : null;
});
