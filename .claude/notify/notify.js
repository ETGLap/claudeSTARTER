#!/usr/bin/env node
"use strict";

// Cross-platform desktop notifier for Claude Code harness hooks.
// Invoked by .claude/settings.json on the Stop and Notification events.
// Zero dependencies: relies only on the Node runtime that ships with Claude Code
// and on the OS-native notifier (osascript / notify-send / PowerShell).
//
// Contract: never throw, never block the session. On any problem we exit 0 silently.

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

// Why __dirname, not cwd: the config lives next to this script, but Claude Code
// runs the hook from the project root. Resolve relative to the file instead.
const CONFIG_PATH = path.join(__dirname, "notify.config.json");

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  } catch {
    return null; // missing/broken config => treat as disabled
  }
}

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    if (process.stdin.isTTY) return resolve({}); // no piped payload (manual run)
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({}); // schema may vary across versions; degrade gracefully
      }
    });
    process.stdin.on("error", () => resolve({}));
  });
}

function projectName(payload) {
  const dir = payload.cwd || process.cwd();
  try {
    return path.basename(dir);
  } catch {
    return "";
  }
}

// Build the {title, body} for the popup based on the event and config.
function buildMessage(event, payload, config) {
  const harnessMessage =
    typeof payload.message === "string" ? payload.message.trim() : "";
  const custom = (config.messages && config.messages[event]) || null;

  let title;
  let body;
  if (event === "stop") {
    title = custom || "✅ Task complete";
    body = "Claude Code finished.";
  } else {
    // notification: needs response / approval / clarification / blocked
    title = "Claude Code";
    body = custom || harnessMessage || "Claude needs your input.";
  }

  if (config.includeProjectName) {
    const name = projectName(payload);
    if (name) title = `${title} — ${name}`;
  }
  return { title, body };
}

function run(cmd, args) {
  try {
    const child = spawn(cmd, args, { stdio: "ignore" });
    child.on("error", () => {}); // missing binary => ignore
  } catch {
    /* ignore */
  }
}

function escAppleScript(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function escPowerShell(s) {
  // Single-quoted PS strings: escape by doubling single quotes; flatten newlines.
  return String(s).replace(/\r?\n/g, " ").replace(/'/g, "''");
}

function notify({ title, body }, sound) {
  const platform = process.platform;

  if (platform === "darwin") {
    const soundClause = sound ? ' sound name "Glass"' : "";
    const script = `display notification "${escAppleScript(
      body
    )}" with title "${escAppleScript(title)}"${soundClause}`;
    run("osascript", ["-e", script]);
    return;
  }

  if (platform === "linux") {
    run("notify-send", [title, body]);
    if (sound) run("canberra-gtk-play", ["--id", "message"]); // best-effort
    return;
  }

  if (platform === "win32") {
    const t = escPowerShell(title);
    const b = escPowerShell(body);
    // Prefer BurntToast if installed; otherwise fall back to a balloon tip.
    const ps = `
      if (Get-Module -ListAvailable -Name BurntToast) {
        Import-Module BurntToast
        New-BurntToastNotification -Text '${t}', '${b}'
      } else {
        Add-Type -AssemblyName System.Windows.Forms
        $n = New-Object System.Windows.Forms.NotifyIcon
        $n.Icon = [System.Drawing.SystemIcons]::Information
        $n.BalloonTipTitle = '${t}'
        $n.BalloonTipText = '${b}'
        $n.Visible = $true
        $n.ShowBalloonTip(5000)
        Start-Sleep -Milliseconds 6000
        $n.Dispose()
      }`;
    run("powershell", ["-NoProfile", "-NonInteractive", "-Command", ps]);
    return;
  }
  // Unknown platform: do nothing.
}

(async function main() {
  try {
    const config = loadConfig();
    if (!config || config.enabled !== true) return; // master off switch

    const event = process.argv[2] === "notification" ? "notification" : "stop";
    if (config.events && config.events[event] === false) return; // per-event toggle

    const payload = await readStdin();
    notify(buildMessage(event, payload, config), config.sound !== false);
  } catch {
    /* never break the session */
  } finally {
    process.exit(0);
  }
})();
