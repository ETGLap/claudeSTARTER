"use strict";

// Shared I/O contract for every Conductor hook: read the JSON payload from stdin, write at
// most one JSON object to stdout, always exit 0. A hook that throws or hangs would break
// the session, so every entry point funnels through `run`.

/** Read the harness payload. Missing or malformed stdin degrades to an empty object. */
function readStdin() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) return resolve({}); // manual run, no piped payload
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({}); // payload schema varies across versions — degrade, never fail
      }
    });
    process.stdin.on("error", () => resolve({}));
  });
}

/** PreToolUse decision envelope. */
const preToolUse = (decision) => ({
  hookSpecificOutput: { hookEventName: "PreToolUse", ...decision },
});

/** Non-blocking context added to the model's turn. */
const additionalContext = (hookEventName, text) => ({
  hookSpecificOutput: { hookEventName, additionalContext: text },
});

/** Stop / PostToolUse blocking envelope. */
const block = (reason) => ({ decision: "block", reason });

/**
 * Run a hook body. Whatever it resolves to is emitted as JSON; null/undefined emits
 * nothing. Any throw is swallowed. The process always exits 0.
 */
async function run(body) {
  try {
    const payload = await readStdin();
    const output = await body(payload);
    if (output) process.stdout.write(JSON.stringify(output));
  } catch {
    /* never break the session */
  } finally {
    process.exit(0);
  }
}

module.exports = { readStdin, run, preToolUse, additionalContext, block };
