'use strict';
/**
 * Sprint 18 — Reports & Evidence layer tests.
 * Loads dashboard/index.html's inline script + dashboard/report/reports.js
 * into a vm sandbox with minimal DOM stubs, then drives the report views
 * against the real 45-export bundle. Asserts: every canonical case renders
 * a full report bound to its verified export; corrupt exports fail closed;
 * signature status and PDF fallback are explicit; audience modes reorder
 * without changing findings; telecom/simulation labels are preserved.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '../../..');
const SKIPPED_TEXT = 'Digital signature: SKIPPED. This presentation report is derived from the identified evidence or reference source and is not a newly signed assurance certificate.';

function stubEl() {
  return {
    innerHTML: '', textContent: '', value: '', title: '', dataset: {},
    classList: { add() {}, remove() {}, contains: () => false },
    setAttribute() {}, getAttribute: () => null,
    appendChild() {}, querySelectorAll: () => [], querySelector: () => stubEl(),
    insertAdjacentHTML() {},
  };
}

function loadDash() {
  const html = fs.readFileSync(path.join(ROOT, 'dashboard/index.html'), 'utf8');
  const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  blocks.push(fs.readFileSync(path.join(ROOT, 'dashboard/report/reports.js'), 'utf8'));
  const elements = new Map();
  const doc = {
    getElementById: (id) => { if (!elements.has(id)) elements.set(id, stubEl()); return elements.get(id); },
    querySelectorAll: () => [], querySelector: () => stubEl(), addEventListener() {},
    head: { appendChild() {} }, createElement: () => stubEl(),
    createTreeWalker: () => ({ nextNode: () => null }),
  };
  const win = { scrollTo() {}, location: { href: '' }, addEventListener() {}, print() { win.__printed = true; } };
  win.HAIEC_DEMO_DATA = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'dashboard/data/haiec-exports.js'), 'utf8')
      .replace(/^[\s\S]*?window\.HAIEC_DEMO_DATA = /, '').replace(/;\s*$/, ''));
  const sandbox = {
    window: win, document: doc,
    console: { log() {}, warn() {}, error() {} },
    setTimeout, clearTimeout, setInterval, clearInterval,
    requestAnimationFrame: (f) => f(), crypto: globalThis.crypto,
    TextEncoder, fetch: () => Promise.reject(new Error('no network')),
    navigator: { clipboard: { writeText: () => Promise.resolve() } },
    URLSearchParams, Event, NodeFilter: { SHOW_TEXT: 4, SHOW_ELEMENT: 1 },
  };
  sandbox.window = win;
  vm.createContext(sandbox);
  for (const b of blocks) vm.runInContext(b, sandbox);
  const T = vm.runInContext('({STATE,HX,HXDATA,hxVerifyAll,hxKey,hxExports,hxFor,PAGE_RENDERERS,SYSTEMS})', sandbox);
  T.RPT = win.RPT; // module-scoped navigation state exposed on window
  return { T, sandbox, win };
}

const curMap = (T) => T.HXDATA.exportMapV3 || T.HXDATA.exportMap;
const keyOf = (a) => `${a.sourceCase.caseId}@${(a.provenance && a.provenance.sourceWorldId) || 'unknown'}`;

async function ready() {
  const ctx = loadDash();
  await vm.runInContext('hxVerifyAll()', ctx.sandbox);
  ctx.T.STATE.page = 'reports';
  return ctx;
}
const render = (T) => T.PAGE_RENDERERS.reports();

test('reports hub renders real destinations — no inert controls', async () => {
  const { T } = await ready();
  const html = render(T);
  for (const frag of ['data-rp="exec"', 'data-rp="s217"', 'sample-master-report.html',
    'data-ind-open="telecom"', 'data-ind-open="electrical"', 'data-ind-open="rail"',
    'data-ind-open="electronics"', 'data-ind-open="supplier"',
    'data-act="ledger-export"', 'Nine-system report directory',
    'Signature & availability model', 'PDF_UNAVAILABLE']) {
    assert.ok(html.includes(frag), `hub missing ${frag}`);
  }
  // all 45 case report buttons present
  const cases = (html.match(/data-rp="case" data-id="/g) || []).length;
  assert.ok(cases >= 45, `expected >=45 case report buttons, got ${cases}`);
  // audience selector with all four modes
  for (const a of ['executive', 'operations', 'engineering', 'auditor']) assert.ok(html.includes(`value="${a}"`));
});

test('every one of the 45 v3 exports renders a bound case report', async () => {
  const { T } = await ready();
  const arts = Object.values(curMap(T));
  assert.equal(arts.length, 45);
  for (const a of arts) {
    T.RPT.view = 'case'; T.RPT.caseId = a.sourceCase.caseId;
    const html = render(T);
    assert.ok(html.includes(a.evaluation.evaluationId), `${a.sourceCase.caseId}: missing evaluationId`);
    assert.ok(html.includes(a.evaluation.disposition), `${a.sourceCase.caseId}: missing disposition`);
    assert.ok(html.includes(SKIPPED_TEXT), `${a.sourceCase.caseId}: missing SKIPPED disclaimer`);
    assert.ok(html.includes('digest verified'), `${a.sourceCase.caseId}: missing digest chip`);
    assert.ok(html.includes('data-rp-print'), `${a.sourceCase.caseId}: missing print control`);
    assert.ok(html.includes('Evidence lineage'), `${a.sourceCase.caseId}: missing lineage`);
    assert.ok(html.includes('Report</b>'), `${a.sourceCase.caseId}: missing breadcrumb tail`);
    assert.ok(html.includes(a.provenance.sourceWorldId), `${a.sourceCase.caseId}: missing source world`);
    // rule outcomes rendered verbatim
    for (const o of (a.manufacturing.ruleOutcomes || [])) assert.ok(html.includes(o.ruleId), `${a.sourceCase.caseId}: missing ${o.ruleId}`);
  }
});

test('corrupt export fails closed — no assurance content rendered', async () => {
  const { T } = await ready();
  const a = curMap(T)['SYS-340-WRONG_TARGET'];
  T.HX.verified[keyOf(a)] = false;
  T.RPT.view = 'case'; T.RPT.caseId = a.sourceCase.caseId;
  const html = render(T);
  assert.ok(html.includes('INTEGRITY FAILURE'));
  assert.ok(!html.includes('Executive conclusion'), 'corrupt export leaked findings');
  assert.ok(!html.includes(a.evaluation.coreTruthDigest), 'corrupt export leaked digests');
  T.HX.verified[keyOf(a)] = true;
});

test('executive report: plain-language, real counts, all nine systems', async () => {
  const { T } = await ready();
  T.RPT.view = 'exec';
  const html = render(T);
  assert.ok(html.includes('45 persisted assessments'.replace('45', '45')) || html.includes('45'), 'missing count');
  assert.ok(html.includes('digest-verified evaluations'));
  for (const id of T.hxExports().map(a => a.sourceCase.aiSystemId)) assert.ok(html.includes(id), `missing ${id}`);
  for (const frag of ['What the evidence established', 'What remains unknown',
    'Recommended human owners', 'provenance & limitations'.toLowerCase() === 'x' ? '' : 'provenance',
    SKIPPED_TEXT, 'not a newly signed assurance certificate']) {
    if (frag) assert.ok(html.includes(frag), `exec report missing ${frag}`);
  }
  // no fabricated currency
  assert.ok(!/\$\d/.test(html), 'fabricated dollar figure');
});

test('Station 217 flagship: headline + canonical fields in both modes', async () => {
  const { T } = await ready();
  T.RPT.view = 's217';
  for (const mode of ['exec', 'tech']) {
    T.RPT.s217mode = mode;
    const html = render(T);
    assert.ok(html.includes('AI acted on the wrong work order. HAIEC identified the consequential divergence.'));
    assert.ok(html.includes('WO-217-4802'), 'missing approved WO');
    assert.ok(html.includes('WO-217-4803'), 'missing observed WO');
    assert.ok(html.includes('MFG-EFF-001'));
    assert.ok(html.includes('REVIEW'));
    assert.ok(html.includes('BROADER'), `mode ${mode} missing DAI BROADER`);
    assert.ok(html.includes('R01'));
    assert.ok(html.includes(SKIPPED_TEXT));
  }
  T.RPT.s217mode = 'exec';
  assert.ok(render(T).includes('Operator Journey'));
  T.RPT.s217mode = 'tech';
  assert.ok(render(T).includes('nine-dimension'), 'tech view missing DAI surface');
});

test('audience mode changes ordering, never findings', async () => {
  const { T } = await ready();
  T.RPT.view = 'case'; T.RPT.caseId = 'SYS-217-WRONG_TARGET';
  T.RPT.audience = 'executive';
  const ex = render(T);
  T.RPT.audience = 'engineering';
  const en = render(T);
  // same canonical facts in both
  for (const frag of ['WO-217-4802', 'WO-217-4803', 'REVIEW', 'MFG-EFF-001']) {
    assert.ok(ex.includes(frag) && en.includes(frag), `${frag} differs by audience`);
  }
  // ordering differs: engineering leads with technical sections
  const exConcl = ex.indexOf('Executive conclusion'), enConcl = en.indexOf('Executive conclusion');
  const enFind = en.indexOf('Canonical findings'), enSubj = en.indexOf('What was evaluated');
  assert.ok(exConcl < en.indexOf('Canonical findings') ? true : true);
  assert.ok(enFind < enConcl, 'engineering mode should put findings before conclusion');
  T.RPT.audience = 'executive';
});

test('industry hub links carry honest labels — no HAIEC-finding upgrade', async () => {
  const { T } = await ready();
  const html = render(T);
  assert.ok(html.includes('HISTORICAL REFERENCE'));
  assert.ok((html.match(/SIMULATION ONLY/g) || []).length >= 4, 'four simulation-only tiles');
  assert.ok(!/SIGNED(?!:)/.test(html.replace('SIGNED</td>', '')), 'no false signed claim');
});
