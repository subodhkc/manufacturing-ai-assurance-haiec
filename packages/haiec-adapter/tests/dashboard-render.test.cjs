'use strict';
/**
 * Headless render smoke for the Sprint 14 adapter-driven dashboard pages.
 * Loads dashboard/index.html's script blocks into a vm sandbox with a
 * minimal DOM stub, then drives the evaluation/station217 render paths
 * and asserts the projected content is verbatim pass-through.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '../../..');

function stubEl() {
  return {
    innerHTML: '', textContent: '', value: '', title: '',
    dataset: {},
    classList: { add() {}, remove() {}, contains: () => false },
    setAttribute() {}, getAttribute: () => null,
    appendChild() {}, querySelectorAll: () => [], querySelector: () => stubEl(),
  };
}

function loadDashboard() {
  const html = fs.readFileSync(path.join(ROOT, 'dashboard/index.html'), 'utf8');
  const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const elements = new Map();
  const doc = {
    getElementById: (id) => {
      if (!elements.has(id)) elements.set(id, stubEl());
      return elements.get(id);
    },
    querySelectorAll: () => [],
    querySelector: () => stubEl(),
    addEventListener() {},
    head: { appendChild() {} },
    createElement: () => stubEl(),
    createTreeWalker: () => ({ nextNode: () => null }),
  };
  const win = {
    scrollTo() {}, location: { href: '' },
    addEventListener() {},
  };
  const sandbox = {
    window: win, document: doc,
    console: { log() {}, warn() {}, error() {} },
    setTimeout, clearTimeout, setInterval, clearInterval,
    requestAnimationFrame: (f) => f(),
    crypto: globalThis.crypto,
    TextEncoder, fetch: () => Promise.reject(new Error('no network in tests')),
    navigator: { clipboard: { writeText: () => Promise.resolve() } },
    URLSearchParams,
    NodeFilter: { SHOW_TEXT: 4, SHOW_ELEMENT: 1 },
  };
  win.HAIEC_DEMO_DATA = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'dashboard/data/haiec-exports.js'), 'utf8')
      .replace(/^[\s\S]*?window\.HAIEC_DEMO_DATA = /, '').replace(/;\s*$/, ''),
  );
  sandbox.window = win;
  vm.createContext(sandbox);
  for (const b of blocks) vm.runInContext(b, sandbox);
  // Top-level const/let stays lexical in the context — capture test handles.
  const T = vm.runInContext(
    '({ STATE, HX, HXDATA, RP, RP_STEPS, render, pageEvaluations, pageStation217, pageEvalCase, pageReplay, pageExec, hxVerifyAll, SCENARIOS })',
    sandbox,
  );
  return { sandbox, elements, T };
}

test('evaluations page renders all nine systems from verified exports', async () => {
  const { elements, T } = loadDashboard();
  T.STATE.page = 'evaluations';
  T.render();
  const html = elements.get('main').innerHTML;
  assert.match(html, /SYNTHETIC/i);
  assert.match(html, /digest/i);
  for (const sysId of T.HXDATA && Object.keys(T.HXDATA.exportMap)
    .map((k) => T.HXDATA.exportMap[k].sourceCase.aiSystemId)) {
    // every system id appears at least once
    assert.ok(html.includes(sysId), `missing ${sysId}`);
  }
});

test('case drill-down renders verbatim rule outcomes + facet, no recompute', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.HX.caseId = 'SYS-217-EXPECTED_BASELINE';
  T.STATE.page = 'evaluations';
  T.render();
  const html = elements.get('main').innerHTML;
  const a = T.HXDATA.exportMap['SYS-217-EXPECTED_BASELINE'];
  for (const o of a.manufacturing.ruleOutcomes) {
    assert.ok(html.includes(o.ruleId), `missing ${o.ruleId}`);
    assert.ok(html.includes(o.status), `missing status for ${o.ruleId}`);
  }
  assert.ok(html.includes(a.evaluation.evaluationId), 'missing evaluationId');
  assert.ok(html.includes('RECEIPT_BOUND'), 'missing receipt state');
  assert.ok(html.includes('www.haiec.com'), 'missing authorized links');
  // never shows oracle/expected labels as HAIEC verdicts
  assert.doesNotMatch(html, /expected findings/i);
});

test('wrong-target case displays the evaluated divergence verbatim — MATCH is a finding, not green pass', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.HX.caseId = 'SYS-217-WRONG_TARGET';
  T.STATE.page = 'evaluations';
  T.render();
  const html = elements.get('main').innerHTML;
  const a = T.HXDATA.exportMap['SYS-217-WRONG_TARGET'];
  assert.ok(html.includes('WRONG_TARGET') || html.includes('Wrong target'));
  const eff = a.manufacturing.ruleOutcomes.find((o) => o.ruleId === 'MFG-EFF-001');
  assert.ok(html.includes(eff.status), 'MFG-EFF-001 outcome not shown verbatim');
  assert.ok(html.includes('qualified target divergence'), 'MFG-EFF-001 divergence reason not rendered');
  assert.ok(html.includes('DIVERGENCE FINDING'), 'wrong-target MATCH must be marked a divergence finding, not a green pass');
});

test('a failed export digest blocks the detail view — no untrusted assurance content', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.HX.verified['SYS-217-EXPECTED_BASELINE'] = false;
  T.HX.caseId = 'SYS-217-EXPECTED_BASELINE';
  T.STATE.page = 'evaluations';
  T.render();
  const html = elements.get('main').innerHTML;
  assert.ok(html.includes('INTEGRITY FAILURE'), 'must show INTEGRITY FAILURE');
  for (const o of T.HXDATA.exportMap['SYS-217-EXPECTED_BASELINE'].manufacturing.ruleOutcomes) {
    assert.ok(!html.includes(o.ruleId), `withheld content leaked: ${o.ruleId}`);
  }
  assert.ok(!html.includes('Master Report (HTML)'), 'report links must be withheld');
  assert.ok(!html.includes('RECEIPT_BOUND'), 'receipt state must be withheld');
});

test('pending verification shows VERIFYING, never renders findings early', () => {
  const { elements, T } = loadDashboard();
  // digests NOT awaited — digestsDone is false
  T.HX.caseId = 'SYS-217-EXPECTED_BASELINE';
  T.STATE.page = 'evaluations';
  T.render();
  const html = elements.get('main').innerHTML;
  assert.ok(html.includes('VERIFYING'));
  assert.ok(!html.includes('RECEIPT_BOUND'), 'findings must not render before verification');
});

test('degraded case shows honest insufficient coverage, never a pass', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.HX.caseId = 'SYS-217-EVIDENCE_DEGRADED';
  T.STATE.page = 'evaluations';
  T.render();
  const html = elements.get('main').innerHTML;
  assert.ok(html.includes('INSUFFICIENT SOURCE'), 'degraded case must show INSUFFICIENT_SOURCE verbatim');
  assert.doesNotMatch(html, />PASS</);
});

test('station217 page renders all six replay cases with synthetic labels', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.STATE.page = 'station217';
  T.render();
  const html = elements.get('main').innerHTML;
  assert.ok(html.includes('SYNTHETIC'), 'must label synthetic');
  for (const c of T.HXDATA.station217.cases) assert.ok(html.includes(c.id), `missing case ${c.id}`);
  assert.ok(html.includes(T.HXDATA.station217.digest), 'missing bundle digest');
  assert.doesNotMatch(html, /real plant|factory authorized/i);
});

test('station217 case switch shows wrong-target divergence and missing-witness honesty', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.STATE.page = 'station217';
  T.HX.s217case = 'wrong-target';
  T.render();
  let html = elements.get('main').innerHTML;
  assert.ok(html.includes('TARGET_MISMATCH'), 'wrong-target must show TARGET_MISMATCH');
  T.HX.s217case = 'missing-readback';
  T.render();
  html = elements.get('main').innerHTML;
  assert.ok(html.includes('EFFECT_UNKNOWN') || html.includes('missing'), 'missing readback must not show green');
});

test('station217 fails closed on bundle digest failure — no case content', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.HX.stationVerified = false;
  T.STATE.page = 'station217';
  T.render();
  const html = elements.get('main').innerHTML;
  assert.ok(html.includes('INTEGRITY FAILURE'), 'bundle failure must show INTEGRITY FAILURE');
  for (const c of T.HXDATA.station217.cases) assert.ok(!html.includes(`>${c.id}<`), `case ${c.id} must not render`);
});

test('all twelve repository scenarios are present in the dashboard', async () => {
  const { T } = loadDashboard();
  assert.equal(T.SCENARIOS.length, 12);
  const ids = T.SCENARIOS.map((s) => s.id);
  assert.ok(ids.includes('INCOMING_QC') && ids.includes('WMS_HELD_SHIPMENT'), 'missing Sprint-14.1 scenarios');
});

test('all 27 exports in the bundle have verified digests at build', () => {
  const { T } = loadDashboard();
  const exps = Object.values(T.HXDATA.exportMap);
  assert.equal(exps.length, 27);
  const { verifyExportDigest } = require('../src/load-export.cjs');
  for (const a of exps) assert.equal(verifyExportDigest(a).verified, true, `${a.sourceCase.caseId} digest`);
});

/* ---------------- Sprint 14.3 — Mode A recorded evidence replay -------- */

test('replay data is embedded digest-pinned and bound to the wrong-target evaluation', () => {
  const { T } = loadDashboard();
  const rp = T.HXDATA.replay;
  assert.ok(rp, 'replay bundle must be embedded');
  assert.equal(rp.caseId, 'SYS-217-WRONG_TARGET');
  assert.equal(rp.evaluationId, 'bce94772-df56-447b-8625-0646915f7e25:assurance:1.1');
  assert.match(rp.digest, /^sha256:[0-9a-f]{64}$/);
  assert.equal(rp.records.length, 6);
  const phases = rp.records.map((r) => r.payload.phase);
  for (const p of ['REQUESTED', 'POLICY_DECLARED', 'CAPABILITY_DECLARED', 'GATE_DECISION', 'ACTION_RECORDED', 'TARGET_READBACK']) {
    assert.ok(phases.includes(p), `missing source record phase ${p}`);
  }
  for (const r of rp.records) assert.ok(r.declaredAt, 'every record carries its real declaredAt');
});

test('replay records come from the canonical source world, not the oracle storyboard', () => {
  const { T } = loadDashboard();
  const rp = T.HXDATA.replay;
  const wt = T.HXDATA.exportMap['SYS-217-WRONG_TARGET'];
  // The evaluated run identity — oracle golden-scenarios carries
  // 'syn-mfg-sys-217-001', which must never enter an evidence path.
  assert.equal(rp.provenance.scenarioRunId, 'syn-world-sys-217-wrong_target');
  assert.equal(rp.provenance.sourceWorldId, 'manufacturing-source-world-v1');
  assert.equal(rp.provenance.transactionId, 'syn-txn-b855a022ebe42786bf');
  assert.equal(rp.provenance.scenarioRunId, wt.sourceCase.scenarioRunId,
    'replay run must equal the export\'s bound scenarioRunId');
  assert.equal(rp.provenance.sourceWorldId, wt.provenance.sourceWorldId,
    'replay world must equal the export\'s declared sourceWorldId');
  for (const r of rp.records) {
    assert.equal(r.payload.scenarioRunId, 'syn-world-sys-217-wrong_target',
      'record must carry the evaluated run identity, not the storyboard');
    assert.ok(!/^syn-mfg-/.test(r.payload.scenarioRunId), 'oracle storyboard identity leaked into evidence path');
    assert.ok(/^synthetic-source-/.test(r.evidenceId), 'record must be a source-world evidence record');
    assert.notEqual(r.sourceType, 'SYNTHETIC_FIXTURE', 'oracle fixture records must not be embedded');
    assert.equal(r.producerQualification, 'NOT_HAIEC_QUALIFIED',
      'raw source qualification state must be preserved, not upgraded');
  }
  // The persisted rule outcome must name the same transaction the records carry.
  const eff = wt.manufacturing.ruleOutcomes.find((o) => o.ruleId === 'MFG-EFF-001');
  assert.ok(eff.reason.includes(rp.provenance.transactionId),
    'MFG-EFF-001 reason must name the source-world transaction');
  // Record count equals what the evaluation declared it consumed.
  const snap = wt.evaluation.evaluationScenarioSnapshot.states[0];
  assert.equal(rp.records.length, snap.evidenceCount);
  assert.equal(rp.provenance.consumedEvidenceCount, snap.evidenceCount);
});

test('replay page shows VERIFYING before digests complete and blocks start', async () => {
  const { elements, T } = loadDashboard();
  T.STATE.page = 'replay';
  T.render();
  const html = elements.get('main').innerHTML;
  assert.ok(html.includes('VERIFYING'), 'must show VERIFYING while digests pending');
  assert.ok(!html.includes('Run Evidence Replay'), 'start control must not render unverified');
});

test('tampered replay digest blocks playback — INTEGRITY FAILURE, no record content', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.HX.replayVerified = false;
  T.STATE.page = 'replay';
  T.render();
  const html = elements.get('main').innerHTML;
  assert.ok(html.includes('INTEGRITY FAILURE'), 'must show INTEGRITY FAILURE');
  assert.ok(html.includes('Replay blocked'));
  for (const r of T.HXDATA.replay.records) assert.ok(!html.includes(r.evidenceId), `record ${r.evidenceId} must not render`);
});

test('verified replay renders all eight steps with source timestamps and playback windows', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.STATE.page = 'replay';
  T.render();
  const html = elements.get('main').innerHTML;
  assert.ok(html.includes('Run Evidence Replay'), 'start control renders when verified');
  assert.ok(html.includes('Recorded evidence replay'), 'honesty banner present');
  assert.ok(html.includes('Nothing is collected'), 'no-collection statement present');
  assert.equal(T.RP_STEPS.length, 8);
  for (const st of T.RP_STEPS) {
    assert.ok(html.includes(`t=${st.start}–${st.end}s`), `missing playback window for ${st.title}`);
  }
});

test('playback reveals steps at their windows; source declaredAt stays distinct from UI time', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.STATE.page = 'replay';
  T.RP.elapsed = 31; // inside the 30–38s effect window
  T.render();
  const html = elements.get('main').innerHTML;
  // request/dispatch/effect records revealed, report step still locked
  assert.ok(html.includes('WO-217-4802'), 'requested target record revealed');
  assert.ok(html.includes('WO-217-4803'), 'actual-target record revealed');
  assert.ok(html.includes('2026-10-13T00:00:00.000Z'), 'source declaredAt rendered, distinct from pacing');
  assert.ok(html.includes('id="rp-done" style="display:none"'), 'completion card stays hidden until the last window');
});

test('completion distinguishes witnessed effect from authorized effect and links the sample report', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.STATE.page = 'replay';
  T.RP.elapsed = 60; T.RP.status = 'done';
  T.render();
  const html = elements.get('main').innerHTML;
  assert.ok(html.includes('witnessed'), 'completion must name the witnessed effect');
  assert.ok(html.includes('REVIEW'), 'disposition verbatim');
  assert.ok(html.includes('report/sample-master-report.html'), 'sample report link present');
  assert.ok(html.includes('Replay complete'));
});

test('manual step-through mode works without the timer; reset returns to pristine state', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.STATE.page = 'replay';
  T.RP.manual = true; T.RP.stepIdx = 4;
  T.render();
  let html = elements.get('main').innerHTML;
  assert.ok(html.includes('step 5 / 8'), 'manual counter');
  assert.ok(html.includes('data-rp="prev"') && html.includes('data-rp="next"'), 'step controls');
  T.RP.status = 'idle'; T.RP.elapsed = 0; T.RP.stepIdx = 0; T.RP.manual = false;
  T.render();
  html = elements.get('main').innerHTML;
  assert.ok(html.includes('0s / 60s'), 'reset returns to t=0');
  assert.ok(!html.includes('step 1 /'), 'manual step counter absent in timer mode');
});

test('a missing source-world record renders MISSING EVIDENCE, never a substitute', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  const orig = T.HXDATA.replay.records;
  T.HXDATA.replay.records = orig.filter((r) => r.payload.phase !== 'TARGET_READBACK');
  T.STATE.page = 'replay';
  T.RP.elapsed = 60; // reveal all steps
  T.render();
  const html = elements.get('main').innerHTML;
  assert.ok(html.includes('MISSING EVIDENCE'), 'absent record must render MISSING EVIDENCE');
  T.HXDATA.replay.records = orig; // restore shared fixture
});

test('rendered HAIEC links never expose the internal org id', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.HX.caseId = 'SYS-217-WRONG_TARGET';
  T.STATE.page = 'evaluations';
  T.render();
  const html = elements.get('main').innerHTML;
  assert.ok(!html.includes('org=s12'), 'internal org query param must not render in links');
  assert.ok(html.includes('/dashboard/assurance/evaluations/'), 'sanitized eval link still present');
});

/* ---------------- Sprint 14.4 — Executive Command Center -------- */

test('exec center renders all seven modules from verified sources', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.STATE.page = 'exec';
  T.render();
  const html = elements.get('main').innerHTML;
  for (const mod of ['AI Estate &amp; Inventory', 'Five Independent Evidence Planes',
    'Assurance &amp; Integrity Posture', 'Consequence Action Graph',
    'Delegation &amp; Capability Boundary', 'Proof Frontier &amp; Required Evidence',
    'Recorded Event Timeline']) {
    assert.ok(html.includes(mod), `missing module: ${mod}`);
  }
  // canonical facts, verbatim
  assert.ok(html.includes('REVIEW'));
  assert.ok(html.includes('EVIDENCE_ONLY'));
  assert.ok(html.includes('WO-217-4802') && html.includes('WO-217-4803'));
  assert.ok(html.includes('MFG-EFF-001'));
  assert.ok(html.includes('syn-world-sys-217-wrong_target'));
  assert.ok(html.includes('syn-txn-b855a022ebe42786bf'));
  assert.ok(html.includes('FICTIONAL MANUFACTURING ESTATE'));
  // forbidden invented metrics must never render
  assert.ok(!/False Assurance Rate|44\/44|silent.?miss|proof.{0,20}\d{1,3}\s?%/i.test(html));
  assert.ok(!/0\.0\s?%|100\s?%/.test(html));
});

test('exec planes render all five canonical action-path states as NOT_ASSESSED', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.STATE.page = 'exec';
  T.render();
  const html = elements.get('main').innerHTML;
  const planes = T.HXDATA.exportMap['SYS-217-WRONG_TARGET'].evaluation.fourQuestions.authority.planes;
  for (const p of Object.values(planes)) assert.equal(p.state, 'NOT_ASSESSED');
  assert.equal((html.match(/NOT_ASSESSED/g) || []).length >= 5, true, 'five NOT_ASSESSED plane cards');
  assert.ok(html.includes('path(s)'));
});

test('exec center fails closed when the export digest is tampered', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.HX.verified['SYS-217-WRONG_TARGET'] = false;
  T.STATE.page = 'exec';
  T.render();
  const html = elements.get('main').innerHTML;
  assert.ok(html.includes('INTEGRITY FAILURE'));
  assert.ok(!html.includes('MFG-EFF-001'), 'no assurance content under tamper');
});

test('exec proof frontier shows verbatim canonical items and never downgrades', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.STATE.page = 'exec';
  T.render();
  const html = elements.get('main').innerHTML;
  assert.ok(html.includes('PARTIAL'), 'proof boundary verbatim');
  for (const probe of ['AI-PROOF-003', 'AI-PROOF-012', 'AI-PROOF-014', 'AI-PROOF-015']) {
    assert.ok(html.includes(probe), `missing frontier item ${probe}`);
  }
  assert.ok(html.includes('NOT_EVALUATED') && html.includes('REQUESTED_NOT_AUTHORIZED'), 'U5 reasons verbatim');
});

test('exec graph separates established edges from the evidence frontier', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.STATE.page = 'exec';
  T.render();
  const html = elements.get('main').innerHTML;
  assert.ok(html.includes('EVIDENCE FRONTIER'), 'dashed frontier marker present');
  assert.ok(html.includes('NOT ESTABLISHED'), 'frontier node honestly labeled');
  assert.ok(html.includes('qualified target divergence'));
});

test('exec delegation module labels DCD as concept, not an evaluated result', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.STATE.page = 'exec';
  T.render();
  const html = elements.get('main').innerHTML;
  assert.ok(html.includes('not evaluated results') || html.includes('not an evaluated'), 'DCD must be labeled a concept');
  assert.ok(!/DCD\s*=\s*[\d.]+%?/.test(html), 'no computed DCD value may render');
});

test('exec plane selection reveals exact status, path count and meaning', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.STATE.page = 'exec';
  T.HX.execPlane = 'observed';
  T.render();
  const html = elements.get('main').innerHTML;
  assert.ok(html.includes('Observed plane — NOT_ASSESSED'));
  assert.ok(html.includes('Bound evidence paths'));
  assert.ok(html.includes('Supplied runtime signals'));
});

test('exec summary and technical case view preserve identical canonical facts', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.STATE.page = 'exec'; T.render();
  const execHtml = elements.get('main').innerHTML;
  T.STATE.page = 'evaluations'; T.HX.caseId = 'SYS-217-WRONG_TARGET'; T.render();
  const caseHtml = elements.get('main').innerHTML;
  for (const fact of ['bce94772-df56-447b-8625-0646915f7e25:assurance:1.1', 'REVIEW', 'EVIDENCE_ONLY', 'MFG-EFF-001', 'PARTIAL']) {
    assert.ok(execHtml.includes(fact), `exec missing ${fact}`);
    assert.ok(caseHtml.includes(fact), `case view missing ${fact}`);
  }
});
