#!/usr/bin/env node
"use strict";

// Startup guidance only; no per-prompt scans or session bookkeeping.

const fs = require("node:fs");
const path = require("node:path");
const { run, additionalContext } = require("./lib/io.js");
const { loadConfig, configWarning } = require("./lib/config.js");
const { buildSessionStart, needsBootstrap } = require("./lib/context.js");

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

function readIfPresent(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return "";
    throw error;
  }
}

run(() => {
  const config = loadConfig();
  if (config.injectContext === false) return null;

  const cwd = PROJECT_ROOT;
  // The source checkout intentionally keeps context blank and owns canonical CLAUDE.md.
  const isStarter = ["scripts/sync-adapters.js", "scripts/validate-kit.js"].every((file) => fs.existsSync(path.join(cwd, file)));
  const instructionsFile = !isStarter && process.argv.includes("--codex") ? "AGENTS.md" : "CLAUDE.md";
  const bootstrap = buildSessionStart({
    needsBootstrap: needsBootstrap({
      instructions: readIfPresent(path.join(cwd, instructionsFile)),
      context: readIfPresent(PROJECT_CONTEXT),
      hasCodebase: hasCodebase(cwd),
      isStarter,
    }),
  });

  const text = [configWarning(), bootstrap].filter(Boolean).join("\n");
  return text ? additionalContext("SessionStart", text) : null;
});
