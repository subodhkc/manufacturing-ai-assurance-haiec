# Devin: HackFW 2026 repo-native handoff

**Start here.** This file is an actionable implementation handoff, not a request to restart architecture research or to reproduce the Drive documents in another repo.

## Read in this exact order

1. [Enhanced execution plan v2.6](ENHANCED_EXECUTION_PLAN_v2.6.md), including status, source-truth locks and owner/gates.
2. [Source inventory and Drive snapshot manifest](README.md).
3. [Full original Master v2.4 with appended v2.5](drive-snapshots/MASTER_EXECUTION_PLAN_v2.4_PLUS_v2.5.txt), then [Synthetic v3.1](drive-snapshots/SYNTHETIC_EVIDENCE_v3.1_PLAN.txt), then [Multi-industry / Telecom](drive-snapshots/MULTI_INDUSTRY_TELECOM_EXECUTION_SPEC.txt). The snapshot texts are planning history; do not overwrite status in them.
4. [Current industry release contract](../INDUSTRY-DASHBOARD-RELEASE.md), [60-second recorded replay](../60-SECOND-EVIDENCE-REPLAY.md), [existing operator v2.5 UI plan on PR #20](https://github.com/subodhkc/manufacturing-ai-assurance-haiec/blob/feat/operator-journey-evidence-bound-hackfw/docs/OPERATOR-ACTION-ASSURANCE-UX-V2.5.md).
5. Read the current repository's `main` SHA and open PRs immediately before editing. The status in this file was reviewed 15 Oct 2026 and may be older than new merges.

## Fixed boundaries and repository conventions

- Manufacturing source/reference repo: `subodhkc/manufacturing-ai-assurance-haiec`, branch **`main`** (lowercase).
- HAIEC private canonical repo: `subodhkc/haiec-website`, branch **`Main`** (uppercase).
- Never rebuild or ship a separate assurance engine in the public manufacturing repository.
- Never allow a browser simulator, oracle answer, source fixture, static report graphic or synthetic source claim to become a qualified approval, runtime action or effect witness by presentation alone.
- Immutable existing 27 HAIEC exported evaluations are v1 synthetic source, not freshly assessed source-native v3.1.
- `MFG-EFF-001 MATCH` = qualified wrong-target divergence, NOT passing rule. `U5 REVIEW` is a different decision. `R01 SATISFIED` only proves the specified effect-witness test, NOT authorized/safe operation or containment.
- No real PLC/OT commands, customer MES/WMS writes, live kill-switch requests, payment settlement, external company partnerships or fake regulatory certification.
- If an evaluation source is missing/corrupt or a producer is unqualified, render a bounded UNKNOWN / NOT_ASSESSED / INSUFFICIENT_SOURCE. Never synthesize a PASS.
- Previously shared real-client credentials require rotation and use of a secure secret store; never copy secrets into GitHub or prompts.
- Do not change Vercel Git identity to work around deployments. Merge an approved public PR to `main`, then verify existing automatic deployment; private `Main` follows its own production gate.

## Initial task and bounded steps

1. **Reconcile before coding:** confirm whether manufacturing [PR #20](https://github.com/subodhkc/manufacturing-ai-assurance-haiec/pull/20) and HAIEC private [PR #2211](https://github.com/subodhkc/haiec-website/pull/2211) have merged, and read their CI. Do not recreate either implementation.
2. **UI accept/release:** inspect deployed operator journey and mobile/keyboard/print; verify all six stages, old nine-system Assurance, profile switching and Report navigation. Correct only concrete UI failures in a focused public PR. A Vercel READY record is not browser acceptance.
3. **Private-security gate:** If unmerged, finish kill-switch recover tenant isolation; review trusted actor/trigger and effective dispatcher binding separately. Do not claim enforced containment simply because a guard helper exists.
4. **Fresh source path:** Start with SYS-217 v3.1 typed source data. Show rejected malformed/foreign/expired sources and actual tenant-qualified accepted records. Run a NEW canonical HAIEC evaluation and Master Report with fresh ID; do not alter v1 receipts.
5. **Nine-system expansion:** Reuse canonical HAIEC engine to evaluate nine systems' baseline/degraded/wrong-target as separately immutable v3.1 states, then nine corrected/remediated states. A correction is not proven unless new evidence and snapshot are independently qualified.
6. **Framework view:** Use existing HAIEC versioned mapping registry and map only qualified evaluated rules. If no owned mapping, display CONTEXTUAL reference, not “compliant.”
7. **Sector enhancement:** one careful consequence narrative each: quality-held shipment, vendor-bank/PO scope, firmware/revision test, wrong rail asset, and telecom network slice historical AL states. All remain simulation/reference until qualified evaluation exists.

## Definition of done for each commit/PR

- State precise source ID, role, subject, scoped outcome and any unavailable or missing evidence.
- Correct source-world / evaluation ID binding, tenant checks and no cross-profile contamination.
- Focused code-level and data parity tests; no repeated full-suite runs except release CI.
- Report which actions are simulated, HAIEC-evaluated, production-enforced or not established.
- Public and private repo work remain separate PRs. Never merge private security work into public app.
- Merge to owned branch after acceptance, verify CI and deployment SHA, and report real resulting status (not promises).

## Fast source paths

```text
README.md
docs/hackfw/README.md
docs/hackfw/ENHANCED_EXECUTION_PLAN_v2.6.md
docs/hackfw/drive-snapshots/*.txt
docs/INDUSTRY-DASHBOARD-RELEASE.md
docs/60-SECOND-EVIDENCE-REPLAY.md
dashboard/index.html
dashboard/industry/industry.js
data/source-native/v3.1/
data/evaluations/manifest.json
scripts/build-dashboard-data.cjs
scripts/build-industry-data.cjs
packages/fixtures/
```

**Minimal local check:** `npm run verify` (Node 22+). UI/browser review remains separate. Do not auto-publish new document updates; a new Drive version requires an explicit snapshot refresh with diff to these files.
