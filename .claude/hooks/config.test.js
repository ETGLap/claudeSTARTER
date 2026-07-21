"use strict";

const test = require("node:test");
const assert = require("node:assert");
const { DEFAULTS, mergeConfig, loadConfig } = require("./lib/config.js");

test("mergeConfig: an empty user config yields the defaults", () => {
  assert.deepStrictEqual(mergeConfig({}), DEFAULTS);
  assert.deepStrictEqual(mergeConfig(null), DEFAULTS);
  assert.deepStrictEqual(mergeConfig(undefined), DEFAULTS);
});

test("mergeConfig: a partial section keeps the untouched sibling keys", () => {
  const merged = mergeConfig({ testGate: { enabled: true } });
  assert.strictEqual(merged.testGate.enabled, true);
  assert.strictEqual(merged.testGate.maxBlocks, DEFAULTS.testGate.maxBlocks);
  assert.deepStrictEqual(merged.guards, DEFAULTS.guards);
});

test("mergeConfig: false overrides a true default (opting out must work)", () => {
  const merged = mergeConfig({ guards: { secretFiles: false } });
  assert.strictEqual(merged.guards.secretFiles, false);
  assert.strictEqual(merged.guards.adrAppendOnly, true);
});

test("mergeConfig: does not mutate DEFAULTS", () => {
  mergeConfig({ notify: { enabled: true } });
  assert.strictEqual(DEFAULTS.notify.enabled, false);
});

test("mergeConfig: guards default to on, notifications default to off", () => {
  assert.strictEqual(DEFAULTS.guards.adrAppendOnly, true);
  assert.strictEqual(DEFAULTS.guards.secretFiles, true);
  assert.strictEqual(DEFAULTS.notify.enabled, false);
});

test("loadConfig: the shipped conductor.config.json parses and merges", () => {
  const config = loadConfig();
  assert.ok(config.testGate && config.guards && config.notify && config.format);
  assert.strictEqual(typeof config.testGate.command, "string");
});
