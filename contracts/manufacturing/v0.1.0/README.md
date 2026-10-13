# HAIEC Manufacturing Semantic Pack v0.1.0 — public, proposed

**Status: CONTRACT SPECIFICATION / NOT HAIEC-REGISTERED / NOT AN ENGINE VERDICT.**

This folder formalizes [Research R-A](https://docs.google.com/document/d/1tsyu4YtZt1E9B1vETHoeuRpRCeFQHc6gZF4_zNECHMU/edit) (bounded ISA-95-inspired entities and relations) and [Research R-C](https://docs.google.com/document/d/1db6jg3jkNUVOZomB5B0VqmNnwk_N-2SpVrqND_KuCwI/edit) (deterministic detector rules). It is a *versioned public interface proposal*. Canonical HAIEC evidence admission, semantic state, scan/evaluation, U5/DAI, UCP and MCP remain in private `subodhkc/haiec-website` Main.

## Artifact inventory

| File | Function | Safe for HAIEC ingestion? |
| --- | --- | --- |
| `semantic-pack.json` | 37 entity kinds, 17 relation kinds, strict source/tenant identity, source qualification requirements, all nine systems' native operation/effect candidates, 10 ontology hard negatives | **NO**, until approved/qualified in canonical HAIEC |
| `detector-acceptance-spec.json` | Five P0 rule predicates, preconditions, execution wiring requirements, C0/C1/C2 release gates, seven deferred rules | **NO**, reference specification |
| `detector-acceptance-inputs.json` | 25 published fictional *source-only* acceptance inputs: positive, negative, insufficient, contradiction, foreign-vendor per rule | **NO** until explicitly registered synthetic qualification path, user consent and binder scope |
| `detector-acceptance-oracle.json` | Separate expected harness outcomes and forbidden conclusions; never sent to evidence intake | **NEVER** |

The test-only result vocabulary (`MATCH`, `NO_MATCH_WITH_ADEQUATE_COVERAGE`, `INSUFFICIENT_SOURCE`, `CONTRADICTED`) is **not** a proposed replacement for HAIEC's canonical findings/visibility/enforcement states. A future HAIEC adapter must map actual canonical statuses to the offline comparator accurately and keep source reasons.

## Version and immutable artifact digest

Use `node scripts/compare-manufacturing-detector-results.cjs --digests` from repository root to compute SHA-256 over **exact committed UTF-8 bytes**. Pin each digest with the HAIEC accepted `packId+version` and source-run/evaluation receipt. Any content change after release requires a new pack version and digest; never edit an active pack in place. At v0.1.0 this pack is not activated, so no matching HAIEC receipt exists.

The pack deliberately describes sample spelling such as `mes.work_order.update` but does **not** mark it as verified reachability, executable code, independent readback, approved authority or authorized alias. Station 217 `HOLD` versus `RELEASE` requires an exact typed action facet; a generic `update` name is insufficient. `vision.inspect` is not a QMS disposition; `cmms.work_request.create` is not a completed repair; product/application control effects must be admitted from separate sources.

## Run local **contract** checks, not detector execution

```bash
npm test
node scripts/compare-manufacturing-detector-results.cjs --digests
# This MUST return exit 2 until a real normalized HAIEC result exists:
node scripts/compare-manufacturing-detector-results.cjs
```

The static tests verify all nine product mappings, the ten source/identity hard negatives, the five rule definitions and all 25 input/oracle pairs. They **do not execute detector predicates**, qualify any source, or assert an HAIEC finding. The offline comparator is executable when an authenticated HAIEC acceptance process exports a fully populated result JSON.

Future example input to comparator (schema, not a passing fixture):

```json
{
  "schemaVersion": "haiec.manufacturing.acceptance-results/0.1",
  "origin": "CANONICAL_HAIEC_EVALUATION",
  "semanticPackSha256": "<from --digests, exactly matching semantic-pack.json>",
  "organizationId": "<server-authenticated-org>",
  "evaluationId": "<real-persisted-evaluation-id>",
  "runId": "<actual-run-id>",
  "sourceDigest": "<frozen-qualified-source-digest>",
  "cases": [
    {
      "caseId": "MFG-AUTH-001-POSITIVE",
      "ruleId": "MFG-AUTH-001",
      "evaluationId": "<same-real-evaluation-id>",
      "status": "MATCH",
      "sourceRefs": ["<qualified-source-evidence-ref>"],
      "sourceQualification": "SERVER_VERIFIED_QUALIFIED",
      "limitations": []
    }
  ]
}
```

An **offline comparison match is not proof** the file came from HAIEC. The acceptance owner must independently verify the authenticated organization and exact evaluation receipt, source producer identity, effective policy/permissions, frozen source/semantic pack SHA, and role-gated MCP/read API. The tool cannot independently authenticate a file.


## R-B/D/E/F/G/H implementation handoffs (research-to-development, additive)

The original `semantic-pack.json` and `detector-acceptance-*.json` bytes remain untouched; these six independent sibling specs are added under the same proposed v0.1.0 contract family. All are **design contracts**, not executed HAIEC manufacturing engine capabilities.

| Source research | Machine-readable contract | Developer handoff |
|---|---|---|
| R-B: seven workflows / nine effects | [operation-effect-contract.json](operation-effect-contract.json) | [R-B1 witness acceptance](https://docs.google.com/document/d/1x2_8ZZtHwNlrpaNL1gH2Wwr6wbOHZBkHlPwByhm2Kxs/edit) |
| R-D: OT trust boundary | [trust-boundary-acceptance.json](trust-boundary-acceptance.json) | [R-D1 security acceptance](https://docs.google.com/document/d/1kLr4jv--rfHoDKPOfp_f_eUmaOK5qQvXY2zvkiZMuhI/edit) |
| R-E: source class onboarding | [source-qualification-matrix.json](source-qualification-matrix.json) | [R-E1 source qualification](https://docs.google.com/document/d/1ycHRuI39ZKQuULZ0oau4ZX9XDBLVEUiv_m65t8osWoE/edit) |
| R-F: C0/C1/C2 benchmark | [independent-benchmark-protocol.json](independent-benchmark-protocol.json) | [R-F1 blind benchmark](https://docs.google.com/document/d/1xQEkeXxQMaIRcf36aAEcGZHPHA-tN36ZBqlk2GB-YMc/edit) |
| R-G: UCP/control maturity | [control-maturity-crosswalk.json](control-maturity-crosswalk.json) | [R-G1 control applicability](https://docs.google.com/document/d/1RcNEGBAXjbT6zxmx-a6PwN8C1tXWp_v-9cTRbnONGmw/edit) |
| R-H: judge/full product release | [product-release-acceptance.json](product-release-acceptance.json) | [R-H1 parity + release](https://docs.google.com/document/d/1PknOpgkLeG-6CmJhaI04FtHtIbJhgo_jzmWCgVrkr4M/edit) |

Focused `npm test` verifies contract structure, nine systems, 27 states, seven trust zones, 40 planned hard negatives, canonical catalog truth and ten dashboard view gates. **It does not run manufacturing detectors, a C2 blind benchmark, a UCP TestSpec or live HAIEC evaluation.**

To version-pin the additional six exact JSON files, compute SHA-256 over committed bytes (e.g. `sha256sum contracts/manufacturing/v0.1.0/{operation-effect-contract,trust-boundary-acceptance,source-qualification-matrix,independent-benchmark-protocol,control-maturity-crosswalk,product-release-acceptance}.json` on systems supporting shell brace expansion). The existing `--digests` comparator prints only the original four core artifacts, unchanged. A later semantic pack activation must explicitly freeze an inventory listing **all** accepted file digests; adding sibling specs does not auto-activate them.

**Release truth:** six research-to-development handoffs delivered, private HAIEC Main not modified, no genuine manufacturing findings or customer OT effect verified.

## HAIEC implementation targets (not included here)

1. Inspect frozen private Main `lib/evidence/adapters/intake-profiles.ts`, Foundry source contract, canonical source binder and `lib/ai-security/detection-evidence-batch.ts`. Define adapters for exact manufacturing source claims and rejected/unknown coverage.
2. Implement and prove a qualified source producer and typed runtime record classes before adding MFG rule metadata to the canonical catalog/runner.
3. Add **five P0 rules** in canonical engine only: MFG-AUTH-001, MFG-EFF-001, MFG-EFF-002, MFG-QMS-001, MFG-OBS-001. Do not mark them executable from this spec.
4. Require C0 hand-verified unit inputs, C1 nine-system synthetic reference events, and separately authored **sealed C2** different-manufacturer inputs and oracle. The five public foreign-vendor examples are **portability design cases**, not blind C2.
5. Perform isolated, consented HAIEC scans and persisted evaluations with eligible control tests. Enforce 27-case HTML parity against actual frozen results and expose unknown/incomplete evidence explicitly.

## Scientific and safety bounds

- R-A public source references: ISA-95 public 2025 metadata, OPC UA 10030 common object model, OPC UA Job Control 10031-4 v2; the proposal contains no licensed standard clauses, no certification claim and no presumption that v1/v2 namespaces match.
- R-C source requirements: every match has qualified producer identity, exact tenant/system/operation/target/transaction, versioned approved policy (where applicable), real static reachability or native effect evidence as applicable. `UNKNOWN != CLEAN`, `TOOL_NAME != CODE_REACHABLE`, `PERMISSION != DELEGATION`, `GATE_ALLOW != NATIVE_EFFECT`, `SOURCE_SILENCE != NO_ACTION`.
- No physical PLC/SCADA writes, industrial interlock, real factory protection or licensed ISA/IEC conformance is implemented by these files.
- No data from `data/generated/golden-scenarios.json`, illustrative `findings.json` or the separate oracle may be passed to a source-ingest producer.

**Baseline pin (research):** private HAIEC Main `548edfa3f809fac738dd1c8ba5b2846b897011bf`; manufacturing Main before this pack `5329d95afb7fa8fe9dc61ea99b07195f5525117b`. Revalidate when integrating.
