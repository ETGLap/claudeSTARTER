#!/usr/bin/env node
"use strict";

const { spawnSync } = require("node:child_process");
const { run } = require("./lib/io");
const { loadConfig, configWarning } = require("./lib/config");
const { fingerprint } = require("./lib/fingerprint");
const { shouldRunTests } = require("./lib/testgate");
const { PROJECT_ROOT, stateKey, readState, writeState } = require("./lib/state");

run((payload) => {
  const warning = configWarning();
  if (warning) return { systemMessage: warning };
  const { testGate } = loadConfig();
  const command = String(testGate.command || "").trim();
  if (!testGate.enabled || !command) return null;

  const key = stateKey(PROJECT_ROOT, payload.session_id || "manual");
  const file = `test-gate-${key}.json`;
  const previous = readState(file);
  const signature = testGate.cache === true ? fingerprint(PROJECT_ROOT, command) : null;
  if (!shouldRunTests({ signature, last: previous })) return null;

  const timeout = Number.isInteger(testGate.timeoutMs) && testGate.timeoutMs > 0
    ? Math.min(testGate.timeoutMs, 600000) : 300000;
  const result = spawnSync(command, {
    cwd: PROJECT_ROOT, shell: true, encoding: "utf8", timeout,
    maxBuffer: 4 * 1024 * 1024,
  });
  const green = result.status === 0;
  const after = green && signature ? fingerprint(PROJECT_ROOT, command) : null;
  const blocks = green ? 0 : (previous?.command === command ? previous.blocks || 0 : 0) + 1;
  const saved = writeState(file, { command, signature: after === signature ? signature : null, green, blocks });
  if (green) return null;
  if (!saved) return { systemMessage: "Verification failed; unable to save retry state. Returning control to avoid an endless Stop loop. Tests remain unverified." };

  const maxBlocks = Number.isInteger(testGate.maxBlocks) && testGate.maxBlocks >= 0 ? testGate.maxBlocks : 2;
  if (blocks > maxBlocks) {
    return { systemMessage: "Verification failed; returning control after the configured retry limit. Tests are still failing or could not run. Do not claim this work is verified." };
  }
  const detail = result.error ? `Test command could not complete (${result.error.code || "execution error"}).` : `Test command exited ${result.status}.`;
  const tail = `${result.stdout || ""}${result.stderr || ""}`.trim().split("\n").slice(-20).join("\n").slice(-4000);
  return { decision: "block", reason: `Tests are red — fix before finishing. ${detail}\n${tail}` };
});
