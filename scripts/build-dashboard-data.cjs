'use strict';
/**
 * Bundle the frozen HAIEC evaluation exports + Station 217 replay into a
 * single JS data file the standalone dashboard can load under file:// —
 * no fetch(), no server, no live calls.
 *
 * Regenerate: node scripts/build-dashboard-data.cjs
 * Inputs:  data/evaluations/*.json (incl. manifest.json)
 *          data/station217/replay-bundle.json
 * Output:  dashboard/data/haiec-exports.js
 */
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { loadExportFile } = require('../packages/haiec-adapter/src/load-export.cjs');

const root = path.resolve(__dirname, '..');
const evalDir = path.join(root, 'data/evaluations');
const bundlePath = path.join(root, 'data/station217/replay-bundle.json');
const outPath = path.join(root, 'dashboard/data/haiec-exports.js');

const exportMap = {};
const problems = [];
for (const f of fs.readdirSync(evalDir).filter((f) => f.endsWith('.json') && f !== 'manifest.json').sort()) {
  const p = path.join(evalDir, f);
  const r = loadExportFile(fs, p);
  if (!r.ok) { problems.push(`${f}: ${r.errors.join('; ')}`); continue; }
  exportMap[r.artifact.sourceCase.caseId] = r.artifact;
}
const manifest = JSON.parse(fs.readFileSync(path.join(evalDir, 'manifest.json'), 'utf8'));
const station217 = fs.existsSync(bundlePath) ? JSON.parse(fs.readFileSync(bundlePath, 'utf8')) : null;

/* ------------------------------------------------------------------
 * Strict frozen-release parity gate. A missing or invalid export fails
 * the build — the displayed program may never silently shrink.
 * Required for this release: exactly 9 systems × 3 scenario states =
 * 27 unique case IDs and evaluation bindings, every manifest entry
 * present, no unexpected or duplicate entries, every export schema +
 * digest valid, Station 217 bundle integrity valid.
 * ------------------------------------------------------------------ */
const REQUIRED_STATES = ['EXPECTED_BASELINE', 'WRONG_TARGET', 'EVIDENCE_DEGRADED'];
const REQUIRED_SYSTEMS = 9;
const REQUIRED_EXPORTS = 27;

const exportsArr = Object.values(exportMap);
const systems = new Set(exportsArr.map((a) => a.sourceCase.aiSystemId));
const caseIds = new Set(exportsArr.map((a) => a.sourceCase.caseId));
const evalIds = new Set(exportsArr.map((a) => a.evaluation && a.evaluation.evaluationId));

if (systems.size !== REQUIRED_SYSTEMS) problems.push(`PARITY: ${systems.size} distinct systems — required ${REQUIRED_SYSTEMS}`);
if (caseIds.size !== REQUIRED_EXPORTS || exportsArr.length !== REQUIRED_EXPORTS) {
  problems.push(`PARITY: ${exportsArr.length} exports / ${caseIds.size} unique case IDs — required ${REQUIRED_EXPORTS} unique`);
}
if (evalIds.size !== REQUIRED_EXPORTS) problems.push(`PARITY: ${evalIds.size} unique evaluationIds — required ${REQUIRED_EXPORTS} (duplicate or missing binding)`);
for (const sys of systems) {
  const states = new Set(exportsArr.filter((a) => a.sourceCase.aiSystemId === sys).map((a) => a.sourceCase.scenarioState));
  for (const st of REQUIRED_STATES) if (!states.has(st)) problems.push(`PARITY: ${sys} missing state ${st}`);
}

// Manifest parity — every listed entry present, no extras, no dupes.
const manifestEntries = manifest && Array.isArray(manifest.exports) ? manifest.exports : (manifest && manifest.entries) || [];
if (manifestEntries.length !== REQUIRED_EXPORTS) problems.push(`PARITY: manifest lists ${manifestEntries.length} entries — required ${REQUIRED_EXPORTS}`);
const manifestCaseIds = new Set();
for (const e of manifestEntries) {
  const cid = e.caseId || (e.sourceCase && e.sourceCase.caseId);
  if (!cid) { problems.push('PARITY: manifest entry missing caseId'); continue; }
  if (manifestCaseIds.has(cid)) problems.push(`PARITY: duplicate manifest entry ${cid}`);
  manifestCaseIds.add(cid);
  const a = exportMap[cid];
  if (!a) { problems.push(`PARITY: manifest entry ${cid} has no export file`); continue; }
  if (e.evaluationId && a.evaluation.evaluationId !== e.evaluationId) problems.push(`PARITY: manifest evaluationId mismatch for ${cid}`);
}
for (const cid of caseIds) if (!manifestCaseIds.has(cid)) problems.push(`PARITY: export ${cid} absent from manifest`);

// Station 217 bundle integrity.
if (!station217) problems.push('PARITY: station217 replay bundle absent');
else {
  const { digest, ...body } = station217;
  const recomputed = 'sha256:' + createHash('sha256').update(JSON.stringify(body), 'utf8').digest('hex');
  if (recomputed !== digest) problems.push('PARITY: station217 bundle digest mismatch');
  if ((station217.cases || []).length !== 6) problems.push(`PARITY: station217 has ${(station217.cases || []).length} cases — required 6`);
}

// Sprint 14.3 — Mode A evidence replay. Pin the SYS-217-WRONG_TARGET
// source-world records (the six-phase fixture evidence the evaluation
// consumed) with their own digest. The dashboard re-verifies it and
// refuses playback on mismatch. These are recorded fixture facts only —
// no timestamps are fabricated at display time.
const goldenPath = path.join(root, 'data/generated/golden-scenarios.json');
const golden = fs.existsSync(goldenPath) ? JSON.parse(fs.readFileSync(goldenPath, 'utf8')) : null;
const wtScenario = golden && (golden.scenarios || []).find((s) => s.caseId === 'SYS-217-WRONG_TARGET');
let replay = null;
if (!wtScenario) {
  problems.push('PARITY: evidence-replay source scenario SYS-217-WRONG_TARGET absent from data/generated/golden-scenarios.json');
} else {
  const recs = (wtScenario.evidence || []).slice().sort((x, y) => (x.sequence ?? 0) - (y.sequence ?? 0));
  if (recs.length !== 6) problems.push(`PARITY: replay scenario has ${recs.length} records — required 6`);
  for (const r of recs) {
    if (!r.declaredAt || !r.payload || !r.payload.phase || !r.evidenceId) {
      problems.push(`PARITY: replay record ${r.evidenceId || '?'} missing declaredAt/phase/evidenceId`);
    }
  }
  const wtEval = exportMap['SYS-217-WRONG_TARGET'];
  if (!wtEval) problems.push('PARITY: SYS-217-WRONG_TARGET export absent — replay cannot bind an evaluation');
  replay = {
    schemaVersion: 'haiec-evidence-replay-1.0.0',
    truthLabel: 'RECORDED_SYNTHETIC_EVIDENCE — deterministic display pacing only; no new evaluation, no live collection, no dispatch',
    caseId: 'SYS-217-WRONG_TARGET',
    evaluationId: wtEval && wtEval.evaluation && wtEval.evaluation.evaluationId,
    title: wtScenario.title,
    operation: wtScenario.operation,
    expectedTarget: wtScenario.expectedTarget,
    actualTarget: wtScenario.actualTarget,
    firstDivergence: wtScenario.firstDivergence,
    notEvidenceOf: wtScenario.notEvidenceOf,
    records: recs,
  };
  replay.digest = 'sha256:' + createHash('sha256').update(JSON.stringify(replay), 'utf8').digest('hex');
}

if (problems.length) {
  console.error('BUILD FAILED — integrity/parity violations:');
  for (const p of problems) console.error('  ✗', p);
  process.exit(1);
}

const payload = {
  schemaVersion: 'haiec-dashboard-data-1.0.0',
  generatedAt: new Date().toISOString(),
  origin: 'FROZEN_EVALUATION_EXPORT_SET + SYNTHETIC_LOCAL_FIXTURE',
  truthLabel: 'All evaluation content is HAIEC persisted output over a SYNTHETIC lab corpus. Station 217 is a local simulator replay — never a HAIEC verdict or plant observation.',
  exportMap,
  manifest,
  station217,
  replay,
};
payload.payloadDigest = 'sha256:' + createHash('sha256').update(JSON.stringify(exportMap) + JSON.stringify(station217 ?? ''), 'utf8').digest('hex');

const js = `'use strict';
/* GENERATED FILE — scripts/build-dashboard-data.cjs. Do not edit.
 * Frozen HAIEC evaluation exports (digest-pinned) + Station 217 replay.
 * The dashboard re-verifies each exportDigest via crypto.subtle at load. */
window.HAIEC_DEMO_DATA = ${JSON.stringify(payload)};
`;
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, js);
console.log(`dashboard data: ${Object.keys(exportMap).length} verified exports + station217 bundle → ${outPath}`);

// Sprint 14.2 — regenerate the public sample report (fails build on digest
// mismatch) and verify the committed PDF derivative exists.
require('./build-sample-report.cjs');
const pdfPath = path.join(root, 'dashboard/report/sample-master-report.pdf');
const pdf = fs.existsSync(pdfPath) ? fs.readFileSync(pdfPath) : null;
if (!pdf || pdf.length < 50000 || pdf.slice(0, 5).toString('latin1') !== '%PDF-') {
  console.error('BUILD FAILED — sample-master-report.pdf missing or invalid');
  process.exit(1);
}
console.log('sample pdf present:', pdfPath, `(${(pdf.length / 1024).toFixed(0)} KB)`);

// Sprint 14.3 — the redacted public derivatives are separate artifacts from
// the pinned export. Stamp derivative digests so consumers can verify the
// published bytes without implying the HAIEC exportDigest covers them.
const htmlPath = path.join(root, 'dashboard/report/sample-master-report.html');
const htmlDigest = createHash('sha256').update(fs.readFileSync(htmlPath)).digest('hex');
const pdfDigest = createHash('sha256').update(pdf).digest('hex');
fs.writeFileSync(
  path.join(root, 'dashboard/report/sample-master-report.sha256'),
  `# Derivative digests (Sprint 14.3) — these cover the redacted public files only.\n` +
  `# They are NOT the pinned HAIEC exportDigest; digest = integrity, not issuer signature.\n` +
  `sha256:${htmlDigest}  sample-master-report.html\n` +
  `sha256:${pdfDigest}  sample-master-report.pdf\n`,
);
console.log('derivative digests stamped: sample-master-report.sha256');
