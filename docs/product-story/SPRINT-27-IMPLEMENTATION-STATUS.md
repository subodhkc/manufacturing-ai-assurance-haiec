# Sprint 27 — Implementation Status

Status: **shipped** (one consolidated PR; see repository history for commit/PR
identity). Sprint 27 hardens the Sprint 26 Digital Factory: cross-system
policy consistency, coordinated session reset, a portable demonstration
record and a guided judge path — all on the existing single policy path.

## Cross-system ERP consistency (fixed)

**Issue found:** buyer approval of `REQ-2026-8842` ($86,500, supplier
`VND-FST-118` PPAP_EXPIRED) committed the purchase order outright — financial
authority silently satisfied supplier qualification.

**Resolution:** two independent gates, still on the one `policyVerdict` /
`commitOutcome` / `decide` path.

- `decide()` approval of a PO now checks `dfPoQualified(req)` — the supplier's
  PPAP state on the targeted PO. Approved-but-unqualified → PO status
  `HELD_SUPPLIER_QUALIFICATION`, `STATE.mes.poValue` untouched, and a second
  ledger event ("Commitment held — supplier qualification unresolved")
  explains the distinction. Qualified → `COMMITTED` + bounded effect.
- `dfApplyOutcome` applies the same gate to the auto-pass path (PO ≤ cap with
  an expired supplier cannot commit either).
- The review dialog surfaces "Two independent gates apply" on unqualified-PO
  requests before the human decides.
- New fixture PO `REQ-2026-8855` ($38,900, `VND-CST-042` PPAP_CURRENT) gives
  the positive path: buyer approval commits it.
- Also fixed a stale-identity defect: `decide()`'s permitted list named
  `REQUEST_HOLD` while the HOLD scenario's intent is `REQUEST_CONTAINMENT` —
  supervisor approval of expanded containment was unreachable. Now permitted;
  `RELEASE_HOLD` remains forbidden (quality release is never
  reviewer-approvable in the demo).

## Session reconciliation (Reset Demonstration Session)

`dfResetSession()` (the "Reset session" control):

- Issues a new deterministic session identity `SES-####`.
- Restores `DF` baseline **and** `STATE.mes` counters together.
- Marks prior pending requests `SESSION_CLOSED`; `decide()` fails closed on a
  request whose session doesn't match the active one — old approvals can
  never mutate a new session.
- Resets anomaly mode/tick/guide state; emits one `SESSION_BOUNDARY` ledger
  event; the append-only ledger keeps prior-session entries (labeled "prior
  session" in the feed).
- Seeded baseline events (`FCT-*`, `FAC-SYS-*`) carry `session:null` and are
  classified as fixture history in reports — never session activity.

## Portable demonstration record

- `demoRecord()` → `demo-factory-record-1.0.0`
  (`BROWSER_LOCAL_DEMONSTRATION_RECORD_NOT_HAIEC_ISSUED`): session identity,
  fixture/policy versions, baseline vs current state, proposed operations,
  review requests with outcomes, full event ledger (session/channel tagged),
  equipment readings, session boundaries, evidence links
  (`SYS-217-WRONG_TARGET` + public receipt URL).
- "Export record" downloads `haiec-demo-record-SES-####.json`.
- `?report=demo` renders the readable projection (signature NOT_APPLICABLE,
  print row reused); a Reports Hub tile links it.
- "Import record" validates the schema via `dfValidateRecord` and loads it
  read-only into the record view — imported data cannot create decisions or
  reports.

## Guided judge path

"Guided demonstration" on the factory page — 7 steps, each calling the same
functions the buttons call: HOLD 3 (applied) → HOLD 40 (review modal opens,
approve to apply) → HOLD 60 (PQM pending) → MES write (held) → PO pair
(held on qualification, then qualified commit) → torque anomaly + signal loss
(OBSERVED events) → record export. Steps auto-open the review dialog when a
request is created; progress chips mark position.

## `?report=gov` upgrade

Digital Factory Operations now shows the **current session**: baseline →
resulting state per record with deltas, session-scoped requests/events, prior
sessions explicitly excluded, seeded-baseline events classified, link to the
full demonstration record.

## Validation

- `sprint27-factory-integrity.test.cjs` — 8 tests (fixture pairing, second
  gate, session reset/closure, record reproduction + validation, guide run,
  permitted-target isolation, report wiring).
- Full suite: **199/199**. Playwright smoke: **20/20** including the two-gate
  PO flow, session reset and record export — zero console errors, mobile clean.

## Boundaries kept

No MES/ERP/PLC services, no second policy engine, no new assessment run, no
notification/enforcement integration; 45+27 saved evaluations byte-identical.
