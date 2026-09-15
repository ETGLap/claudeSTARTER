"use strict";

// Decision logic for the Stop test gate.
//
// Why this exists: `Stop` fires at the end of *every* turn, including turns that only
// answered a question. Running a full suite each time is invisible at 0.7s and crippling at
// three minutes, which is the difference between the kit being usable on a real project and
// not. So the gate first asks whether anything could plausibly have changed the result.
//
// The rule is fail-safe, never fail-open: anything unknown runs the suite. A slow gate is a
// nuisance; a silently skipped one defeats the only guarantee the kit makes about tests.

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
  if (last.green !== true) return true; // still red => keep blocking
  return last.signature !== signature;
}

module.exports = { shouldRunTests, treeSignature };
