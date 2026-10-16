# Sprint 26 — Implementation Status

Status: **shipped** (one consolidated PR; see repository history for commit/PR
identity). Sprint 26 turns the dashboard into an interactive digital factory:
MES, ERP and virtual equipment panels all observe one browser-local state
seeded by a versioned fixture, and every visitor action flows through the
same local policy and ledger as the Decision Lab. No MES/ERP/PLC backends,
no second policy engine, no changes to the 45 current or 27 historical
saved evaluations.

## Reuse-versus-gap inventory (what was already there)

| Existing piece | Reused for |
|---|---|
| `policyVerdict` (extracted from `runScenario`) | The single local policy path — HOLD 3/40/60, MES deny, RELEASE deny, PO cap, supplier QC, WMS hold, FORECAST, VISION, SPEND — now shared by `runScenario()` **and** `factoryAttempt()`. |
| `commitOutcome` (extracted) | One funnel for bounded `STATE.mes` effects, `REV-####` review requests and `EV-####` ledger entries; calls `dfApplyOutcome` so factory and lab can never disagree. |
| `STATE.requests` / `decide()` / `openReview()` | Exact-action review lifecycle unchanged; `decide()` additionally calls `dfApplyDecision` so approvals land on the virtual plant. |
| `STATE.events` + `exportLedger()` | Append-only ledger; factory events carry `channel:'FACTORY'`, lab events `'LAB'`. |
| `SHARED` dossiers (`scenario-shared.js`) | Permitted/excluded scope copy on the factory page and HAIEC rail. |
| Sprint 24 `PLAY` controller | Unchanged; factory interaction ribbon is a separate state-driven element, not a competing playback. |

## What was added

- `data/demo-factory/digital-factory.json` — `demo-digital-factory-1.0.0`,
  `SIMULATION_ONLY`: 3 work orders, 3 suppliers, 1 PO proposal
  (`REQ-2026-8842`), 2 inventory lots, 3 equipment records, 3 anomaly
  programs. New identities (`EQ-*`, `VND-*`, `SI-*`) are defined once here.
- `scripts/build-factory-data.cjs` — emits `dashboard/data/digital-factory.js`;
  `--check` enforced in CI `validate`.
- `DF` state layer in `dashboard/index.html` — deterministic `dfRead(eqId, t)`
  readings (seeded sine offsets, anomaly deltas from the fixture, signal-loss
  state), `dfReset`, `dfSetMode`, virtual-clock tick (1.4 s), hidden-tab
  pause, reduced-motion honored.
- `pageFactory` — Digital Factory page (nav "DF"): MES panel (work orders,
  holds, per-WO attempt history, Attempt MES update / advisory / hold-release
  actions), ERP panel (PO commit → buyer review → commit, supplier
  qualification, held-lot + receiving-lot release attempts), equipment panel
  (torque/RPM/temp gauges, heartbeat, alarm/signal-loss states, anomaly
  buttons), interaction ribbon (proposed → boundary → review → outcome →
  ledger), HAIEC assurance & governance rail (SYS-217 scope, pending reviews,
  evidence links) and a single About-this-demonstration card.
- `?report=gov` — new **Digital Factory Operations** section: fixture baseline
  table + in-session ledger/requests, classified separately from
  digest-verified evaluations.

## Decision-path invariants (test-verified)

- HOLD: 3 → `PASS` (applied), 40 → `REVIEW_REQUIRED` (pending), 60 →
  `REVIEW_REQUIRED` (plant-manager path) — identical via lab and factory.
- `MES` write → `DENY`, work-order state preserved, attempt recorded on
  `WO-217-4802`.
- `RELEASE`/`WMS_HELD_SHIPMENT`/`INCOMING_QC` → `DENY`; held lots stay held.
- `PO` 86,500 → pending buyer review; `decide(APPROVED)` commits it.
- Anomaly programs emit exactly one `OBSERVED` ledger event per episode;
  `SOURCE_GAP` renders heartbeat `LOST` (unknown shown as unknown).
- Reset restores fixture baseline; the ledger remains append-only.
- Station 217 episodes stay distinct: recorded `WO-217-4803` divergence
  (saved evaluation) vs later held demo write (`DEMO-GW-SYS-217-02`).

## Validation

- `packages/haiec-adapter/tests/sprint26-digital-factory.test.cjs` — 13 tests.
- Full suite: 191/191 pass. Browser smoke (Playwright): 19/19 checks, zero
  page/console errors, including a desktop interaction chain
  (MES hold → advisory → PO review → anomaly → signal loss → restore →
  lab-run visibility in the shared ledger) and 390px mobile no-overflow.

## Boundaries kept

No MES/ERP/PLC service, no new assessment run, no persisted-evaluation or
digest changes, no notification/enforcement integration, no changes to the
Sprint 24 playback controller. Remaining gaps for a real connected-factory
pilot: live OT/ERP connectors, authenticated reviewer identities, real
notification dispatch, and production enforcement — all still labeled
demonstration in the UI copy.
