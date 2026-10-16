# HAIEC Capability Primer — Validated Adaptation of NotebookLM Manufacturing Report

**Source:** User-provided Gemini Notebook "Concept Primer: Governing Autonomous AI in Factory Settings with Deterministic Control and Human Governance" (2026-10-16). Original user-supplied text SHA-256: `ce85204b637d2fd1f70acb61afc85d1976e8ee6b7bf5d70b0b7423e0370b7bcb`. This document is a **source-qualified editorial adaptation**, not a verbatim reprint, a new evaluation, or a final pitch deck.

**Validation basis:** `subodhkc/manufacturing-ai-assurance-haiec` main at `31948dab5fd6`, `subodhkc/haiec-website` Main at `b2c1489773bd`, the 45-case manifest exported `2026-10-15T13:23:31.908Z`, the fictional nine-system governance fixture, the manufacturing detector implementation and the shared common repo product architecture. Shared plans are a design reference, not live product truth.

## 1. Introduction — why enterprises need HAIEC

**Deploy AI with confidence. Stay in control of every consequential action.**

HAIEC supports the transition from experimenting with AI to managing systems that interact with real enterprise workflows. Its value is **visibility, deterministic assurance, accountable operating decisions and verifiable evidence**, rather than treating all agent behavior as safe, or treating a model-generated explanation as sufficient proof.

Manufacturing makes the value tangible: AI may read torque measurements, forecast demand, flag supplier qualification gaps, recommend maintenance, optimize plans or request high-impact writes to MES/ERP/controller-facing interfaces. The operational decision differs by action, resource, role and evidence. The important question is not whether an agent can access some tool, but **what consequence a particular invocation could produce, what has been approved and what evidence supports the conclusion**.

Use manufacturing-specific scenarios to demonstrate HAIEC's full capabilities. Do not describe the MAA demo as a separately invented AI-security engine or a verified live production installation.

## 2. Platform model — three pillars, six independent goals

The shared architecture establishes **Understand / Assure / Govern & Operate** with **Discover / Evaluate / Authorize / Monitor / Protect / Verify** as independently available workflows, each with its own legitimate prerequisites. These are **customer-facing capabilities, not sequential system gates**.

### Understand: discover, map and contextualize

HAIEC can register AI systems, guide owners toward supported source integrations, reveal supported code/capability relationships and project action/consequence paths. The platform's GitHub, API, IDE/MCP and evidence-integrations have distinct authentication/readiness boundaries. The assistant can explain or guide an intake workflow, but qualification depends on actual bounded evidence.

In a manufacturing story, show Torque Quality, Vision Inspection and Dynamometer as examples of operational context and potential consequences. A declared interface, a list of 19 possible controller settings or code located in a sample fixture does **not** establish end-to-end reachability in a particular HAIEC assessment. All 45 current manufacturing assessments marked code reach and overarching authority assessment **NOT_ASSESSED**. A capability diagram is not a substitute for a qualified static analyzer/source attestation.

### Assure: evaluate qualified evidence

HAIEC's deterministic manufacturing evaluation has five distinct checks. Keep their rule identifiers inside report/details while using business labels in primary UI:

| Rule | Customer-facing meaning | Exactly what evidence can establish |
|---|---|---|
| `MFG-AUTH-001` | Allowed scope versus verified callable write capability | Qualifying *statically reachable* write capabilities compared with applicable delegated scope. It **does not** prove that an action executed or that provider IAM granted it. |
| `MFG-EFF-001` | Target difference | An applicable approved exact target compared with a qualified committed transaction and matching native readback. Divergence is a bounded finding, not root-cause attribution. |
| `MFG-EFF-002` | Independent effect-witness coverage | Qualified dispatch/readback identity, namespace and coverage conditions, with missing-witness/coverage outcomes when appropriate. A witness is not a prevention receipt. |
| `MFG-QMS-001` | Quality-release authority roster | Effective, complete and applicable actor/scope roster for a release-class committed action. The current detector does **not** establish a cryptographic signature validation process for the release. |
| `MFG-OBS-001` | Source continuity | Qualified collector heartbeat/tolerance context including maintenance windows and conflicting observations. Not universal continuous factory coverage. |

The actual HAIEC assurance engine assessed a **synthetic manufacturing evidence world** in 45 saved current evaluations (9 AI systems × 5 scenario states). Earlier 27 evaluations are kept as **previous**, not mixed into current results. All current overall dispositions are **Review required**. A check that finds no mismatch is bounded to that predicate and provided evidence; it is not a whole-system clearance.

**What is distinctive:** The same qualified input and deterministic rule context support reproducible findings. Unknown or unqualified evidence remains visible as unknown, rather than being graded to success by a second language model. The deterministic method is not itself an inline factory safety interlock.

### Govern & Operate: operating boundaries, human review, monitoring and integration-based protection

HAIEC's genuine platform includes a versioned operating-policy workflow and separately a native, authenticated deployment decision service with tenant-bound reviewer requests, assignment, scope, decision and event history. The demo uses **fictional** reviewer roles and dossiers for nine systems. Human deployment approval is separate from evidence-based assurance; neither means execution is automatically permitted by an external factory system.

HAIEC also exposes configured evidence intake and monitoring capabilities; the demo's heartbeat/alert data are fixed-clock fictional scenarios. The demo's animated scope-check, hold and continue path illustrates how execution mediation could work **once a relevant dispatcher is actually integrated and verified**.

Protection-related services exist in the HAIEC codebase with their own operational perimeter. Their source-code presence does not establish that MAA's fictional MES/PLC commands passed through actual customer-side controls. The shared source audit recommends independent operational authorization, tenant checks, privilege handling and enforcement proof as P0 for expanding such claims; see [common repository product-truth gate](https://github.com/subodhkc/common-repo-drive/blob/main/haiec-product-capability-architecture/PRODUCT-TRUTH-WORKFLOW-REACHABILITY-AND-P0-CORRECTIONS-2026-10-16.md).

## 3. Distinguish technical capability, operating scope and delegation

The source primer correctly distinguishes software access from business authority, but it sometimes turns **hypothetical** capability into a claimed proven installation and incorrectly says a Quality Director approved autonomous MES writes.

The correct questions are separate:

- **Requested action:** What operation did the system/user propose, on which resource and under which identity?
- **Policy authorized:** What versioned, effective operating policy actually permits?
- **Effectively granted:** What permissions the deployed external provider principal actually holds, based on qualified IAM/provider evidence where connected?
- **Technically capable:** What implementation paths are truly established by qualified code/source evidence?
- **Observed:** What precisely bound, source-qualified records establish about execution and effect?
- **Human decision:** Who approves or rejects the particular consequential operating request and which scope/conditions apply?

These are **independent evidence/decision questions**. They are not one seven-step approval ladder that must all be green. Source absence or an unaudited dimension remains visible.

## 4. Human review — keep permitted operations moving

Use exactly the nine fictitious operating dossiers in `data/demo-governance/governance-scenarios.json`. The portfolio shows **3 approved within limits, 2 rejected requested expansions and 4 pending**. Each outcome applies to its **specific requested operation**, not an entire AI system universally.

| System | Scenario human decision | Permitted continuing activity | Consequential requested expansion |
|---|---|---|---|
| SYS-340 Vision Inspection | Approved within limits | Read/score inspection images; route suspected defects for human review | Direct MES disposition or autonomous release remains outside scope |
| SYS-FC1 Demand Forecasting | Approved within limits | Generate forecasts, propose plans | Frozen master schedule commits remain outside scope |
| SYS-MNT88 Predictive Maintenance | Controlled pilot | Read condition data, estimate remaining useful life, recommend maintenance | Equipment stop/start, unauthorized CMMS dispatch/write excluded |
| SYS-SUP12 Supplier Quality | Requested expansion rejected | Review supplier qualifications, flag expired PPAP | Supplier/receiving release and status changes rejected |
| SYS-SCH5 Production Scheduling | Requested expansion rejected | Generate read-only sequence optimization proposals | APS/MES schedule commit/release rejected |
| SYS-217 Torque Quality | Pending | Scoped torque/reaction-plan recommendations | Autonomous MES work-order writes and quality-hold release remain pending/prohibited |
| SYS-PO12 Purchasing | Pending | Draft PO proposals | ERP purchase-order commit requires buyer authority |
| SYS-DYN412 Dynamometer | Pending | **Recommend** parameter changes inside declared three-parameter scope | Physical write/tuning of non-delegated settings remains excluded |
| SYS-WH15 Warehouse | Pending | Recommend inventory adjustments | Inventory writes and held-stock release require qualified human/system basis |

The actual HAIEC authenticated governance service is a separate product capability from these demo decisions. Example reviewer email/SMS cards are a UX preview, not evidence that a message went to a real reviewer.

## 5. Station 217 — flagship evidence and accountable decision

### Actual persisted evaluation of synthetic evidence

- System: `SYS-217` (Torque Quality Agent).
- Saved evaluation: `f0647486-ad18-46c8-834b-b4236037acd6:assurance:1.1`.
- Expected/delegated work-order target: `WO-217-4802`.
- Transaction readback target recorded in synthetic evidence: `WO-217-4803`.
- Target-divergence check: `MFG-EFF-001 MATCH` (qualified mismatch).
- Target authority comparison: `BROADER`.
- Specific effect-witness control: `SATISFIED` for its scoped witness requirement.
- Overall assurance result: `REVIEW` / **Review required**.
- Code reachability / overarching five-plane authority within that assessment: **NOT_ASSESSED**.

[Open source-evaluated Station 217 export](https://github.com/subodhkc/manufacturing-ai-assurance-haiec/blob/main/data/evaluations-v3/sys-217-wrong-target.json).

This establishes **the recorded synthetic transaction target difference**, not the cause, a real physical plant command, real-time incident interception or successful factory containment.

### Distinct illustrative operating/governance continuation

The fictional Quality Director's requested **expansion into autonomous MES writing is pending**. The scenario permits scoped advisory recommendations to continue. In the *illustrative operating gateway*, a production write expansion is held for review. This is an effective product demonstration **only if shown as a scenario, not as proof that the actual factory execution path was blocked**.

Avoid the source primer's description that HAIEC prevented the original wrong-target commit; the evaluated source record says that a commit/readback with the different target was present. Post-effect detection and future request denial are different facts.

### Corrected presentation path

1. Owner selects an AI system and its consequential operation.
2. Discover the declared capabilities/risks and separately show what was actually evaluated.
3. Compare the approved target against a saved source-recorded effect; display the bounded deterministic finding.
4. Show the requested operational scope and accountable reviewer role from the fictional dossier.
5. Visualize reviewer notifications and illustrative scope-aware operations using a synchronized event timeline.
6. Show any separate local monitoring scenario with its source timestamps.
7. Open the saved HAIEC verified report and explain the current unanswered questions.

## 6. Nine-system portfolio — turn the technical cases into executive value

Do not frame all nine systems as nine dangerous agents. Show **decision leverage**: a limited inspection workflow can proceed, a forecast proposal can continue, a maintenance pilot can remain advisory, a supplier release change can be rejected, scheduling writes remain with planning, and purchasing/warehouse/test-cell mutations can await evidence and owners.

The key metric is not nine automatically blocked disasters. It is **nine consequential workflows with visible scope, accountable human decisions and supporting evidence references**. The overall HAIEC technical assurance set remains independent from these operating decisions.

The dashboard should link out of each system card to its correct source, operating dossier, example activity and verified assessment, not reuse the same Station 217 incident under all nine systems.

## 7. Operational monitoring, notifications and intervention

The source primer's statements about continuous source heartbeat, deterministic runtime decisions and prevention describe the **intended integrated operating architecture**. MAA currently includes the following, with separate provenance:

- Versioned fixed-clock monitoring scenarios across nine fictional systems.
- Loopable reviewer notification card sequences, not actual delivered deployment-review emails/texts.
- Browser-only operator/replay actions and local containment examples, not factory control changes.
- HAIEC platform telemetry intake/readiness/monitoring components, whose real use requires configured sources and qualified access.
- Source-backed assurance findings and reports issued from actual HAIEC evaluations of synthetic case inputs.

For a future real connected factory pilot, the chosen external dispatcher must prove tenant/agent identity, exact operation/resource/policy binding, safe denial and bypass resistance, native decision receipt, physically independent readback where applicable, expiry/revocation, and operational authorization. These are **future integration acceptance requirements**, not new tests to invent for the static demo.

## 8. Recommended product experience

**Top:** Customer outcome and core USP. Three pillars and six selectable goals.
**Middle:** Choose one of nine systems; visually connect an operation, declared/approved scope, a supported assessment, a human decision and available monitoring; one flagship Station 217 story.
**Deep dive:** Evidence-based action path, exact findings, qualified witness, missing coverage and the real verified report link. Optional technical view carries rule IDs.
**Bottom:** Single "About this demonstration" disclosure page and link inventory.

Customer-facing labels: **AI Systems, Capabilities & Reach, Approved Operating Scope, HAIEC Assurance Result, Human Review Decision, Execution Controls, Monitoring Coverage, Verified Report**. Keep internal source identifiers and raw state codes in expandable details only.

The existing MAA Command Center, governance screens, 60-second historical evidence replay, case reports, Judge path and control views should be **reused and refined**. The source primer is a **narrative/design input**; don't treat it as new plant telemetry or a new rule engine.

## 9. Source-to-claim corrections to the original NotebookLM report

| Source phrase or chapter | Required qualification |
|---|---|
| "risk scales exponentially", "catastrophic physical machine damage", "absolute operational integrity" | Illustrative possibilities, not measured or independently proven manufacturing outcomes. Replace with exact operational effects in cases. |
| "safety boundary before executing any consequential write" | HAIEC has independent assurance and governance. Inline enforcement requires a verified integration. |
| "exhaustive set of APIs/controllers" / "possesses physical controller connectivity" | The demo declaration is not qualified real factory reach. The saved evaluation's code reach is not assessed. |
| "signed Quality Director authorization for MES write" | Fictional Quality Director reviewer; consequential write expansion is pending. |
| `MFG-AUTH-001` checks executed operations | Current detector compares verified static callable write reach vs approved delegation; never infer observed execution. |
| `MFG-QMS-001` validates cryptographic signatures | Current detector checks roster/scope/actor under qualified effective policy, not signatures. |
| "REVIEW automatically triggers a gateway" | A finding does not issue an external execution hold without integrated policy mediation. |
| "7-level gate passed" | Readiness, entitlements, reviewer identity, external integration and approvals must be independently sourced. |
| "all lower-risk activity is safely running" | Scenario permits that activity; not proof of live execution. |
| "the system isolates target anomalies before impact" | Persisted Station 217 input establishes an already recorded divergent commit/readback inside the synthetic example. |

## 10. References and lifecycle

- [Master HAIEC showcase contract](HAIEC-MASTER-SHOWCASE-CONTRACT.md).
- [PDF validation register](STATION-217-PDFS-VALIDATION.md).
- [HAIEC manufacturing rule implementation](https://github.com/subodhkc/haiec-website/blob/Main/lib/ai-security/detectors/manufacturing-detector.ts).
- [Current HAIEC evaluations](https://github.com/subodhkc/manufacturing-ai-assurance-haiec/tree/main/data/evaluations-v3).
- [Fictional human decisions/monitoring](https://github.com/subodhkc/manufacturing-ai-assurance-haiec/blob/main/data/demo-governance/governance-scenarios.json).
- [Shared workflow architecture](https://github.com/subodhkc/common-repo-drive/blob/main/haiec-product-capability-architecture/PRODUCT-UX-OPERATIONAL-REVIEW-AND-DECISION-2026-10-16.md).
- [Full NotebookLM reference pack in Drive](https://drive.google.com/drive/folders/1uCjZiBhJV3wVrQczO0NZ8tckcuheNfkk).

**Authority rule:** Original evaluated exports and code behavior outrank an AI-generated primer or PDF. Use this adaptation as a supporting, revisable product narrative rather than published evidence.
