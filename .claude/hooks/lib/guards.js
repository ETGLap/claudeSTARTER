"use strict";

// Path guards and quote-aware literal shell checks; see hooks/README.md for coverage.

const ADR = /(^|\/)docs-vault\/decisions\/[^/]+\.md$/i;
const SPEC = /(^|\/)docs-vault\/specs\/[^/]+\.md$/i;
const IMPLEMENTED = /^\s*Status:\s*implemented\b/im;

const SECRET_PATTERNS = [
  /(^|\/)\.env(\.[^/]*)?$/i, // .env, .env.local, .env.production
  /\.(pem|key|p12|pfx|jks|keystore)$/i,
  /(^|\/)id_(rsa|dsa|ecdsa|ed25519)(\.pub)?$/i,
];

const isSecretPath = (filePath) => !/(^|\/)\.env\.example$/.test(filePath) && SECRET_PATTERNS.some((re) => re.test(filePath));

// Simple command wrappers that precede a literal verb; wrapper options are not interpreted.
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

  if (on(config, "secretFiles") && isSecretPath(path)) {
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

/** Small quote-aware tokenizer for literal shell commands, not a shell interpreter. */
function segments(command) {
  const result = [];
  let words = [], word = "", quote = null, escaped = false;
  const pushWord = () => { if (word) words.push(word); word = ""; };
  const pushCommand = () => { pushWord(); if (words.length) result.push(words); words = []; };
  for (const char of command) {
    if (escaped) { word += char; escaped = false; continue; }
    if (char === "\\" && quote !== "'") { escaped = true; continue; }
    if (quote) { if (char === quote) quote = null; else word += char; continue; }
    if (char === "'" || char === '"') { quote = char; continue; }
    if (";&|\n".includes(char)) { pushCommand(); continue; }
    if (/\s/.test(char)) { pushWord(); continue; }
    word += char;
  }
  pushCommand();
  return result;
}

const executable = (name) => name.replace(/\\/g, "/").split("/").pop();
function tokens(parts) {
  let i = 0;
  while (i < parts.length && (/^[A-Za-z_][\w]*=/.test(parts[i]) || WRAPPERS.has(executable(parts[i])))) i++;
  return parts.slice(i);
}

function gitCommand(rest) {
  let i = 0;
  while (i < rest.length && rest[i].startsWith("-")) {
    if (["-C", "-c", "--git-dir", "--work-tree"].includes(rest[i])) i += 2;
    else i++;
  }
  return { verb: rest[i], args: rest.slice(i + 1) };
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

  let uncertainBranch = false;
  for (const segment of segments(command)) {
    if (segment.some((token) => /^GIT_(DIR|WORK_TREE)=/.test(token))) uncertainBranch = true;
    const parts = tokens(segment);
    if (parts.length === 0) continue;
    const [program, ...rest] = parts;
    const verb = executable(program);
    if (["cd", "pushd", "popd"].includes(verb)) uncertainBranch = true;
    const flags = rest.filter((token) => token.startsWith("-"));

    if (verb === "rm") {
      if (!on(config, "recursiveDelete")) continue;
      const recursive = hasFlag(flags, "r", ["recursive"]) || hasFlag(flags, "R", []);
      const forced = hasFlag(flags, "f", ["force"]);
      if (recursive && forced) {
        return ask(
          `Recursive force delete: \`${segment.join(" ")}\`. Confirm the target is what you ` +
            `expect — this is not recoverable.`
        );
      }
      continue;
    }

    if (verb !== "git") continue;

    const git = gitCommand(rest);
    if (rest.some((arg) => arg === "-C" || arg.startsWith("--git-dir") || arg.startsWith("--work-tree")) || ["switch", "checkout"].includes(git.verb)) uncertainBranch = true;
    if (
      on(config, "forcePush") && git.verb === "push" &&
      (hasFlag(git.args.filter((arg) => arg.startsWith("-")), "f", ["force"]) ||
        git.args.some((arg) => arg === "--force-with-lease" || arg.startsWith("--force-with-lease=") || arg.startsWith("+")))
    ) {
      return ask("Force push rewrites remote history, including with a lease. Confirm the target and approval before running it.");
    }

    if (
      on(config, "defaultBranchCommit") &&
      git.verb === "commit" &&
      (uncertainBranch || branch === "main" || branch === "master")
    ) {
      return ask(
        `Committing to \`${uncertainBranch ? "an unverified branch" : branch}\`. Project rule: never commit to the ` +
          `default branch — branch first, then commit.`
      );
    }
  }

  return null;
}

module.exports = { decideWrite, decideBash, isSecretPath };
