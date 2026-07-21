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
// gate), test gate on but inert until a command is set.
const DEFAULTS = Object.freeze({
  testGate: { enabled: true, command: "", maxBlocks: 2 },
  format: { enabled: true, command: "" },
  guards: {
    adrAppendOnly: true,
    implementedSpecs: true,
    secretFiles: true,
    gitSafety: true,
  },
  notify: {
    enabled: false,
    sound: true,
    events: { stop: true, notification: true },
    includeProjectName: true,
    messages: { stop: "✅ Task complete", notification: null },
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

module.exports = { DEFAULTS, mergeConfig, loadConfig, CONFIG_PATH };
