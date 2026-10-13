# HAIEC Manufacturing AI Assurance — Fixture-First Reference

**Fictional manufacturer · synthetic source records · independently authored expected outcomes · judge-facing interactive UX**

This repository is the independent manufacturing data and UX reference for the **Example Manufacturing Company**. It provides nine AI systems, sixteen agent roles, seven manufacturing workflows, a 45-entry control catalog, twelve scenario definitions and 27 three-condition test fixtures (39 scenario cases total), nine baseline findings and sixteen agent report examples.

The purpose is to test **what HAIEC can discover and establish from connected evidence**, including additional source, authority, approval and effect data that customers may choose to provide. This project does not create an alternative HAIEC assurance engine.

## Local start (Node.js 22+; no dependencies)

```bash
npm run verify
```

`npm run export:haiec-candidates` writes separately labeled candidate-only structured records for a future HAIEC ingestion acceptance test.

`npm run generate` regenerates `data/generated/*.json`. `npm test` runs the independent integrity and behavior tests. `npm run check:fixtures` fails if committed output drifts from deterministic generation.

Open [`dashboard/index.html`](dashboard/index.html) directly for the self-contained judge UI. It is static and still renders its embedded v7.2 data; tying it to generated source events and genuine HAIEC evaluations is a **separate implementation step**, not silently represented as complete.

## Station 217: executable synthetic action control (new)

Run `npm run demo:station217 > station217-replay.json` for a deterministic 3/40/51-engine hold, denied release, wrong-target and missing-witness replay. This new CLI fixture has a fail-closed local policy broker, distinct private MES target ledger and independent assertions. It is **not wired into v7.2 HTML**, not a customer/HAIEC evaluation, and not safe as a public action API without authenticated server mediation. See [Station 217 acceptance and remaining integration gates](docs/STATION217-ACCEPTANCE.md).

## Evidence and results

| File | Contents |
|---|---|
| `data/generated/estate.json` | Fictional manufacturer, nine systems, 37 scoped evidence-feed entries, accountabilities and AI spending |
| `agents.json` | All 16 agent roles, individually scoped tool capabilities, monitoring and control references |
| `workflows.json` | All seven manufacturing workflows, including separate Supplier Quality and Warehouse |
| `controls.json` | Full 45 catalog entries and truthful catalog/implementation distinction |
| `findings.json` | Nine **expected findings** with source qualification gaps and prohibited conclusions |
| `golden-scenarios.json` | 27 controlled expected/degraded/wrong-target synthetic input/event cases |
| `decision-scenarios.json` | The 10 existing UI cases and two expanded incoming-QMS/WMS cases |
| `behavior-baselines.json` | 16 reproducible token baselines and advisory-only anomaly examples |
| `agent-reports.json` | 16 agent-specific **illustrative** reports, not HAIEC-issued assessment receipts |
| `monitoring.json` | 9 example alerts, 37 source-freshness expectations, and advisory baseline signals |
| `manifest.json` | Stable counts and sha256 output identities |

## Domain corrections incorporated

- Protective torque containment **escalates with quantity**; quality-held product release requires distinct Quality authority.
- Supplier Quality is distinct from procurement; receiving lot release depends on supplier-part-site/revision, PPAP and QMS.
- Warehouse picks and shipments are not purchase orders. Shipment of quality-held lots requires QMS release and WMS actor attribution.
- Vision defect prevalence is not identical to false-accept/false-reject model drift.
- Predictive maintenance recommendation, CMMS acceptance, work execution and return to service are separate phases.
- Dyno system is Test Engineering; 19 code-accessible setpoints versus three delegated parameters are an **exposure**, not proof of an applied command.
- Schedule pilot remains blocked when write mediation and MES/APS effect witness are not established.
- The estate's nine recorded monthly inference costs sum to **$44,100**, replacing an older contradictory $48,200 label.

## Non-negotiable assurance boundaries

`CAPABILITY != EFFECT` · `PERMISSION != DELEGATION` · `ALERT != PREVENTION` · `UNKNOWN != PASS` · `BASELINE_NOVELTY != POLICY_VIOLATION` · `SCENARIO_LABEL != HAIEC_VERDICT`.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/HAIEC-INTEGRATION-HANDOFF.md`](docs/HAIEC-INTEGRATION-HANDOFF.md).

This repository does **not** contain customer data, customer credentials, executable plant commands, auto-deploy to HAIEC Main, active email delivery, or cron-scheduled writes.
