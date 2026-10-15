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

/* The dashboard's current world is v3 when present, else v1.
   Tests that assert on "the displayed artifact" must resolve the
   same artifact the page renders, never pin the historical world. */
function curMap(T) {
  return T.HXDATA.exportMapV3 || T.HXDATA.exportMap;
}
function curKey(T, caseId) {
  const a = curMap(T)[caseId];
  return `${a.sourceCase.caseId}@${(a.provenance && a.provenance.sourceWorldId) || 'unknown'}`;
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
  const a = curMap(T)['SYS-217-EXPECTED_BASELINE'];
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
  T.HX.verified[curKey(T, 'SYS-217-EXPECTED_BASELINE')] = false;
  T.HX.caseId = 'SYS-217-EXPECTED_BASELINE';
  T.STATE.page = 'evaluations';
  T.render();
  const html = elements.get('main').innerHTML;
  assert.ok(html.includes('INTEGRITY FAILURE'), 'must show INTEGRITY FAILURE');
  for (const o of curMap(T)['SYS-217-EXPECTED_BASELINE'].manufacturing.ruleOutcomes) {
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
    'Delegated Action Integrity', 'Proof Frontier &amp; Required Evidence',
    'Recorded Event Timeline', 'What HAIEC Demonstrated']) {
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
  T.HX.verified[curKey(T, 'SYS-217-WRONG_TARGET')] = false;
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
  const wtEval = curMap(T)['SYS-217-WRONG_TARGET'].evaluation;
  for (const fact of [wtEval.evaluationId, 'REVIEW', 'EVIDENCE_ONLY', 'MFG-EFF-001', 'PARTIAL']) {
    assert.ok(execHtml.includes(fact), `exec missing ${fact}`);
    assert.ok(caseHtml.includes(fact), `case view missing ${fact}`);
  }
});

/* ---------------- Sprint 14.5 — enterprise positioning fixes -------- */

test('exec estate shows the frozen export date, not the bundle build time', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.STATE.page = 'exec'; T.render();
  const html = elements.get('main').innerHTML;
  const a = T.HXDATA.exportMap['SYS-217-WRONG_TARGET'];
  const exported = String(a.exportedAt).slice(0, 10);
  assert.ok(html.includes(exported), 'frozen-export date must be export.exportedAt');
  // The module row labelled "Frozen export" must not render generatedAt.
  const row = html.match(/Frozen export[\s\S]{0,120}?<b>([^<]+)<\/b>/);
  assert.ok(row && row[1].includes(exported), `Frozen export shows ${row && row[1]}`);
});

test('exec frontier chip shows the canonical 5+1 accounting', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.STATE.page = 'exec'; T.render();
  const html = elements.get('main').innerHTML;
  const pb = curMap(T)['SYS-217-WRONG_TARGET'].evaluation.fourQuestions.proofBoundary;
  const m = String(pb.summary).match(/(\d+) unresolved evidence-frontier item\(s\) and (\d+) open evidence need\(s\)/);
  assert.ok(m, 'canonical summary present');
  assert.ok(html.includes(`${m[1]} frontier items`), 'canonical frontier count rendered');
});

test('estate agent count binds to the agent registry, not report documents', () => {
  const agents = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/generated/agents.json'), 'utf8'));
  const data = loadData();
  assert.equal(data.estate.agentRoles, agents.agents.length, 'agentRoles must equal agents.json registry length');
});

test('evidence integrity panel distinguishes bound digests from unattached signatures', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.STATE.page = 'exec'; T.render();
  const html = elements.get('main').innerHTML;
  const cur = curMap(T)['SYS-217-WRONG_TARGET'];
  const e = cur.evaluation;
  assert.ok(html.includes('Evidence Integrity'), 'integrity section present');
  assert.ok(html.includes(e.coreTruthDigest), 'core truth digest verbatim');
  assert.ok(html.includes(e.evidenceBundleDigest), 'bundle digest verbatim');
  if (e.links && e.links.decisionReceipt) {
    // Sprint 15 v3 evaluations carry an issued + published U6 package.
    assert.ok(html.includes(e.links.decisionReceipt), 'issued receipt link verbatim');
  } else {
    assert.ok(html.includes('NOT ISSUED'), 'decision receipt honestly absent');
  }
  assert.ok(html.includes('unsigned'), 'unsigned derivative state explicit');
  assert.ok(!/issuer.?signed|digitally signed|cryptographically signed (origin|export|report)/i.test(html),
    'no signature claim on the derivative');
});

test('consequence graph renders POLICY_DECLARED and GATE_DECISION as separate nodes', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.STATE.page = 'exec'; T.render();
  const html = elements.get('main').innerHTML;
  assert.ok(html.includes('Declared policy target'));
  assert.ok(html.includes('Gate decision'));
});

test('manufacturing impact is labeled potential and modeled context is not evaluated scope', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.STATE.page = 'exec'; T.render();
  const html = elements.get('main').innerHTML;
  assert.ok(html.includes('POTENTIAL'), 'impact labeled potential');
  assert.ok(html.includes('LOT-2026-4401'));
  assert.ok(html.includes('41002'));
  assert.ok(/not independently evaluated affected scope/i.test(html), 'modeled scope caveat present');
  assert.ok(!/actually triggered|product recall|defective engines/i.test(html), 'no claimed real-world consequence');
});

test('DAI module renders the persisted nine-dimension surface verbatim — no fabricated result', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.STATE.page = 'exec'; T.render();
  const html = elements.get('main').innerHTML;
  assert.ok(html.includes('dai-evaluation-1.0.0'));
  for (const d of ['OPERATION', 'TARGET', 'SCOPE', 'MAGNITUDE', 'DURATION', 'APPROVAL', 'DATA_CLASS', 'ENVIRONMENT', 'GEOGRAPHY']) {
    assert.ok(html.includes(`>${d}<`), `missing DAI dimension ${d}`);
  }
  // Sprint 15 — a real DAI surface is persisted on the SYS-217 wrong-target
  // evaluation: bound state + owner-computed comparisons pass through
  // verbatim, never recomputed or fabricated.
  const bound = T.HXDATA.exportMapV3['SYS-217-WRONG_TARGET'].dai.evaluations[0];
  assert.equal(bound.daiState, 'OBSERVED_OUTSIDE_DELEGATION');
  assert.ok(html.includes('SYS-217: EVALUATED'), 'bound surface pill rendered');
  assert.ok(html.includes(bound.daiState), 'persisted daiState rendered verbatim');
  const tgt = bound.comparisons.find((c) => c.dimension === 'TARGET');
  assert.equal(tgt.comparison, 'BROADER');
  assert.ok(html.includes(tgt.delegatedValue) && html.includes(tgt.observedValue), 'delegated/observed target values rendered');
  assert.ok(!/DCD\s*=\s*[\d.]+%?/.test(html), 'no computed DCD value');
});

test('replay one-click requires verified digest and replay wording is honest', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.STATE.page = 'exec'; T.render();
  const html = elements.get('main').innerHTML;
  assert.ok(html.includes('data-act="exec-replay"'), 'one-click action present');
  const src = fs.readFileSync(path.join(ROOT, 'dashboard/index.html'), 'utf8');
  assert.ok(src.includes("case 'exec-replay'") && /HX\.replayVerified===true/.test(src),
    'autostart gated on replay digest verification');
  assert.ok(html.includes('source-world replay aligned to the persisted HAIEC evaluation'));
});

test('report derivatives share one deterministic identity and canonical parity', () => {
  const idPath = path.join(ROOT, 'dashboard/report/sample-master-report.identity.json');
  const id = JSON.parse(fs.readFileSync(idPath, 'utf8'));
  const html = fs.readFileSync(path.join(ROOT, 'dashboard/report/sample-master-report.html'), 'utf8');
  const sidecar = fs.readFileSync(path.join(ROOT, 'dashboard/report/sample-master-report.sha256'), 'utf8');
  assert.ok(id.derivativeId.startsWith('sha256:'));
  assert.ok(html.includes(id.derivativeId), 'HTML carries derivative identity');
  assert.ok(sidecar.includes(id.derivativeId), 'sidecar records derivative identity');
  for (const probe of [id.evaluationId, id.disposition, id.coreTruthDigest, id.evidenceBundleDigest]) {
    assert.ok(html.includes(probe), `HTML missing canonical field ${String(probe).slice(0, 30)}`);
  }
  const r01 = id.ruleOutcomes.find((r) => r.ruleId === 'MFG-EFF-001');
  assert.equal(r01 && r01.status, 'MATCH');
  // deterministic: recompute and compare
  const { createHash } = require('node:crypto');
  const e = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/evaluations/sys-217-wrong-target.json'), 'utf8'));
  const src = { derivativeVersion: 'sample-report-derivative-1.0.0', evaluationId: e.evaluation.evaluationId, reportId: e.evaluation.reportId, reportVersion: e.evaluation.reportVersion, projectionVersion: e.evaluation.projectionVersion, coreTruthDigest: e.evaluation.coreTruthDigest, exportDigest: e.exportDigest, exportedAt: e.exportedAt, disposition: e.evaluation.disposition };
  const expect = 'sha256:' + createHash('sha256').update(JSON.stringify(src), 'utf8').digest('hex');
  assert.equal(id.derivativeId, expect, 'derivative identity is deterministic');
});

/* ---------- Sprint 15: v3 world, five-assessment coverage ---------- */

test('v3 world carries 45 exports, five assessments per system, v1 preserved', async () => {
  const { T } = loadDashboard();
  assert.ok(T.HXDATA.exportMapV3, 'v3 world must be present');
  assert.equal(Object.keys(T.HXDATA.exportMapV3).length, 45);
  assert.equal(Object.keys(T.HXDATA.exportMap).length, 27, 'historical v1 corpus preserved');
  const bySys = {};
  for (const a of Object.values(T.HXDATA.exportMapV3)) {
    (bySys[a.sourceCase.aiSystemId] ||= new Set()).add(a.sourceCase.scenarioState);
  }
  assert.equal(Object.keys(bySys).length, 9);
  for (const [sys, states] of Object.entries(bySys)) {
    for (const st of ['EXPECTED_BASELINE', 'ENRICHED', 'WRONG_TARGET', 'EVIDENCE_DEGRADED', 'REMEDIATED'])
      assert.ok(states.has(st), `${sys} missing ${st}`);
  }
});

test('system page renders five columns and corrected-state comparison', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.HX.system = 'SYS-217'; T.HX.caseId = null;
  T.STATE.page = 'evaluations'; T.render();
  const html = elements.get('main').innerHTML;
  for (const l of ['Expected baseline', 'Enriched evidence', 'Wrong target', 'Evidence degraded', 'Corrected state'])
    assert.ok(html.includes(l), `missing state column ${l}`);
  assert.ok(html.includes('corrected-state comparison'), 'governed-response comparison present');
  assert.ok(html.includes('did not modify the original wrong-target finding'), 'remediation honesty preserved');
});

test('remediated case states independence — original finding stands', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.HX.caseId = 'SYS-217-REMEDIATED';
  T.STATE.page = 'evaluations'; T.render();
  const html = elements.get('main').innerHTML;
  assert.ok(html.includes('separately persisted evaluation'), 'independence must be stated');
  assert.ok(html.includes('does not modify or close the original'), 'must not claim closure');
  assert.ok(html.includes('SYS-217-WRONG_TARGET'), 'must link the standing finding');
});

test('published evaluation shows view-only public verification, org routes stay closed', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.HX.caseId = 'SYS-217-WRONG_TARGET';
  T.STATE.page = 'evaluations'; T.render();
  const html = elements.get('main').innerHTML;
  const a = curMap(T)['SYS-217-WRONG_TARGET'];
  assert.equal(a.publication.publicationState, 'PUBLIC');
  assert.ok(html.includes(a.publication.publicVerificationUrl), 'public verification link verbatim');
  assert.ok(html.includes('fail-closed'), 'org-scoped routes stated fail-closed');
  assert.ok(!html.includes('s15-v3-org'), 'internal org id never rendered');
});

test('tamper in the historical world does not block or confuse the v3 view', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.HX.verified[`SYS-217-WRONG_TARGET@${T.HXDATA.exportMap['SYS-217-WRONG_TARGET'].provenance.sourceWorldId}`] = false;
  T.HX.caseId = 'SYS-217-WRONG_TARGET';
  T.STATE.page = 'evaluations'; T.render();
  const html = elements.get('main').innerHTML;
  assert.ok(!html.includes('INTEGRITY FAILURE'), 'v1 tamper must not leak into v3 view');
  assert.ok(html.includes('MFG-EFF-001'), 'v3 case still renders verified content');
});

test('v3 DAI surfaces render the real nine-dimension comparison verbatim', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.HX.caseId = 'SYS-217-EXPECTED_BASELINE';
  T.STATE.page = 'evaluations'; T.render();
  const html = elements.get('main').innerHTML;
  const d = curMap(T)['SYS-217-EXPECTED_BASELINE'].dai.evaluations[0];
  assert.ok(d, 'DAI surface persisted');
  for (const c of d.comparisons) assert.ok(html.includes(c.dimension), `missing ${c.dimension}`);
  assert.ok(html.includes(d.surfaceId || 'surface'), 'surface id rendered');
});

test('no absolute cryptographic claims anywhere in dashboard or pitch copy', async () => {
  const { elements, T } = loadDashboard();
  await T.hxVerifyAll();
  T.STATE.page = 'exec'; T.render();
  const html = elements.get('main').innerHTML;
  const home = fs.readFileSync(path.join(ROOT, 'dashboard/home.html'), 'utf8');
  for (const text of [html, home]) {
    assert.ok(!/absolute trust|tamper.?proof|unassailable|absolute replay|zero LLM hallucination/i.test(text),
      'absolute claim must not appear');
  }
});

function loadData() {
  const vm = require('node:vm');
  const src = fs.readFileSync(path.join(ROOT, 'dashboard/data/haiec-exports.js'), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(src, sandbox);
  return sandbox.window.HAIEC_DEMO_DATA;
}
