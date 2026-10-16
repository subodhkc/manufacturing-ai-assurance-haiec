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
  win.HAIEC_GOVERNANCE_DEMO = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'dashboard/data/governance-scenarios.js'), 'utf8')
      .replace(/^[\s\S]*?window\.HAIEC_GOVERNANCE_DEMO = /, '').replace(/;\s*$/, ''));
  win.HAIEC_SCENARIO_SHARED = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'dashboard/data/scenario-shared.js'), 'utf8')
      .replace(/^[\s\S]*?window\.HAIEC_SCENARIO_SHARED = /, '').replace(/;\s*$/, ''));
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
    '({STATE,HX,HXDATA,GOVDATA,GOV,hxVerifyAll,hxKey,hxExports,hxFor,hxHistorical,rpEval,rpBinding,rpOk,' +
    'pageReplay,pageExec,pageTryIt,tryReset,runScenario,exportLedger,renderSystemReports,' +
    'pageGovernance,govDecision,govMonitoringStatus,govApprove,govReject,govReset,PLAY,SHARED,' +
    'PAGE_RENDERERS,scen,sys,RP,RP_CASE})', sandbox);
  T.rptArtifact = win.rptArtifact;
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
  // v5SystemReports is the live workspace renderer (PAGE_RENDERERS.system → v5SystemPage)
  const html = vm.runInContext('v5SystemReports(sys("SYS-217"))', sandbox);
  assert.ok(html.includes('Persisted canonical evaluations'));
  assert.ok(html.includes('data-act="hx-case"'));
  assert.ok(html.includes('data-rp="case"'));
  assert.ok(html.includes('· canonical →'), 'audit/dai must link the persisted case report');
  assert.ok((html.match(/NOT ISSUED/g) || []).length >= 5, 'never-issued types must be marked');
  assert.ok(html.includes('WRONG_TARGET'), 'persisted state rows rendered');
});

test('entry points exist on command center, judge page and hub', async () => {
  const { T, win } = await ready();
  assert.ok(T.PAGE_RENDERERS.exec().includes('data-act="try-open"'));
  win.RPT.view = 'judge';
  assert.ok(T.PAGE_RENDERERS.reports().includes('data-act="try-open"'));
  win.RPT.view = 'hub';
  assert.ok(T.PAGE_RENDERERS.reports().includes('data-act="try-open"'));
});

/* ---------------- Sprint 21.1: hardened binding ---------------- */

test('empty or missing transaction ID fails closed', async () => {
  for (const mutate of [
    (T) => { T.HXDATA.replay.provenance.transactionId = ''; },
    (T) => { delete T.HXDATA.replay.provenance.transactionId; },
    (T) => { T.HXDATA.replay.records[0].payload.transactionId = 'syn-txn-other'; },
    (T) => { T.HXDATA.replay.records[2].payload.scenarioRunId = 'syn-mfg-v3-run'; },
  ]) {
    const { T } = await ready();
    mutate(T);
    assert.equal(T.rpBinding().ok, false);
    assert.ok(T.PAGE_RENDERERS.replay().includes('REPLAY_BINDING_MISMATCH'));
  }
});

test('exec timeline withholds records and autostart when binding fails', async () => {
  const { T, sandbox } = await ready();
  T.HXDATA.replay.provenance.transactionId = 'forged';
  const html = T.PAGE_RENDERERS.exec();
  assert.ok(html.includes('REPLAY_BINDING_MISMATCH'));
  assert.ok(!html.includes(T.HXDATA.replay.records[0].evidenceId), 'withheld record leaked');
  // autostart source gate uses full binding, not bare digest flag
  const src = fs.readFileSync(path.join(ROOT, 'dashboard/index.html'), 'utf8');
  const branch = src.match(/case 'exec-replay':[\s\S]{0,400}/)[0];
  assert.ok(/if\(rpOk\(\)\)/.test(branch), 'exec-replay must gate on rpOk()');
});

test('v1 case@world resolves the v1 report; bare id stays v3', async () => {
  const { T, win } = await ready();
  const v1 = T.rptArtifact('SYS-217-WRONG_TARGET@manufacturing-source-world-v1');
  assert.equal(v1.evaluation.evaluationId, V1_EVAL);
  const v3 = T.rptArtifact('SYS-217-WRONG_TARGET');
  assert.equal(v3.evaluation.evaluationId, V3_EVAL);
  const bogus = T.rptArtifact('SYS-217-WRONG_TARGET@manufacturing-source-world-v9');
  assert.equal(bogus, null);
  win.RPT.view = 'case'; win.RPT.caseId = 'SYS-217-WRONG_TARGET@manufacturing-source-world-v1';
  const html = T.PAGE_RENDERERS.reports();
  assert.ok(html.includes(V1_EVAL));
  assert.ok(html.includes('HISTORICAL REGISTER'));
});

test('v5SystemReports shows VERIFYING/INTEGRITY FAILURE, never unverified dispositions', async () => {
  const { T, sandbox } = await ready();
  const a = T.hxExports().find(x => x.sourceCase.caseId === 'SYS-217-WRONG_TARGET');
  T.HX.verified[T.hxKey(a)] = false;
  let html = vm.runInContext('v5SystemReports(sys("SYS-217"))', sandbox);
  assert.ok(html.includes('INTEGRITY FAILURE'));
  assert.ok(!html.includes('data-rp="case" data-id="SYS-217-WRONG_TARGET"'), 'unverified report link rendered');
  T.HX.verified[T.hxKey(a)] = true;
  T.HX.digestsDone = false;
  html = vm.runInContext('v5SystemReports(sys("SYS-217"))', sandbox);
  assert.ok(html.includes('VERIFYING'));
});

/* ---------------- Sprint 21.1: governance fixture ---------------- */

test('portfolio: exactly 3 approved / 2 rejected / 4 pending, all derived', async () => {
  const { T } = await ready();
  const decs = T.GOVDATA.decisions;
  assert.equal(decs.length, 9);
  assert.equal(decs.filter(d => /^APPROVED/.test(d.humanDecision)).length, 3);
  assert.equal(decs.filter(d => d.humanDecision === 'REJECTED').length, 2);
  assert.equal(decs.filter(d => d.humanDecision === 'PENDING').length, 4);
  const html = T.pageGovernance();
  assert.ok(html.includes('About this demonstration'));
  assert.ok(html.includes('<div class="num">3</div>'));
  assert.ok(html.includes('<div class="num">2</div>'));
  assert.ok(html.includes('<div class="num">4</div>'));
});

test('every approval carries explicit operation and environment scope', async () => {
  const { T } = await ready();
  for (const d of T.GOVDATA.decisions) {
    assert.ok(d.allowedOperations.length > 0 && d.prohibitedOperations.length > 0, d.systemId);
    assert.ok(/^FICTIONAL_/.test(d.environment), d.systemId);
    assert.ok(d.approverRole && d.decisionRef && d.policyVersion, d.systemId);
  }
});

test('nine fictional review requests bind role, scope, policy, decision trail and infrastructure state', async () => {
  const { T } = await ready();
  const g = T.GOVDATA;
  assert.equal(g.reviewInfrastructure.reviewerAuthentication, 'NOT_CONNECTED');
  assert.equal(g.reviewInfrastructure.persistentApprovalStore, 'NOT_PROVISIONED');
  assert.equal(g.reviewInfrastructure.productionDispatcher, 'NOT_CONNECTED');
  const ids = new Set();
  for (const d of g.decisions) {
    const q = d.requestRecord;
    assert.ok(q && Array.isArray(d.reviewEvents) && d.reviewEvents.length >= 2);
    assert.ok(!ids.has(q.requestId)); ids.add(q.requestId);
    assert.equal(q.supportingCaseId, d.canonicalCaseId);
    assert.equal(q.requestedOperation, d.proposedOperation);
    assert.equal(q.assignedReviewerRole, d.approverRole);
    assert.notEqual(q.requestedByRole, q.assignedReviewerRole);
    assert.equal(JSON.stringify(q.allowedAdvisoryScope), JSON.stringify(d.allowedOperations));
    assert.equal(JSON.stringify(q.forbiddenConsequenceScope), JSON.stringify(d.prohibitedOperations));
    assert.equal(q.reviewerIdentityState, 'FICTIONAL_ROLE_ONLY_NOT_AUTHENTICATED');
    assert.equal(q.liveDispatchEnforcement, 'NOT_CONNECTED');
    const last = d.reviewEvents.at(-1);
    assert.equal(last.requestId, q.requestId);
    assert.equal(last.eventType, d.humanDecision === 'PENDING' ? 'DEMO_REVIEW_PENDING' :
      d.humanDecision === 'REJECTED' ? 'DEMO_ACTION_REJECTED' : 'DEMO_SCOPED_APPROVAL_RECORDED');
  }
  T.STATE.govSystem = 'SYS-217';
  const html = T.pageGovernance();
  assert.ok(html.includes('Fictional human approval dossier'));
  assert.ok(html.includes('DEMO-REQ-SYS-217-06'));
  assert.ok(html.includes('FICTIONAL_ROLE_ONLY_NOT_AUTHENTICATED'));
  assert.ok(html.includes('NOT_PROVISIONED'));
});

test('monitoring status is derived from records, not approval status', async () => {
  const { T } = await ready();
  assert.equal(T.govMonitoringStatus('SYS-340'), 'SIMULATED_MONITORING_ESTABLISHED');
  assert.equal(T.govMonitoringStatus('SYS-FC1'), 'SIMULATED_MONITORING_ESTABLISHED');
  assert.equal(T.govMonitoringStatus('SYS-MNT88'), 'SIMULATED_MONITORING_PARTIAL');
  assert.equal(T.govMonitoringStatus('SYS-S217') === 'x', false); // guard
  assert.equal(T.govMonitoringStatus('SYS-217'), 'SIMULATED_MONITORING_PARTIAL');
  assert.equal(T.govMonitoringStatus('SYS-SUP12'), 'SIMULATED_MONITORING_STALE');
  assert.equal(T.govMonitoringStatus('SYS-PO12'), 'SIMULATED_MONITORING_STALE');
  assert.equal(T.govMonitoringStatus('SYS-DYN412'), 'NO_LIVE_CONNECTION');
  assert.equal(T.govMonitoringStatus('SYS-SCH5'), 'SIMULATED_MONITORING_PARTIAL');
  assert.equal(T.govMonitoringStatus('SYS-WH15'), 'SIMULATED_MONITORING_PARTIAL');
});

test('roleplay: safe advisory continuation cannot approve the pending consequential request', async () => {
  const { T } = await ready();
  const d = T.GOVDATA.decisions.find(x => x.systemId === 'SYS-217');
  T.govApprove('SYS-217');
  assert.equal(T.govDecision(d), 'PENDING', 'MES authority expansion was silently approved');
  assert.equal(T.GOV.advisory['SYS-217'], true);
  assert.ok(T.pageGovernance().includes('advisory only; expansion still pending'));
  const ev = T.STATE.events.find(e => !e.fixture);
  assert.equal(ev.decision, 'SIMULATED_HUMAN_DECISION');
  assert.equal(ev.effect, 'LOCAL_FIXTURE_EFFECT_ONLY');
  assert.ok(ev.desc.includes('REMAINS PENDING'));
  // A simulated advisory continuation cannot also reject/approve the same pending request.
  T.govReject('SYS-217');
  assert.equal(T.govDecision(d), 'PENDING');
  // Already rejected actions remain rejected and cannot be elevated.
  T.govReject('SYS-SUP12');
  T.govApprove('SYS-SUP12');
  assert.equal(T.govDecision(T.GOVDATA.decisions.find(x => x.systemId === 'SYS-SUP12')), 'REJECTED');
  T.govReset();
  assert.equal(T.govDecision(d), 'PENDING');
  assert.equal(Object.keys(T.GOV.advisory).length, 0);
  assert.equal(T.STATE.events.filter(e => e.decision === 'SIMULATED_HUMAN_DECISION').length, 0);
});

test('roleplay never mutates the 45 canonical exports and carries no U6 receipt', async () => {
  const { T } = await ready();
  const before = Object.values(T.HXDATA.exportMapV3).map(a => a.evaluation.evaluationId).sort().join(',');
  T.govApprove('SYS-217'); T.govReject('SYS-WH15');
  const after = Object.values(T.HXDATA.exportMapV3).map(a => a.evaluation.evaluationId).sort().join(',');
  assert.equal(after, before);
  assert.equal(Object.keys(T.HXDATA.exportMapV3).length, 45);
  assert.ok(!JSON.stringify(T.GOVDATA).includes('publicVerificationId'));
  assert.ok(!/evaluationId/.test(JSON.stringify(T.GOVDATA.decisions)), 'governance fixture carries evaluation IDs');
});

test('governance page keeps the four fields separate + Station 217 story', async () => {
  const { T } = await ready();
  T.STATE.govSystem = 'SYS-217';
  const html = T.pageGovernance();
  for (const f of ['1 · HAIEC Assurance Result', '2 · Human Review Decision', '3 · Approved Operating Scope', '4 · Monitoring Coverage'])
    assert.ok(html.includes(f), 'missing field ' + f);
  assert.ok(html.includes('WO-217-4802') && html.includes('WO-217-4803'));
  assert.ok(html.includes('NOT ESTABLISHED'));
  assert.ok(html.includes('Demo activity'));
  assert.ok(/not connected|NOT_CONNECTED/i.test(html));
  assert.ok(!/GO\/NO-GO/.test(html), 'no combined risk score');
});

test('governance page uses plain-language labels and a loopable demo activity feed', async () => {
  const { T } = await ready();
  T.STATE.govSystem = 'SYS-217';
  const html = T.pageGovernance();
  // No raw internal jargon surfaced to judges/buyers.
  for (const jargon of ['U5 disposition', 'U6 receipt', 'source world', 'SIMULATION_ONLY', 'SIMULATED_MONITORING_', 'canonical export'])
    assert.ok(!html.includes(jargon), 'leaked internal label: ' + jargon);
  // Preferred plain-language labels present.
  for (const label of ['Assurance result', 'Human Review Decision', 'Approved Operating Scope', 'Monitoring Coverage',
    'Approved — scoped', 'Pending review', 'Established — simulated', 'Partial — simulated',
    'DEMO PLAYBACK', 'Action &amp; scope', 'Monitoring &amp; evidence', 'About this demonstration'])
    assert.ok(html.includes(label), 'missing plain label: ' + label);
  // Coordinated player markup: one clock, three lanes, controls, stage ribbon.
  for (const k of ['govPlayer', 'govpLaneAction', 'govpLaneReviewer', 'govpLaneMonitoring',
    'govpPlay', 'govpRestart', 'govpPrev', 'govpNext', 'govpSpeed', 'govpStages', 'govpBar', 'govpLive'])
    assert.ok(html.includes(`id="${k}"`), 'missing player node ' + k);
  // Station 217 plain-language story.
  for (const phrase of ['target mismatch observed', 'approved for advisory use only', 'write expansion'])
    assert.ok(html.toLowerCase().includes(phrase), 'missing story phrase: ' + phrase);
  // Shared scenario source: one artifact drives both apps — no hand-maintained lists.
  assert.equal(typeof T.SHARED, 'object');
  assert.equal(T.SHARED.schemaVersion, 'haiec-scenario-playback-1.0.0');
  assert.equal(T.SHARED.dossiers.length, 9);
  assert.equal(Object.keys(T.SHARED.scripts.journey).length, 9);
  // Deterministic playback: same virtual time => same visible events, every lane.
  const cr = T.SHARED.scripts.controlRoom;
  assert.equal(cr.scenarioId, 'mfg-control-room');
  for (const e of cr.events) {
    assert.ok(e.eventId && e.offsetMs >= 0 && e.stage && e.lane && e.eventType && e.origin === 'SIMULATED');
    assert.ok(['action', 'reviewer', 'monitoring'].includes(e.lane));
  }
  // Three contrasting outcomes are staged and bound to their systems.
  const held = cr.events.filter(e => e.eventType === 'EXECUTION_HELD');
  assert.equal(held.length, 1); assert.equal(held[0].systemId, 'SYS-217');
  const blocked = cr.events.filter(e => e.eventType === 'EXECUTION_BLOCKED');
  assert.equal(blocked.length, 1); assert.equal(blocked[0].systemId, 'SYS-SCH5');
  // Per-system journey loads the matching system, never Station 217's events.
  const j217 = T.SHARED.scripts.journey['SYS-217'];
  assert.ok(j217.events.every(e => e.systemId === 'SYS-217'));
  assert.ok(j217.events.some(e => e.eventType === 'DECISION_PENDING'));
  const j340 = T.SHARED.scripts.journey['SYS-340'];
  assert.ok(j340.events.every(e => e.systemId === 'SYS-340'));
  assert.ok(j340.events.some(e => e.eventType === 'DECISION_RECORDED'));
  assert.ok(!j340.events.some(e => /WO-217-/.test(e.copy)), 'journey for another system leaked Station 217 copy');
  // Controller exists; deterministic render and no leaked timers in the sandbox.
  assert.equal(typeof T.PLAY, 'object');
  assert.equal(typeof T.PLAY.load, 'function');
  assert.equal(typeof T.PLAY.stepTo, 'function');
  T.PLAY.load(cr);
  T.PLAY.t = 21001; // past the first act boundary — deterministic visible set
  const seen = T.PLAY.visible();
  assert.ok(seen.length > 0 && seen.every(e => e.offsetMs <= T.PLAY.t));
  T.PLAY.t = 0;
  assert.equal(T.PLAY.visible().length, 1); // only the t=0 event is visible
  // Station 217 invariants from the shared source: approved target, pending decision.
  const d217 = T.SHARED.dossiers.find(d => d.systemId === 'SYS-217');
  assert.equal(d217.humanDecision, 'PENDING');
  assert.ok(d217.request.requestedTarget.includes('WO-217-4802'));
});

test('governance fixture is cleanly separated: SIMULATION_ONLY, no canonical identity', () => {
  const g = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/demo-governance/governance-scenarios.json'), 'utf8'));
  assert.equal(g.provenance, 'SIMULATION_ONLY');
  assert.equal(g.artifactClass, 'FICTIONAL_DEPLOYMENT_GOVERNANCE_SCENARIOS_NOT_HAIEC_AUTHORIZATIONS');
  for (const d of g.decisions) {
    assert.ok(!('evaluationId' in d) && !('receipt' in d) && !('publicVerificationId' in d));
    assert.ok(d.canonicalCaseId, 'each decision references its canonical case for the assurance pane');
  }
});
