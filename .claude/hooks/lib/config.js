"use strict";

// Single source of configuration for every Conductor hook.
//
// Why __dirname and not cwd: hooks are invoked from wherever the session happens to be,
// but the config always sits next to the kit. Resolve relative to this file instead.

const fs = require("node:fs");
const path = require("node:path");

const CONFIG_PATH = path.join(__dirname, "..", "..", "conductor.config.json");

// Defaults encode the shipping policy: guards on (they only ever ask, except for secret
// material), notifications off (opt-in — they are a personal preference, not a quality
// gate). Test blocking and per-edit formatting also require explicit opt-in.
const DEFAULTS = Object.freeze({
  testGate: { enabled: false, command: "", maxBlocks: 2, cache: false, timeoutMs: 300000 },
  format: { enabled: false, command: "" },
  guards: {
    adrAppendOnly: true,
    implementedSpecs: true,
    secretFiles: true,
    recursiveDelete: true,
    forcePush: true,
    defaultBranchCommit: true,
  },
  notify: {
    enabled: false,
    sound: true,
    events: { stop: true, notification: true },
    includeProjectName: true,
    messages: { stop: "Turn stopped", notification: null },
  },
  injectContext: true,
});

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * Merge a user config over DEFAULTS. Recursive, so a partial `notify.events` keeps its
 * sibling keys. Keys absent from DEFAULTS are ignored; neither input is mutated.
 */
function mergeConfig(user) {
  return deepMerge(DEFAULTS, isPlainObject(user) ? user : {});
}

function deepMerge(base, override) {
  const out = {};
  for (const [key, value] of Object.entries(base)) {
    const candidate = override[key];
    out[key] = isPlainObject(value)
      ? deepMerge(value, isPlainObject(candidate) ? candidate : {})
      : candidate === undefined
        ? value
        : candidate;
  }
  return out;
}

/** Read and merge the on-disk config. A missing or broken file falls back to defaults. */
function loadConfig() {
  try {
    return mergeConfig(JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8")));
  } catch {
    return mergeConfig(null);
  }
}

// Hook entry points surface this separately; defaults keep guards available on bad input.
function configWarning() {
  try {
    const user = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    if (!isPlainObject(user)) throw new Error();
    const validate = (value, defaults) => {
      for (const [key, candidate] of Object.entries(value)) {
        if (!(key in defaults)) continue;
        const expected = defaults[key];
        if (isPlainObject(expected)) {
          if (!isPlainObject(candidate)) throw new Error();
          validate(candidate, expected);
        } else if (expected !== null && typeof candidate !== typeof expected) throw new Error();
        else if (expected === null && candidate !== null && typeof candidate !== "string") throw new Error();
      }
    };
    validate(user, DEFAULTS);
    if (user.testGate?.maxBlocks !== undefined && (!Number.isInteger(user.testGate.maxBlocks) || user.testGate.maxBlocks < 0)) throw new Error();
    if (user.testGate?.timeoutMs !== undefined && (!Number.isInteger(user.testGate.timeoutMs) || user.testGate.timeoutMs < 1 || user.testGate.timeoutMs > 600000)) throw new Error();
    return null;
  } catch {
    return "Conductor configuration is missing or invalid. Check .claude/conductor.config.json; verification is not established.";
  }
}

module.exports = { DEFAULTS, mergeConfig, loadConfig, configWarning, CONFIG_PATH };
