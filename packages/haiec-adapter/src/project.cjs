'use strict';
/**
 * Read-only projection: haiec-evaluation-export → dashboard view models.
 *
 * Every projected value is pass-through from the artifact or an explicit
 * UNAVAILABLE marker — this adapter never recalculates a disposition,
 * rule outcome, receipt state or coverage figure. `origin` on each
 * projected node says where the displayed value came from:
 *   HAIEC_EVALUATION — persisted HAIEC product field (verbatim)
 *   EXPORT_METADATA  — export-envelope provenance/case binding
 *   SYNTHETIC_FIXTURE — Station 217 replay artifact (never a HAIEC verdict)
 *   UNAVAILABLE      — honestly absent (ABSENT_FACET, no receipt, no link)
 */

function projectCaseSummary(artifact) {
  const e = artifact.evaluation;
  const maturity = artifact.manufacturing?.controlMaturity ?? null;
  const receipts = maturity
    ? maturity.rows.filter((r) => r.ucpReceiptState === 'RECEIPT_BOUND' || r.ucpResult).map((r) => ({
        controlId: r.controlId ?? null,
        ucpResult: r.ucpResult ?? null,
        ucpReceiptState: r.ucpReceiptState ?? 'EVALUATED_NO_RECEIPT',
      }))
    : [];
  return {
    origin: 'HAIEC_EVALUATION',
    caseId: artifact.sourceCase.caseId,
    aiSystemId: artifact.sourceCase.aiSystemId,
    scenarioState: artifact.sourceCase.scenarioState,
    scenarioRunId: artifact.sourceCase.scenarioRunId,
    evaluationId: e.evaluationId,
    disposition: e.disposition,
    evaluationBasis: e.evaluationBasis,
    coreTruthDigest: e.coreTruthDigest,
    evidenceBundleDigest: e.evidenceBundleDigest ?? null,
    methodologyVersion: e.methodologyVersion ?? null,
    reportVersion: e.reportVersion ?? null,
    ruleOutcomes: (artifact.manufacturing.ruleOutcomes ?? []).map((o) => ({
      ruleId: o.ruleId, status: o.status, evidenceRefs: o.evidenceRefs ?? [],
    })),
    facet: maturity ? {
      version: maturity.version,
      qualifiedObservationCount: maturity.qualifiedObservationCount,
      rejectedObservationCount: maturity.rejectedObservationCount,
      boundBatchIds: maturity.boundBatchIds ?? [],
      limitations: maturity.limitations ?? [],
    } : { origin: 'UNAVAILABLE', note: 'ABSENT_FACET — no manufacturing facet bound to this evaluation' },
    receipts,
    links: e.links ?? {},
    linksMode: 'HAIEC_HOSTED_REQUIRES_AUTHORIZATION',
    limitations: e.limitations ?? [],
    semantics: e.semantics ?? [],
    fourQuestions: e.fourQuestions ?? null,
    scenarioSnapshot: e.evaluationScenarioSnapshot ?? null,
    provenance: artifact.provenance,
    exportDigest: artifact.exportDigest,
    exportedAt: artifact.exportedAt,
  };
}

/** Nine-system overview: group case summaries per system. */
function projectOverview(artifacts) {
  const systems = new Map();
  for (const a of artifacts) {
    const s = projectCaseSummary(a);
    if (!systems.has(s.aiSystemId)) {
      systems.set(s.aiSystemId, { aiSystemId: s.aiSystemId, states: {}, origin: 'HAIEC_EVALUATION' });
    }
    systems.get(s.aiSystemId).states[s.scenarioState] = s;
  }
  return [...systems.values()].sort((x, y) => x.aiSystemId.localeCompare(y.aiSystemId));
}

/** Three-state comparison for one system (baseline / wrong-target / degraded). */
function projectScenarioTriad(systemId, artifacts) {
  const s = projectCaseSummary;
  const mine = artifacts.filter((a) => a.sourceCase.aiSystemId === systemId);
  const triad = {
    EXPECTED_BASELINE: null,
    WRONG_TARGET: null,
    EVIDENCE_DEGRADED: null,
  };
  for (const a of mine) {
    if (triad[a.sourceCase.scenarioState] === null) triad[a.sourceCase.scenarioState] = s(a);
  }
  return {
    aiSystemId: systemId,
    origin: 'HAIEC_EVALUATION',
    states: triad,
    divergence: {
      wrongTarget: triad.WRONG_TARGET
        ? { ruleOutcomes: triad.WRONG_TARGET.ruleOutcomes, disposition: triad.WRONG_TARGET.disposition }
        : { origin: 'UNAVAILABLE' },
      degraded: triad.EVIDENCE_DEGRADED
        ? { ruleOutcomes: triad.EVIDENCE_DEGRADED.ruleOutcomes, disposition: triad.EVIDENCE_DEGRADED.disposition }
        : { origin: 'UNAVAILABLE' },
    },
  };
}

/** Station 217 replay bundle pass-through — synthetic, never HAIEC truth. */
function projectStation217(bundle) {
  return {
    origin: 'SYNTHETIC_FIXTURE',
    issuer: bundle.issuer,
    synthetic: bundle.synthetic === true,
    schemaVersion: bundle.schemaVersion,
    policyDigest: bundle.policyDigest,
    digest: bundle.digest,
    claims: bundle.claims ?? [],
    limitations: bundle.limitations ?? [],
    cases: (bundle.cases ?? []).map((c) => ({
      id: c.id,
      origin: 'SYNTHETIC_FIXTURE',
      request: c.request,
      proposal: c.proposal,
      approval: c.approval ?? null,
      decision: c.decision ?? null,
      targetReadbacks: c.targetReadbacks ?? null,
      audit: c.audit ?? [],
    })),
  };
}

module.exports = { projectCaseSummary, projectOverview, projectScenarioTriad, projectStation217 };
