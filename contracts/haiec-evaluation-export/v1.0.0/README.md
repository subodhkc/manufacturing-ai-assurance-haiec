# HAIEC Evaluation Export v1.0.0 — read-only demo data contract

**Status: CONSUMER-SIDE READ CONTRACT / READ-ONLY / NO SECOND ASSURANCE ENGINE.**

This folder specifies the `haiec-evaluation-export-1.0.0` envelope — the
frozen, digest-pinned artifact this repository's dashboard consumes when
presenting genuine HAIEC evaluation results. The artifact is produced by
an authorized read of the canonical HAIEC Master Report product
(`master-report-product-1.0.0`) — either `GET
/api/v1/assurance/evaluations/{evaluationId}/master-report?detail=full`
under Bearer authentication, or the equivalent authorized read in the
evaluating HAIEC instance. This repository never recalculates a
disposition, rule outcome, receipt state or coverage count: every field
is pass-through from the persisted HAIEC artifact, a frozen export
label, or an explicit unavailable state.

## Envelope

| Field | Origin | Notes |
| --- | --- | --- |
| `schemaVersion` | export | Literal `haiec-evaluation-export-1.0.0`. Readers must reject unknown major versions. |
| `exportKind` | export | `FROZEN_EVALUATION_EXPORT`. |
| `exportedAt` | export | Producer clock at export time. |
| `exportDigest` | export | `sha256:` digest over the canonical serialization of the payload excluding `exportDigest`. Verifiable offline. |
| `provenance` | export | `dataClass`, `truthLabel`, `sourceWorldId`, `oracleIndependent`, `producedBy`. `SYNTHETIC_LAB` artifacts must never render as real-plant observations. |
| `sourceCase` | export | `caseId`, `aiSystemId`, `scenarioState`, `scenarioRunId` — binds the export to the independent source-world case it evaluated. |
| `evaluation` | HAIEC | The **bounded** `MasterReportProduct` view, verbatim: `evaluationId`, `disposition`, `evaluationBasis`, `coreTruthDigest`, `evidenceBundleDigest`, `fourQuestions`, `evaluationScenarioSnapshot`, `links`, `limitations`, `semantics`. |
| `manufacturing.ruleOutcomes` | HAIEC | Persisted `MFG-*` detout outcomes verbatim (`MATCH` / `NO_MATCH_WITH_ADEQUATE_COVERAGE` / `INSUFFICIENT_SOURCE` / `CONTRADICTED` + bound evidence refs). |
| `manufacturing.controlMaturity` | HAIEC | The evaluation-bound `ManufacturingControlMaturityFacet`, verbatim; `null` means absent, not zero. Includes `ucpReceiptState` and `BoundUcpReceipt` references. |

`manifest.json` (`haiec-evaluation-export-1.0.0-manifest`) lists every
export with its `caseId`, `evaluationId`, `disposition`, digests and
file name so a reader can enumerate and pin the whole set.

## Two consumption modes

1. **Authenticated HAIEC mode** — `evaluation.links` carries the
   HAIEC-hosted HTML/PDF/API URLs for the exact `evaluationId`. Opening
   one requires the reader to hold access to the owning organization;
   unauthorized readers get HAIEC's normal fail-closed response. The
   dashboard shows an authorization-required affordance, never a cached
   credential.
2. **Frozen offline mode** — the artifact itself plus `exportDigest`.
   Everything rendered from it is labeled `SYNTHETIC_LAB` /
   `FROZEN_EVALUATION_EXPORT`; nothing is presented as a live factory or
   customer result.

## What consumers must not do

- Recalculate or re-rank dispositions, rule outcomes or receipts.
- Present `expected-findings` oracle content as HAIEC output.
- Treat a missing `controlMaturity` facet as zero controls evaluated.
- Present `INSUFFICIENT_SOURCE` as a pass, a fail, or a score.
- Embed API keys, OAuth tokens or private report URLs in exports or UI.

## Producer

Authorized HAIEC operator side:
`scripts/export-manufacturing-evaluation.ts` (HAIEC repository,
read-only) or the equivalent authenticated API read. The produced files
land under `data/evaluations/` in this repository; digests are
re-verifiable by `packages/haiec-adapter/src/load-export.cjs`.
