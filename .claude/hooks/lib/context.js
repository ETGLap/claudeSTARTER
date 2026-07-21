"use strict";

// Builds the per-turn context line for the UserPromptSubmit hook.
//
// Deliberately NOT a paraphrase of CLAUDE.md: that file is already in context every turn,
// so repeating it buys nothing. This reports *session state* CLAUDE.md cannot know —
// which branch, whether the test gate is armed, which specs are waiting to be built.

const PIPELINE =
  "Conductor: spec-worthy work → /sdd, build via /implement · reuse-check · failing test " +
  "(Red) → code (Green) → refactor your own change · quality + security · tests green " +
  "before done.";

/** Compose the injected text. Returns null when there is nothing worth saying. */
function buildContext(state = {}) {
  const { branch, defaultBranch, testGate, approvedSpecs, contextUnfilled } = state;
  const lines = [PIPELINE];

  if (branch) {
    lines.push(
      branch === defaultBranch
        ? `Branch: ${branch} — this is the default branch; branch before committing.`
        : `Branch: ${branch}`
    );
  }

  if (testGate?.enabled && testGate.command) {
    lines.push(`Test gate armed: \`${testGate.command}\` must pass before you finish.`);
  } else {
    lines.push(
      "Test gate not armed (no testCommand configured) — you must run and read tests yourself."
    );
  }

  if (Array.isArray(approvedSpecs) && approvedSpecs.length > 0) {
    lines.push(
      `Approved specs awaiting /implement: ${approvedSpecs.join(", ")}.`
    );
  }

  if (contextUnfilled) {
    lines.push(
      "project-context.md is still the blank template — run `/maintain project` to bootstrap it."
    );
  }

  return lines.join("\n");
}

module.exports = { buildContext, PIPELINE };
