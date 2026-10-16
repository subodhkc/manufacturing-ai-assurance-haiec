# Sprint 25 — Implementation Status

Status: **shipped** (one consolidated PR; see repository history for commit/PR
identity). This file records what actually shipped against
`SYNTHETIC-CONTROL-DEMO-ACCEPTANCE-AND-S25-STORYBOARD.md` and the master
showcase contract.

## What shipped

| Requirement | Where |
|---|---|
| Station 217 two linked episodes | `scripts/build-scenario-shared.cjs` → `journey.SYS-217` now emits `RECORDED_MISMATCH_DETECTED` (evaluation ref `SYS-217-WRONG_TARGET`, Oct 14 recorded evidence) then `SUBSEQUENT_WRITE_HELD` (attempt `DEMO-GW-SYS-217-02`, Oct 15 demo gateway hold) while `DEMO-REQ-SYS-217-06` stays pending and advisory work continues. Rendered on the governance page (`.s217-eps` two-panel block), the flagship report (`?report=s217`) and the operating report. |
| Seven-facet readiness | `data/demo-governance/scenario-readiness.json` (`scenario-readiness-1.0.0`, `SIMULATION_ONLY`) — honest authored states bound to named sources; rendered via `govReadinessTable()` on the governance page and in `?report=s217`; printable one-pager at `dashboard/report/supporting/station-217-readiness.html`. Not a mandatory customer lifecycle. |
| Twelve-page visual report | `dashboard/report/supporting/haiec-12p.html` + `haiec-12p.pdf`, generated deterministically by `scripts/build-supporting-report.cjs` from `scenario-shared.json` + the export bundle. Nine unique system cards; `NOT AN ISSUED ASSURANCE REPORT` on every page footer. |
| Enterprise Operating & Governance Report | `dashboard/report/reports.js` → `rpGov()` (deep link `?report=gov`): nine-system scope/decision/reviewer/monitoring table, Station 217 two-event section, next actions, real-vs-authored provenance. Signature SKIPPED — a presentation derivative, not an issued report. |
| Full capability overview | `exModCapabilities()` on the Command Center exec page — six selectable goal tiles (Discover · Evaluate · Authorize · Monitor · Protect · Verify) under Understand / Assure / Govern & Operate, each linking an existing view. |
| Playback extension | Sprint 24 controller unchanged; the 217 journey script gained the two episode event types. All controls, hidden-tab pause and reduced-motion behavior preserved. |

## Real vs authored

- **Real HAIEC output:** the 45 digest-verified v3 evaluations (all REVIEW),
  the public receipt, report lineage/digests. Unchanged by this sprint.
- **Authored demonstration:** fictional reviewer roles and decisions, email/SMS
  previews, monitoring states on the fixed 2026-10-15 clock, the demonstration
  gateway hold, the readiness facet states, both supporting documents.

## Regeneration

```
node scripts/build-scenario-shared.cjs        # shared artifact + dashboard bundle
node scripts/build-supporting-report.cjs      # readiness one-pager + 12p HTML
```

Both support `--check` (enforced in CI `validate`). The PDF is produced by
printing `haiec-12p.html` via a headless browser (A4) — regenerate it after
changing the generator.

## Tests

`packages/haiec-adapter/tests/sprint25-showcase.test.cjs` — fixture integrity,
two-episode identity ordering, supporting-package classification, hub wiring.
Full suite: 178/178.
