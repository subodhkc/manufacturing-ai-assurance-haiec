# HAIEC Manufacturing AI Assurance — Fixture-First Reference

**Fictional manufacturer · source-only input world isolated from expected outcomes · judge-facing reference UX**

This repository is the independent manufacturing data and UX reference for the **Example Manufacturing Company**. It provides nine AI systems, sixteen agent roles, seven manufacturing workflows, a 45-entry control catalog, twelve scenario definitions and 27 three-condition test fixtures (39 scenario cases total), nine baseline findings and sixteen agent report examples.

The purpose is to test **what HAIEC can discover and establish from connected evidence**, including additional source, authority, approval and effect data that customers may choose to provide. This project does not create an alternative HAIEC assurance engine.

## Devin / HackFW governing plan (GitHub mirror)

The complete HackFW Master v2.4 + v2.5, source-native v3.1, and multi-industry/telecom Google Drive plan texts are mirrored at **[docs/hackfw/](docs/hackfw/README.md)**. Start with **[Devin's repo-native handoff](docs/hackfw/DEVIN_START_HERE.md)** and the [enhanced v2.6 execution overlay](docs/hackfw/ENHANCED_EXECUTION_PLAN_v2.6.md) for current gaps, source-truth boundaries, security gates, ownership and the correct next implementation sequence. The three Drive source snapshots are preserved, not silently overwritten.

## Local start (Node.js 22+; no dependencies)

```bash
npm run verify
```

**Oracle independence / source-of-truth boundary:** \`npm run source:world > source-world.json\` emits 27 raw, source-only fictional cases covering all nine systems, with 153 event records. \`npm run export:haiec-candidates\` exports **unqualified** candidates from that independent producer, never from \`golden-scenarios.json\`, \`expected-findings.cjs\`, example findings or reports. The exporter-generated \`data/generated/haiec-ingest-candidates.json\` is deliberately not committed. \`npm run test:oracle\` proves that changing the oracle cannot alter either the produced world or exported candidates. Neither run is a real HAIEC evaluation.

**Legacy artifact distinction:** \`npm run generate\` still regenerates the historical *reference/presentation artifacts*, including oracle-authored expected findings, golden storyboards, and illustrative reports. They are **not admissible source inputs** to a HAIEC integration and must not be fed into evidence intake. In this slice, input/oracle independence is implemented at the *acceptance data boundary*; the older presentation generator has not been rewritten into a wholly oracle-free producer.

`npm run generate` regenerates the tracked **illustrative** reference artifacts only. `npm test` runs the independent integrity and behavior tests. `npm run check:fixtures` fails if committed output drifts from deterministic generation.

**Live deployment:** https://haiec-manufacturing-demo.vercel.app — static Vercel deployment of `dashboard/` (project `haiec-manufacturing-demo`, built by `node scripts/build-dashboard-data.cjs`). Branded domain `manufacturing.haiec.com` is associated with the Vercel project and goes live once its DNS CNAME record is published.

**Public sample report (Sprint 14.2):** [`dashboard/report/sample-master-report.html`](dashboard/report/sample-master-report.html) (+ `.pdf`) is a frozen public-safe derivative of the genuine persisted SYS-217 wrong-target evaluation `bce94772-df56-447b-8625-0646915f7e25:assurance:1.1` — rendered verbatim from the digest-verified export by `scripts/build-sample-report.cjs` (regenerated on every build; the build fails if the export digest or the committed PDF is invalid). It retains the exact evaluation identity, rule outcomes, control-maturity facet, UCP receipt state, digests and limitations; it redacts internal identities. The original HTML/PDF remain behind HAIEC authorization — links on the case page open them for authorized org members only.

**Demo email notifications:** the dashboard's "Send test email" action POSTs to `https://www.haiec.com/api/demo/manufacturing/notify` — a HAIEC-hosted endpoint that enforces an origin allowlist, a recipient allowlist (`MFG_DEMO_EMAIL_ALLOWLIST`), fixed synthetic-labeled templates, consent flag, and rate limits. Non-allowlisted recipients are refused, never silently dropped. Status is honest: `ACCEPTED_BY_PROVIDER` is not delivery.

**60-second evidence replay:** implemented (Mode A) on the dashboard's **Evidence Replay** page — eight deterministic stages over ~60s using the canonical source-world records (`syn-world-sys-217-wrong_target`, digest-pinned) plus the persisted evaluation. Spec: [`docs/60-SECOND-EVIDENCE-REPLAY.md`](docs/60-SECOND-EVIDENCE-REPLAY.md). Mode B (live monitoring) remains deferred.

**Executive Command Center:** the dashboard's default landing page — a bento view (estate, five evidence planes, assurance posture + evidence-integrity panel, consequence graph with manufacturing-impact context, Delegated Action Integrity engine visibility, proof frontier, recorded timeline, demonstrated-corpus and telecom→manufacturing story) rendered pass-through from the verified SYS-217 wrong-target export. The dark Technical Console theme applies to this page only. Field-level source mapping: [`docs/EXEC-COMMAND-CENTER-FIELD-MAP.md`](docs/EXEC-COMMAND-CENTER-FIELD-MAP.md). A separate pitch home with concept visuals, the pitch video and the deck lives at [`dashboard/home.html`](dashboard/home.html).

Open [`dashboard/index.html`](dashboard/index.html) directly for the self-contained judge UI. The **HAIEC Assurance** and **Station 217** pages now consume genuine frozen HAIEC evaluation exports through a read-only adapter — see [Genuine HAIEC evaluation integration](#genuine-haiec-evaluation-integration-frozen-offline-mode). All other pages still render their embedded v7.2 illustrative data.


## Operator Action Assurance — six-stage judged walkthrough (v2.5)

Open [the deployed manufacturing demo](https://haiec-manufacturing-demo.vercel.app/) and choose **Operator Journey**. The guide follows **Detect → Investigate → Authorize → Contain → Verify → Report** and links to the existing 60-second Evidence Replay, SYS-217 evaluated case and public sample Master Assurance Report. See [the scoped UX, control and OWASP release plan](docs/OPERATOR-ACTION-ASSURANCE-UX-V2.5.md).

**Critical source split:** Detection, rule `MFG-EFF-001 MATCH`, `REVIEW`, target `WO-217-4802 → WO-217-4803` and R01 `SATISFIED / RECEIPT_BOUND` are read from a **historical, SHA-256 verified persisted HAIEC evaluation of fictional manufacturing data**. The “Authorize” screen is a proposed human-response checklist, not a new delegated authorization. “Contain” is an **in-memory, browser-only fictional dispatch pause**; a local `SIMULATED_DENY` is not a HAIEC kill switch, tool boundary or native effect witness. “Verify” explicitly leaves post-response enforcement `NOT ESTABLISHED`; the old R01 receipt does not qualify new remediation. No live production monitoring, OT actuation, new evaluation, framework certification or signed report is performed by this page.

This feature does not modify HAIEC's private engine, manufacturing v1 exports, v3.1 candidate fixtures, 27 frozen digests, or existing industry-specific evidence modes. A focused test checks six stages, simulated response isolation and fail-closed export rendering. A live browser QA pass is still required for visual interaction acceptance.

## Multi-industry presentation (HackFW v2.4)

Open the **Industry Experiences** navigation item in the same [manufacturing demo](https://haiec-manufacturing-demo.vercel.app/), or use `?industry=telecom` for the historical TM Forum-reference view. One shared dashboard shell renders Manufacturing, Telecommunications, Electrical Equipment, Rail & Transportation, Electronics / AI Infrastructure and Supplier Network. The organization/profile selector is fictional and profile-scoped.

Manufacturing remains the only industry with genuine frozen persisted HAIEC evaluations (historical source-world v1; **not** v3.1 evaluations). Telecommunications reconstructs the original TM Forum demonstration as a **historical reference only**, with interactive AL0/AL1/AL2 scenario states but no newly issued HAIEC findings. The four other sectors render `SIMULATION_ONLY` consequence stories from independent v3.1 fictional source events; no source profile can inherit another industry's evaluation, approval, receipt or report. No actual operator, company, event judge or corporate partnership is claimed.

The data is built by `node scripts/build-industry-data.cjs` from `data/industry/` and `data/source-native/v3.1/profiles/`. See [industry release and truth contract](docs/INDUSTRY-DASHBOARD-RELEASE.md). Industrial real estate remains backlog.

## Manufacturing Semantic Pack v0.1.0 (proposed, not HAIEC-registered)

[Versioned semantic contract and executable acceptance **specification**](contracts/manufacturing/v0.1.0/README.md) cover all nine systems, evidence-qualified typed identity, 5 P0 rule predicates and 25 oracle-separated public test cases. Run `npm test` for **spec integrity** or `node scripts/compare-manufacturing-detector-results.cjs --digests` to print exact SHA-256 identities. **Update (Sprint 14):** canonical HAIEC manufacturing detection, source qualification and persisted evaluation now exist — 27 digest-pinned evaluations live under `data/evaluations/` and render on the dashboard's HAIEC Assurance page. The v0.1.0-format blind C2 comparator remains intentionally unrun and fails closed.

## Station 217: executable synthetic action control (new)

Run `npm run demo:station217 > station217-replay.json` for a deterministic 3/40/51-engine hold, denied release, wrong-target and missing-witness replay. This CLI fixture has a fail-closed local policy broker, distinct private MES target ledger and independent assertions. It is now wired into the dashboard's **Station 217** page as a read-only replay presentation (via `packages/station217/src/export-bundle.cjs` → `dashboard/data/`); no browser action is a factory authorization or prevention mechanism. It is not a customer/HAIEC evaluation and not safe as a public action API without authenticated server mediation. See [Station 217 acceptance and remaining integration gates](docs/STATION217-ACCEPTANCE.md).

## Genuine HAIEC evaluation integration (frozen offline mode)

The dashboard's **HAIEC Assurance** page is driven by 27 real, persisted HAIEC evaluations of the independent synthetic source world (9 systems × 3 states), produced by the canonical HAIEC assurance engine on the `haiec-website` repository and exported digest-pinned under `data/evaluations/` (+ `manifest.json`).

- `packages/haiec-adapter/` — the read-only presentation adapter (`haiec-evaluation-export-1.0.0` contract, `contracts/haiec-evaluation-export/`). It validates schema, recomputes the canonical payload digest, and projects verbatim — it never recomputes dispositions, and a single mutated field fails the digest check both in tests and in the browser.
- `scripts/build-dashboard-data.cjs` — re-verifies every export, then emits `dashboard/data/haiec-exports.js` (~479 KB static bundle; works over `file://` and static hosting).
- Every displayed value is pass-through from a verified export or an explicit unavailable marker; synthetic content is labeled SYNTHETIC; the expected-findings oracle is never rendered as a HAIEC verdict.
- The **open report** links point at the HAIEC-hosted artifacts for the exact `evaluationId` (e.g. `…/master-report/pdf`). They require authorization to the owning organization — an unauthorized reader gets HAIEC's normal fail-closed response. This is the *authenticated mode*; the frozen export set is the *offline mode*. No customer credentials or tokens exist in this repository.
- Onboarding a real manufacturer reuses the same adapter contract — see [Manufacturer onboarding mapping](docs/MANUFACTURER-ONBOARDING-MAPPING.md).

## Evidence and results

| File | Contents |
|---|---|
| `data/generated/estate.json` | Fictional manufacturer, nine systems, 37 scoped evidence-feed entries, accountabilities and AI spending |
| `agents.json` | All 16 agent roles, individually scoped tool capabilities, monitoring and control references |
| `workflows.json` | All seven manufacturing workflows, including separate Supplier Quality and Warehouse |
| `controls.json` | Full 45 catalog entries and truthful catalog/implementation distinction |
| `findings.json` | Nine **expected findings** with source qualification gaps and prohibited conclusions |
| `golden-scenarios.json` | 27 **oracle-authored illustrative storyboards**, not accepted source evidence; use `npm run source:world` for independent raw cases |
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

This repository does **not** contain customer data, customer credentials, executable plant commands, auto-deploy to HAIEC Main, unrestricted email delivery (the demo notify path is HAIEC-hosted and recipient-allowlisted), or cron-scheduled writes.

## Source-native v3.1 expanded manufacturer evidence

The additive [v3.1 evidence pack](data/source-native/v3.1/README.md) provides profile-shaped input candidates for all nine systems, 36 scenario runs, four simulation-only industry profiles, distinct remediation receipts and materialized negative inputs. Run `node scripts/generate-source-native-v3-1.cjs --check` to verify the SHA-256 manifest. These are **synthetic unqualified source records**; fresh HAIEC SaaS evaluations and new dashboards/reports remain separate actions. Historical 27 evaluations and v2/v3 artifacts are preserved.
