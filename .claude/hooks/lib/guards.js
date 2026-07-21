"use strict";

// Pure decision logic for the PreToolUse guards.
//
// Why this file exists separately from the hooks: these rules were prose in CLAUDE.md
// ("ADRs are append-only", "never push --force"), which is advisory. Encoding them as pure
// functions makes them deterministic *and* testable without a live session — the hook
// entry points do only I/O and delegate every judgment here.
//
// Each decider returns a PreToolUse decision object or null (= nothing to say).

const ADR = /(^|\/)docs-vault\/decisions\/[^/]+\.md$/i;
const SPEC = /(^|\/)docs-vault\/specs\/[^/]+\.md$/i;
const IMPLEMENTED = /^\s*Status:\s*implemented\b/im;

const SECRET_PATTERNS = [
  /(^|\/)\.env(\.[^/]*)?$/i, // .env, .env.local, .env.production
  /\.(pem|key|p12|pfx|jks|keystore)$/i,
  /(^|\/)id_(rsa|dsa|ecdsa|ed25519)(\.pub)?$/i,
];

// Command wrappers that precede the real verb: `sudo rm -rf`, `FOO=1 git push`.
const WRAPPERS = new Set(["sudo", "command", "nohup", "time", "env", "xargs"]);

const on = (config, key) => config?.[key] !== false;

const ask = (reason) => ({
  permissionDecision: "ask",
  permissionDecisionReason: reason,
});

const deny = (reason) => ({
  permissionDecision: "deny",
  permissionDecisionReason: reason,
});

/**
 * Decide on a file write. `content` is the *existing* file's text when the caller could
 * read it; omitted content simply skips the content-dependent rules.
 */
function decideWrite({ filePath, exists = false, content = null, config = {} } = {}) {
  if (typeof filePath !== "string" || filePath === "") return null;
  const path = filePath.replace(/\\/g, "/");

  if (on(config, "secretFiles") && SECRET_PATTERNS.some((re) => re.test(path))) {
    return deny(
      `Blocked: ${filePath} holds secret material. Secrets never belong in code, ` +
        `commits, logs, or output — put the value in the environment and reference it.`
    );
  }

  if (on(config, "adrAppendOnly") && exists && ADR.test(path)) {
    return ask(
      `${filePath} is an ADR, and ADRs are append-only. Prefer a new decision record ` +
        `that supersedes this one. Approve only for a typo or link fix.`
    );
  }

  if (
    on(config, "implementedSpecs") &&
    exists &&
    SPEC.test(path) &&
    typeof content === "string" &&
    IMPLEMENTED.test(content)
  ) {
    return ask(
      `${filePath} has Status: implemented. An implemented spec is never silently ` +
        `rewritten — supersede it with a new spec. Approve only to check off ` +
        `verification criteria or fix a typo.`
    );
  }

  return null;
}

/** Split a shell command into segments so `a && rm -rf b` is inspected as two commands. */
const segments = (command) =>
  command
    .split(/\r?\n|\|\||&&|[;|&]/)
    .map((s) => s.trim())
    .filter(Boolean);

/** Tokens of one segment, minus leading env assignments and wrappers like `sudo`. */
function tokens(segment) {
  const parts = segment.split(/\s+/).filter(Boolean);
  let i = 0;
  while (i < parts.length && (/^[A-Za-z_][\w]*=/.test(parts[i]) || WRAPPERS.has(parts[i]))) {
    i += 1;
  }
  return parts.slice(i);
}

/** Does this flag set contain `short` (bundled, e.g. -rf) or any of `longs`? */
function hasFlag(flags, short, longs) {
  return flags.some((flag) =>
    flag.startsWith("--")
      ? longs.includes(flag.slice(2))
      : flag.startsWith("-") && flag.slice(1).includes(short)
  );
}

function decideBash({ command, branch = null, config = {} } = {}) {
  if (typeof command !== "string" || command === "") return null;
  if (!on(config, "gitSafety")) return null;

  for (const segment of segments(command)) {
    const parts = tokens(segment);
    if (parts.length === 0) continue;
    const [verb, ...rest] = parts;
    const flags = rest.filter((token) => token.startsWith("-"));

    if (verb === "rm") {
      const recursive = hasFlag(flags, "r", ["recursive"]) || hasFlag(flags, "R", []);
      const forced = hasFlag(flags, "f", ["force"]);
      if (recursive && forced) {
        return ask(
          `Recursive force delete: \`${segment}\`. Confirm the target is what you ` +
            `expect — this is not recoverable.`
        );
      }
      continue;
    }

    if (verb !== "git") continue;

    if (
      rest.includes("push") &&
      (hasFlag(flags, "f", ["force", "force-with-lease"]) || rest.includes("--force"))
    ) {
      return ask(
        `Force push: \`${segment}\`. This rewrites remote history — confirm explicitly.`
      );
    }

    if (rest.includes("commit") && (branch === "main" || branch === "master")) {
      return ask(
        `Committing directly to \`${branch}\`. Project rule: never commit to the ` +
          `default branch — branch first, then commit.`
      );
    }
  }

  return null;
}

module.exports = { decideWrite, decideBash };
