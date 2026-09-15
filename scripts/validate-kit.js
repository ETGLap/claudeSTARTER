#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { generatedFiles, staleGeneratedFiles } = require("./sync-adapters");
const ROOT = path.resolve(__dirname, "..");

function instructionGraph(root, entry, active = new Set(), visited = new Set()) {
  const file = path.resolve(root, entry);
  if (active.has(file)) throw new Error(`Import cycle at ${entry}`);
  if (visited.has(file)) return "";
  const text = fs.readFileSync(file, "utf8");
  active.add(file); visited.add(file);
  const imported = [...text.matchAll(/^@([^\s]+)$/gm)].map((match) =>
    instructionGraph(root, path.relative(root, path.resolve(path.dirname(file), match[1])), active, visited));
  active.delete(file);
  return [text, ...imported].join("\n");
}

function checkWiring(config, exists) {
  const errors = [];
  if (!config.hooks || typeof config.hooks !== "object") return ["Missing hooks object"];
  for (const [event, groups] of Object.entries(config.hooks)) {
    if (!Array.isArray(groups)) { errors.push(`${event}: invalid hook groups`); continue; }
    for (const group of groups) {
      try { if (group.matcher) new RegExp(group.matcher); }
      catch { errors.push(`${event}: invalid matcher`); }
      for (const hook of group.hooks || []) {
        const command = hook.command || "";
        if (/\/Users\/|\/home\//.test(command)) errors.push(`${event}: machine-specific command`);
        const target = command.match(/\.(?:claude|codex)\/hooks\/[\w-]+\.js/)?.[0];
        if (!target || !exists(target)) errors.push(`${event}: missing hook ${target || command}`);
      }
    }
  }
  return errors;
}

function validate() {
  const errors = [];
  const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
  for (const file of [".claude/settings.json", ".codex/hooks.json", ".claude/templates/hooks.optional.json", ".codex/hooks.optional.json"]) {
    try { errors.push(...checkWiring(JSON.parse(read(file)), (p) => fs.existsSync(path.join(ROOT, p))).map((s) => `${file}: ${s}`)); }
    catch (error) { errors.push(`${file}: ${error.message}`); }
  }
  const { configWarning } = require("../.claude/hooks/lib/config");
  if (configWarning()) errors.push(configWarning());
  let instructions = "";
  try { instructions = instructionGraph(ROOT, "CLAUDE.md"); }
  catch (error) { errors.push(error.message); }
  if (instructions.length > 8000) errors.push("Always-loaded starter instructions exceed the 8000-character review budget.");
  for (const [file, content] of generatedFiles()) {
    if (!fs.existsSync(path.join(ROOT, file)) || read(file) !== content) errors.push(`Stale adapter: ${file}`);
  }
  for (const file of staleGeneratedFiles()) errors.push(`Obsolete generated adapter: ${file}`);
  const walk = (dir) => fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".state" || entry.name === "settings.local.json") return [];
    const file = `${dir}/${entry.name}`;
    return entry.isDirectory() ? walk(file) : [file];
  });
  for (const file of ["CLAUDE.md", "AGENTS.md", ...walk(".claude"), ...walk(".codex"), ...walk(".agents")]) {
    if (!/\.(md|json|toml)$/.test(file)) continue;
    const text = read(file);
    if (/\.Codex\//.test(text)) errors.push(`${file}: obsolete platform path`);
    for (const match of text.matchAll(/`(\.claude\/[\w./-]+)`/g)) {
      if (!fs.existsSync(path.join(ROOT, match[1]))) errors.push(`${file}: missing resource ${match[1]}`);
    }
  }
  if (!read(".claude/context/project-context.md").includes("<what this project is>")) errors.push("Portable project context must remain blank in the starter.");
  if (!/^\d+\.\d+\.\d+\n?$/.test(read(".claude/VERSION"))) errors.push("Invalid kit version.");
  return { errors, metrics: { characters: instructions.length, estimatedTokens: Math.ceil(instructions.length / 4) } };
}

if (require.main === module) {
  const { errors, metrics } = validate();
  console.log(`Always-loaded starter instructions: ${metrics.characters} characters (~${metrics.estimatedTokens} tokens; estimate only).`);
  if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
  else console.log("Kit wiring, imports, resources, configuration and adapters are valid.");
}
module.exports = { instructionGraph, checkWiring, validate };
