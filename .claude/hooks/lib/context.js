"use strict";

// Builds the per-turn context line for the UserPromptSubmit hook.
//
// Deliberately NOT a paraphrase of CLAUDE.md: that file is already in context every turn,
// so repeating it buys nothing. This reports *session state* CLAUDE.md cannot know —
// which branch, whether the test gate is armed, which specs are waiting to be built.

const PIPELINE =
  "Conductor: spec-worthy work → /sdd → commit → /clear → /implement · reuse-check · " +
  "failing test written and committed (Red) → code (Green) → refactor your own change · " +
  "quality + security · tests green before done.";

/** Compose the injected text. Returns null when there is nothing worth saying. */
function buildContext(state = {}) {
  const { branch, defaultBranch, testGate, approvedSpecs, needsBootstrap } = state;
  const sameSessionSpecs = Array.isArray(state.sameSessionSpecs) ? state.sameSessionSpecs : [];
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

  return lines.join("\n");
}

module.exports = { buildContext, PIPELINE };
