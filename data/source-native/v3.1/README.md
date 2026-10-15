# HAIEC Manufacturing Synthetic Evidence v3.1

**Status:** source-producer enhancement, not a canonical HAIEC assessment. This is a **new additive layer** over v3 (PR #17, main `eda7a6f6`). The existing 27 evaluations, v2 SYS-217 pack, original v3 files and original sample reports are intentionally unchanged. A source profile being schema-valid **never** establishes HAIEC authority, IAM grant, code capability or a native customer effect.

## What changed

* **9 manufacturer AI systems / 36 runs / 216 domain-specific measurements:** torque Nm, vision defect-score plus independently seeded label/prediction comparisons (there are **no actual camera image bytes**), demand units, inventory, vibration, supplier-quality defects, plan capacity, emulator dyno torque and warehouse stock. Domain context includes site/agent/workflow/operation, revision, source role and scope.
* **Native registered manufacturing profiles** under `cases/<system>/<state>/profiled/` and static `systems/<system>/source-code-candidate.json`. For each run: business approval candidate, IAM candidate (effective:false, not provider-proven), requested+dispatched gateway records, eligible MES/QMS/ERP/APS/WMS/CMMS native commit/readback, and collector continuity. DYN412 controller-effect profile remains explicitly DEFERRED; its simulator ledger from v3 is **not** mislabeled as a MES/QMS or ERP source.
* **9 separate remedied simulations** with a blocked wrong-target attempt, independent-in-simulator no-mutation witness and corrected authorized-target receipt. All three share one fictional lab custody root and do not prove live preventive enforcement.
* **14 materialized adversarial source records** (not only textual mutation recipes), including foreign tenant/site, source-hash drift, actor/approval replay, future timestamp, forged authoritative role, A2A scope expansion and deny-then-mutate contradictions.
* **5 profile registry entries**: manufacturing plus 4 fictional industry simulation-only profiles (electrical assembly, rail, electronics, supplier network). None is evidence of a panel company partnership; optional profiles contain no HAIEC report IDs.

## Deterministic generation and checks

```bash
node scripts/generate-source-native-v3-1.cjs --check
npm test
npm run check:fixtures
```

The manifest lists SHA-256 hashes of each generated source file and the upstream v3 manifest digest. Regeneration without `--check` is for fixture authors; do not overwrite prior packs. Never import expected-findings into a source producer.

## Exact HAIEC intake handoff

1. Pin the v3.1 SHA manifest and run `--check`. Open `scan-plan.json`, `producer-registry.json` and each `cases/<id>/<state>/index.json`.
2. In a protected integration job, replace **`SYNTHETIC_ORG_REBIND_AT_HAIEC_INTAKE`** with the authenticated test tenant's actual organization ID. Bind exact aiSystemId, runId, principal, transaction, resource and source registration; never accept the caller's organization claim as authority.
3. Use HAIEC's registered `manufacturing_source` intake on **`profiled/*.json`**, not the untyped v3 `case.json`, native JSON or domain supplement files. The registered profiles are `OPENAPI_3_JSON_PINNED`, `manufacturing_policy_iam_v1`, `manufacturing_action_event_v1`, `manufacturing_mes_qms_state_v1`, `manufacturing_business_transaction_v1` and `manufacturing_collector_continuity_v1`. Use HAIEC `otel` intake for v3 `telemetry/otlp-traces.json`; do not interpret OTLP tool HTTP 200 as a native effect.
4. Provider IAM is deliberately **not verified**. Business approvals are simulated **candidates**, not an HAIEC approved Operating Envelope. The producer registry does not contain a real attestation or secret. HAIEC must register source identities, verify any producer attestation, explicitly approve policies and bind eligible claim roles server-side before issuing evaluated findings.
5. Run new immutable initial-source then enriched-source snapshots for the same source run; no receipt or earlier evaluation ID may be replaced. Separately evaluate WRONG_TARGET, EVIDENCE_DEGRADED and REMEDIATED. More evidence != a fixed operational state.
6. Save true org-scoped persisted evaluation IDs, report digests and evidence/source limitations. The dashboard can display updated HAIEC findings only after verified canonical exports; all profile-only scenarios stay labeled SIMULATION ONLY.

## Non-goals and constraints

No real plant actuation, PLC control, customer telemetry, customer panel brands, physically enforced interlock, native IAM trust proof or live SaaS execution happens in this public repository. `REMEDIATED` is a source-fixture scenario label, not an automatic PASS. Industrial protocols OPC UA, MTConnect, Sparkplug B and B2MML have deferred authoritative profile support. Code capability requires separate static reachability analysis against pinned source. A denial without a qualified target no-effect witness does not prove prevention. This release enhances the **input pack** only; Devin's tenant-backed HAIEC assessments and dashboard/report refresh are subsequent work.
