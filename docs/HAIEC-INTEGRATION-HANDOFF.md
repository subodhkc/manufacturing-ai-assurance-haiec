# HAIEC reusable components and planned bridge

**Do not fork or transplant HAIEC's core engine into this repository.** Keep this repository a fixture/golden-oracle/buyer-demo producer and call canonical HAIEC API/MCP from a separate adapter.

## Verified source anchors (HAIEC `Main`)

- `lib/evidence/adapters/structured-event-adapter.ts`: `normalizeStructuredRecord` is the strict caller-owned record intake; event time, source, event ID and target must be specified.
- `lib/evidence/evidence-contract.ts`: transient `EvidenceEnvelope`, `ScenarioBinding`, source authority and evidence limitations.
- `lib/evidence/adapters/intake-profiles.ts`: the one canonical intake-profile owner. Do not create a competing normalization layer.
- `lib/forensics/scenario-reconstruction.ts`: exact scenario bindings, explicit state order, no timestamp inference, ≥2 states.
- `lib/forensics/scenario-investigation-index.ts`: source-bound scenario discovery, not active lifecycle state.
- `lib/assurance/dai-evaluation.ts`: evidence-qualified, deterministic nine-dimension comparison.
- `lib/assurance/operating-envelope.ts`: only approved versioned envelopes establish policy authority.
- `lib/assurance/action-witness.ts`: trace does not equal applied/confirmed effect.
- `lib/assurance/effect-envelope-comparison.ts`: measured before/after bound comparison, not a safety score.
- `lib/evidence/runtime-drift-projection.ts`, `lib/ai-security/baseline-state-compute.ts`: exact source-bound runtime change and baseline readiness, not autonomous maliciousness verdicts.
- `lib/control-test/evaluate-acn-cost-001.ts`: qualified post-run token budget test.
- `lib/assurance/reporting-projection-bundle.ts`: evaluation-bound multi-audience reports.
- `lib/mcp/ide-tools.ts`, `lib/mcp/server.ts`: existing tenant-scoped tool orchestration, `haiec_prepare_scenario`, `haiec_prepare_scenario_capture`, `haiec_get_scenario_status`, `haiec_reconstruct_scenario`, `haiec_compare_scenario_states`, `haiec_ingest_structured`, `haiec_run_assurance`.

## Next connector slice

1. Use a dedicated isolated synthetic test organization and limited-scope credentials in secrets store; never embed secrets in the HTML or repository.
2. Verify `packages/fixtures/src/export-haiec-candidates.cjs` against HAIEC's current `StructuredRecordInput`/typed profiles and test failing records. It emits **candidate** inputs with explicit source/event/target/clock/sequence, not qualified authority.
3. Submit the permitted source records using an authenticated `haiec_ingest_structured` call with explicit user confirmation where required. Do not infer source qualification merely from 200/202.
4. Verify each run's **exact scenario-bound** evidence count and source coverage before reconstruction. Preserve all three state labels and caller-declared ordering.
5. Run canonical HAIEC assurance after evidence admission and compare full qualified results to independent expected manifests without silent coercion. Save run/evaluation/bundle identities.
6. Replace individual dashboard fixture report projections with genuine saved, tenant-bound report references only after these are established.

## Out of scope for initial skeleton

No production plant connectivity; no cron; no automatic external email; no human approval as fake evidence; no active equipment writes; no changes to HAIEC `Main`; no customer-specific IAM/ERP adapters; no claim that all 45 catalog entries are implemented controls.
