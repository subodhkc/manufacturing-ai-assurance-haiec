# HackFW + HAIEC — Enhanced Execution Plan v2.6

**Review date:** 2026-10-15  
**Status:** Proposed execution overlay and verified repository reconciliation. **Not a claim of finished production work.**  
**Scope:** Manufacturing-first HackFW demo; HAIEC private-engine dependencies; telecom and four other fictional industry profiles.  
**Governing source:** Original Google Drive master v2.4 with appended v2.5 section, Multi-Industry Plan, and Synthetic Evidence v3.1 Plan, mirrored unchanged under `drive-snapshots/`.

## 0. What changed in this review

The three Drive plans were drafted before several later GitHub PRs. Preserve the original requirements but follow these reconciled facts:

| Subject | Observed repo status as of this review | Correct handling |
|---|---|---|
| Multi-industry shell + telecom AL0/AL1/AL2 reference | **MERGED** public PR #19, public `main` `fb5ae69` | Do not rebuild; improve navigation, sources and domain-specific scenario depth only |
| Four additional sector views | **MERGED** as fictional simulation-only profiles | Never attach a HAIEC evaluation ID or derived verdict |
| 60-second SYS-217 recorded replay | **IMPLEMENTED** over immutable v1 synthetic evaluation source | Reuse, with digest gating, not a new streaming monitor |
| Operator Journey v2.5 | **IMPLEMENTED ON OPEN PUBLIC PR #20**, not merged to `main` | Review, focus-check, merge separately after acceptance; do not claim production |
| Private kill-switch recovery ownership fix | **OPEN PRIVATE HAIEC PR #2211**, not established deployed | Verify cross-tenant tests and Main CI before merge; not proof of dispatcher integration |
| 27 persisted HAIEC evaluations (9 systems × 3 states) | **REAL CANONICAL EVALUATIONS OF FICTIONAL v1 SOURCE WORLD** | Immutable historical bundle, separately digest verified; no v3.1 relabel |
| Source-native v3.1 | **CANDIDATE FIXTURE DROP, NOT 36 QUALIFIED NEW EVALUATIONS** | Complete registered intake and re-run as distinct immutable snapshots |
| Real industrial connectivity / live control | **NOT ESTABLISHED** | No customer OT, PLC, MES or third-party agent writes; simulation-only until authorized proof |
| Telecom demonstration | **HISTORICAL TM FORUM REFERENCE** | Sample stages/labels, not new HAIEC verdicts |
| OWASP / compliance crosswalk | Canonical HAIEC framework mapping exists; demo contextual only | Qualified mapping + reference release + actual control evidence required before evaluated claim |


## Sprint 16/17 reconciliation (supersedes dated status rows below)

- PR #20 merged `8b3e930`; PR #21 merged `55c8bbe` (Operator Journey world-aware) → `main`, deployed via Vercel CLI.
- HAIEC PR #2212 merged `770b94cdc` → `Main`; kill-switch recovery tenant fix PR #2211 merged `aff91c80`.
- "Nine-system fresh v3.1 assessed corpus" is superseded by **45 canonical v3 evaluations** (9 systems × 5 states: baseline, enriched, degraded, wrong-target, remediated) — persisted, digest-pinned under `data/evaluations-v3/`, publicly verifiable. They are genuine evaluations **of synthetic lab evidence**, not real factory monitoring or certification.
- P0-1 six-step UI: merged and deployed-browser acceptance passed 32/32 (journey stages, systems, states, worlds, industry switch, mobile/keyboard/print).
- Kill-switch execution guard: `assertAiExecutionAllowed`/`withKillSwitchGuard`/`isSystemKilled` still have **no runtime dispatcher call sites** — containment remains unproven; treat as bounded backlog, not shipped enforcement.
**Status precedence:** actual deployed code/CI and signed, tenant-bound evaluation receipts supersede retrospective plan status text. The Drive copies are frozen planning sources, not updated release ledgers. A source-native event is not an admitted evidence claim; a report graphic is not a detector; a passed test of a local guard is not proof the runtime calls it.

## 1. Product narrative / UX north star

The competition's main interaction is **Detect → Investigate → Authorize → Contain → Verify → Report**. Lead with a clear consequence:

> **The AI had technical permission. It acted on the wrong work order.**

Second line: “HAIEC detected the documented target divergence in a persisted evaluation of synthetic manufacturing records, preserved the qualified sources and exposed what remains unproven.”

The audience should be able to understand, in a 60–90-second optional interactive walkthrough:

1. **Detect:** `SYS-217-WRONG_TARGET`, rule `MFG-EFF-001 = MATCH`, canonical U5 disposition `REVIEW`; original approved target `WO-217-4802`, native recorded target `WO-217-4803`.
2. **Investigate:** approved/effective/code/dispatch/native source families, exactly what claim each qualifies, `MFG-EFF-002` and `MFG-OBS-001 = INSUFFICIENT_SOURCE` for `COLLECTOR_CONTINUITY`, original action-path Observed `NOT_ASSESSED`. Show no speculative motive/root cause.
3. **Authorize:** historical manufacturing operation permission is **not** fresh incident-response authorization. Display required response owner, tenant/system, exact action and resource, policy version, scope, expiration, separation of duties, and approved decision evidence; if absent say **NOT ESTABLISHED**.
4. **Contain:** support a deliberately local **fictional dispatcher pause** and simulated follow-up denial. Label every local control **BROWSER-ONLY SIMULATION**. Never label it a verified HAIEC kill switch or real actuation; cannot affect prior HAIEC evaluation.
5. **Verify:** two separate columns: historical R01 UCP `SATISFIED / RECEIPT_BOUND` witnesses the recorded wrong-target effect, but independent **post-containment** blocked-attempt/native readback does **not** exist for this snapshot. A witnessed effect may be unauthorized.
6. **Report:** launch actual public sample and exact authorized HAIEC evaluation/receipt paths when available. Print/export only source-truth facts, limitations and separately labelled user simulation notes; do not issue a new signed Master Report.

**Design system improvements:** 3-level visual hierarchy: (A) executive consequence, (B) six-step evidence route, (C) forensic inspector. Status chips always encode *origin* (Persisted HAIEC synthetic / Historical reference / Simulation only / Not assessed). The five planes are a **coverage map**, never five default green boxes; do not infer “5 analyzed” from framework existence. No unauthorized PASS green on `MATCH`. Prefer precise target-before/after, transaction ID, action class, receipt scope and required next witness over gauge scores.

**Operator actions:** Access to reference and simulation pages is public and read-only; any future live control must be a separately privileged authenticated HAIEC workflow with explicit approval preview, step-up confirmation, safe-state requirements, immutable reason and time-bound authorization. Do not expose a production kill-switch API or secrets in the public dashboard.

## 2. Gap-to-implementation matrix (priority, owner, acceptance)

| Priority | Gap / enhancement | Owner & repo | Smallest acceptable proof |
|---|---|---|---|
| P0-1 | Deliver six-step UI without breaking verified case, replay, reports or industry switching | Public manufacturing PR #20 | 123-test CI baseline or newer, 360px/desktop/keyboard/print smoke, exact 27 exports untouched, direct links work |
| P0-2 | Cross-tenant kill-switch recovery authorization | Private HAIEC PR #2211 | Foreign OPEN/KILLED cannot recover or leak target; owner OPEN idempotent and KILLED recover; focused handler tests + typecheck |
| P0-3 | Kill-switch trigger and guard correctness | **New scoped private PR only after P0-2** | Trusted server actor semantics, no forged manual L3, real dispatch guard interception, layers 1/2 vs 3+ differentiated, stale-cache/TOCTOU tests |
| P0-4 | v3.1 intake-contract acceptance for SYS-217 | Public fixture producer + private HAIEC existing registered profiles | Source schema accepted and rejected appropriately, same-org/foreign-org isolation, source role ceilings, exact resource/transaction IDs, saved evaluation and report |
| P0-5 | Competition fallback and release hygiene | Public manufacturing repo | Offline verified frozen report/replay works if HAIEC API is unavailable; deployed SHA recorded; no sensitive credentials in public artifacts |
| P1-1 | Nine-system fresh v3.1 assessed corpus | Private canonical evaluator + approved fixture source; never separate renderer engine | 9 systems × baseline, degraded, wrong-target; fresh evaluation IDs and immutable receipts |
| P1-2 | Nine remediated outcomes and change assurance | HAIEC delta/Compliance Twin; public read-only renderer | Separate new approved snapshots, evidence-bound before/after with control versions; no synthetic post-hoc state correction |
| P1-3 | Qualified monitoring/collector continuity | Registered runtime producers and source mapper | Source uptime window and completeness adequate for target rules or explicit `INSUFFICIENT_SOURCE` |
| P1-4 | Evidence-qualified OWASP/NIST/OT view | Canonical HAIEC mappings + public presentation | Framework version, exact mapping, applicable scope, test execution and evidence refs; blank/unknown on absent qualified edges |
| P1-5 | Sector story improvements | Public fiction profiles, one at a time | One consequence, denial/approval branch, independent effect unknown, responsible owner, source references, printable limitations per sector |
| P2 | True enterprise controls and agent monitoring | HAIEC private | Authenticated tenant/system binding, production-grade adapters, no live OT writes without separately approved safety program |

### Additional under-specified acceptance gates

- **Integrity vs authenticity:** export SHA-256 validates file-content equality with the published digest, not who originally produced source facts; authenticated producer registration is a separate claim.
- **Human approvals:** a local “approve” click, approval form or simulation reviewer must never mint approved delegation evidence or satisfy U5.
- **Kill-switch scope and fail-safe:** a PAUSE control, L1 throttle, L2 circuit-breaker, L3 runtime kill, cancellation, native equipment emergency stop and recovery are **different actions**. Avoid collapsing into a single “Kill Switch Active” badge. A stored `KILLED` flag is not an enforcement receipt.
- **Control-system safety:** no PLC command, MES release, WMS shipment, real payment or physical stop in the reference app; keep any proposed experiment in a bounded simulator/emulator. Emergency-stop procedures must remain separate from digital agent governance.
- **Timing and causality:** distinguish source event time, ingest time, evaluation snapshot, UI replay pacing, mitigation time and independently observed recovery time. No implication historical finding caused a later browser rehearsal.
- **Absence-of-event proof:** denied API acknowledgement is not independent proof no effect occurred; require collector continuity and native readback over a bounded observation interval.
- **Provenance on sector switching:** reset all industry, site, report, evaluation and UCP bindings; never carry a manufacturing verdict to a telecom or fiction profile.
- **OWASP product security:** validate tenant-scoped read/modify endpoints against OWASP ASVS 5.0, especially authorization, session/API identities, audit integrity, input validation and denial cross-org.
- **UI accessibility:** reduced motion, step controls, aria-current, responsive overflow, keyboard focus, screen reader labels and printable reference disclaimers.
- **Reproducibility:** scenario/source fixtures do not import expected verdicts; independent sealed holdout is not the same as a public oracle fixture.
- **Marketing truth:** no real sponsor/judge/customer claim for Moonshot, BNSF, Wistron/NVIDIA or telecom operators; avoid “compliant”, “tamper-proof”, “prevents all incidents”, “live factory monitoring”.

## 3. Recommended high-impact scenarios, with honest scope

| Story | Consequence and evidence path | Mode now / proof required to upgrade |
|---|---|---|
| **SYS-217 wrong work order** | Approved WO-217-4802 vs independent native target WO-217-4803; R01 witness; operator response rehearsal | Persisted v1 HAIEC evaluation + separate browser simulator; live containment NOT established |
| **Held-lot WMS shipment** | Optimizer recommends held lot; QMS hold + WMS target; dispatch denial; check no actual shipment via independent readback | Local deterministic simulation only until new v3.1 evaluation |
| **Scope-expanding A2A delegation** | Planning agent delegates larger MES/APS change than authorized; preserve signed parent→child identity, bounded scope and native effect | Risk scenario spec; OWASP ASI07 mapping **contextual** |
| **Supplier vendor-bank modification** | Unauthorized bank master edit or threshold-evading PO → human confirmation + ERP/vendor master witnesses, actual settlement unknown | Fictional cross-sector simulation |
| **Electronics test/firmware mismatch** | Firmware digest not aligned with test matrix → controlled quarantine, independent serial/lot native QMS | Fictional simulation |
| **Rail wrong asset** | Inspection event targets one milepost/asset; AI generates CMMS work order for another; repair and safe return not inferred | Fictional simulation |
| **Telecom wrong slice** | AL0/AL1/AL2 historical reference; compare requested RAN/OSS slice vs candidate native config & KPI coverage | Historic TM Forum sample only; no issued HAIEC telecom verdict |

For each new scenario: question → exact actor/action/target → eligible producer and qualified claim → policy envelope and approval → trace → native effect/readback → rule outcome or unknown → appropriate control/OWASP mapping → customer-friendly consequence → remediation owner. A fixture expected outcome never becomes a HAIEC rule outcome.

## 4. Delivery train and stop/go gates

**Sprint A — ship truthful guided UX (public).** First review open PR #20 and existing PR #19; validate entire judge path and older report links. Merge only after CI, UI acceptance and source-isolation checks. Record Vercel production SHA. No fresh HAIEC assessment required to finish this design slice.

**Sprint B — secure private containment (private).** Review PR #2211 with actual tests. Follow with trigger trust, guard callsites, killSwitchSystem↔aiSystem identity and measurable deny/recovery proof. Merge to uppercase `Main` only after accepted tests; verify auto-Vercel production without changing Git identity.

**Sprint C — source and re-evaluation (both).** First pin source-native v3.1 typed schema and producer lineage in public fixture. Register approved synthetic producers in isolated HAIEC test org using secret store/rotated test credentials, validate rejection paths, persist new evaluation, establish exact report IDs and only then publish new frozen read-only export snapshots. Start SYS-217, then eight other systems, then remediated states. Keep the existing 27 immutable.

**Sprint D — controls/compliance & other sectors (presentation).** Reuse HAIEC's versioned framework catalog. Render normalized applicable/mapped/evaluated/covered/unknown states; cite the exact release and evidence. One strong domain branch per fictional industry, not 36 fabricated evaluations. Keep telecom historical sample visibly bounded.

**Competition freeze:** The older master specifies a *claimed* official deadline of 30 Oct 2026 at 11:00 a.m. CDT and a preference for a sub-two-minute video. Reconfirm submission details on official HackFW pages before relying on the stated cutoff. Maintain an offline static release containing the 27 existing verified exports even if new tenant integrations are delayed. Do not make R1 competition readiness dependent on shipping all R2 enterprise functions.

## 5. Minimal validation — velocity without compromising assurance

1. **Public docs/data:** mirror presence, source document references, preserved 27 exports, static dataset parity. No source transformation of oracle expected findings.
2. **Public UI:** six-step stage test + absent/corrupt export negative + industry switch isolation + report link + mobile keyboard screenshot; existing regression cone only.
3. **Private security:** real route handler tenant boundary tests for both OPEN/KILLED, missing org and legitimate owner; trigger trusted-actor tests, race/freshness where relevant; focused typecheck.
4. **Source intake:** one 9-system acceptance set with only the minimum representative cases needed to establish per-system qualified outcomes; replayable negative for wrong target, stale source and missing collector continuity. Broaden after evidence justifies.
5. **Evidence/public report:** exact evaluated snapshot, immutable digest, UCP qualified source and report projection parity; no automatic score or compliance verdict.

## 6. Code and artifact ownership

- **Public `subodhkc/manufacturing-ai-assurance-haiec` (branch `main`):** fictional raw/source-native fixture inputs, independent scenario/oracle test harness, visual shell, telecom historical narrative, domain simulations, static snapshot exports and this Devin-facing plan. **Do not copy HAIEC proprietary evaluator rules or secret source credentials.**
- **Private `subodhkc/haiec-website` (branch `Main`):** canonical admission/producer verification, deterministic detectors, policy/authority decisions (U5), UCP control receipts, master report projection, tenant-scoped APIs and kill-switch access and actual runtime guard.
- **Drive:** historical governing decisions, source authoring and research. These `drive-snapshots/*.txt` are *text snapshots*, not live two-way sync; reimport only after explicitly comparing revisions and the manifest.
- **No automation:** do not automatically merge a private API security PR from a public documentation edit.

## 7. Completion definition (cannot claim release based on plan presence)

- Demo opens with one clear synthetic-lab origin banner, wrong target and exact persisted result.
- Operator can follow all six steps with source-bound proof and simulation distinctly colored, labelled and accessible.
- Cross-industry selector never shares assessment identities.
- No new source sample upgrades evidence role by self-assertion.
- Operator pause never calls real kill switch; no real-world safety outcome claimed.
- Full nine-system historical frozen read-only evaluations remain accessible.
- Public docs correctly distinguish planned, implemented, code-tested and independently production-verified.
- Real kill switch claims remain gated until code-level dispatch interception + native denial observation + secure owner and recovery tests.
- Compliance references are exact mapping outputs or visibly only contextual.
- Documentation snapshots and index are available in `main` for Devin after the docs PR is merged.

**Suggested Devin strategy:** Do not start a new UI rewrite or broad testing campaign. Review open PRs, reuse existing canonical engines, implement the smallest missing source/evidence bridges and keep each high-consequence security change in its owned private repo.
