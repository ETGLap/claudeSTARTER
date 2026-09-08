#!/usr/bin/env node
"use strict";

// Cross-platform desktop notifier for the Stop and Notification events.
// Zero dependencies: the Node runtime that ships with Claude Code plus the OS-native
// notifier (osascript / notify-send / PowerShell). Opt-in via conductor.config.json.

const { spawn } = require("node:child_process");
const path = require("node:path");
const { readStdin } = require("./lib/io.js");
const { loadConfig } = require("./lib/config.js");

function projectName(payload) {
  try {
    return path.basename(payload.cwd || process.cwd());
  } catch {
    return "";
  }
}

/** Build the {title, body} for the popup based on the event and config. */
function buildMessage(event, payload, notifyConfig) {
  const harnessMessage = typeof payload.message === "string" ? payload.message.trim() : "";
  const custom = notifyConfig.messages?.[event] || null;

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

  if (notifyConfig.includeProjectName) {
    const name = projectName(payload);
    if (name) title = `${title} — ${name}`;
  }
  return { title, body };
}

function spawnDetached(cmd, args) {
  try {
    const child = spawn(cmd, args, { stdio: "ignore" });
    child.on("error", () => {}); // missing binary => ignore
  } catch {
    /* ignore */
  }
}

const escAppleScript = (s) => String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');

// Single-quoted PS strings: escape by doubling single quotes; flatten newlines.
const escPowerShell = (s) => String(s).replace(/\r?\n/g, " ").replace(/'/g, "''");

function notify({ title, body }, sound) {
  if (process.platform === "darwin") {
    const soundClause = sound ? ' sound name "Glass"' : "";
    const script = `display notification "${escAppleScript(body)}" with title "${escAppleScript(
      title
    )}"${soundClause}`;
    spawnDetached("osascript", ["-e", script]);
    return;
  }

  if (process.platform === "linux") {
    spawnDetached("notify-send", [title, body]);
    if (sound) spawnDetached("canberra-gtk-play", ["--id", "message"]); // best-effort
    return;
  }

  if (process.platform === "win32") {
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
    spawnDetached("powershell", ["-NoProfile", "-NonInteractive", "-Command", ps]);
    return;
  }
  // Unknown platform: do nothing.
}

(async function main() {
  try {
    const { notify: config } = loadConfig();
    if (config.enabled !== true) return; // master off switch

    const event = process.argv[2] === "notification" ? "notification" : "stop";
    if (config.events?.[event] === false) return; // per-event toggle

    const payload = await readStdin();
    notify(buildMessage(event, payload, config), config.sound !== false);
  } catch {
    /* never break the session */
  } finally {
    process.exit(0);
  }
})();
