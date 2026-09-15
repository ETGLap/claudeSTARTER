"use strict";
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { compactJSON, summarize, route } = require('./optimization');
const { queryGraph } = require('./graph');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'conductor-opt-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = (p, text) => { const f = path.join(root, p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); };
  assert.equal(spawnSync('git', ['init', '-q', root]).status, 0);
  write('.gitignore', 'ignored/\n.claude/.state/\n');
  return { root, write };
}
const now = Date.parse('2026-09-15T00:00:00Z');
const model = (id, tier, price) => ({ id, host: 'fixture', tier, available: true, validated: true,
  verifiedAt: '2026-09-15T00:00:00Z', inputPerMillion: price, outputPerMillion: price * 5, maxContext: 100000 });
const task = { host: 'fixture', complexity: 'simple', risk: 'normal', inputTokens: 1000, outputTokens: 200 };

test('prompt compaction preserves strings, duplicates and exact numeric literals', () => {
  const source = ' { "n": 9007199254740993123, "n": 1e+99, "code": "a  b\\n\\\"c", "must": false } ';
  const result = compactJSON(source);
  assert.deepEqual(JSON.parse(result), JSON.parse(source));
  assert.ok(result.includes('9007199254740993123')); assert.ok(result.includes('1e+99'));
  assert.equal((result.match(/"n"/g) || []).length, 2);
  assert.throws(() => compactJSON('{broken'));
});

test('log summaries preserve short evidence and bound long output with omissions', () => {
  assert.equal(summarize('small diagnostic\n').text, 'small diagnostic\n');
  const log = ['start', ...Array(300).fill('progress'), 'ERROR required constraint failed', ...Array(300).fill('progress'), 'done'].join('\n');
  const result = summarize(log);
  assert.match(result.text, /ERROR required constraint failed/);
  assert.match(result.text, /omitted|repeated/);
  assert.ok(result.text.length <= 8000);
  assert.ok(result.outputCharacters < result.inputCharacters);
  const huge = summarize('ERROR '+ 'x'.repeat(20000));
  assert.ok(huge.text.length <= 8000); assert.equal(huge.truncated, true);
});

test('routing chooses cheapest capable eligible model, then escalates above a failed tier', () => {
  const models = [model('strong', 3, 5), model('cheap', 1, 1), model('middle', 2, 2)];
  assert.equal(route(task, models, now).model, 'cheap');
  assert.equal(route({ ...task, failedModels: ['cheap'] }, models, now).model, 'middle');
  assert.equal(route({ ...task, risk: 'high' }, models, now).model, 'strong');
  assert.equal(route({ ...task, complexity: 'deep' }, models, now).model, null);
});

test('routing excludes stale, unvalidated, unavailable, unknown-priced and small-context models', () => {
  for (const change of [{ available: false }, { validated: false }, { verifiedAt: '2020-01-01' },
    { inputPerMillion: null }, { maxContext: 500 }, { host: 'different' }]) {
    assert.equal(route(task, [{ ...model('candidate', 1, 1), ...change }], now).model, null);
  }
  assert.throws(() => route({ ...task, inputTokens: -1 }, [], now));
  assert.throws(() => route({ ...task, complexity: 'guess' }, [], now));
  assert.throws(() => route({ ...task, failedModels: ['unknown'] }, [], now));
});

test('graph finds symbol definitions, imports, reverse dependencies and refreshes changes', (t) => {
  const { root, write } = fixture(t);
  write('src/service.js', 'export function verifyUser() { return true; }');
  write('src/api.js', "import { verifyUser } from './service.js';\napp.get('/user', verifyUser);");
  write('tests/service.test.js', "const service = require('../src/service');\nservice.verifyUser();");
  let result = queryGraph(root, 'verifyUser');
  assert.ok(result.matches.some(m => m.path === 'src/service.js' && m.symbols.some(s => s.name === 'verifyUser')));
  assert.ok(result.matches.some(m => m.path === 'src/service.js' && m.dependents.includes('src/api.js')));
  assert.ok(result.matches.some(m => m.path === 'tests/service.test.js'));
  write('src/service.js', 'export function changedName() {}');
  result = queryGraph(root, 'changedName');
  assert.ok(result.matches.some(m => m.path === 'src/service.js'));
  fs.unlinkSync(path.join(root, 'src/service.js'));
  result = queryGraph(root, 'changedName'); assert.equal(result.matches.length, 0);
});

test('graph excludes secrets, ignored paths and symlinks, reports bounds and handles corrupt cache', (t) => {
  const { root, write } = fixture(t);
  write('safe.js', 'function visible() {}'); write('ignored/hidden.js', 'function secret() {}');
  write('.env.js', 'function secret() {}'); write('big.js', 'x'.repeat(300000));
  fs.symlinkSync(path.join(root, 'safe.js'), path.join(root, 'link.js'));
  let result = queryGraph(root, 'secret'); assert.equal(result.matches.length, 0);
  assert.ok(result.skipped > 0);
  write('.claude/.state/code-graph.json', '{broken');
  result = queryGraph(root, 'visible');
  assert.deepEqual(result.matches.map(m => m.path), ['safe.js']);
  assert.equal(queryGraph(root, 'visible', { maxFiles: 0 }).partial, true);
});

test('graph fails visibly outside Git, and query output is bounded', (t) => {
  const { root, write } = fixture(t);
  for (let i=0;i<15;i++) write(`src/file${i}.js`, 'function sameName() {}');
  const result = queryGraph(root, 'sameName'); assert.equal(result.matches.length, 8); assert.ok(result.more > 0);
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'conductor-no-git-'));
  t.after(() => fs.rmSync(outside, { recursive: true, force: true }));
  assert.throws(() => queryGraph(outside, 'anything'), /Git/);
});

test('CLI log filtering preserves original exit status and raw log, errors are nonzero', (t) => {
  const { root, write } = fixture(t); write('build.log', 'ERROR failed\n');
  const cli = path.join(__dirname, 'optimize.js');
  const result = spawnSync(process.execPath, [cli, 'summarize', path.join(root, 'build.log'), '7'], { encoding: 'utf8' });
  assert.equal(result.status, 7); assert.match(result.stdout, /ERROR failed/); assert.match(result.stdout, /build.log/);
  assert.equal(fs.readFileSync(path.join(root, 'build.log'), 'utf8'), 'ERROR failed\n');
  assert.notEqual(spawnSync(process.execPath, [cli, 'summarize', path.join(root, 'missing'), '0']).status, 0);
});

test('graph reuses extraction but detects changed content even with restored timestamps', (t) => {
  const { root, write } = fixture(t);
  write('source.js', 'function firstName() {}');
  queryGraph(root, 'firstName');
  assert.equal(queryGraph(root, 'firstName').parsed, 0);
  const file = path.join(root, 'source.js'), stat = fs.statSync(file);
  write('source.js', 'function otherName() {}'); fs.utimesSync(file, stat.atime, stat.mtime);
  const result = queryGraph(root, 'otherName');
  assert.equal(result.parsed, 1); assert.equal(result.matches[0].symbols[0].name, 'otherName');
});

test('routing excludes future verification and stops after the highest failed tier', () => {
  assert.equal(route(task, [{ ...model('future',1,1), verifiedAt:'2099-01-01' }], now).model, null);
  assert.equal(route({ ...task, failedModels:['top'] }, [model('top',4,10)], now).model, null);
});

test('graph cache symlinks do not overwrite another file', (t) => {
  const { root, write } = fixture(t); write('source.js', 'function safeName() {}');
  write('keep.txt','keep'); write('.claude/.state/.keep','');
  fs.symlinkSync(path.join(root,'keep.txt'),path.join(root,'.claude/.state/code-graph.json'));
  const result=queryGraph(root,'safeName');
  assert.equal(result.matches[0].path,'source.js'); assert.ok(result.cacheWarning);
  assert.equal(fs.readFileSync(path.join(root,'keep.txt'),'utf8'),'keep');
});

test('malformed cached symbols are rebuilt even when the file hash matches', (t) => {
  const { root, write } = fixture(t);
  write('source.js', 'function presentName() {}'); queryGraph(root,'presentName');
  const cacheFile=path.join(root,'.claude/.state/code-graph.json');
  const cache=JSON.parse(fs.readFileSync(cacheFile,'utf8'));
  cache.files['source.js'].symbols=[null];
  fs.writeFileSync(cacheFile,JSON.stringify(cache));
  const result=queryGraph(root,'presentName');
  assert.equal(result.parsed,1); assert.equal(result.matches[0].symbols[0].name,'presentName');
});

test('a long opening line cannot crowd a later diagnostic out of the excerpt', () => {
  const result=summarize('x'.repeat(20000)+'\nERROR: actual failure\nfinished');
  assert.match(result.text,/ERROR: actual failure/);
  assert.ok(result.text.length<=8000);
});
