# HAIEC Manufacturing Source-Native Synthetic Evidence v3

This is a committed **nine-system, 36-case** synthetic evidence fixture for HAIEC canonical ingestion and fresh evaluations. It is not itself an assessment. Existing source-native v2 and 27 historical HAIEC evaluation exports remain unchanged.

## Content

- Nine `systems/<id>/` contracts with source-code-under-test, inert OpenAPI 3.0, AWS-style IAM policies, proposed operating envelopes and 24 source-labeled observations each (216 samples total).
- Four independently generated synthetic source scenarios per system: `EXPECTED_BASELINE`, `EVIDENCE_DEGRADED`, `WRONG_TARGET`, `REMEDIATED`. Every case contains separate source-role files for delegation/approval, IAM observation, OTLP trace, collector continuity, gateway-native transaction, target-native readback when available, and behavior history. Degraded cases intentionally omit the target-readback file and its OTLP span.
- `producer-registry.json` distinguishes simulated producer identities and source claims. **All simulated producers share a fictional laboratory trust root; HAIEC must qualify source roles independently.** No real factory IAM, independent customer custody, operational safety, or remote factory write is represented.
- `adversarial-inputs.json` holds negative mutation recipes, never expected detector decisions. This producer never imports golden scenarios, reference findings or evaluation exports.
- `manifest.json` pins every source file by SHA-256. `scan-plan.json` supplies per-case run identities and an exact HAIEC handoff sequence.

## Reproducibility

`node packages/fixtures/src/source-native-v3.cjs --check` compares all committed source files byte-for-byte with independent source generation. Running without `--check` generates the files. `npm test` validates digests, joins, span IDs, negative witness absence, 16 agent roles, 216 observations, a runnable in-memory client and exact case cardinalities. No external connections, credentials or npm dependencies are required.

## Methodologically correct assessment sequence

1. Pin Git SHA and `manifest.json` digests. Validate schema and source roles; inspect `scan-plan.json`.
2. Use isolated HAIEC manufacturing test organization with newly issued least-privilege secrets in a vault. Register synthetic claim producers in the canonical binder; do not map fixture-declared roles to provider-native authority.
3. Review and approve operating envelopes through HAIEC's actual approval API. Proposed envelopes are **not** automatically approved.
4. Run a **fresh v3 baseline** with a declared initial evidence subset. Add qualifying independent sources and run a separate **v3 enriched** evaluation against the same pinned source-case identity (separate immutable snapshot / receipt).
5. Evaluate `WRONG_TARGET`, `EVIDENCE_DEGRADED`, and `REMEDIATED` as distinct source runs; a remediation case shows a simulated denied diversion and corrected synthetic target readback, not a historical fix retroactively applied to an older case.
6. Export authentic HAIEC evaluation and report digests; compare to historical evaluations only with correct source-world/methodology provenance. Keep all 27 prior exports and report artifacts available as historical snapshots. Update dashboard separately after canonical evaluation.

### Source boundaries

- Candidate IAM allow means no verified effective AWS grant; OpenAPI declaration means no proven code reachability until code scan; business approval in a synthetic record means no approved HAIEC delegation; emitter transaction means no independent target witness.
- `REMEDIATED` labels describe the injected fictional scenario, not HAIEC PASS. Model/behavior novelty is advisory absent policy-evidence confirmation.
- No PLC/OT command execution, physical machine stops, production safety controls, customer data or secret material.
