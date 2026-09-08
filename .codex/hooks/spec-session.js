#!/usr/bin/env node
"use strict";

// PostToolUse hook: record which session authored each spec.
//
// This is the machinery behind the fresh-session test. Writing a spec and implementing it
// in the same session carries the exploration, the rejected alternatives, and every
// unstated assumption — so the build can succeed for reasons the spec never captured.
// The ledger lets `context-inject.js` notice that and say so before you build.

const { run } = require("./lib/io.js");
const { loadConfig } = require("./lib/config.js");
const { specSlug, recordAuthor, loadLedger, saveLedger } = require("./lib/spec-state.js");

run((payload) => {
  if (loadConfig().injectContext === false) return null; // the ledger only feeds injection

  const slug = specSlug(payload.tool_input?.file_path);
  const sessionId = payload.session_id;
  if (!slug || !sessionId) return null;

  const ledger = loadLedger();
  const updated = recordAuthor(ledger, slug, sessionId);
  if (updated !== ledger) saveLedger(updated); // first author wins => usually a no-op

  return null; // silent: this hook only records
});
