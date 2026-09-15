"use strict";

// Only bootstrap guidance is emitted automatically; task context is resolved on demand.
function buildSessionStart(state = {}) {
  const { needsBootstrap } = state;
  const lines = [];

  // Genesis and retrofit need opposite advice: `/maintain project` maps an existing
  // codebase, and there is nothing to map before one exists. A bare `true` reads as
  // retrofit — the safe default, since it never tells someone with real code to scaffold.
  if (needsBootstrap === "genesis") {
    lines.push(
      "This project has no application code yet — run `/start <what to build>` to " +
        "classify it, decide a stack, and establish test commands."
    );
  } else if (needsBootstrap) {
    lines.push(
      "This project is not bootstrapped (blank project-context.md, no root CLAUDE.md) — " +
        "run `/maintain project`."
    );
  }


  return lines.length > 0 ? lines.join("\n") : null;
}


module.exports = { buildSessionStart };
