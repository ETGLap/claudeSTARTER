"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
const { treeSignature } = require("./testgate");

// Bounded I/O: unfamiliar trees, symlinks, submodules, or large inputs run the suite.
function fingerprint(cwd, command) {
  try {
    cwd = fs.realpathSync(cwd);
    const git = (args) => {
      const r = spawnSync("git", args, { cwd, encoding: "utf8", timeout: 5000, maxBuffer: 4 * 1024 * 1024 });
      if (r.status !== 0) throw new Error();
      return r.stdout;
    };
    const head = git(["rev-parse", "HEAD"]);
    const index = git(["ls-files", "--stage", "-z"]);
    const names = [...new Set(git(["ls-files", "--cached", "--others", "--exclude-standard", "-z"]).split("\0").filter(Boolean))].sort();
    if (names.length > 10000) return null;
    let bytes = 0;
    const files = [];
    for (const name of names) {
      const target = path.resolve(cwd, name);
      if (!target.startsWith(`${path.resolve(cwd)}${path.sep}`)) return null;
      let stat;
      try { stat = fs.lstatSync(target); }
      catch (error) { if (error.code === "ENOENT") { files.push([name, "deleted"]); continue; } throw error; }
      if (!stat.isFile() || fs.realpathSync(target) !== target) return null;
      bytes += stat.size;
      if (bytes > 50 * 1024 * 1024) return null;
      files.push([name, stat.mode, crypto.createHash("sha256").update(fs.readFileSync(target)).digest("hex")]);
    }
    return treeSignature(head, index, files, command);
  } catch { return null; }
}

module.exports = { fingerprint };
