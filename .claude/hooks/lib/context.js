"use strict";

// Inspect only the documented root references and purpose field, not arbitrary prose/imports.
function needsBootstrap({ instructions = "", context = "", hasCodebase = false, isStarter = false } = {}) {
  const linked = /(?:^@(?:\.\/)?\.claude\/CLAUDE\.md\s*$|\bRead\s+(?:`\.claude\/CLAUDE\.md`|\.claude\/CLAUDE\.md(?=\s|$)))/m.test(instructions);
  const purpose = context.match(/^\s*(?:-\s+)?(?:\*\*)?Purpose:(?:\*\*)?[^\S\r\n]*([^\r\n]*)/m)?.[1].trim();
  const configured = purpose && !/<[^>]+>/.test(purpose);
  if (linked && (configured || isStarter)) return false;
  return hasCodebase ? "retrofit" : "genesis";
}

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
      "Conductor setup appears incomplete: check the shared-workflow reference in root " +
        "instructions and the purpose in .claude/context/project-context.md. Run `/maintain project`."
    );
  }


  return lines.length > 0 ? lines.join("\n") : null;
}


module.exports = { buildSessionStart, needsBootstrap };
