'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { loadExport, canonicalSerialize, verifyExportDigest } = require('../src/load-export.cjs');
const { projectCaseSummary, projectOverview, projectScenarioTriad, projectStation217 } = require('../src/project.cjs');

function makeExport(over = {}) {
  const payload = {
    schemaVersion: 'haiec-evaluation-export-1.0.0',
    exportKind: 'FROZEN_EVALUATION_EXPORT',
    exportedAt: '2026-10-15T00:00:00.000Z',
    provenance: {
      dataClass: 'SYNTHETIC_LAB',
      truthLabel: 'FROZEN_SYNTHETIC_EVALUATION',
      sourceWorldId: 'manufacturing-source-world-v1',
      oracleIndependent: true,
      producedBy: 'AUTHORIZED_DB_READ',
    },
    sourceCase: {
      caseId: 'SYS-217-EXPECTED_BASELINE',
      aiSystemId: 'SYS-217',
      scenarioState: 'EXPECTED_BASELINE',
      scenarioRunId: 'syn-world-sys-217-expected_baseline',
      ...over.sourceCase,
    },
    evaluation: {
      schemaVersion: 'master-report-product-1.0.0',
      timeBasis: 'EVALUATED_SNAPSHOT',
      evaluationId: 'eval-111:assurance:1.1',
      disposition: 'REVIEW',
      evaluationBasis: 'EVIDENCE_ONLY',
      coreTruthDigest: 'sha256:' + 'a'.repeat(64),
      evidenceBundleDigest: 'sha256:' + 'b'.repeat(64),
      fourQuestions: { q1: {} },
      evaluationScenarioSnapshot: { status: 'BOUND', states: [] },
      links: { html: 'https://www.haiec.com/r/x', pdf: 'https://www.haiec.com/r/x.pdf' },
      limitations: ['SYNTHETIC'],
      semantics: ['EVIDENCE_ONLY'],
      ...over.evaluation,
    },
    manufacturing: {
      ruleOutcomes: [
        { ruleId: 'MFG-AUTH-001', status: 'NO_MATCH_WITH_ADEQUATE_COVERAGE', evidenceRefs: ['ev-1'] },
        { ruleId: 'MFG-EFF-001', status: 'MATCH', evidenceRefs: ['ev-2'] },
      ],
      controlMaturity: {
        version: 'mfg-cmf-1',
        rows: [{ controlId: 'R01', ucpResult: 'SATISFIED', ucpReceiptState: 'RECEIPT_BOUND' }],
        qualifiedObservationCount: 4,
        rejectedObservationCount: 0,
        boundBatchIds: ['b-1'],
        limitations: [],
      },
      ...over.manufacturing,
    },
  };
  return { ...payload, exportDigest: 'sha256:' + createHash('sha256').update(canonicalSerialize(payload), 'utf8').digest('hex') };
}

test('a well-formed export validates and verifies', () => {
  const r = loadExport(JSON.stringify(makeExport()));
  assert.equal(r.ok, true);
  assert.equal(r.verified, true);
  assert.deepEqual(r.errors, []);
});

test('any payload mutation after signing fails the digest — payload-bound replay safety', () => {
  const a = makeExport();
  a.evaluation.disposition = 'ALLOW'; // forged upgrade — must never verify
  const r = loadExport(JSON.stringify(a));
  assert.equal(r.ok, false);
  assert.equal(r.verified, false);
  assert.match(r.errors[0], /exportDigest mismatch/);
});

test('a tampered rule outcome fails the digest', () => {
  const a = makeExport();
  a.manufacturing.ruleOutcomes[1].status = 'INSUFFICIENT_SOURCE';
  const r = loadExport(JSON.stringify(a));
  assert.equal(r.ok, false);
});

test('schema violations are rejected before any rendering', () => {
  for (const mutate of [
    (a) => { a.schemaVersion = 'haiec-evaluation-export-2.0.0'; },
    (a) => { a.evaluation.disposition = 'CERTIFIED'; },
    (a) => { a.evaluation.evaluationBasis = 'HISTORICAL_BASELINE'; },
    (a) => { delete a.evaluation.evaluationId; },
    (a) => { a.manufacturing.ruleOutcomes[0].status = 'PASS'; },
    (a) => { a.manufacturing.ruleOutcomes[0].ruleId = 'GENERIC-1'; },
    (a) => { a.provenance.dataClass = 'REAL_PLANT'; },
    (a) => { delete a.manufacturing.controlMaturity; },
  ]) {
    const a = makeExport();
    mutate(a);
    const r = loadExport(JSON.stringify(a));
    assert.equal(r.ok, false, `expected rejection: ${mutate.toString().slice(0, 60)}`);
  }
});

test('projection is pass-through — origins, verbatim statuses, receipts', () => {
  const a = makeExport();
  const s = projectCaseSummary(a);
  assert.equal(s.origin, 'HAIEC_EVALUATION');
  assert.equal(s.disposition, 'REVIEW');
  assert.equal(s.ruleOutcomes[0].status, 'NO_MATCH_WITH_ADEQUATE_COVERAGE');
  assert.equal(s.receipts[0].ucpReceiptState, 'RECEIPT_BOUND');
  assert.equal(s.linksMode, 'HAIEC_HOSTED_REQUIRES_AUTHORIZATION');
  assert.equal(s.provenance.dataClass, 'SYNTHETIC_LAB');
});

test('absent facet projects as UNAVAILABLE, never zero coverage', () => {
  const a = makeExport({ manufacturing: { ruleOutcomes: [], controlMaturity: null } });
  const s = projectCaseSummary(a);
  assert.equal(s.facet.origin, 'UNAVAILABLE');
  assert.equal(s.receipts.length, 0);
});

test('overview groups 9 systems x 3 states', () => {
  const artifacts = [];
  for (const sys of ['SYS-217', 'SYS-340']) {
    for (const [st, ev] of [['EXPECTED_BASELINE', 'e1'], ['WRONG_TARGET', 'e2'], ['EVIDENCE_DEGRADED', 'e3']]) {
      artifacts.push(makeExport({
        sourceCase: { caseId: `${sys}-${st}`, aiSystemId: sys, scenarioState: st, scenarioRunId: `syn-world-${sys.toLowerCase()}-${st.toLowerCase()}` },
        evaluation: { evaluationId: `${ev}:assurance:1.1` },
      }));
    }
  }
  const ov = projectOverview(artifacts);
  assert.equal(ov.length, 2);
  assert.equal(Object.keys(ov[0].states).length, 3);
  const triad = projectScenarioTriad('SYS-217', artifacts);
  assert.equal(triad.states.EXPECTED_BASELINE.evaluationId, 'e1:assurance:1.1');
  assert.equal(triad.divergence.wrongTarget.disposition, 'REVIEW');
});

test('Station 217 bundle projects as SYNTHETIC_FIXTURE with digest + limitations intact', () => {
  const { out } = require('../../station217/src/replay.cjs');
  const p = projectStation217(out);
  assert.equal(p.origin, 'SYNTHETIC_FIXTURE');
  assert.equal(p.synthetic, true);
  assert.equal(p.cases.length, 6);
  assert.ok(p.limitations.includes('NO_HAIEC_EVALUATION'));
  assert.match(p.digest, /^sha256:[0-9a-f]{64}$/);
});
