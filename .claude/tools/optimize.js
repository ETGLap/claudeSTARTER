#!/usr/bin/env node
"use strict";
const fs = require('node:fs');
const path = require('node:path');
const { isSecretPath } = require('../hooks/lib/guards');
const { compactJSON, summarize, route } = require('./optimization');
const { queryGraph } = require('./graph');

function read(file) {
  if (!file || isSecretPath(file) || fs.lstatSync(file).isSymbolicLink()) throw new Error('Missing or protected input path');
  if (isSecretPath(fs.realpathSync(file))) throw new Error('Protected resolved input path');
  const stat = fs.statSync(file);
  if (!stat.isFile() || stat.size>5*1024*1024) throw new Error('Input must be a regular file no larger than 5 MiB');
  return fs.readFileSync(file,'utf8');
}
try {
  const [command, first, second] = process.argv.slice(2);
  if (command === 'prepare') {
    const input = read(first), result = compactJSON(input);
    process.stdout.write(result+'\n');
    process.stderr.write(`JSON characters: ${input.length} -> ${result.length}; no semantic rewrite\n`);
  } else if (command === 'graph') {
    process.stdout.write(JSON.stringify(queryGraph(second || process.cwd(), first))+'\n');
  } else if (command === 'route') {
    process.stdout.write(JSON.stringify(route(JSON.parse(read(first)), JSON.parse(read(second))))+'\n');
  } else if (command === 'summarize') {
    if (!/^\d+$/.test(second || '') || Number(second)>255) throw new Error('Provide the original command exit code (0–255)');
    const result = summarize(read(first));
    process.stdout.write(result.text);
    process.stdout.write(`\nExit: ${second}; full log: ${path.resolve(first)}; characters: ${result.inputCharacters} -> ${result.outputCharacters}\n`);
    process.exitCode = Number(second);
  } else throw new Error('Usage: optimize.js prepare REQUEST.json | graph QUERY [ROOT] | route TASK.json MODELS.json | summarize LOG EXIT_CODE');
} catch (error) {
  process.stderr.write(`Optimization unavailable: ${error.message}\n`);
  process.exitCode = 1;
}
