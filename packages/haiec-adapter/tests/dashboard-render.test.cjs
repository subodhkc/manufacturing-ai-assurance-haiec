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
    '({ STATE, HX, HXDATA, render, pageEvaluations, pageStation217, pageEvalCase })',
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

test('wrong-target case displays the evaluated divergence verbatim', () => {
  const { elements, T } = loadDashboard();
  T.HX.caseId = 'SYS-217-WRONG_TARGET';
  T.STATE.page = 'evaluations';
  T.render();
  const html = elements.get('main').innerHTML;
  const a = T.HXDATA.exportMap['SYS-217-WRONG_TARGET'];
  assert.ok(html.includes('WRONG_TARGET') || html.includes('Wrong target'));
  const eff = a.manufacturing.ruleOutcomes.find((o) => o.ruleId === 'MFG-EFF-001');
  assert.ok(html.includes(eff.status), 'MFG-EFF-001 outcome not shown verbatim');
});

test('degraded case shows honest insufficient coverage, never a pass', () => {
  const { elements, T } = loadDashboard();
  T.HX.caseId = 'SYS-217-EVIDENCE_DEGRADED';
  T.STATE.page = 'evaluations';
  T.render();
  const html = elements.get('main').innerHTML;
  assert.ok(html.includes('INSUFFICIENT SOURCE'), 'degraded case must show INSUFFICIENT_SOURCE verbatim');
  assert.doesNotMatch(html, />PASS</);
});

test('station217 page renders all six replay cases with synthetic labels', () => {
  const { elements, T } = loadDashboard();
  T.STATE.page = 'station217';
  T.render();
  const html = elements.get('main').innerHTML;
  assert.ok(html.includes('SYNTHETIC'), 'must label synthetic');
  for (const c of T.HXDATA.station217.cases) assert.ok(html.includes(c.id), `missing case ${c.id}`);
  assert.ok(html.includes(T.HXDATA.station217.digest), 'missing bundle digest');
  assert.doesNotMatch(html, /real plant|factory authorized/i);
});

test('station217 case switch shows wrong-target divergence and missing-witness honesty', () => {
  const { elements, T } = loadDashboard();
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

test('all 27 exports in the bundle have verified digests at build', () => {
  const { T } = loadDashboard();
  const exps = Object.values(T.HXDATA.exportMap);
  assert.equal(exps.length, 27);
  const { verifyExportDigest } = require('../src/load-export.cjs');
  for (const a of exps) assert.equal(verifyExportDigest(a).verified, true, `${a.sourceCase.caseId} digest`);
});
