# SYS-217 Source-Native Evidence Pack v2

**Purpose:** realistic, reproducible synthetic manufacturing evidence to exercise HAIEC's real engine integrations, without using expected outcomes as evidence.

This is a new versioned source program, **not the frozen 27-case evaluation corpus**. Original source run: `syn-world-sys-217-wrong_target`. New source-native run: `syn-world-v2-sys-217-wrong_target`. No original eval ID or digest is replaced. Both sets remain available for a defensible before/after comparison.

## Source families

- `authority/`: proposed operating envelope + simulated business approval/delegation record (HAIEC approval still required).
- `iam/`: AWS-style policy + bounded candidate permission observation (AWS grants NOT provider-established).
- `code/`: OpenAPI 3.0 and a standalone in-memory test agent with an actual injectable call path (reachability must be checked by HAIEC).
- `telemetry/`: OTLP JSON request, approval, dispatch, MES and QMS spans with valid IDs and nanosecond timestamps; continuity plus degraded negative cases (not a live connected collector).
- `native/`: distinct synthetic MES transaction and QMS readback records, with declared common-custody limitation.
- `deployment/`: runtime/build claim with explicit missing immutable image/source provenance.

`manifest.json` captures per-file SHA-256 digests and source roles. A source record is not automatically a qualified HAIEC claim; qualification needs registered producer, environment binder, appropriate attestation and exact scenario binding. Individual files are fixture inputs, NOT issued DAI, DCD, IAM, five-plane or U5 outcomes.

## Important execution ordering

1. **Source preparation**: validate this pack and the negative cases with `npm test`. Do not feed oracle-authored `golden-scenarios.json` or `expected-findings.cjs` into evidence intake.
2. **HAIEC integration**: review and approve the candidate envelope through HAIEC's versioned approval mechanism; route code, IAM and telemetry to the *respective* existing producers, recording their actual evidence strength.
3. **New baseline evaluation**: run a fresh versioned assessment with the disclosed initial source subset.
4. **Enriched evaluation**: add qualified eligible sources and run another immutable assessment; distinguish additional evidence from operational remediation.
5. **Reporting**: only HAIEC creates assurance findings, DAI, DCD and signed/verified issued report products. Neither the synthetic pack nor this repository can self-certify those outcomes.

## Safety and provenance

Entirely synthetic. No credentials, production endpoints, plant actuation or customer data. Example AWS account ID `000000000000` and `synthetic.invalid` are inert identifiers. The candidate policy's broad API wildcard is intentionally included as a **candidate exposure** to be investigated; it is not a canonical security violation without a qualified grant and approved delegation. The in-memory code client performs no network activity. The OTLP timestamps are **new v2 simulated times**, not replayed exact timestamps from the historical v1 evaluation.

## Optional open-source tools (not bundled)

Consider official OpenTelemetry JS SDK/OTLP exporter to instrument the synthetic agent once HAIEC's ingestion adapter contract is resolved. Collector Contrib can be added for an isolated local replay, subject to pinning and licensing review. Consider Cedar *or* OPA for policy-structure fixtures only if the platform's own boundary contracts cannot generate the required test cases. Do not add dependencies solely to make the fixture look operational.
