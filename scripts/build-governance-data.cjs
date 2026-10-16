#!/usr/bin/env node
'use strict';
/**
 * Fictional deployment-governance demo bundle — static presentation only.
 * No HAIEC evaluation, U5 disposition, U6 receipt, authorization or real
 * human attestation is generated here. Every record must stay clearly
 * separated from the digest-verified canonical export corpus.
 */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const writePath = path.join(root, 'dashboard/data/governance-scenarios.js');

const g = read('data/demo-governance/governance-scenarios.json');

/* ---- structural + boundary validation ---- */
if (g.schemaVersion !== 'demo-governance-scenario-1.0.0') throw new Error('GOV_SCHEMA');
if (g.artifactClass !== 'FICTIONAL_DEPLOYMENT_GOVERNANCE_SCENARIOS_NOT_HAIEC_AUTHORIZATIONS') throw new Error('GOV_ARTIFACT_CLASS');
if (g.provenance !== 'SIMULATION_ONLY') throw new Error('GOV_PROVENANCE');
if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(g.referenceClock || '')) throw new Error('GOV_REFERENCE_CLOCK');

const FORBIDDEN = ['evaluationId', 'coreTruthDigest', 'u6', 'receipt', 'publicVerificationId', 'assurancePackage'];
function scanForbidden(o, where) {
  for (const k of Object.keys(o)) {
    if (FORBIDDEN.includes(k)) throw new Error('GOV_FORBIDDEN_FIELD:' + where + '.' + k);
    if (o[k] && typeof o[k] === 'object') scanForbidden(o[k], where + '.' + k);
  }
}
scanForbidden(g, 'root');

const decisions = g.decisions || [];
if (decisions.length !== 9) throw new Error('GOV_DECISION_COUNT:' + decisions.length);
const count = s => decisions.filter(d => d.humanDecision === s).length;
if (count('APPROVED_SCOPED') !== 2) throw new Error('GOV_APPROVED_SCOPED:' + count('APPROVED_SCOPED'));
if (count('APPROVED_SCOPED_PILOT') !== 1) throw new Error('GOV_APPROVED_PILOT:' + count('APPROVED_SCOPED_PILOT'));
if (count('REJECTED') !== 2) throw new Error('GOV_REJECTED:' + count('REJECTED'));
if (count('PENDING') !== 4) throw new Error('GOV_PENDING:' + count('PENDING'));

/* The review dossier is a fictional source record, never authenticated human approval. */
const infra = g.reviewInfrastructure || {};
for (const key of ['type','reviewerIdentity','reviewerAuthentication','persistentApprovalStore','serverAuthorization','productionDispatcher','liveMonitoring','canonicalAssurance']) {
  if (!infra[key]) throw new Error('GOV_APPROVAL_INFRA_MISSING:' + key);
}
if (infra.type !== 'DEMONSTRATION_ONLY' || infra.reviewerAuthentication !== 'NOT_CONNECTED' ||
    infra.persistentApprovalStore !== 'NOT_PROVISIONED' || infra.productionDispatcher !== 'NOT_CONNECTED' ||
    infra.liveMonitoring !== 'NO_LIVE_CONNECTORS') throw new Error('GOV_APPROVAL_INFRA_OVERCLAIM');
const requestIds = new Set();
for (const d of decisions) {
  const q = d.requestRecord;
  if (!q || !Array.isArray(d.reviewEvents) || !d.reviewEvents.length) throw new Error('GOV_REVIEW_DOSSIER_MISSING:' + d.systemId);
  if (requestIds.has(q.requestId)) throw new Error('GOV_REVIEW_DUPLICATE_ID:' + q.requestId);
  requestIds.add(q.requestId);
  if (q.requestedOperation !== d.proposedOperation || q.requestedEnvironment !== d.environment ||
      q.assignedReviewerRole !== d.approverRole || q.policyVersion !== d.policyVersion ||
      q.decisionState !== d.humanDecision || q.decisionTime !== d.decidedAt ||
      q.supportingCaseId !== d.canonicalCaseId || q.approvalExpiresAt !== d.expiresAt ||
      q.liveDispatchEnforcement !== 'NOT_CONNECTED')
    throw new Error('GOV_REVIEW_BINDING_MISMATCH:' + d.systemId);
  if (q.requestedByRole === q.assignedReviewerRole || q.reviewerIdentityState !== 'FICTIONAL_ROLE_ONLY_NOT_AUTHENTICATED' ||
      q.mfaState !== 'NOT_PERFORMED_SIMULATION')
    throw new Error('GOV_REVIEW_IDENTITY_OVERCLAIM:' + d.systemId);
  if (JSON.stringify(q.allowedAdvisoryScope) !== JSON.stringify(d.allowedOperations) ||
      JSON.stringify(q.forbiddenConsequenceScope) !== JSON.stringify(d.prohibitedOperations) ||
      JSON.stringify(q.evidenceRequirements) !== JSON.stringify(d.requiredConditions))
    throw new Error('GOV_REVIEW_SCOPE_MISMATCH:' + d.systemId);
  const ts = Date.parse(q.requestTime), ref = Date.parse(g.referenceClock);
  if (!Number.isFinite(ts) || ts > ref) throw new Error('GOV_REVIEW_TIME_INVALID:' + d.systemId);
  for (const ev of d.reviewEvents) {
    const et = Date.parse(ev.at);
    if (ev.requestId !== q.requestId || !Number.isFinite(et) || et < ts || et > ref)
      throw new Error('GOV_REVIEW_EVENT_MISMATCH:' + d.systemId);
  }
  const last = d.reviewEvents[d.reviewEvents.length-1];
  if (d.humanDecision === 'PENDING') {
    if (last.eventType !== 'DEMO_REVIEW_PENDING' || q.decisionTime !== null || !q.reviewDueAt)
      throw new Error('GOV_REVIEW_PENDING_UNSAFE:' + d.systemId);
  } else {
    const expected = d.humanDecision === 'REJECTED' ? 'DEMO_ACTION_REJECTED' : 'DEMO_SCOPED_APPROVAL_RECORDED';
    if (last.eventType !== expected || last.at !== d.decidedAt || last.actorRole !== d.approverRole || q.reviewDueAt !== null)
      throw new Error('GOV_REVIEW_DECISION_MISMATCH:' + d.systemId);
  }
}

const monIds = new Set((g.monitoringScenarios || []).map(m => m.scenarioId));
for (const d of decisions) {
  for (const f of ['systemId','agentId','canonicalCaseId','environment','proposedOperation','humanDecision',
    'allowedOperations','prohibitedOperations','approverRole','decisionRef','policyVersion','rationale','monitoringScenarioId'])
    if (d[f] === undefined || d[f] === null || d[f] === '') throw new Error('GOV_MISSING_FIELD:' + d.systemId + '.' + f);
  if (!Array.isArray(d.allowedOperations) || !Array.isArray(d.prohibitedOperations)) throw new Error('GOV_SCOPE_TYPE:' + d.systemId);
  if (!monIds.has(d.monitoringScenarioId)) throw new Error('GOV_MONITORING_REF:' + d.systemId);
  if (d.humanDecision === 'PENDING' && d.decidedAt) throw new Error('GOV_PENDING_DECIDED:' + d.systemId);
}

for (const m of g.monitoringScenarios || []) {
  if (!decisions.some(d => d.systemId === m.systemId)) throw new Error('GOV_ORPHAN_MONITORING:' + m.scenarioId);
  for (const s of m.sources) {
    if (!s.sourceId || !Number.isFinite(s.cadenceSec)) throw new Error('GOV_SOURCE_SHAPE:' + m.scenarioId);
    for (const r of s.records)
      if (!r.eventType || !r.target || !r.declaredAt || !r.observedAt) throw new Error('GOV_RECORD_SHAPE:' + m.scenarioId);
  }
}

const out = '/* GENERATED from data/demo-governance/governance-scenarios.json; read-only presentation. */\n' +
  'window.HAIEC_GOVERNANCE_DEMO = ' + JSON.stringify(g, null, 2) + ';\n';
if (process.argv.includes('--check')) {
  if (!fs.existsSync(writePath) || fs.readFileSync(writePath, 'utf8') !== out)
    throw new Error('GOVERNANCE_BUNDLE_DRIFT: run node scripts/build-governance-data.cjs');
  process.stdout.write('Governance bundle build parity: OK\n');
} else {
  fs.mkdirSync(path.dirname(writePath), { recursive: true });
  fs.writeFileSync(writePath, out, 'utf8');
  process.stdout.write('Built governance bundle: ' + decisions.length + ' decisions, ' +
    (g.monitoringScenarios || []).length + ' monitoring scenarios\n');
}
