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
// Sprint 15 — the v3 source world produced its own canonical evaluation
// set (9 systems × 5 assessments). Kept in a sibling directory so the
// historical 27-export corpus stays byte-identical and parity-pinned.
const evalDirV3 = path.join(root, 'data/evaluations-v3');
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

const exportMapV3 = {};
let manifestV3 = null;
if (fs.existsSync(evalDirV3)) {
  for (const f of fs.readdirSync(evalDirV3).filter((f) => f.endsWith('.json') && f !== 'manifest.json').sort()) {
    const p = path.join(evalDirV3, f);
    const r = loadExportFile(fs, p);
    if (!r.ok) { problems.push(`v3/${f}: ${r.errors.join('; ')}`); continue; }
    exportMapV3[r.artifact.sourceCase.caseId] = r.artifact;
  }
  if (fs.existsSync(path.join(evalDirV3, 'manifest.json'))) {
    manifestV3 = JSON.parse(fs.readFileSync(path.join(evalDirV3, 'manifest.json'), 'utf8'));
  }
}
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

// Sprint 15 — v3 parity gate (independent of the historical v1 set).
// Required when the directory exists: exactly 9 systems × 5 assessments =
// 45 unique case IDs and evaluation bindings — EXPECTED_BASELINE, ENRICHED
// (evidence-subset assessment), WRONG_TARGET, EVIDENCE_DEGRADED and
// REMEDIATED — every v3 manifest entry present and bound.
const v3Arr = Object.values(exportMapV3);
if (v3Arr.length || manifestV3) {
  const REQUIRED_V3_STATES = ['EXPECTED_BASELINE', 'ENRICHED', 'WRONG_TARGET', 'EVIDENCE_DEGRADED', 'REMEDIATED'];
  const v3Systems = new Set(v3Arr.map((a) => a.sourceCase.aiSystemId));
  const v3CaseIds = new Set(v3Arr.map((a) => a.sourceCase.caseId));
  const v3EvalIds = new Set(v3Arr.map((a) => a.evaluation && a.evaluation.evaluationId));
  if (v3Systems.size !== REQUIRED_SYSTEMS) problems.push(`PARITY-V3: ${v3Systems.size} systems — required ${REQUIRED_SYSTEMS}`);
  if (v3CaseIds.size !== 45 || v3Arr.length !== 45) problems.push(`PARITY-V3: ${v3Arr.length} exports / ${v3CaseIds.size} unique — required 45`);
  if (v3EvalIds.size !== 45) problems.push(`PARITY-V3: ${v3EvalIds.size} unique evaluationIds — required 45`);
  for (const sys of v3Systems) {
    const states = new Set(v3Arr.filter((a) => a.sourceCase.aiSystemId === sys).map((a) => a.sourceCase.scenarioState));
    for (const st of REQUIRED_V3_STATES) if (!states.has(st)) problems.push(`PARITY-V3: ${sys} missing assessment ${st}`);
  }
  const v3Entries = manifestV3 && Array.isArray(manifestV3.exports) ? manifestV3.exports : [];
  if (v3Entries.length !== 45) problems.push(`PARITY-V3: manifest lists ${v3Entries.length} entries — required 45`);
  const v3Seen = new Set();
  for (const e of v3Entries) {
    const cid = e.caseId;
    if (!cid) { problems.push('PARITY-V3: manifest entry missing caseId'); continue; }
    if (v3Seen.has(cid)) problems.push(`PARITY-V3: duplicate manifest entry ${cid}`);
    v3Seen.add(cid);
    const a = exportMapV3[cid];
    if (!a) { problems.push(`PARITY-V3: manifest entry ${cid} has no export file`); continue; }
    if (e.evaluationId && a.evaluation.evaluationId !== e.evaluationId) problems.push(`PARITY-V3: manifest evaluationId mismatch for ${cid}`);
  }
  for (const cid of v3CaseIds) if (!v3Seen.has(cid)) problems.push(`PARITY-V3: export ${cid} absent from manifest`);
}

// Station 217 bundle integrity.
if (!station217) problems.push('PARITY: station217 replay bundle absent');
else {
  const { digest, ...body } = station217;
  const recomputed = 'sha256:' + createHash('sha256').update(JSON.stringify(body), 'utf8').digest('hex');
  if (recomputed !== digest) problems.push('PARITY: station217 bundle digest mismatch');
  if ((station217.cases || []).length !== 6) problems.push(`PARITY: station217 has ${(station217.cases || []).length} cases — required 6`);
}

// Sprint 14.4 P0 — Mode A evidence replay bound to the CANONICAL source world.
// The frozen export's sourceCase.scenarioRunId is
// 'syn-world-sys-217-wrong_target', produced by packages/fixtures/src/
// source-world.cjs (manufacturing-source-world-v1) — the deterministic,
// oracle-independent input producer. The earlier build incorrectly embedded
// golden-scenarios.json storyboard records (scenarioRunId
// 'syn-mfg-sys-217-001'), which are oracle-authored illustrative content,
// NOT the evidence the evaluation consumed. Replay records are now taken
// from buildSourceWorld() and their lineage is asserted against the pinned
// export on three independent fields before the bundle is emitted:
//   1. sourceWorldId  — export.provenance.sourceWorldId === WORLD_VERSION
//   2. scenarioRunId  — export.sourceCase.scenarioRunId === scenario.sourceRunId
//   3. transactionId  — scenario.transactionId appears verbatim in the
//      persisted MFG-EFF-001 reason, and the record count equals the
//      evaluation's own evaluationScenarioSnapshot evidenceCount.
// These bindings demonstrate the replay records share the identity the
// evaluation consumed. Per-record bodies are deterministic generator output,
// not independently issuer-signed — the UI states this plainly.
const { buildSourceWorld, WORLD_VERSION } = require('../packages/fixtures/src/source-world.cjs');
let replay = null;
{
  const wtEval = exportMap['SYS-217-WRONG_TARGET'];
  if (!wtEval) problems.push('PARITY: SYS-217-WRONG_TARGET export absent — replay cannot bind an evaluation');
  let wtWorld = null;
  try { wtWorld = buildSourceWorld(); } catch (e) { problems.push('PARITY: source-world generator failed: ' + e.message); }
  const wtScenario = wtWorld && (wtWorld.scenarios || []).find((s) => s.caseId === 'SYS-217-WRONG_TARGET');
  if (wtEval && wtScenario) {
    const e = wtEval.evaluation || {};
    const prov = wtEval.provenance || {};
    const snap = (e.evaluationScenarioSnapshot && e.evaluationScenarioSnapshot.states) || [];
    const snapCount = snap[0] && snap[0].evidenceCount;
    const eff = ((wtEval.manufacturing || {}).ruleOutcomes || []).find((o) => o.ruleId === 'MFG-EFF-001');
    const recs = (wtScenario.events || []).slice().sort((x, y) => (x.sequence ?? 0) - (y.sequence ?? 0));
    // Lineage assertions — any mismatch fails the build.
    if (prov.sourceWorldId !== WORLD_VERSION) problems.push(`PARITY: export sourceWorldId ${prov.sourceWorldId} !== ${WORLD_VERSION}`);
    if ((wtEval.sourceCase || {}).scenarioRunId !== wtScenario.sourceRunId) {
      problems.push(`PARITY: export scenarioRunId ${(wtEval.sourceCase || {}).scenarioRunId} !== source-world ${wtScenario.sourceRunId}`);
    }
    if (!eff || !String(eff.reason || '').includes(wtScenario.transactionId)) {
      problems.push(`PARITY: MFG-EFF-001 reason does not name source-world transaction ${wtScenario.transactionId}`);
    }
    if (recs.length !== snapCount) problems.push(`PARITY: replay has ${recs.length} records — evaluation consumed ${snapCount}`);
    for (const r of recs) {
      if (!r.declaredAt || !r.payload || !r.payload.phase || !r.evidenceId) {
        problems.push(`PARITY: replay record ${r.evidenceId || '?'} missing declaredAt/phase/evidenceId`);
      }
      if ((r.payload || {}).scenarioRunId !== wtScenario.sourceRunId) {
        problems.push(`PARITY: replay record ${r.evidenceId || '?'} carries foreign scenarioRunId ${(r.payload || {}).scenarioRunId}`);
      }
    }
    const readback = recs.find((r) => r.payload.phase === 'TARGET_READBACK');
    replay = {
      schemaVersion: 'haiec-evidence-replay-1.0.0',
      truthLabel: 'RECORDED_SYNTHETIC_EVIDENCE — deterministic display pacing only; no new evaluation, no live collection, no dispatch',
      caseId: 'SYS-217-WRONG_TARGET',
      evaluationId: e.evaluationId,
      title: 'SYS-217 wrong-target — recorded evidence sequence',
      operation: wtScenario.operation,
      expectedTarget: wtScenario.requestedTarget,
      actualTarget: readback && readback.payload ? readback.payload.actualTarget : null,
      provenance: {
        sourceWorldId: wtWorld.schemaVersion,
        scenarioRunId: wtScenario.sourceRunId,
        transactionId: wtScenario.transactionId,
        consumedEvidenceCount: snapCount,
        binding: 'sourceWorldId + scenarioRunId + transactionId + record-count all verified against the pinned export',
        limitation: 'Records are deterministic source-world generator output; identity is bound to the export, individual record bodies are not issuer-signed.',
        origin: wtScenario.sourceOrigin,
      },
      records: recs,
    };
    replay.digest = 'sha256:' + createHash('sha256').update(JSON.stringify(replay), 'utf8').digest('hex');
  } else if (!wtScenario) {
    problems.push('PARITY: source-world generator produced no SYS-217-WRONG_TARGET scenario');
  }
}

// Sprint 14.4 — estate/catalog facts for the Executive Command Center.
// These are FICTIONAL estate facts from the generated catalog — counts of
// cataloged entities, never executed checks or evaluated coverage.
const gen = (f) => JSON.parse(fs.readFileSync(path.join(root, 'data/generated', f), 'utf8'));
const estateJson = gen('estate.json');
const sys217 = (estateJson.systems || []).find((s) => s.id === 'SYS-217') || {};
const estate = {
  systems: estateJson.systems.length,
  // Sprint 14.5 — bound to the agent registry (data/generated/agents.json),
  // not the report-document count.
  agentRoles: gen('agents.json').agents.length,
  catalogControls: gen('controls.json').controls.length,
  workflows: gen('workflows.json').workflows.length,
  // Modeled estate context for the SYS-217 impact narrative — catalog data,
  // NOT independently evaluated affected scope.
  modeledContext: {
    affectedLots: sys217.affectedLots || [],
    affectedSerials: sys217.affectedSerials || null,
    area: sys217.area || null,
    agents: sys217.agents || [],
    status: 'MODELED_ESTATE_CONTEXT — not evaluated affected scope',
  },
  provenance: 'FICTIONAL_MANUFACTURING_ESTATE — catalog facts from data/generated; catalog size is not evaluated coverage',
};
if (estate.systems !== 9 || estate.agentRoles !== 16 || estate.catalogControls !== 45 || estate.workflows !== 7) {
  problems.push(`PARITY: estate counts ${JSON.stringify(estate)} — expected 9/16/45/7`);
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
  exportMapV3: v3Arr.length ? exportMapV3 : undefined,
  manifestV3: manifestV3 ?? undefined,
  station217,
  replay,
  estate,
};
payload.payloadDigest = 'sha256:' + createHash('sha256').update(JSON.stringify(exportMap) + JSON.stringify(exportMapV3) + JSON.stringify(station217 ?? ''), 'utf8').digest('hex');

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
// Sprint 14.5 T8 — shared deterministic derivative identity (canonical
// source fields only, never wall-clock) proves HTML + PDF + any executive
// summary were rendered from the same frozen export.
const idPath = path.join(root, 'dashboard/report/sample-master-report.identity.json');
const derivId = fs.existsSync(idPath)
  ? (JSON.parse(fs.readFileSync(idPath, 'utf8')).derivativeId || 'unavailable')
  : 'unavailable';
if (derivId === 'unavailable') {
  console.error('BUILD FAILED — sample-master-report.identity.json missing; derivative identity required');
  process.exit(1);
}
// Semantic parity check — the rendered HTML must carry the canonical facts.
const htmlText = fs.readFileSync(htmlPath, 'utf8');
const parity = JSON.parse(fs.readFileSync(idPath, 'utf8'));
for (const probe of [parity.evaluationId, parity.disposition, parity.coreTruthDigest, derivId]) {
  if (probe && !htmlText.includes(String(probe))) {
    console.error(`BUILD FAILED — report HTML missing canonical field: ${String(probe).slice(0, 40)}`);
    process.exit(1);
  }
}
fs.writeFileSync(
  path.join(root, 'dashboard/report/sample-master-report.sha256'),
  `# Derivative digests (Sprint 14.3/14.5) — these cover the redacted public files only.\n` +
  `# They are NOT the pinned HAIEC exportDigest; digest = integrity, not issuer signature.\n` +
  `# Derivative identity (shared across HTML/PDF): ${derivId}\n` +
  `sha256:${htmlDigest}  sample-master-report.html\n` +
  `sha256:${pdfDigest}  sample-master-report.pdf\n`,
);
console.log('derivative digests stamped: sample-master-report.sha256');
