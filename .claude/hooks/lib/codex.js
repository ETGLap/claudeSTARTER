"use strict";

const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { readStdin } = require("./io");

// Codex hooks use command for both Bash and apply_patch. Ask is unsupported there;
// preserving an ask response would report a hook error and continue the operation.
async function runCodexHook(name) {
  try {
    const payload = await readStdin();
    if (payload.tool_name === "Bash" && typeof payload.tool_input?.workdir === "string") {
      payload.cwd = path.resolve(payload.cwd || process.cwd(), payload.tool_input.workdir);
    }
    const result = spawnSync(process.execPath, [path.join(__dirname, "..", name), ...process.argv.slice(2)], {
      input: JSON.stringify(payload), encoding: "utf8", timeout: 615000,
      env: { ...process.env, CONDUCTOR_HOST: "codex" },
    });
    if (result.status !== 0) {
      process.stdout.write(JSON.stringify({ systemMessage: "Conductor hook could not run. Verification is not established." }));
      return;
    }
    if (!result.stdout.trim()) return;
    const output = JSON.parse(result.stdout);
    if (output.hookSpecificOutput?.permissionDecision === "ask") {
      output.hookSpecificOutput.permissionDecision = "deny";
      output.hookSpecificOutput.permissionDecisionReason += " Codex cannot request confirmation from this hook. Review the operation and run it manually, or explicitly configure the relevant guard for the approved operation.";
    }
    process.stdout.write(JSON.stringify(output));
  } catch {
    process.stdout.write(JSON.stringify({ systemMessage: "Conductor adapter failed; its check is unverified." }));
  } finally { process.exit(0); }
}

module.exports = { runCodexHook };
