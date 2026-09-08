#!/usr/bin/env node
"use strict";

// Stop hook: blocks "done" while the test suite is red.
//
// The one place the kit refuses to trust judgment — it reads an exit code and makes no
// semantic call. "Tests must pass before done" is the rule CLAUDE.md states and this hook
// actually enforces.

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { loadConfig } = require("./lib/config.js");
const { shouldRunTests, treeSignature } = require("./lib/testgate.js");

const TEST_TIMEOUT_MS = 10 * 60 * 1000;
const REPORTED_LINES = 20;
const GIT_TIMEOUT_MS = 5000;

/** Current working-tree fingerprint, or null when git cannot answer (=> always run). */
function currentSignature() {
  try {
    const git = (args) => {
      const r = spawnSync("git", args, { encoding: "utf8", timeout: GIT_TIMEOUT_MS });
      return r.status === 0 ? r.stdout : null;
    };
    return treeSignature(git(["rev-parse", "HEAD"]), git(["status", "--porcelain"]));
  } catch {
    return null;
  }
}

/** Where the last run's record lives. Keyed by cwd so parallel projects stay separate. */
function recordPath() {
  const key = Buffer.from(process.cwd()).toString("hex").slice(0, 32);
  return path.join(os.tmpdir(), `conductor-test-gate-run-${key}.json`);
}

const readRecord = (p) => {
  try {
    const parsed = JSON.parse(fs.readFileSync(p, "utf8"));
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const writeRecord = (p, record) => {
  try {
    fs.writeFileSync(p, JSON.stringify(record));
  } catch {
    /* ignore */
  }
};

// Per-project block counter so an unfixable suite cannot loop the session forever.
// Keyed by cwd so parallel projects do not clobber each other.
function counterPath() {
  const key = Buffer.from(process.cwd()).toString("hex").slice(0, 32);
  return path.join(os.tmpdir(), `conductor-test-gate-${key}`);
}

const readCounter = (p) => {
  try {
    return parseInt(fs.readFileSync(p, "utf8"), 10) || 0;
  } catch {
    return 0;
  }
};

const writeCounter = (p, n) => {
  try {
    fs.writeFileSync(p, String(n));
  } catch {
    /* ignore */
  }
};

const clearCounter = (p) => {
  try {
    fs.unlinkSync(p);
  } catch {
    /* ignore */
  }
};

(function main() {
  try {
    const { testGate } = loadConfig();
    if (!testGate.enabled) return; // master off switch

    const command = String(testGate.command || "").trim();
    if (!command) return; // nothing configured => no-op

    const counter = counterPath();
    const maxBlocks = Number.isInteger(testGate.maxBlocks) ? testGate.maxBlocks : 2;
    if (readCounter(counter) >= maxBlocks) {
      clearCounter(counter); // stop blocking; hand control back to the user
      return;
    }

    // Stop fires every turn. Skip the suite when the tree is provably unchanged since a run
    // that passed — anything unknown falls through and runs.
    const record = recordPath();
    const signature = currentSignature();
    if (!shouldRunTests({ signature, last: readRecord(record) })) return;

    const result = spawnSync(command, {
      shell: true,
      encoding: "utf8",
      timeout: TEST_TIMEOUT_MS,
    });
    writeRecord(record, { signature, green: result.status === 0 });

    if (result.status === 0) {
      clearCounter(counter); // green => reset
      return;
    }

    writeCounter(counter, readCounter(counter) + 1);
    const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
    const tail = output.split("\n").slice(-REPORTED_LINES).join("\n");
    process.stdout.write(
      JSON.stringify({
        decision: "block",
        reason: `Tests are red — fix before finishing.\n${tail}`,
      })
    );
  } catch {
    /* never break the session */
  } finally {
    process.exit(0);
  }
})();
