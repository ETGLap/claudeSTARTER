"use strict";

// Builds the text the context hooks inject, split by how often the fact can change.
//
// Deliberately NOT a paraphrase of CLAUDE.md: that file is already in context every turn,
// so repeating it buys nothing and costs tokens on every turn forever. These report *state*
// CLAUDE.md cannot know.
//
// The split matters. Whether the project is bootstrapped, and whether a test command is
// configured, are fixed for a whole session — they belong in SessionStart. Only the branch,
// the pending specs, and the same-session warning can change between prompts.

/** Compose the per-turn text. Returns null when there is nothing worth saying. */
function buildContext(state = {}) {
  const { branch, defaultBranch, approvedSpecs } = state;
  const sameSessionSpecs = Array.isArray(state.sameSessionSpecs) ? state.sameSessionSpecs : [];
  const lines = [];

  if (branch) {
    lines.push(
      branch === defaultBranch
        ? `Branch: ${branch} — this is the default branch; branch before committing.`
        : `Branch: ${branch}`
    );
  }

  // A same-session spec gets the warning instead of the plain pending line — both would
  // otherwise fire for the same slug, and only one of them is actionable.
  const pending = (Array.isArray(approvedSpecs) ? approvedSpecs : []).filter(
    (slug) => !sameSessionSpecs.includes(slug)
  );
  if (pending.length > 0) {
    lines.push(`Approved specs awaiting /implement: ${pending.join(", ")}.`);
  }

  if (sameSessionSpecs.length > 0) {
    const subject =
      sameSessionSpecs.length === 1
        ? `Spec ${sameSessionSpecs[0]} was written in this session.`
        : `Specs ${sameSessionSpecs.join(", ")} were written in this session.`;
    lines.push(
      `⚠ ${subject} Commit it and /clear before /implement — implementing here reuses the ` +
        `context that wrote it, so a spec with gaps would still appear to work.`
    );
  }

  return lines.length > 0 ? lines.join("\n") : null;
}

/** Compose the once-per-session text. Returns null when the project is fully set up. */
function buildSessionStart(state = {}) {
  const { needsBootstrap, testGate } = state;
  const lines = [];

  // Genesis and retrofit need opposite advice: `/maintain project` maps an existing
  // codebase, and there is nothing to map before one exists. A bare `true` reads as
  // retrofit — the safe default, since it never tells someone with real code to scaffold.
  if (needsBootstrap === "genesis") {
    lines.push(
      "This project has no application code yet — run `/start <what to build>` to " +
        "classify it, decide a stack, and wire the test gate."
    );
  } else if (needsBootstrap) {
    lines.push(
      "This project is not bootstrapped (blank project-context.md, no root CLAUDE.md) — " +
        "run `/maintain project`."
    );
  }

  if (!testGate?.enabled || !testGate.command) {
    lines.push(
      "Test gate not armed (no test command configured) — you must run and read tests " +
        "yourself before claiming anything passes."
    );
  }

  return lines.length > 0 ? lines.join("\n") : null;
}

module.exports = { buildContext, buildSessionStart };
