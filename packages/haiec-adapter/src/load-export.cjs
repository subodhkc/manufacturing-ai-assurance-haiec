'use strict';
/**
 * haiec-evaluation-export-1.0.0 — read-only loader + verifier.
 *
 * This module NEVER produces assurance content. It validates the export
 * envelope produced by an authorized HAIEC read and verifies its
 * canonical SHA-256 digest offline.
 *
 * Canonicalization contract: lexicographically sorted object keys,
 * undefined dropped, array order preserved — byte-compatible with
 * HAIEC's canonicalSerialize for this payload shape (the export carries
 * no top-level set-like fields: artifactRefs, capabilityDeclarations,
 * continuityEvidence, correlationIds, findingRefs, limitations,
 * provenanceRefs are all nested, where HAIEC preserves order too).
 */
const { createHash } = require('node:crypto');

const SCHEMA = 'haiec-evaluation-export-1.0.0';
const DISPOSITIONS = new Set(['ALLOW', 'REVIEW', 'BLOCK', 'UNKNOWN']);
const BASES = new Set(['SCAN_BACKED', 'EVIDENCE_ONLY']);
const RULE_STATUSES = new Set(['MATCH', 'NO_MATCH_WITH_ADEQUATE_COVERAGE', 'INSUFFICIENT_SOURCE', 'CONTRADICTED']);
// v1 corpus uses EXPECTED_BASELINE/EVIDENCE_DEGRADED/WRONG_TARGET (+EXPLICIT).
// Sprint 15 v3 adds ENRICHED (baseline + additional qualified evidence subset)
// and REMEDIATED (independently evaluated corrected-state run).
const STATES = new Set(['EXPECTED_BASELINE', 'EVIDENCE_DEGRADED', 'WRONG_TARGET', 'EXPLICIT', 'ENRICHED', 'REMEDIATED']);
const DATA_CLASSES = new Set(['SYNTHETIC_LAB', 'CUSTOMER_PRODUCTION', 'UNKNOWN']);

function canonicalize(value) {
  if (value === undefined) return undefined;
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    return value.map((v) => canonicalize(v)).filter((v) => v !== undefined);
  }
  const out = {};
  for (const key of Object.keys(value).sort()) {
    const v = canonicalize(value[key]);
    if (v !== undefined) out[key] = v;
  }
  return out;
}

function canonicalSerialize(value) {
  return JSON.stringify(canonicalize(value));
}

/** Structural validation mirroring evaluation-export.schema.json. */
function validateExportShape(a) {
  const errors = [];
  const need = (cond, msg) => { if (!cond) errors.push(msg); };
  need(a && typeof a === 'object', 'export is not an object');
  if (!a || typeof a !== 'object') return errors;
  need(a.schemaVersion === SCHEMA, `schemaVersion must be ${SCHEMA}, got ${a.schemaVersion}`);
  need(a.exportKind === 'FROZEN_EVALUATION_EXPORT', 'exportKind must be FROZEN_EVALUATION_EXPORT');
  need(typeof a.exportedAt === 'string', 'exportedAt required');
  const p = a.provenance;
  need(p && typeof p === 'object', 'provenance required');
  if (p) {
    need(DATA_CLASSES.has(p.dataClass), `provenance.dataClass invalid: ${p.dataClass}`);
    need(typeof p.truthLabel === 'string', 'provenance.truthLabel required');
    need(typeof p.oracleIndependent === 'boolean', 'provenance.oracleIndependent required');
    need(typeof p.producedBy === 'string', 'provenance.producedBy required');
  }
  const c = a.sourceCase;
  need(c && typeof c === 'object', 'sourceCase required');
  if (c) {
    for (const f of ['caseId', 'aiSystemId', 'scenarioRunId']) need(typeof c[f] === 'string' && c[f].length > 0, `sourceCase.${f} required`);
    need(STATES.has(c.scenarioState), `sourceCase.scenarioState invalid: ${c.scenarioState}`);
  }
  const e = a.evaluation;
  need(e && typeof e === 'object', 'evaluation required');
  if (e) {
    need(e.schemaVersion === 'master-report-product-1.0.0', `evaluation.schemaVersion must be master-report-product-1.0.0, got ${e.schemaVersion}`);
    need(e.timeBasis === 'EVALUATED_SNAPSHOT', 'evaluation.timeBasis must be EVALUATED_SNAPSHOT');
    need(typeof e.evaluationId === 'string' && e.evaluationId.length > 0, 'evaluation.evaluationId required');
    need(DISPOSITIONS.has(e.disposition), `evaluation.disposition invalid: ${e.disposition}`);
    need(BASES.has(e.evaluationBasis), `evaluation.evaluationBasis invalid: ${e.evaluationBasis}`);
    need(typeof e.coreTruthDigest === 'string' && e.coreTruthDigest.length > 0, 'evaluation.coreTruthDigest required');
    for (const f of ['fourQuestions', 'evaluationScenarioSnapshot', 'links']) need(e[f] && typeof e[f] === 'object', `evaluation.${f} required`);
    need(Array.isArray(e.limitations), 'evaluation.limitations must be an array');
    need(Array.isArray(e.semantics), 'evaluation.semantics must be an array');
  }
  const m = a.manufacturing;
  need(m && typeof m === 'object', 'manufacturing required');
  if (m) {
    need(Array.isArray(m.ruleOutcomes), 'manufacturing.ruleOutcomes must be an array');
    for (const [i, o] of (m.ruleOutcomes ?? []).entries()) {
      need(o && typeof o.ruleId === 'string' && o.ruleId.startsWith('MFG-'), `ruleOutcomes[${i}].ruleId must be MFG-*`);
      need(RULE_STATUSES.has(o?.status), `ruleOutcomes[${i}].status invalid: ${o?.status}`);
    }
    need(m.controlMaturity === null || typeof m.controlMaturity === 'object', 'manufacturing.controlMaturity must be object|null');
  }
  need(typeof a.exportDigest === 'string' && /^sha256:[0-9a-f]{64}$/.test(a.exportDigest), 'exportDigest must be sha256:<64hex>');
  return errors;
}

/** Recompute the export digest over the payload (minus exportDigest). */
function verifyExportDigest(artifact) {
  const { exportDigest, ...payload } = artifact;
  const actual = 'sha256:' + createHash('sha256').update(canonicalSerialize(payload), 'utf8').digest('hex');
  return { expected: artifact.exportDigest, actual, verified: actual === artifact.exportDigest };
}

/** Parse + validate + verify. Returns { ok, artifact?, verified, errors }. */
function loadExport(jsonText) {
  let artifact;
  try {
    artifact = JSON.parse(jsonText);
  } catch (e) {
    return { ok: false, verified: false, errors: [`invalid JSON: ${e.message}`] };
  }
  const errors = validateExportShape(artifact);
  if (errors.length) return { ok: false, verified: false, errors, artifact };
  const digest = verifyExportDigest(artifact);
  if (!digest.verified) {
    return { ok: false, verified: false, errors: [`exportDigest mismatch: expected ${digest.expected}, computed ${digest.actual}`], artifact };
  }
  return { ok: true, verified: true, errors: [], artifact };
}

function loadExportFile(fs, path) {
  try {
    return loadExport(fs.readFileSync(path, 'utf8'));
  } catch (e) {
    return { ok: false, verified: false, errors: [`unreadable: ${e.message}`] };
  }
}

module.exports = { SCHEMA, canonicalSerialize, validateExportShape, verifyExportDigest, loadExport, loadExportFile };
