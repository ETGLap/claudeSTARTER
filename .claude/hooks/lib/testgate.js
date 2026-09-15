"use strict";

// Optional test-cache decisions; unknown inputs require a fresh run.

const crypto = require("node:crypto");

/**
 * Combine Git metadata, file-content digests and the command. External/ignored inputs
 * are deliberately outside this cache contract; caching is opt-in for that reason.
 */
function treeSignature(head, status, files, command) {
  if (typeof head !== "string" || typeof status !== "string" || !Array.isArray(files) || typeof command !== "string") return null;
  return crypto.createHash("sha256").update(JSON.stringify([head, status, files, command])).digest("hex");
}

/**
 * Should the suite run this Stop?
 *
 * `last` is the previous run's record ({ signature, green }) or null when there is none.
 * Runs unless the tree is provably unchanged since a run that passed.
 */
function shouldRunTests({ signature, last } = {}) {
  if (!signature) return true; // unknown state => run
  if (!last || typeof last !== "object") return true; // no prior run => run
  if (last.green !== true) return true; // Failed results cannot be reused.
  return last.signature !== signature;
}

module.exports = { shouldRunTests, treeSignature };
