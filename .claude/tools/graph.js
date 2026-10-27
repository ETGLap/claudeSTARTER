"use strict";
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { isSecretPath } = require('../hooks/lib/guards');
const EXT = ['.js','.jsx','.ts','.tsx','.mjs','.cjs','.py'];
const VERSION = 1;

function safePath(root, relative) {
  const absolute = path.resolve(root, relative);
  if (!absolute.startsWith(root + path.sep)) throw new Error('Path outside project');
  let current = root;
  for (const part of path.relative(root, absolute).split(path.sep)) {
    current = path.join(current, part);
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw new Error('Symlink excluded');
  }
  return absolute;
}

// Lexical locations are navigation hints, not parser-resolved symbol or call identities.
function extract(text) {
  const symbols = [], imports = [], calls = [], routes = [];
  const lines = text.split('\n');
  for (let i=0;i<lines.length;i++) {
    const line = lines[i];
    if (/^\s*(?:\/\/|#|\*)/.test(line)) continue;
    const definition = line.match(/\b(function|class|def)\s+([A-Za-z_$][\w$]*)/) ||
      line.match(/\b(const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*=>/);
    if (definition) symbols.push({ name: definition[2], kind: definition[1] === 'class' ? 'class' : 'function', line: i+1 });
    for (const m of line.matchAll(/(?:from\s*|import\s*|require\s*\(\s*|import\s*\(\s*)['"]([^'"\n]+)['"]/g)) imports.push(m[1]);
    const python = line.match(/^\s*(?:from\s+([.\w]+)\s+import|import\s+([\w.]+))/);
    if (python) imports.push(python[1] || python[2]);
    for (const m of line.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) {
      if (!['if','for','while','switch','catch','function','require','import'].includes(m[1])) calls.push({ name: m[1], line: i+1 });
    }
    if (/(?:\.(?:get|post|put|patch|delete|route)\s*\(|@\w+\.route|\b(?:model|Schema)\s*\()/.test(line)) routes.push(i+1);
  }
  return { symbols: symbols.slice(0,200), imports: [...new Set(imports)].slice(0,200),
    calls: calls.slice(0,500), routeOrModelLines: routes.slice(0,50),
    extractionLimited: symbols.length>200 || imports.length>200 || calls.length>500 || routes.length>50 };
}

function readCache(file) {
  try {
    if (fs.statSync(file).size > 8*1024*1024) return {};
    const data = JSON.parse(fs.readFileSync(file,'utf8'));
    return data.version === VERSION && data.files && typeof data.files === 'object' ? data.files : {};
  } catch { return {}; }
}

function validRecord(record, hash) {
  const location = item => item && typeof item.name === 'string' && Number.isInteger(item.line) && item.line > 0;
  return record?.hash === hash && typeof record.extractionLimited === 'boolean' &&
    Array.isArray(record.symbols) && record.symbols.every(item => location(item) && ['function','class'].includes(item.kind)) &&
    Array.isArray(record.calls) && record.calls.every(location) &&
    Array.isArray(record.imports) && record.imports.every(item => typeof item === 'string') &&
    Array.isArray(record.routeOrModelLines) && record.routeOrModelLines.every(line => Number.isInteger(line) && line > 0);
}

function queryGraph(directory, query, limits = {}) {
  if (typeof query !== 'string' || !query.trim() || query.length>200) throw new Error('Provide a focused query of 1–200 characters');
  const root = fs.realpathSync(directory);
  const git = spawnSync('git', ['-C', root, 'ls-files', '-co', '--exclude-standard', '-z'], { encoding:'utf8', maxBuffer:2*1024*1024, timeout:10000 });
  if (git.status !== 0) throw new Error('Git file listing unavailable; use focused search');
  const names = [...new Set(git.stdout.split('\0').filter(Boolean))].sort();
  const maxFiles = limits.maxFiles ?? 2000;
  let cacheFile, previous = {}, cacheWarning;
  try { cacheFile = safePath(root,'.claude/.state/code-graph.json'); previous = readCache(cacheFile); }
  catch { cacheWarning = 'Cache path unsafe; using fresh in-memory index'; }
  const files = Object.create(null);
  let bytes = 0, skipped = 0, parsed = 0, indexed = 0;
  for (const name of names) {
    if (isSecretPath(name) || /(^|\/)(?:\.git|\.state|node_modules|vendor|dist|build|\.next)(\/|$)/.test(name)) continue;
    if (!EXT.includes(path.extname(name))) { skipped++; continue; }
    if (indexed >= maxFiles) { skipped++; continue; }
    try {
      const file = safePath(root,name), stat = fs.lstatSync(file);
      if (!stat.isFile() || stat.size>256000 || bytes+stat.size>20*1024*1024) { skipped++; continue; }
      const text = fs.readFileSync(file,'utf8'); bytes += Buffer.byteLength(text);
      if (text.includes('\0')) { skipped++; continue; }
      const hash = crypto.createHash('sha256').update(text).digest('hex');
      const cached = previous[name];
      const reusable = validRecord(cached, hash);
      const data = reusable ? cached : { hash, ...extract(text) };
      if (!reusable) parsed++;
      files[name] = data; indexed++;
    } catch { skipped++; }
  }
  if (cacheFile) {
    try {
      fs.mkdirSync(path.dirname(cacheFile), { recursive:true, mode:0o700 });
      // Re-check after creation; never write through a pre-existing state symlink.
      safePath(root,'.claude/.state/code-graph.json');
      const temp = path.join(path.dirname(cacheFile), `.graph-${crypto.randomUUID()}.tmp`);
      try {
        const serialized = JSON.stringify({version:VERSION,files});
        if (Buffer.byteLength(serialized)>8*1024*1024) throw new Error('Cache exceeds size limit');
        fs.writeFileSync(temp, serialized, {mode:0o600,flag:'wx'});
        fs.renameSync(temp,cacheFile);
      } finally { try { fs.unlinkSync(temp); } catch {} }
    } catch { cacheWarning = 'Cache unavailable; results computed from current files'; }
  }
  const imports = Object.create(null), dependents = Object.create(null);
  for (const [name,data] of Object.entries(files)) {
    imports[name] = [];
    for (const specifier of data.imports) {
      if (typeof specifier !== 'string' || !specifier.startsWith('.')) continue;
      const base = path.posix.normalize(path.posix.join(path.posix.dirname(name),specifier));
      const target = [base,...EXT.map(ext=>base+ext),...EXT.map(ext=>base+'/index'+ext)].find(p=>Object.hasOwn(files,p));
      if (!target) continue;
      imports[name].push(target); (dependents[target] ||= []).push(name);
    }
  }
  const terms = query.toLowerCase().trim().split(/\s+/);
  const ranked = Object.entries(files).map(([name,data]) => {
    const keys = [name,...data.symbols.map(s=>s.name),...data.calls.map(s=>s.name)].join(' ').toLowerCase();
    return { name, data, score:terms.filter(t=>keys.includes(t)).length };
  }).filter(m=>m.score>0).sort((a,b)=>b.score-a.score || a.name.localeCompare(b.name));
  const matches = ranked.slice(0,8).map(({name,data})=>({ path:name, kind:/test|spec/i.test(name)?'test':/config/i.test(name)?'config':'source',
    symbols:data.symbols.slice(0,12), imports:imports[name].slice(0,12), dependents:(dependents[name]||[]).slice(0,12),
    callHints:data.calls.filter(c=>terms.some(t=>c.name.toLowerCase().includes(t))).slice(0,8),
    routeOrModelLines:data.routeOrModelLines.slice(0,8), detailsLimited:data.extractionLimited || data.symbols.length>12 || imports[name].length>12 || (dependents[name]||[]).length>12 }));
  const result = { coverage:'Lexical JS/TS/Python hints; verify source. Dynamic calls, aliases, Python import resolution and unsupported languages require search.',
    indexed:Object.keys(files).length, parsed, skipped, partial:skipped>0 || Object.values(files).some(f=>f.extractionLimited),
    cacheWarning, matches, more:Math.max(0,ranked.length-matches.length) };
  while (result.matches.length && JSON.stringify(result).length > 16000) {
    result.matches.pop(); result.more++; result.partial = true;
  }
  return result;
}
module.exports = { queryGraph, extract };
