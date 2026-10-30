# HackFW 2026 — GitHub source pack for Devin

This directory is the self-contained, versioned **implementation handoff** for the HAIEC manufacturing competition experience. Devin can read it directly from GitHub without Google Drive permissions.

**Read first:** [Devin implementation instructions](DEVIN_START_HERE.md) and [Enhanced execution plan v2.6](ENHANCED_EXECUTION_PLAN_v2.6.md).


## Printable judge handouts

- [HAIEC overview (two-sided PDF)](print/HAIEC_HackFW_2026_Overview_Double_Sided_Print.pdf): what problem HAIEC solves, how independent evidence-bound assurance works, and why it is not AI judging AI.
- [Manufacturing judge handout (two-sided PDF)](print/HAIEC_HackFW_2026_Judge_Handout_Print.pdf): Station 217 example, rule outcomes, saved synthetic evaluations, and QR links to live showcase, source and video.

Print US Letter, duplex, long-edge flip. The [Judge Guide](JUDGE-GUIDE.md) provides detailed evidence and proof boundaries.

## Google Drive text snapshots

These are complete copies of the *readable text returned by Google Drive on 15 October 2026*. Source line endings were normalized to LF and initial BOM removed; decisions, language and section ordering were not silently edited. Their original status statements describe the dates on which they were authored and may be superseded by later merged code.

| Repo-native file | Source document | Scope |
|---|---|---|
| [Master v2.4 + appended v2.5](drive-snapshots/MASTER_EXECUTION_PLAN_v2.4_PLUS_v2.5.txt) | [Drive Master](https://docs.google.com/document/d/1fjw9j6Kl_ynJqzeCRlQ_Z-y7xSx8XyNpCL1n8tOqohE/edit) | Nine systems, v3.1 intake, priorities, HackFW release, six-step journey and kill-switch gates |
| [Synthetic v3.1 enhancement](drive-snapshots/SYNTHETIC_EVIDENCE_v3.1_PLAN.txt) | [Drive Synthetic](https://docs.google.com/document/d/1ryqwpy3S-v5bxV1i1hcT83_v6JEoM-NZOQmaVYydyC0/edit) | Qualified intake candidates, source roles, entity correlation, scenarios and holdouts |
| [Multi-industry + Telecom](drive-snapshots/MULTI_INDUSTRY_TELECOM_EXECUTION_SPEC.txt) | [Drive Industries](https://docs.google.com/document/d/1o3CqviU7LRs2QhnFMRmncFhwH59zq8J2dhXvD2Fz1Qo/edit) | Shared dashboard, historic TM Forum reference, five fictional industry profiles and report presentation |

The [enhanced v2.6 plan](ENHANCED_EXECUTION_PLAN_v2.6.md) is **not** a copy of a Google Doc. It adds reconciliation against the repository and new recommendations. Original Drive snapshots remain source documents; this overlay specifies suggested implementation gates rather than altering that source.

## Snapshot trust and status

- Mirror type: *readable extracted document text*, not a fidelity-preserving Google Docs export. Embedded images, tables with native formatting, comments, revision metadata and smart chips are not represented unless converted into text in the extraction.
- Snapshot date: **2026-10-15**. This is a one-time capture, not a live sync. Refresh only after reading a newly revised source and explicitly comparing it with the mirrored text.
- Manufacturing main reviewed SHA: `fb5ae69a3c08ede205572046eaeb6233e5c75952` (PR #19).
- Operator Journey code reviewed as **unmerged** manufacturing [PR #20](https://github.com/subodhkc/manufacturing-ai-assurance-haiec/pull/20), focused CI had passed; do not describe as production merged.
- Private kill-switch recovery fix is **unmerged** HAIEC [PR #2211](https://github.com/subodhkc/haiec-website/pull/2211), authorization tests/CI require acceptance before merge.
- Manufacturing v1 27 frozen synthetic evaluations still exist; v3.1 registered source-native candidate files are not automatically newly evaluated snapshots.

**Sprint 16/17 reconciliation (status as of the merged state above is now superseded):**

- PR #20 **merged** `8b3e930`; PR #21 **merged** `55c8bbe` → manufacturing `main` (deployed via Vercel CLI production, deployment records `615d5ce`).
- HAIEC PR #2212 **merged** `770b94cdc` → `Main` (Vercel production READY); kill-switch PR #2211 **merged** `aff91c80`.
- 45 canonical v3 evaluations (9 systems × 5 states) are now persisted, exported under `data/evaluations-v3/` and publicly verifiable — genuine HAIEC evaluations **of synthetic lab evidence**, distinct from the v3.1 fixture pack, which remains unqualified candidate data.

## Evidence, IP and usage rules

This repository is public. The snapshots contain only planning prose, research sources and fictional scenarios. No HAIEC SaaS secret, tenant credential, proprietary executable assurance engine or privileged live production artifact should be committed here.

Source and precedence hierarchy: **actually qualified persisted HAIEC evaluation → admitted and role-qualified source data → verified candidate source context → fictional fixture → historical research/plan.** A source-text snapshot is never a runtime attestation, a rule outcome, a signed approval or a compliance certificate.

For current implementation truth, inspect live GitHub branch heads, source, tests and deployed commitment instead of assuming the Drive document is current.
