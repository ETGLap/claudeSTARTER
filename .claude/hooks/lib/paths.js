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

module.exports = { resolveTarget };
