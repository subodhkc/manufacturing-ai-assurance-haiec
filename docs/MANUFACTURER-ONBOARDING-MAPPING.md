# Manufacturer Onboarding Mapping — Configuration vs Source Integration

How a new manufacturing organization would use this demonstration's data contracts
and the HAIEC assurance engine for its own systems — and what does **not** exist today.

Status: **PROPOSED onboarding path**, built on TEST_VERIFIED components
(27 frozen evaluations + adapter, `packages/haiec-adapter/`). No customer
integration has been performed.

---

## 1. What is configuration (data you supply)

The demo's UI data contracts are manufacturer-agnostic. Nothing in
`packages/haiec-adapter` or the Sprint 14 dashboard pages hard-codes SYS-217 or
the Example Manufacturing Company — the adapter consumes whatever the
`haiec-evaluation-export-1.0.0` artifact carries. A new manufacturer replaces
these **data inputs**:

| Supplied as data | Demo example | Real manufacturer replaces with |
|---|---|---|
| System/asset/site inventory | `data/generated/estate.json` (9 fictional systems) | Its own AI system + asset register (id, site, line, operations, owner) |
| Source case set | `source:world` 27 synthetic cases (3 states × 9 systems) | Its own scenario set, or the same three-state shape (`EXPECTED_BASELINE` / `WRONG_TARGET` / `EVIDENCE_DEGRADED`) over real cases |
| Operation ↔ control mapping | `contracts/manufacturing/v0.1.0` operation families | Its operation names mapped to the same typed-claim vocabulary |
| Control catalog | `data/generated/controls.json` (45 entries) | Its control implementations (catalog ≠ implemented — keep the distinction) |
| Frozen export bundle | `dashboard/data/haiec-exports.js` built from `data/evaluations/` | Output of `scripts/export-manufacturing-evaluation.ts` run against **its own** HAIEC organization |
| Report links | `www.haiec.com` bearer-authorized URLs in each export | Same mechanism — links always resolve to the exact `evaluationId` and fail closed without authorization |

Nothing in the adapter layer needs code changes for a new manufacturer — only a
new export set and a new mapping table.

## 2. What is source integration (engineering, not config)

Real evidence ingestion requires work **inside HAIEC** (the `haiec-website`
repository), not in this repo:

| Step | Owner | Status |
|---|---|---|
| Environment binder + upstream producer registrations for the manufacturer's emitters | HAIEC SaaS | EXISTS — `lib/evidence/environment-binder.ts`; demo used `HMAC_SHA256_V2` producers |
| V2 payload-bound attestation at the emitter (HMAC over canonical payload digest + org/binder/identity) | Manufacturer's emitter code | CONTRACT READY — `haiec-upstream-proof-v2`; secret custody is server-side only |
| Structured record ingest matching the typed-claim vocabulary | HAIEC ingest service | EXISTS — canonical `IngestRecordRequest` path |
| Manufacturing rule adjudication (`MFG-AUTH-001`, `MFG-EFF-001`, `MFG-QMS-001`, …) | HAIEC | EXISTS — deterministic rule outcomes over qualified claims |
| Manufacturing control-maturity facet + UCP receipts | HAIEC | EXISTS — RECEIPT_BOUND rows appear in the frozen exports |
| Frozen export of the manufacturer's evaluations | `scripts/export-manufacturing-evaluation.ts` (HAIEC repo) | EXISTS — produces this repo's `data/evaluations/` shape |

The demo's 27 evaluations were produced by exactly this path: registered V2
producers → canonical ingest → manufacturing-qualified evaluation → persisted
Master Report products → digest-pinned export.

## 3. What the one-time manufacturing pack added

The generic-vs-manufacturing comparator study
([haiec.com/research/out-of-the-box-assurance](https://www.haiec.com/research/out-of-the-box-assurance))
measured precisely what the manufacturing enhancement adds over generic HAIEC:

- Qualified industrial source registration and typed claim semantics
- `MFG-*` deterministic rule adjudication
- Manufacturing control-maturity report facet
- Governed independent-effect evidence (UCP receipts) via V2 payload-bound
  attestation — two independently-authenticated emitters cannot be the same
  transport holding two labels

A new manufacturer does **not** re-derive this pack; it supplies its own source
registrations, binder ceilings, and claim vocabulary mapping (Section 1–2).

## 4. What is NOT supported today (fail-closed, not hidden)

| Integration | Status |
|---|---|
| OPC UA | NOT IMPLEMENTED — no adapter exists; do not present as available |
| MTConnect | NOT IMPLEMENTED |
| MQTT Sparkplug B | NOT IMPLEMENTED |
| B2MML / ISA-95 message ingest | NOT IMPLEMENTED |
| PLC/DCS direct write or interlock | NOT IMPLEMENTED — Station 217 is a local synthetic broker replay only |
| Live (non-frozen) dashboard binding to a customer org | NOT IMPLEMENTED — demo reads frozen exports only; authenticated links open HAIEC-hosted views |

If a manufacturer's only sources are OPC UA/MTConnect-native, the honest answer
today is **source integration required before ingestion** — the demo must not
imply otherwise.

## 5. Security boundaries that stay fixed

- Emitter secrets live only in HAIEC server-side storage; this repository
  contains no credentials and the dashboard verifies digests, never proofs.
- V1 identity-only attestation remains readable as historical evidence but
  cannot establish newly evaluated independent-effect proof.
- The adapter recomputes assurance never; mutation of any exported field —
  including a rule outcome — fails the payload digest and the browser labels
  the artifact `digest failed` rather than rendering tampered content.
