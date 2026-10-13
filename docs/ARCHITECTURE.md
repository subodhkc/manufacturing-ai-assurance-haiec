# Architecture: fixture-first, one canonical HAIEC assurance engine

## Ownership and boundaries

- `packages/fixtures/src/reference-dashboard-data.cjs` is a source-faithful extraction of the standalone v7.2 example estate with later manufacturing corrections applied. It is **illustrative source input**, not accepted canonical evidence.
- `packages/fixtures/src/expected-findings.cjs` is an **independently authored oracle** of target scope, expected conditions, unestablished claims, and required evidence. Never derive it from the generated reports or actual HAIEC evaluator output.
- `packages/fixtures/src/generate.cjs` deterministically projects fictional agent/source/report/monitoring data from the reference and oracle. This is **not a replacement for HAIEC evaluations, DAI, Action Witness, or U6 reporting**.
- `packages/fixtures/src/export-haiec-candidates.cjs` prepares caller-declared inputs for subsequent HAIEC structured-ingress validation. The typed candidate is not a verified envelope or approved effect.
- `data/generated` contains reproducible snapshots and sha256 digests in `manifest.json`.
- `dashboard/index.html` is the complete static judge-facing v7.2 dashboard (still uses embedded JS fixture arrays). Generated JSON and rendered UI are **not yet dynamically bound**; a future dashboard adapter should map generated IDs to views and reconcile difference tests before enabling live application data.

## Four independent steps

1. **Generate** identical source evidence for fictional AI agents, IAM, tool/API calls, MES/QMS/ERP/CMMS/WMS transactions, and source continuity.
2. **Qualify** inside HAIEC's existing normalized `EvidenceEnvelope`, source-authority, scenario-binding, correlation, coverage and provenance contracts.
3. **Evaluate** using HAIEC's canonical DAI, approved Operating Envelope, U5 evaluations, effect comparison, runtime drift and Control Tests. Compare against independently authored expected facts. A synthetic test failure is a signal to investigate HAIEC, the adapter **or the oracle**, not justification to rewrite HAIEC until the result looks right.
4. **Present** real evaluation IDs/receipts in an authenticated dashboard with strict snapshot binding; if absent, show the corresponding fixture-only report with explicit origin.

## Known negative cases

- Missing downstream QMS/MES/WMS witness is **UNKNOWN**, not a safe state.
- Code-capable does not imply executed; a shared trace ID is not causation; IAM grant does not establish delegation.
- AL2-style wrong target is an exact divergence only when the target identity, applied operation and witness can be bound. Earliest divergence is **not root cause**.
- Post-run token test is **not** pre-execution budget enforcement.
- Alert notification, approval acknowledgment and prevention are distinct from effect confirmation.
- A baseline novelty, including a new tool, is an **advisory change** without evidence of authorization violation.

## Scenario states

- **Expected baseline** (`STATE_1`): Intended target, approved scope, and target effect are present inside the synthetic fixture.
- **Evidence degraded** (`STATE_2`): Same logical behavior but target-side confirmation omitted; consequence is UNKNOWN.
- **Wrong-target** (`STATE_3`): Same request but independently simulated effect appears on the alternative target, producing an exact mismatch in the fictional data. Not a root-cause or motive claim.

All three labels are **declared scenario structure**, not assurance dispositions or active monitoring statuses. Replay state order must not be inferred from timestamps.

## Job scheduling

A browser timer or static HTML is not a durable activity source. A future optional **server-side synthetic runner** may create events in an isolated tenant database and expose an authenticated event-list API for dashboard polling. Trigger may be manual initially; scheduled Vercel Cron/GitHub Actions comes only after idempotency, tenancy, rate limits, expiry, replay controls, and `SYNTHETIC` environment guard are proven. No cron or production writes are enabled in this version.
