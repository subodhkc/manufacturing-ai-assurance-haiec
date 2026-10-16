# Sprint 28 — Implementation Status

Status: **shipped** (one consolidated PR; see repository history for commit/PR
identity). Sprint 28 closes the remaining decision-integrity gaps in the
Sprint 26/27 Digital Factory — all on the existing single policy path.

## Issues found and exact fixes

### 1. Purchase-order commit ordering (P0, real defect)

`commitOutcome()` applied `STATE.mes[r.mesKey] += v` **before**
`dfApplyOutcome()` checked supplier qualification, and the auto-PASS path had
no request object — so `(request && request.target) || 'REQ-2026-8842'`
silently defaulted the target. Result: an under-threshold PO to the expired
supplier could raise `poValue` while the ERP card showed a qualification hold,
and a PASS on `REQ-2026-8855` would have been applied to `REQ-2026-8842`.

**Fix, at the existing commit boundary** (`commitOutcome`, no new engine):

- `poId` resolves `meta.target || 'REQ-2026-8842'` once; every request, event
  (`ev.target`) and factory transition uses that resolved identity.
- For `PO` + auto-PASS (`mesKey='poValue'`), supplier qualification is
  evaluated **before** the effect commits via `dfPoQualifiedId(poId)`.
  Unqualified → the outcome is rewritten to `HELD` /
  `HELD_SUPPLIER_QUALIFICATION`, `mesKey` cleared (no `poValue` increment),
  and the ledger explanation states the two-gate distinction.
- `dfApplyOutcome` now uses `request.target || ev.target` — never a blind
  default.
- Verified by test: under-threshold PO to `VND-FST-118` (expired) leaves
  `poValue` at 0 and sets `HELD_SUPPLIER_QUALIFICATION`; the same amount to
  `VND-CST-042` (qualified) commits the correct PO.

### 2. Reviewer-role enforcement (P0)

`decide()` accepted any approval. Now every `REVIEW_REQUIRED` request carries
`requiredRole` (assigned in `commitOutcome` via `dfRequiredRole(sc, v)`):

| Scenario | Required fictional role |
|---|---|
| HOLD ≤ 50 | Quality Supervisor |
| HOLD > 50 | Plant Quality Manager |
| PO | Authorized Buyer |
| FORECAST | Production Planner |
| VISION | Quality Engineer |
| MAINT | Maintenance Manager |
| INCOMING_QC / WMS_HELD_SHIPMENT | Supplier Quality Engineer |

- The review dialog shows "Required reviewer" and a fictional-role selector.
- `decide(id, verdict, role)` reads the selector (or the param, for tests and
  the guide). A mismatched role produces a `ROLE_MISMATCH` ledger event, no
  state change, and the request stays `PENDING`; the modal stays open so the
  correct role can decide.
- The check runs **after** the prohibited-intent guard — no role can ever
  approve an MES write, a quality-hold release or a held-stock shipment.
- `requiredRole` / `decidedByRole` are recorded on the request and projected
  into the demonstration record and both report views.
- Explicitly scenario roleplay — not authenticated identity; HAIEC's real
  deployment-governance service is a separate, unchanged surface.

### 3. Hardened record import (P0)

`dfValidateRecord` now performs bounded structural validation:

- File cap 1.5 MB (`dfImportRecord` checks `file.size` and payload length);
  string fields capped at 4000 chars.
- Session IDs must match `SES-\d{4}`; anomaly mode must be `NORMAL` or a
  fixture program; fixture schema/plant pinned.
- Requests: unique `REV-####` IDs, valid statuses, known scenario intents,
  finite amounts, targets resolving to fixture identities; an `APPROVED`
  request on a prohibited intent is rejected as contradictory.
- Events: unique IDs, valid channel/session classification, `requestId`
  references must resolve.
- State sections: work-order/PO/supplier/lot/equipment IDs must exist in the
  fixture; `heldQty` bounded; a `COMMITTED` PO under an expired supplier is
  rejected as an impossible state.
- `evidence.publicReceipt` must be an `https://*.haiec.com/` URL.
- Imports remain read-only views — they cannot mutate `DF`/`STATE`, create
  decisions, or become reports. UI label: "Review saved demonstration record".

## Guided judge path (P1)

- Every step now shows its **expected result** and a live **baseline → now**
  delta table (held qty, PO statuses, committed value, contained count,
  equipment mode).
- **Duplicate-run guard**: `DF.guideDone` marks each step; "Run this step"
  disables after running — repeated clicks can't double-apply effects.
- **Role refusal is demonstrated inside the review dialog** (steps 2–3): the
  judge selects a wrong role, approves, sees the refusal, then approves with
  the required role.
- **Restart Demonstration** issues a proper session boundary
  (`dfResetSession`) and restarts the guide.
- Stepping forward warns about still-pending requests instead of silently
  leaving them.

## Reports (P1)

- `?report=demo`: requests table gains Required-reviewer / decided-by columns;
  a "Packaging for an executive report" section documents the operator-driven
  NotebookLM path (exported JSON + canonical case report + operating report +
  12-page PDF — no automatic upload).
- `?report=gov`: the request line now names required and acting roles.

## Validation

- New `sprint28-decision-integrity.test.cjs` — 10 tests covering every
  focused-acceptance item (commit-boundary gate both directions, role
  refusal/escalation, forbidden ops under any role, duplicate-run guard,
  malformed/contradictory imports, record↔report consistency).
- Full suite **209/209**. Playwright smoke **24/24**, zero console errors,
  mobile clean.
- 45 current + 27 historical evaluation files/digests byte-identical.

## Boundaries kept

No MES/ERP/PLC services, no second policy engine, no authenticated approval
service, no new assessment, no notification/enforcement integration; the
record is explicitly browser-local scenario output.
