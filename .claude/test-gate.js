#!/usr/bin/env node
"use strict";

// TDD test-gate for the Conductor pipeline.
// Wired to the Stop event in .claude/settings.json: blocks "done" while tests are red.
// Deterministic — it reads a test command's exit code and makes no semantic judgment.
// Contract (cloned from notify.js): zero-dep, never throw, always exit 0.

const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawnSync } = require("child_process");

const CONFIG_PATH = path.join(__dirname, "pipeline.config.json");
// Per-project block counter so unfixable tests can't loop the session forever.
// Keyed by cwd so parallel projects don't clobber each other.
function counterPath() {
  const key = Buffer.from(process.cwd()).toString("hex").slice(0, 32);
  return path.join(os.tmpdir(), `conductor-test-gate-${key}`);
}

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  } catch {
    return null; // missing/broken config => disabled
  }
}

function readCounter(p) {
  try {
    return parseInt(fs.readFileSync(p, "utf8"), 10) || 0;
  } catch {
    return 0;
  }
}

function writeCounter(p, n) {
  try {
    fs.writeFileSync(p, String(n));
  } catch {
    /* ignore */
  }
}

function clearCounter(p) {
  try {
    fs.unlinkSync(p);
  } catch {
    /* ignore */
  }
}

(function main() {
  try {
    const config = loadConfig();
    if (!config || config.enabled !== true) return; // master off switch

    const cmd =
      typeof config.testCommand === "string" ? config.testCommand.trim() : "";
    if (!cmd) return; // nothing to run => no-op

    const p = counterPath();
    const maxBlocks = Number.isInteger(config.maxBlocks) ? config.maxBlocks : 2;
    if (readCounter(p) >= maxBlocks) {
      clearCounter(p); // give up blocking; let the user take over
      return;
    }

    const res = spawnSync(cmd, { shell: true, encoding: "utf8" });
    if (res.status === 0) {
      clearCounter(p); // green => reset
      return;
    }

    writeCounter(p, readCounter(p) + 1);
    const out = `${res.stdout || ""}${res.stderr || ""}`.trim();
    const tail = out.split("\n").slice(-20).join("\n");
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
