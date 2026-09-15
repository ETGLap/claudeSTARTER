#!/usr/bin/env node
"use strict";

// Startup guidance only; no per-prompt scans or session bookkeeping.

const fs = require("node:fs");
const path = require("node:path");
const { run, additionalContext } = require("./lib/io.js");
const { loadConfig, configWarning } = require("./lib/config.js");
const { buildSessionStart } = require("./lib/context.js");

const { PROJECT_ROOT } = require("./lib/state");

const PROJECT_CONTEXT = path.join(__dirname, "..", "context", "project-context.md");

// A project with any of these has a codebase to map; without them there is nothing yet.
const CODEBASE_MARKERS = [
  "package.json",
  "pyproject.toml",
  "requirements.txt",
  "go.mod",
  "Cargo.toml",
  "pom.xml",
  "build.gradle",
  "Gemfile",
  "composer.json",
  "src",
  "app",
  "lib",
];

const hasCodebase = (cwd) =>
  CODEBASE_MARKERS.some((marker) => fs.existsSync(path.join(cwd, marker)));

/**
 * Which bootstrap path this project needs, or false when it is already set up. Keyed on the
 * root CLAUDE.md as well as the placeholders, because `project-context.md` ships blank *on
 * purpose* — it is the host-project template. Only the absence of both means nobody has set
 * the project up yet. Genesis and retrofit then split on whether any code exists.
 */
function needsBootstrap(cwd) {
  try {
    if (fs.existsSync(path.join(cwd, "CLAUDE.md"))) return false;
    if (!/<what this project is>/.test(fs.readFileSync(PROJECT_CONTEXT, "utf8"))) return false;
    return hasCodebase(cwd) ? "retrofit" : "genesis";
  } catch {
    return false;
  }
}

run(() => {
  const config = loadConfig();
  if (config.injectContext === false) return null;

  const cwd = PROJECT_ROOT;
  const bootstrap = buildSessionStart({
    needsBootstrap: needsBootstrap(cwd),
  });

  const text = [configWarning(), bootstrap].filter(Boolean).join("\n");
  return text ? additionalContext("SessionStart", text) : null;
});
