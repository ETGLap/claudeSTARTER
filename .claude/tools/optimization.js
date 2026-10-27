"use strict";

// Preserve every JSON token verbatim, including integers beyond JS number precision.
function compactJSON(source) {
  JSON.parse(source);
  let result = '', quoted = false, escaped = false;
  for (const char of source) {
    if (quoted || !/\s/.test(char)) result += char;
    if (escaped) { escaped = false; continue; }
    if (quoted && char === '\\') { escaped = true; continue; }
    if (char === '"') quoted = !quoted;
  }
  return result;
}

function summarize(source) {
  if (source.length <= 6000 && source.split('\n').length <= 80) return { text: source, truncated: false, inputCharacters: source.length, outputCharacters: source.length };
  const lines = source.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '').split('\n');
  const selected = new Set();
  const add = (i) => { if (i >= 0 && i < lines.length) selected.add(i); };
  for (let i=0; i<5; i++) add(i);
  for (let i=Math.max(0,lines.length-10); i<lines.length; i++) add(i);
  // Excerpts prioritize diagnostics, but never claim that lexical selection found every error.
  for (let i=0; i<lines.length && selected.size<70; i++) {
    if (/error|fail|exception|warning|not ok|panic|traceback/i.test(lines[i])) {
      for (let offset=-2; offset<=2; offset++) add(i+offset);
    }
  }
  let previous = -1, text = '';
  for (const i of [...selected].sort((a,b) => a-b)) {
    if (i > previous+1) text += `[${i-previous-1} lines omitted]\n`;
    const line = lines[i].length > 80 ? lines[i].slice(0,80) + ' [line truncated]' : lines[i];
    text += `${i+1}: ${line}\n`; previous = i;
  }
  if (previous < lines.length-1) text += `[${lines.length-previous-1} lines omitted]\n`;
  if (text.length > 7700) text = text.slice(0,7700) + '\n[excerpt truncated]\n';
  text += '[Filtered excerpt; inspect the original log for complete evidence.]\n';
  return { text, truncated: true, inputCharacters: source.length, outputCharacters: text.length };
}

const TIERS = { simple: 1, standard: 2, complex: 3, deep: 4 };
const finite = (n) => typeof n === 'number' && Number.isFinite(n) && n >= 0;
function route(task, models, now = Date.now()) {
  if (!task || !Array.isArray(models) || !Object.hasOwn(TIERS, task.complexity) ||
      !['normal','high'].includes(task.risk) || typeof task.host !== 'string' ||
      !finite(task.inputTokens) || !finite(task.outputTokens)) throw new Error('Invalid routing task');
  const failed = task.failedModels ?? [];
  if (!Array.isArray(failed) || failed.some(id => !models.some(m => m?.id === id && m.host === task.host))) throw new Error('Unknown failed model; reassess routing');
  const failedTier = Math.max(0, ...models.filter(m => m?.host === task.host && failed.includes(m.id)).map(m => m.tier));
  const tier = Math.max(TIERS[task.complexity], task.risk === 'high' ? 3 : 1, failedTier + 1);
  const eligible = models.filter(m => m && m.host === task.host && m.available === true && m.validated === true &&
    typeof m.id === 'string' && Number.isInteger(m.tier) && m.tier >= tier && m.tier <= 4 &&
    finite(m.inputPerMillion) && finite(m.outputPerMillion) && finite(m.maxContext) &&
    m.maxContext >= task.inputTokens + task.outputTokens &&
    Number.isFinite(Date.parse(m.verifiedAt)) && Date.parse(m.verifiedAt) <= now &&
    now - Date.parse(m.verifiedAt) <= 30 * 86400000);
  const cost = m => (task.inputTokens*m.inputPerMillion + task.outputTokens*m.outputPerMillion)/1e6;
  eligible.sort((a,b) => cost(a)-cost(b) || a.tier-b.tier || a.id.localeCompare(b.id));
  const selected = eligible[0];
  return selected ? { model: selected.id, tier, estimatedUSD: cost(selected), dispatch: false,
    note: 'Estimate excludes caching, reasoning variability, tool fees and retries; host must apply selection.' }
    : { model: null, tier, dispatch: false, note: 'No verified eligible candidate. Keep host selection; report routing unavailable. Reassess after exhausted escalation.' };
}

module.exports = { compactJSON, summarize, route };
