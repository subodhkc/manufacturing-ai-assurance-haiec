#!/usr/bin/env node
'use strict';
/**
 * Shared scenario artifact — single authoritative export of the fictional
 * nine-system manufacturing governance story plus deterministic playback
 * scripts. Consumed by this dashboard (dashboard/data/scenario-shared.js)
 * and vendored into haiec-website (data/demo/manufacturing-scenario-shared.json)
 * so both apps render ONE story, not two hand-maintained lists.
 *
 * Deterministic: fixed input fixture -> fixed output. No wall clock; the
 * stamp is inherited from the fixture's generatedAt/referenceClock.
 * Presentation only: no HAIEC evaluation, U6 receipt, real attestation,
 * dispatch or notification is produced here.
 */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

const g = read('data/demo-governance/governance-scenarios.json');
if (g.schemaVersion !== 'demo-governance-scenario-1.0.0') throw new Error('SHARED_SCHEMA');
if (g.provenance !== 'SIMULATION_ONLY') throw new Error('SHARED_PROVENANCE');

/* Versioned scenario-readiness fixture (seven honest facets, authored states). */
const readiness = read('data/demo-governance/scenario-readiness.json');
if (readiness.schemaVersion !== 'scenario-readiness-1.0.0') throw new Error('READINESS_SCHEMA');
if (readiness.systemId !== 'SYS-217' || (readiness.facets || []).length !== 7) throw new Error('READINESS_SHAPE');
const readyById = Object.fromEntries(readiness.facets.map(f => [f.id, f]));
if (readyById['qualified-evidence'].state !== 'EVALUATED') throw new Error('READINESS_EVIDENCE');
if (readyById['org-entitlement'].state !== 'NOT_ASSESSED') throw new Error('READINESS_ENTITLEMENT');
if (readyById['approval-and-control'].state !== 'PENDING_DEMO_GATEWAY') throw new Error('READINESS_APPROVAL');

/* ---- display names (fixture carries ids only) ---- */
const NAMES = {
  'SYS-340': 'Vision Inspection AI', 'SYS-FC1': 'Demand Forecast AI',
  'SYS-MNT88': 'Predictive Maintenance Pilot', 'SYS-SUP12': 'Supplier Quality AI',
  'SYS-SCH5': 'Production Scheduler AI', 'SYS-217': 'Torque Quality — Station 217',
  'SYS-PO12': 'Procurement Agent', 'SYS-DYN412': 'Dynamometer Agent', 'SYS-WH15': 'Warehouse Copilot',
};

/* ---- monitoring derivation: same freshness rules as the dashboard ---- */
const ref = Date.parse(g.referenceClock);
const mult = g.freshnessMultiplier || 2;
function sourceStatus(src) {
  const recs = src.records || [];
  if (!recs.length) return 'MISSING';
  const latest = Math.max.apply(null, recs.map(r => Date.parse(r.declaredAt)));
  return (ref - latest) <= src.cadenceSec * mult * 1000 ? 'FRESH' : 'STALE';
}
function monState(sysId) {
  const m = (g.monitoringScenarios || []).find(x => x.systemId === sysId);
  if (!m || !m.sources || !m.sources.length) return 'NO_LIVE_CONNECTION';
  const ss = m.sources.map(sourceStatus);
  if (ss.every(s => s === 'MISSING')) return 'NO_LIVE_CONNECTION';
  if (ss.some(s => s === 'MISSING')) return 'SIMULATED_MONITORING_PARTIAL';
  if (ss.some(s => s === 'STALE')) return 'SIMULATED_MONITORING_STALE';
  return 'SIMULATED_MONITORING_ESTABLISHED';
}
function latestRecord(sysId) {
  const m = (g.monitoringScenarios || []).find(x => x.systemId === sysId);
  let best = null;
  for (const s of (m && m.sources) || [])
    for (const r of s.records || [])
      if (!best || Date.parse(r.declaredAt) > Date.parse(best.declaredAt)) best = r;
  return best;
}

/* ---- decision presentation ---- */
const DECISION = {
  APPROVED_SCOPED: { sev: 'go', label: 'Approved — scoped', status: 'Operating within approved scope' },
  APPROVED_SCOPED_PILOT: { sev: 'go', label: 'Approved — pilot scope', status: 'Pilot operating within approved scope' },
  REJECTED: { sev: 'warn', label: 'Rejected', status: 'Requested expansion rejected — existing advisory scope unchanged' },
  PENDING: { sev: 'hold', label: 'Pending review', status: 'Awaiting accountable reviewer decision' },
};
const NEXT = {
  APPROVED_SCOPED: 'Operate inside the approved scope; any scope change returns to review.',
  APPROVED_SCOPED_PILOT: 'Continue the pilot inside its approved boundary; expansion requires a new review.',
  REJECTED: 'Requested expansion stays closed; advisory work continues under the existing scope.',
  PENDING: 'Accountable reviewer decision required before any consequential change.',
};

/* Per-system story annotations where the dossier needs narrative context. */
const STORY = {
  'SYS-217': 'Quality station write expansion. Approved for advisory use only — autonomous production update still pending. Target mismatch observed: recorded effect on work order WO-217-4803 while the approved target was WO-217-4802. The consequential request requires an accountable human decision before any MES write expansion.',
};

/* ---- dossiers (presentation-normalized) ---- */
const dossiers = g.decisions.map(d => ({
  systemId: d.systemId,
  systemName: NAMES[d.systemId] || d.systemId,
  agentId: d.agentId,
  canonicalCaseId: d.canonicalCaseId,
  environment: d.environment,
  proposedOperation: d.proposedOperation,
  humanDecision: d.humanDecision,
  assuranceResult: 'REVIEW',
  allowedOperations: d.allowedOperations,
  prohibitedOperations: d.prohibitedOperations,
  approverRole: d.approverRole,
  decisionRef: d.decisionRef,
  decidedAt: d.decidedAt || null,
  expiresAt: d.expiresAt || null,
  reviewTrigger: d.reviewTrigger || null,
  requiredConditions: d.requiredConditions || [],
  rationale: d.rationale,
  monitoringState: monState(d.systemId),
  monitoringScenarioId: d.monitoringScenarioId,
  nextAction: NEXT[d.humanDecision],
  story: STORY[d.systemId],
  request: {
    requestId: d.requestRecord.requestId,
    requestedByRole: d.requestRecord.requestedByRole,
    assignedReviewerRole: d.requestRecord.assignedReviewerRole,
    requestedTarget: d.requestRecord.requestedTarget,
    reviewDueAt: d.requestRecord.reviewDueAt || null,
  },
}));

/* ---- playback event contract ---- */
const SCHEMA = 'haiec-scenario-playback-1.0.0';
function ev(scenarioId, systemId, seq, offsetMs, stage, lane, eventType, severity, headline, copy, extra) {
  return Object.assign({
    eventId: scenarioId + ':' + String(seq).padStart(2, '0'),
    sequence: seq, scenarioId, systemId, offsetMs,
    stage, lane, eventType, origin: 'SIMULATED', severity, headline, copy,
  }, extra || {});
}
const decisionRequest = d => ({ decisionRequestId: d.request.requestId, decisionRef: d.decisionRef || undefined });

/* Station 217 two-episode journey (~46s): Episode A = the saved HAIEC
   evaluation detected the recorded target difference (Oct 14). Episode B =
   the subsequent fictional MES write-expansion request stays pending while a
   later demo write attempt is held at the illustrative gateway (Oct 15).
   Distinct identifiers: evaluation SYS-217-WRONG_TARGET / request
   DEMO-REQ-SYS-217-06 / held attempt DEMO-GW-SYS-217-02. */
function journey217(d) {
  const sid = 'mfg-journey-SYS-217';
  const mon = latestRecord(d.systemId);
  const req = decisionRequest(d);
  const E = [];
  E.push(ev(sid, d.systemId, 1, 0, 'REQUEST', 'action', 'REVIEW_REQUESTED', 'info',
    'Write-expansion review requested', d.proposedOperation, req));
  E.push(ev(sid, d.systemId, 2, 4000, 'SCOPE', 'action', 'SCOPE_CHECK', 'warn',
    'Outside advisory scope', 'Autonomous MES writes sit outside the approved operating scope — an accountable human decision is required.', req));
  E.push(ev(sid, d.systemId, 3, 8000, 'REVIEW', 'action', 'RECORDED_MISMATCH_DETECTED', 'warn',
    'Earlier recorded mismatch detected',
    'Saved evaluation: approved target WO-217-4802, recorded target WO-217-4803 — target divergence found in the submitted evidence. Result: review required.',
    Object.assign({ evaluationRef: d.canonicalCaseId }, req)));
  E.push(ev(sid, d.systemId, 4, 12000, 'REQUEST', 'reviewer', 'REVIEWER_ASSIGNED', 'info',
    'Accountable reviewer assigned', d.approverRole + ' takes the review for this request.', req));
  E.push(ev(sid, d.systemId, 5, 16000, 'NOTIFY', 'reviewer', 'EMAIL_PREVIEW', 'info',
    'Reviewer notified', 'Email preview: "Torque Quality — Station 217 write expansion awaiting your decision."', req));
  E.push(ev(sid, d.systemId, 6, 20000, 'NOTIFY', 'reviewer', 'SMS_PREVIEW', 'info',
    'Reminder preview', 'Text alert preview: "HAIEC review ' + d.request.requestId + ' awaiting your decision."', req));
  E.push(ev(sid, d.systemId, 7, 24000, 'REVIEW', 'reviewer', 'REVIEW_OPENED', 'info',
    'Request opened', 'Reviewer opened the request and its evidence.', req));
  E.push(ev(sid, d.systemId, 8, 28000, 'DECISION', 'reviewer', 'DECISION_PENDING', 'hold',
    'Decision pending', 'No decision recorded yet. The consequential request stays open.', req));
  E.push(ev(sid, d.systemId, 9, 32000, 'STATUS', 'action', 'SUBSEQUENT_WRITE_HELD', 'hold',
    'Subsequent write attempt held',
    'A later autonomous write attempt (DEMO-GW-SYS-217-02) is held at the demonstration gateway while the expansion decision is pending.',
    Object.assign({ attemptRef: 'DEMO-GW-SYS-217-02' }, req)));
  E.push(ev(sid, d.systemId, 10, 36000, 'STATUS', 'action', 'OPERATING_STATUS', 'hold',
    'Advisory work continues — write expansion still pending',
    'Lower-risk advisory activity may continue inside the existing scope. The MES write expansion is not approved.', req));
  E.push(ev(sid, d.systemId, 11, 40000, 'MONITORING', 'monitoring', 'MONITORING_EVENT', 'info',
    'Monitoring coverage partial',
    mon ? 'Latest recorded event: ' + mon.eventType + ' — ' + mon.target + '. One source missing at the fixed scenario clock.'
        : 'No source records in this scenario.', req));
  E.push(ev(sid, d.systemId, 12, 44000, 'EVIDENCE', 'monitoring', 'EVIDENCE_LINK', 'info',
    'Supporting evidence available', 'Verified report and review history stay linked to this system.',
    Object.assign({ evaluationRef: d.canonicalCaseId }, req)));
  return { scenarioId: sid, systemId: d.systemId, title: 'Human review journey — ' + d.systemName, durationMs: 47000, events: E };
}

/* Journey: the human review lifecycle for one system (~40s). */
function journey(d) {
  if (d.systemId === 'SYS-217') return journey217(d);
  const sid = 'mfg-journey-' + d.systemId;
  const dec = DECISION[d.humanDecision];
  const q = d.request;
  const pending = d.humanDecision === 'PENDING';
  const rejected = d.humanDecision === 'REJECTED';
  const is217 = d.systemId === 'SYS-217';
  const mon = latestRecord(d.systemId);
  const monLabel = { SIMULATED_MONITORING_ESTABLISHED: 'Monitoring coverage established', SIMULATED_MONITORING_PARTIAL: 'Monitoring coverage partial', SIMULATED_MONITORING_STALE: 'Monitoring data stale', NO_LIVE_CONNECTION: 'No live connection' }[d.monitoringState];
  const E = [];
  E.push(ev(sid, d.systemId, 1, 0, 'REQUEST', 'action', 'REVIEW_REQUESTED', 'info',
    'Review requested', d.proposedOperation, decisionRequest(d)));
  E.push(ev(sid, d.systemId, 2, 4000, 'REQUEST', 'reviewer', 'REVIEWER_ASSIGNED', 'info',
    'Accountable reviewer assigned', d.approverRole + ' takes the review for this request.', decisionRequest(d)));
  E.push(ev(sid, d.systemId, 3, 8000, 'NOTIFY', 'reviewer', 'EMAIL_PREVIEW', 'info',
    'Reviewer notified', 'Email preview: "' + d.systemName + ' review — ' + d.proposedOperation.slice(0, 60) + '…"', decisionRequest(d)));
  E.push(ev(sid, d.systemId, 4, 12000, 'NOTIFY', 'reviewer', 'SMS_PREVIEW', 'info',
    'Reminder preview', 'Text alert preview: "HAIEC review ' + q.requestId + ' awaiting your decision."', decisionRequest(d)));
  E.push(ev(sid, d.systemId, 5, 16000, 'REVIEW', 'reviewer', 'REVIEW_OPENED', 'info',
    'Request opened', 'Reviewer opened the request and its evidence.', decisionRequest(d)));
  E.push(ev(sid, d.systemId, 6, 20000, 'REVIEW', 'action', 'ASSURANCE_REVIEWED', is217 ? 'warn' : 'info',
    'Assurance result: review required',
    is217 ? 'Target mismatch observed — recorded target WO-217-4803 differs from approved target WO-217-4802.'
          : 'Evaluation completed for the proposed operation; a human decision is required.',
    Object.assign({ evaluationRef: d.canonicalCaseId }, decisionRequest(d))));
  if (pending) {
    E.push(ev(sid, d.systemId, 7, 24000, 'DECISION', 'reviewer', 'DECISION_PENDING', 'hold',
      'Decision pending', 'No decision recorded yet. The consequential request stays open.', decisionRequest(d)));
    E.push(ev(sid, d.systemId, 8, 28000, 'STATUS', 'action', 'OPERATING_STATUS', 'hold',
      is217 ? 'Advisory work continues — write expansion still pending' : dec.status,
      is217 ? 'Lower-risk advisory activity may continue inside the existing scope. The MES write expansion is not approved.'
            : 'Advisory activity may continue; the consequential request is not approved.', decisionRequest(d)));
  } else {
    E.push(ev(sid, d.systemId, 7, 24000, 'DECISION', 'reviewer', rejected ? 'DECISION_REJECTED' : 'DECISION_RECORDED', dec.sev,
      dec.label, rejected ? 'Reviewer rejected the requested expansion: ' + d.rationale.slice(0, 140)
                          : 'Reviewer approved a scoped authorization: ' + d.rationale.slice(0, 140), decisionRequest(d)));
    E.push(ev(sid, d.systemId, 8, 28000, 'STATUS', 'action', 'OPERATING_STATUS', dec.sev,
      dec.status, 'Permitted operations: ' + d.allowedOperations.join('; ') + '.', decisionRequest(d)));
  }
  E.push(ev(sid, d.systemId, 9, 32000, 'MONITORING', 'monitoring', 'MONITORING_EVENT', 'info',
    monLabel, mon ? 'Latest recorded event: ' + mon.eventType + ' — ' + mon.target + '.'
                  : 'No source records in this scenario.', decisionRequest(d)));
  E.push(ev(sid, d.systemId, 10, 36000, 'EVIDENCE', 'monitoring', 'EVIDENCE_LINK', 'info',
    'Supporting evidence available', 'Verified report and review history stay linked to this system.',
    Object.assign({ evaluationRef: d.canonicalCaseId }, decisionRequest(d))));
  return { scenarioId: sid, systemId: d.systemId, title: 'Human review journey — ' + d.systemName, durationMs: 40000, events: E };
}

/* Control room act: condensed contrast arc for one hero system. */
function act(d, headline, seqBase, offset, step, beats) {
  return beats.map((b, i) => ev('mfg-control-room', d.systemId, seqBase + i, offset + i * step,
    b[0], b[1], b[2], b[3], headline, typeof b[4] === 'function' ? b[4](d) : b[4],
    Object.assign({ act: headline }, b[5] || {}, decisionRequest(d))));
}
function controlRoom(d) {
  const S340 = dossiers.find(x => x.systemId === 'SYS-340');
  const S217 = dossiers.find(x => x.systemId === 'SYS-217');
  const SCH5 = dossiers.find(x => x.systemId === 'SYS-SCH5');
  const s = 3400;
  const E = [];
  E.push(...act(S340, 'Within approved scope — ' + S340.systemName, 1, 0, s, [
    ['PROPOSED', 'action', 'PROPOSED_ACTION', 'info', d => 'AI action proposed: ' + d.proposedOperation],
    ['SCOPE', 'action', 'SCOPE_CHECK', 'go', d => 'Inside approved operating scope — no new authorization needed for advisory work'],
    ['DECISION', 'reviewer', 'DECISION_RECORDED', 'go', d => 'Human review decision: ' + DECISION[d.humanDecision].label + ' by ' + d.approverRole],
    ['STATUS', 'action', 'EXECUTION_ALLOWED', 'go', d => 'Advisory inspection output routed to human quality review'],
    ['MONITORING', 'monitoring', 'MONITORING_EVENT', 'info', d => 'Latest observed event: ' + (latestRecord(d.systemId) || {}).eventType],
    ['EVIDENCE', 'monitoring', 'EVIDENCE_LINK', 'info', d => 'Verified report stays linked to this system'],
  ]));
  E.push(...act(S217, 'Held for review — ' + S217.systemName, 10, 21000, s, [
    ['PROPOSED', 'action', 'PROPOSED_ACTION', 'info', d => 'Consequential change proposed: ' + d.proposedOperation],
    ['SCOPE', 'action', 'SCOPE_CHECK', 'warn', d => 'Outside advisory scope — write expansion requires human review'],
    ['REVIEW', 'action', 'ASSURANCE_REVIEWED', 'warn', d => 'Assurance result: review required — target mismatch (WO-217-4803 vs approved WO-217-4802)'],
    ['NOTIFY', 'reviewer', 'EMAIL_PREVIEW', 'info', d => 'Reviewer ' + d.approverRole + ' notified — decision requested'],
    ['DECISION', 'reviewer', 'DECISION_PENDING', 'hold', d => 'Human review decision: pending — expansion held'],
    ['STATUS', 'action', 'EXECUTION_HELD', 'hold', d => 'MES write stays held; lower-risk advisory work continues'],
    ['MONITORING', 'monitoring', 'MONITORING_EVENT', 'info', d => 'Latest observed event: ' + (latestRecord(d.systemId) || {}).eventType],
    ['EVIDENCE', 'monitoring', 'EVIDENCE_LINK', 'info', d => 'Review history and evidence stay linked'],
  ]));
  E.push(...act(SCH5, 'Rejected expansion — ' + SCH5.systemName, 20, 49000, s, [
    ['PROPOSED', 'action', 'PROPOSED_ACTION', 'info', d => 'Consequential change proposed: ' + d.proposedOperation],
    ['SCOPE', 'action', 'SCOPE_CHECK', 'warn', d => 'Consequential change — requires accountable human review'],
    ['NOTIFY', 'reviewer', 'EMAIL_PREVIEW', 'info', d => 'Reviewer ' + d.approverRole + ' notified — decision requested'],
    ['DECISION', 'reviewer', 'DECISION_REJECTED', 'warn', d => 'Human review decision: rejected — ' + d.rationale.slice(0, 110)],
    ['STATUS', 'action', 'EXECUTION_BLOCKED', 'warn', d => 'Schedule commit stays rejected; existing scope unchanged'],
    ['EVIDENCE', 'monitoring', 'EVIDENCE_LINK', 'info', d => 'Rejection rationale recorded with the review history'],
  ]));
  E.push(ev('mfg-control-room', '', 30, 73000, 'EVIDENCE', 'monitoring', 'SCENARIO_END', 'info',
    'Cycle complete', 'Three contrasting outcomes — scope kept, expansion held, expansion rejected.'));
  return { scenarioId: 'mfg-control-room', title: 'Enterprise control room — fictional manufacturing', durationMs: 78000, events: E };
}

const out = {
  schemaVersion: SCHEMA,
  artifactClass: 'FICTIONAL_SCENARIO_PLAYBACK_NOT_HAIEC_AUTHORIZATIONS',
  provenance: 'SIMULATION_ONLY',
  generatedFrom: { fixtureSchema: g.schemaVersion, fixtureGeneratedAt: g.generatedAt },
  referenceClock: g.referenceClock,
  dossiers,
  readiness,
  scripts: { controlRoom: controlRoom(), journey: Object.fromEntries(dossiers.map(j => [j.systemId, journey(j)])) },
};

const json = JSON.stringify(out, null, 2);
const js = '/* GENERATED from data/demo-governance/governance-scenarios.json; presentation-only playback. */\n' +
  'window.HAIEC_SCENARIO_SHARED = ' + json + ';\n';
const jsonPath = path.join(root, 'data/demo-governance/scenario-shared.json');
const jsPath = path.join(root, 'dashboard/data/scenario-shared.js');
if (process.argv.includes('--check')) {
  if (!fs.existsSync(jsonPath) || fs.readFileSync(jsonPath, 'utf8') !== json + '\n' ||
      !fs.existsSync(jsPath) || fs.readFileSync(jsPath, 'utf8') !== js)
    throw new Error('SCENARIO_SHARED_DRIFT: run node scripts/build-scenario-shared.cjs');
  process.stdout.write('Scenario-shared build parity: OK\n');
} else {
  fs.mkdirSync(path.join(root, 'dashboard/data'), { recursive: true });
  fs.writeFileSync(jsonPath, json + '\n');
  fs.writeFileSync(jsPath, js);
  process.stdout.write('Built scenario-shared: ' + dossiers.length + ' dossiers, ' +
    out.scripts.controlRoom.events.length + ' control-room events, ' +
    Object.keys(out.scripts.journey).length + ' journeys\n');
}
