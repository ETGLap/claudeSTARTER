"use strict";

// Shared path handling for hooks that act on a file the harness named.
//
// Hooks run in the session's cwd, which is not necessarily the one the payload refers to,
// and `file_path` may arrive relative or absolute. Resolving in one place keeps every hook
// consistent — format.js silently no-opped for a while because it skipped this step.

const path = require("node:path");

/** Absolute path for a payload file target, or null when there is nothing usable. */
function resolveTarget(cwd, filePath) {
  if (typeof filePath !== "string" || filePath === "") return null;
  return path.resolve(cwd || process.cwd(), filePath);
}

function targetsOf(payload = {}) {
  const input = payload.tool_input || {};
  const direct = input.file_path || input.notebook_path;
  if (typeof direct === "string") return [direct];
  if (payload.tool_name !== "apply_patch" || typeof input.command !== "string") return [];
  return [...new Set([...input.command.matchAll(/^\*\*\* (?:Add File|Update File|Delete File|Move to): (.+)\r?$/gm)]
    .map((match) => match[1].trim()))];
}

module.exports = { resolveTarget, targetsOf };
