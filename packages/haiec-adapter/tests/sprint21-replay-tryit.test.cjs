'use strict';
/**
 * Sprint 21 — replay binding identity + Try-it-yourself tests.
 * Loads dashboard/index.html + reports.js into a vm sandbox with the real
 * 45-export bundle. Asserts: the v1 replay resolves to the v1 export (never
 * v3), every binding check fails closed on tamper, the Command Center
 * timeline is labeled historical, local simulations stay labeled as such,
 * and the guided judge path renders persisted values verbatim.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '../../..');
const V1_EVAL = 'bce94772-df56-447b-8625-0646915f7e25:assurance:1.1';
const V3_EVAL = 'f0647486-ad18-46c8-834b-b4236037acd6:assurance:1.1';
const V1_WORLD = 'manufacturing-source-world-v1';
const V1_RUN = 'syn-world-sys-217-wrong_target';
const V1_TXN = 'syn-txn-b855a022ebe42786bf';

function stubEl() {
  return {
    innerHTML: '', textContent: '', value: '', title: '', dataset: {},
    classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
    setAttribute() {}, getAttribute: () => null,
    appendChild() {}, querySelectorAll: () => [], querySelector: () => stubEl(),
    insertAdjacentHTML() {}, click() { this.__clicked = true; }, style: {},
  };
}

function loadDash() {
  const html = fs.readFileSync(path.join(ROOT, 'dashboard/index.html'), 'utf8');
  const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  blocks.push(fs.readFileSync(path.join(ROOT, 'dashboard/report/reports.js'), 'utf8'));
  const elements = new Map();
  const listeners = {};
  const doc = {
    getElementById: (id) => { if (!elements.has(id)) elements.set(id, stubEl()); return elements.get(id); },
    querySelectorAll: () => [], querySelector: () => stubEl(),
    addEventListener: (t, f) => { (listeners[t] = listeners[t] || []).push(f); },
    head: { appendChild() {} }, createElement: () => stubEl(),
    createTreeWalker: () => ({ nextNode: () => null }),
  };
  const win = {
    scrollTo() {},
    location: { href: 'https://demo.local/', search: '', pathname: '/' },
    history: { pushState() {}, replaceState() {} },
    addEventListener() {}, print() {},
  };
  win.HAIEC_DEMO_DATA = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'dashboard/data/haiec-exports.js'), 'utf8')
      .replace(/^[\s\S]*?window\.HAIEC_DEMO_DATA = /, '').replace(/;\s*$/, ''));
  const blobs = [];
  const sandbox = {
    window: win, document: doc,
    console: { log() {}, warn() {}, error() {} },
    setTimeout, clearTimeout, setInterval, clearInterval,
    requestAnimationFrame: (f) => f(), crypto: globalThis.crypto,
    TextEncoder, fetch: () => Promise.reject(new Error('no network')),
    navigator: { clipboard: { writeText: () => Promise.resolve() } },
    URLSearchParams, Event, NodeFilter: { SHOW_TEXT: 4, SHOW_ELEMENT: 1 },
    Blob: class { constructor(parts) { this.parts = parts; blobs.push(parts); } },
    URL: Object.assign(URL, { createObjectURL: () => 'blob:stub', revokeObjectURL() {} }),
  };
  vm.createContext(sandbox);
  for (const b of blocks) vm.runInContext(b, sandbox);
  const T = vm.runInContext(
    '({STATE,HX,HXDATA,hxVerifyAll,hxKey,hxExports,hxFor,hxHistorical,rpEval,rpBinding,rpOk,' +
    'pageReplay,pageExec,pageTryIt,tryReset,runScenario,exportLedger,renderSystemReports,' +
    'PAGE_RENDERERS,scen,sys,RP,RP_CASE})', sandbox);
  return { T, sandbox, win, doc, elements, listeners, blobs };
}

async function ready() {
  const ctx = loadDash();
  await vm.runInContext('hxVerifyAll()', ctx.sandbox);
  return ctx;
}
const click = (ctx, attrs) => {
  const btn = { closest: (sel) => sel === '[data-act]' ? { dataset: attrs } : null };
  for (const f of (ctx.listeners.click || [])) f({ target: btn });
};

/* ---------------- P0: replay binding ---------------- */

test('valid v1 replay binds to the historical v1 evaluation, never v3', async () => {
  const { T } = await ready();
  const a = T.rpEval();
  assert.equal(a.evaluation.evaluationId, V1_EVAL);
  assert.equal(a.provenance.sourceWorldId, V1_WORLD);
  assert.equal(a.sourceCase.scenarioRunId, V1_RUN);
  assert.notEqual(a.evaluation.evaluationId, V3_EVAL);
  assert.equal(T.rpBinding().ok, true);
  assert.equal(T.rpOk(), true);
  const html = T.PAGE_RENDERERS.replay();
  assert.ok(html.includes('HISTORICAL REPLAY'));
  assert.ok(html.includes(V1_EVAL));
  assert.ok(html.includes('data-id="SYS-217|SYS-217-WRONG_TARGET@manufacturing-source-world-v1"'));
  assert.ok(!html.includes(V3_EVAL), 'replay page leaked the v3 evaluation id');
});

test('every binding check fails closed — tamper each relationship', async () => {
  const tamper = async (mutate) => {
    const { T } = await ready();
    mutate(T);
    assert.equal(T.rpBinding().ok, false);
    assert.equal(T.rpOk(), false);
    const html = T.PAGE_RENDERERS.replay();
    assert.ok(html.includes('REPLAY_BINDING_MISMATCH'));
    assert.ok(!html.includes('Replay again'), 'blocked replay still showed controls');
    assert.ok(!html.includes('MFG-EFF-001 MATCH'), 'mismatched replay still showed findings');
  };
  await tamper((T) => { T.HXDATA.replay.provenance.sourceWorldId = 'manufacturing-source-native-v3'; });
  await tamper((T) => { T.HXDATA.replay.provenance.scenarioRunId = 'syn-mfg-v3-sys-217-wrong_target'; });
  await tamper((T) => { T.HXDATA.replay.evaluationId = V3_EVAL; });
  await tamper((T) => { T.HXDATA.replay.provenance.transactionId = 'syn-txn-forged'; });
  await tamper((T) => { T.HXDATA.replay.provenance.consumedEvidenceCount = 5; });
  await tamper((T) => { T.HX.replayVerified = false; });
  await tamper((T) => { T.HX.verified[T.hxKey(T.rpEval())] = false; });
});

test('command center timeline is labeled historical v1 with both identities', async () => {
  const { T } = await ready();
  const html = T.PAGE_RENDERERS.exec();
  assert.ok(html.includes('Historical v1 evidence replay — different evaluation and source world from the current v3 assessment'));
  assert.ok(html.includes(V1_WORLD));
  assert.ok(html.includes(V1_EVAL));
  assert.ok(html.includes(V3_EVAL), 'current v3 assessment identity missing');
  assert.ok(html.includes('HISTORICAL V1 · RECORDED'));
});

test('playback controls still present when binding is valid', async () => {
  const { T } = await ready();
  const html = T.PAGE_RENDERERS.replay();
  assert.ok(html.includes('data-rp="start"'));
  assert.ok(html.includes('data-rp="manual"'));
  assert.equal(T.RP.status, 'idle');
});

/* ---------------- world-qualified navigation ---------------- */

test('world-qualified case id resolves the v1 artifact, bare id stays v3', async () => {
  const { T, sandbox } = await ready();
  const v3 = vm.runInContext(`(() => { HX.caseId='SYS-217-WRONG_TARGET'; return PAGE_RENDERERS.evaluations(); })()`, sandbox);
  assert.ok(v3.includes(V3_EVAL));
  const v1 = vm.runInContext(`(() => { HX.caseId='SYS-217-WRONG_TARGET@${V1_WORLD}'; return PAGE_RENDERERS.evaluations(); })()`, sandbox);
  assert.ok(v1.includes(V1_EVAL));
  assert.ok(v1.includes('HISTORICAL REGISTER'));
});

/* ---------------- P1/P2: try-it-yourself ---------------- */

test('canonical state comparison renders persisted values verbatim', async () => {
  const { T } = await ready();
  T.STATE.tryState = 'WRONG_TARGET';
  let html = T.pageTryIt();
  assert.ok(html.includes('MFG-EFF-001'));
  assert.ok(html.includes('qualified target divergence'));
  assert.ok(html.includes('BROADER'));
  assert.ok(html.includes('REVIEW'));
  assert.ok(html.includes(V3_EVAL));
  T.STATE.tryState = 'REMEDIATED';
  html = T.pageTryIt();
  assert.ok(html.includes('NO_MATCH_WITH_ADEQUATE_COVERAGE'));
  assert.ok(html.includes('MATCHES'));
  T.STATE.tryState = 'EVIDENCE_DEGRADED';
  html = T.pageTryIt();
  assert.ok(html.includes('INSUFFICIENT_SOURCE'));
  assert.ok(html.includes('NATIVE_TARGET_READBACK'));
  T.STATE.tryState = 'EXPECTED_BASELINE';
  html = T.pageTryIt();
  assert.ok(html.includes('NO_MATCH_WITH_ADEQUATE_COVERAGE'));
  // disclosure + three-class banner present throughout
  assert.ok(html.includes('does not run a new HAIEC assessment'));
  assert.ok(html.includes('CANONICAL HAIEC EVALUATION'));
  assert.ok(html.includes('LOCAL INTERACTIVE SIMULATION'));
  assert.ok(html.includes('HISTORICAL REPLAY'));
});

test('numeric inputs 3 / 40 / 60 produce the expected local fixture decisions', async () => {
  const run = async (v) => {
    const ctx = await ready();
    ctx.T.STATE.selectedScenario = 'HOLD';
    ctx.doc.getElementById('scenario-value').value = String(v);
    vm.runInContext('runScenario()', ctx.sandbox);
    return ctx.T.STATE.events.find((e) => !e.fixture);
  };
  const e3 = await run(3);
  assert.equal(e3.decision, 'PASS');
  assert.equal(e3.effect, 'SIMULATED_LOCAL_READBACK');
  assert.ok(e3.desc.includes('automatic containment'));
  const e40 = await run(40);
  assert.equal(e40.decision, 'REVIEW_REQUIRED');
  assert.ok(e40.desc.includes('Quality Supervisor'));
  const e60 = await run(60);
  assert.equal(e60.decision, 'REVIEW_REQUIRED');
  assert.ok(e60.desc.includes('Plant Quality Manager'));
});

test('local simulation never mutates the 45 canonical exports', async () => {
  const { T, sandbox, doc } = await ready();
  const before = Object.values(T.HXDATA.exportMapV3).map((a) => a.evaluation.evaluationId).sort().join(',');
  doc.getElementById('scenario-value').value = '40';
  T.STATE.selectedScenario = 'HOLD';
  vm.runInContext('runScenario()', sandbox);
  const after = Object.values(T.HXDATA.exportMapV3).map((a) => a.evaluation.evaluationId).sort().join(',');
  assert.equal(Object.keys(T.HXDATA.exportMapV3).length, 45);
  assert.equal(after, before);
});

test('ledger export is labeled BROWSER_LOCAL_SIMULATION_NOT_HAIEC_EVALUATION', async () => {
  const { T, sandbox, blobs, doc } = await ready();
  doc.getElementById('scenario-value').value = '3';
  T.STATE.selectedScenario = 'HOLD';
  vm.runInContext('runScenario()', sandbox);
  vm.runInContext('exportLedger()', sandbox);
  assert.equal(blobs.length, 1);
  const payload = JSON.parse(blobs[0][0]);
  assert.equal(payload.artifactClass, 'BROWSER_LOCAL_SIMULATION_NOT_HAIEC_EVALUATION');
  assert.ok(!payload.evaluationId, 'ledger carried a canonical evaluation id');
  assert.ok(!payload.u6 && !payload.publicVerificationId, 'ledger carried a U6 receipt claim');
  assert.ok(!JSON.stringify(payload).includes('READBACK_VERIFIED'), 'ledger still uses READBACK_VERIFIED');
});

test('no local path presents READBACK_VERIFIED — source has no such assignment', () => {
  const src = fs.readFileSync(path.join(ROOT, 'dashboard/index.html'), 'utf8');
  assert.ok(!/effect\s*={0,2}\s*'READBACK_VERIFIED'/.test(src));
  assert.ok(!src.includes("'READBACK_VERIFIED'"));
});

test('try-state / try-preset / try-reset wire through the real click handler', async () => {
  const ctx = await ready();
  const { T } = ctx;
  T.STATE.page = 'tryit';
  click(ctx, { act: 'try-state', id: 'REMEDIATED' });
  assert.equal(T.STATE.tryState, 'REMEDIATED');
  click(ctx, { act: 'try-preset', id: '40' });
  assert.equal(T.STATE.events.find((e) => !e.fixture).decision, 'REVIEW_REQUIRED');
  assert.equal(T.STATE.requests.filter((r) => r.status === 'PENDING').length, 1);
  click(ctx, { act: 'try-reset' });
  assert.equal(T.STATE.events.filter((e) => !e.fixture).length, 0);
  assert.equal(T.STATE.requests.length, 0);
  assert.equal(T.STATE.mes.contained, 0);
});

/* ---------------- P3: system report navigation ---------------- */

test('system reports link real artifacts and mark unsupported types', async () => {
  const { T, sandbox } = await ready();
  const html = vm.runInContext('renderSystemReports(sys("SYS-217"))', sandbox);
  assert.ok(html.includes('Canonical evaluation export'));
  assert.ok(html.includes('data-act="hx-case"'));
  assert.ok(html.includes('data-rp="case"'));
  assert.ok((html.match(/NOT ISSUED/g) || []).length >= 3);
  assert.ok(!html.includes('report-kind'), 'inert report-kind control still rendered');
  assert.ok(html.includes('all five evidence states'));
});

test('entry points exist on command center, judge page and hub', async () => {
  const { T, win } = await ready();
  assert.ok(T.PAGE_RENDERERS.exec().includes('data-act="try-open"'));
  win.RPT.view = 'judge';
  assert.ok(T.PAGE_RENDERERS.reports().includes('data-act="try-open"'));
  win.RPT.view = 'hub';
  assert.ok(T.PAGE_RENDERERS.reports().includes('data-act="try-open"'));
});
