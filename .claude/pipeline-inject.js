#!/usr/bin/env node
"use strict";

// UserPromptSubmit injector: keeps the Conductor pipeline in context every turn, so the
// automatic workflow runs regardless of the prompt. Deterministic, zero-dep, never throws.
// stdout from a UserPromptSubmit hook is added to the model's context for that turn.
// Toggle with "injectPipeline": false in pipeline.config.json.

const fs = require("fs");
const path = require("path");

try {
  const cfg = JSON.parse(
    fs.readFileSync(path.join(__dirname, "pipeline.config.json"), "utf8")
  );
  if (cfg.injectPipeline !== false) {
    process.stdout.write(
      "Conductor pipeline: for any build/change run reuse-check → failing test (Red) → " +
        "code (Green) → refactor your own change → quality + security → tests green → " +
        "final report. Tests must pass before done. See CLAUDE.md."
    );
  }
} catch {
  /* never break the session */
}
process.exit(0);
