# HAIEC Manufacturing Showcase — Accept the Synthetic Governance and Runtime Scenario

**Decision (2026-10-16):** We **should** use the two Station 217 PDFs and the NotebookLM concept report as supporting visual material for a full HAIEC demonstration, including **synthetic** human approval, scoped operating decisions, monitoring observations, reviewer notifications, and **synthetic** allowed/held/rejected execution-control events. A fictitious operation **can truthfully be shown blocked by the fictitious control gateway**. Do not eliminate these compelling scenes merely because the real factory was not connected.

**Not a new finding or new test run.** This note refines the PDF validation disposition: the original drafts are **usable creative scenario references**, not signed/authenticated HAIEC-issued case reports. Correct or frame inaccurate specific claims before putting any PDF into the public Reports & Evidence gallery.

## 1. Stronger, correct product narrative

**HAIEC** is the product; manufacturing is an example environment.

> Deploy AI with confidence. Stay in control of every consequential action.

From the **Understand / Assure / Govern & Operate** pillars, demonstrate **Discover / Evaluate / Authorize / Monitor / Protect / Verify** as six separately selectable capabilities, not a seven-step mandatory workflow.

There are three complementary source classes:

| Track | What viewers may see | Exact status |
|---|---|---|
| **A — Actual HAIEC evaluation** | A qualified transaction in the synthetic manufacturing evidence package was committed to work order `WO-217-4803` while the approved target was `WO-217-4802`. HAIEC's deterministic rules identified a target mismatch. Overall assurance remains **Review required**. | **Real HAIEC computation over synthetic submitted evidence**, frozen and digest-verified; not a claim that the physical factory performed the transaction. |
| **B — Fictional human governance** | A fictional owner requests wider MES write authority; the Quality Director role is assigned, receives email/SMS **previews**, inspects evidence and keeps the new write authority **pending** while scoped advisory activity continues. Three example approvals, two rejections, four pending across nine systems. | **Authored and versioned MAA governance fixture**, not an authenticated employee approval. HAIEC Main separately provides a *real* authenticated decision service. |
| **C — Simulated ongoing operations** | A **subsequent** attempted autonomous write travels through the **illustrative** dispatcher, compares scope/approval, and is **held**; a later advisory recommendation is **allowed**. Rejected schedule commit is **blocked**. Animated monitoring feeds and reviewer previews advance on a deterministic virtual clock. | **Actual MAA playback/simulator behavior**, not a live OT/MES/PLC enforcement or delivered message. |

**Use positive terms**: "HAIEC identified the target mismatch", "the reviewer retains control of expansion", "within-scope recommendations keep moving", "an out-of-scope write attempt is held in the demo execution gateway". Avoid gratuitous repetitions of "fictional"/"synthetic" in each card. Put **Demo playback** beside the player, the original-record links in details, and the single full **About this demonstration** explanation at the end.

### Causal ordering — two different actions

- **Action 1, prior recorded case (source evidence, Oct 14):** synthetic commit/readback on `WO-217-4803`, despite `WO-217-4802` being the approved target. **HAIEC detects**, records `MFG-EFF-001 MATCH`, overall `REVIEW`. The recorded mismatch is **not claimed prevented**.
- **Action 2, later fictional proposed expansion/attempt (governance scenario, Oct 15):** autonomous MES-write expansion remains **PENDING**. The operating **scenario** shows a later request checked at a virtual dispatcher and **HELD**, while an advisory recommendation **CONTINUES**. This is a valid synthetic *pre-execution* block within the playback world. It cannot be conflated with Action 1's already-recorded event.

This is the minimal correction to pages 7, 8 and 11 of the visual report and the seven-gate appendix: **show both detection and a genuinely blocked *simulated subsequent request***, not "HAIEC prevented the historical wrong-target committed effect."

## 2. What Sprint 24 already shipped — do not rebuild

MAA PR [#42](https://github.com/subodhkc/manufacturing-ai-assurance-haiec/pull/42), HAIEC PR [#2219](https://github.com/subodhkc/haiec-website/pull/2219).

- One normalized scenario export from `data/demo-governance/governance-scenarios.json`: `scripts/build-scenario-shared.cjs` → `data/demo-governance/scenario-shared.json`, `dashboard/data/scenario-shared.js`, vendored HAIEC `data/demo/manufacturing-scenario-shared.json`.
- Three timeline experiences: Advantage ~26 seconds; Control Room ~78 seconds (SYS-340 approve/continue, SYS-217 held, SYS-SCH5 rejected); nine individual decision journeys ~40 seconds.
- Deterministic event records (`eventId`, `systemId`, `offsetMs`, `origin=SIMULATED`, reviewer/request context), one virtual clock, pause/restart/step/speed, reduced-motion fallback.
- Source-bound governance dossier `DEMO-REQ-SYS-217-06`, reviewer role Quality Director, allowed advisory recommendations, forbidden consequential MES write, pending state.
- Real HAIEC native tenant-bound approval requests/reviews/decision history are **separate** from the MAA fixture. Do not copy fixture "PASSED" into native customer auth records.

**Known presentation gap:** Three independently staged tracks now exist but are not yet consolidated into a customer-facing **full-platform capabilities overview**, a **single two-action Station 217 story**, or a **composite nine-system operating report**. Those are appropriate next UX deliverables.

## 3. Seven readiness checks — valid as a synthetic scenario tableau

The one-page appendix's seven levels are **independent readiness facets** for a selected workflow, not mandatory system stages. They may display "PASSED" **inside a clearly authored synthetic environment**, but only after the matching synthetic fact exists in a *versioned scenario-readiness fixture*. Avoid inventing real authenticated entitlement, identity, live collector or actuation proof.

| Display facet | What may be shown in a newly authored synthetic scenario | Mandatory source/provenance |
|---|---|---|
| Platform readiness | Demo system registered; source binding referenced | Versioned `scenarioReadiness.platform` fixture, **not** a real HAIEC registration audit |
| Organization availability | Demo organization entitled to the selected example workflow | Versioned `scenarioReadiness.entitlement` fixture |
| Reviewer eligibility | Fictional Quality Director **assigned**, with separate requester role | Existing `requestRecord`, role identity explicitly a persona |
| Operating scope | Advisory permitted; autonomous MES write excluded | Existing exact `allowedOperations` / `prohibitedOperations` dossier arrays |
| Source monitoring | `torque-tool-event-log` is **STALE** and `mes-release-readback` is **MISSING** as of fixed Oct 15 scenario clock | `MON-S217` event records, source cadence 600 seconds; not contradicting Oct 14 case witness |
| Assurance evidence | HAIEC identified qualified target divergence; review required | Original `SYS-217-WRONG_TARGET` saved evaluation and public verification identity |
| Human approval + demo control | Expanded MES write **PENDING**; a later fictional write request is **HELD by scenario gateway**; advisory work continues | Human dossier + synced `EXECUTION_HELD` playback event; never derive a real server enforcement receipt |

**Important:** The original "01–04 PASSED" table cannot be relabeled as actual verified HAIEC product checks merely by writing "demo" at the bottom. Define explicit source rows in a scenario fixture first if you want to show them as passed *within that synthetic scenario*. Missing information should read "Not shown in this scenario", not be silently invented.

## 4. Specific PDF/storyboard corrections without losing cinematic value

**One-page gating appendix**
- Keep the seven-row table, but rename it **"How HAIEC Would Govern Station 217 — Demonstration Readiness View"**.
- The left table can show demo readiness (fictional org/requester/reviewer, defined policy, monitoring source status, evaluated target mismatch, pending approval). Distinguish sample source state from actual HAIEC evaluation.
- Level 05: no contradiction: the Oct 14 saved evaluation has a transaction-bound target readback; the **separate Oct 15** monitoring scenario declares `torque-tool-event-log` stale and `mes-release-readback` missing. Do not remove detection to force a "missing proof" story.
- Final line should become: "**HAIEC detected the target difference in the evaluated synthetic evidence. The subsequent demonstration holds wider MES-write authority for Quality Director review while scoped advisory work continues.**"

**Twelve-page governance PDF**
1. **Cover:** Keep current USP.
2. **Nine systems:** Render nine distinct agents, correct names and 3 scoped / 2 denied / 4 pending.
3. **Declared intent & scope:** Strong; differentiate proposed technical interface from reach established by source analysis.
4. **Expected vs recorded:** Keep `WO-217-4802` versus `WO-217-4803` as a genuine HAIEC evaluation result over synthetic input.
5. **Deterministic finding:** Keep `MFG-EFF-001 MATCH`, qualify the result as a finding not a runtime block.
6. **Evidence card:** Keep specific evaluated fields, and link source verified record.
7. **Two action paths:** Split **prior observed synthetic mismatch** from **later demonstration attempt held**. Advisory-only continues in the *scenario*.
8. **Reviewer:** Keep Quality Director pending, conditions and notification preview; show request `DEMO-REQ-SYS-217-06`.
9. **Monitoring:** Keep high-value stale/missing illustration; label it **later fixed-clock monitoring scenario**, not the earlier assessed transaction's witness. Never say "no proof means no execution."
10. **Capability versus delegation:** Keep Venn diagram; role-based permission is not a verified static code reach in this saved assessment. Wording: **declared potential capability / approved authority / observed source-case effect**.
11. **Platform workflow:** Replace duplicated Verify with HAIEC three pillars, six selectable goals and shared evidence. The Station 217 story is an example choreography, not required app onboarding stages.
12. **Methodology:** Preserve as a single last-page disclosure; source-scope and demo integration distinction, clickable manifests/evaluations, exact 45 + 27 histories.
- Keep report as **sequential supporting presentation**, not a new official signed HAIEC report. Preserve current look/brand; do not overdesign.

## 5. How to use the corrected material in MAA

At the top, let users select HAIEC capabilities and inspect the nine-system business portfolio. Use three pillars + six clickable goal entry points; the goal tiles should deep-link existing pages, not introduce a duplicate navigation system. On the flagship Station 217 deep link, use a two-phase narrative ribbon:

**A. What HAIEC actually found in the submitted source evidence:** the recorded target difference with exact verification and bounded `REVIEW`.
**B. What the HAIEC operating model demonstrates next:** fictional Quality Director review, synchronized alert previews, scenario dispatcher hold and continuing advisory operation, plus fixed-clock monitoring.

Under **Reports & Evidence**, provide a **Supporting Demonstrations & References** grouping with the corrected NotebookLM adaptation, refined one-page gating diagram and 12-page visual storyboard, with metadata/source class: `SUPPORTING_SCENARIO_PRESENTATION` (not a newly issued evaluation, verification record or execution receipt). Provide a simple link to the original case alongside supporting materials, not merged into signed report export lists.

## 6. Demo/methodology disclosure rule — single location

**About this demonstration** belongs at the end of dashboard/report. Recommended copy:

> HAIEC's actual deterministic assurance engine evaluated a synthetic manufacturing evidence package. Its 45 current saved findings and reports are preserved and available for verification. The manufacturer, human approval examples, reviewer notification previews, runtime-control responses and monitoring/telemetry activity illustrate the broader HAIEC operating experience using versioned demonstration scenarios. The dashboard is not connected to live factory MES/PLC systems. The earlier 27 evaluations remain historical and separate.

Use small **Demo playback** context markers only by active simulated controls; do not repeat the full disclosure in every UI block. In portable PDF exports, retain the source/methodology page at the end even if a user views the PDF outside MAA.

## 7. Tests/engineering scope

**Do not rerun 45 evaluations or create new signed assurance artifacts.** No new engine, database, connector, notification delivery service or control middleware is needed.

Next implementation requires only:
- a *minimal*, deterministic, optional `scenarioReadiness` fixture for the seven-gate illustration, derived where possible from existing dossier + monitoring + evaluation result;
- pure read-only projections and one narrative animation wiring on current Sprint 24 controller;
- one composite operating report + supporting materials hub grouping;
- targeted tests for exact source keys, 3/2/4 counts, fixed monitoring clock, distinct prior-event-versus-future-hold identity, and one mobile/browser smoke.

Everything else is scope creep. The shared common-repo architecture, operational availability rules and product-truth gate stay authoritative for future real-customer deployments.
