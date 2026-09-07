"use strict";

// Ledger of which session authored which spec.
//
// Why it exists: the fresh-session test ("write the spec, /clear, implement from the spec
// alone") is only meaningful if something notices when you skip it. Implementing a spec in
// the session that wrote it carries the exploration, the rejected alternatives and the
// unstated assumptions — so the implementation may succeed for reasons the spec never
// captured. Recording the authoring session is what turns that from a reminder into a
// detectable condition.

const fs = require("node:fs");
const path = require("node:path");

const SPEC_PATH = /(^|\/)docs-vault\/specs\/([^/]+)\.md$/i;

// Session-scoped bookkeeping, not project content — kept out of git.
const LEDGER_PATH = path.join(__dirname, "..", "..", ".state", "spec-sessions.json");

// Bounded so the ledger cannot grow without limit in a long-lived repo.
const MAX_ENTRIES = 50;

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/** The spec slug for a path, or null if the path is not a spec. */
function specSlug(filePath) {
  if (typeof filePath !== "string") return null;
  const match = filePath.replace(/\\/g, "/").match(SPEC_PATH);
  return match ? match[2] : null;
}

/**
 * Record that `sessionId` authored `slug`. The first author wins: a later typo fix from
 * the implementing session must not launder the spec into looking externally authored.
 * Returns a new state object; never mutates the one passed in.
 */
function recordAuthor(state, slug, sessionId) {
  const base = isPlainObject(state) ? state : {};
  if (!slug || !sessionId) return base;
  if (Object.hasOwn(base, slug)) return base;

  const entries = [...Object.entries(base), [slug, sessionId]];
  return Object.fromEntries(entries.slice(-MAX_ENTRIES));
}

/** The session that authored `slug`, or null. */
function authorOf(state, slug) {
  if (!isPlainObject(state) || typeof slug !== "string") return null;
  return Object.hasOwn(state, slug) && typeof state[slug] === "string" ? state[slug] : null;
}

/** Read the ledger from disk. Missing or corrupt file reads as empty. */
function loadLedger() {
  try {
    const parsed = JSON.parse(fs.readFileSync(LEDGER_PATH, "utf8"));
    return isPlainObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

/** Persist the ledger, creating `.state/` on demand. Failure is silent by contract. */
function saveLedger(state) {
  try {
    fs.mkdirSync(path.dirname(LEDGER_PATH), { recursive: true });
    fs.writeFileSync(LEDGER_PATH, `${JSON.stringify(state, null, 2)}\n`);
  } catch {
    /* never break the session */
  }
}

module.exports = {
  specSlug,
  recordAuthor,
  authorOf,
  loadLedger,
  saveLedger,
  MAX_ENTRIES,
  LEDGER_PATH,
};
