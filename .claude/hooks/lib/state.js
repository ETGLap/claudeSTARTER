"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const PROJECT_ROOT = path.resolve(__dirname, "../../..");
const STATE_DIR = path.join(PROJECT_ROOT, ".claude", ".state");

const stateKey = (root, session = "") =>
  crypto.createHash("sha256").update(JSON.stringify([root, session])).digest("hex");

function readState(name) {
  try { return JSON.parse(fs.readFileSync(path.join(STATE_DIR, name), "utf8")); }
  catch { return null; }
}

function writeState(name, value) {
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true });
    const target = path.join(STATE_DIR, name);
    const temporary = `${target}.${process.pid}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(value), { mode: 0o600 });
    fs.renameSync(temporary, target);
    return true;
  } catch { return false; } // Callers must not rely on a retry counter that could not be saved.
}

module.exports = { PROJECT_ROOT, stateKey, readState, writeState };
