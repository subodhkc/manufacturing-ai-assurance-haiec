# HackFW Judge Guide — HAIEC Manufacturing Assurance

**Submission deadline: October 30, 2026, 11:00 a.m. CDT.**
Public repo · demo video · participant talent registration · in-person Demo Day — all required.

## The 90-second path

1. Open `https://haiec-manufacturing-demo.vercel.app` → **Command Center**.
   The narrative: *the AI had access — it changed the wrong work order.*
2. **HAIEC Assurance** — pick `SYS-217 · Wrong Target`. Every number on that
   page is verbatim from a persisted canonical HAIEC evaluation.
3. **Operator Journey** — six stages: Detect → Investigate → Authorize →
   Contain → Verify → Report. Containment is explicitly a *browser-only
   rehearsal*; independent response proof is shown as `NOT ESTABLISHED`.
4. **Industry Experiences** — switch to Telecommunications for one short
   AL0/AL1/AL2 historical reference, then back. Profiles are isolated.
5. Any verification link opens `haiec.com/verify/assurance/{id}` — integrity
   verification of the exact issued receipt, labeled `SYNTHETIC_REFERENCE`.

## What is canonical vs simulated

| Surface | Status |
|---|---|
| 27 v1 exports (`data/evaluations/`) | REAL HAIEC evaluations of fictional v1 source world — frozen, digest-verified |
| 45 v3 exports (`data/evaluations-v3/`) | REAL HAIEC evaluations of synthetic lab evidence — 9 systems × 5 states, persisted, publicly verifiable (`SYNTHETIC_REFERENCE`) |
| `MFG-EFF-001 MATCH` on SYS-217 | Qualified target-divergence finding (`WO-217-4802` approved → `WO-217-4803` recorded) |
| U5 `REVIEW` | Canonical assurance disposition — not a pass |
| R01 `SATISFIED` | Scoped effect-witness test only — not safe-containment proof |
| Five evidence planes (`NOT_ASSESSED`) | Honest plane states — EVIDENCE_ONLY basis, never promoted |
| Operator Journey Contain stage | Browser-only simulation — no kill-switch call, no OT actuation |
| 60-second Evidence Replay | Historical v1 source-world records — not v3 evaluation data |
| Telecom AL0/AL1/AL2 | Historical TM Forum reference — no new HAIEC finding |
| Other 4 industries | `SIMULATION_ONLY` fictional source stories |
| v3.1 pack | Source-native fixture/profile data — not an assessed corpus |

## Source → finding → consequence → report

`data/source-world` producer → canonical HAIEC ingest/evaluation →
`MFG-EFF-001 MATCH` + U5 `REVIEW` → export `f0647486-…:assurance:1.1` →
published 1.1.1 package → public verification page → dashboard projection.
The digest-pinned export is the single source of truth on screen.

**Reports & Evidence (Sprint 18):** the Reports page is now a real destination —
nine-system Executive Assurance Report (45 canonical v3 evaluations, plain
language), a per-case report for each of the 45 (Industry → Manufacturing →
system → scenario → findings → report), the SYS-217 flagship in executive +
technical versions, and labeled links to the telecom historical reference and
four simulation-only sector reports. Signature status is explicit per report
(`SKIPPED` — signing not requested; unsigned ≠ invalid). Digest verification
still gates every canonical value; a failed digest renders INTEGRITY FAILURE,
never findings.

## Video outline (<2 min)

- 0:00–0:15 Command Center: wrong-target consequence, 9-system estate.
- 0:15–0:40 SYS-217 Wrong Target case: MATCH, U5 REVIEW, honest NOT_ASSESSED planes.
- 0:40–1:10 Operator Journey: Detect → Investigate → Authorize (human checklist) → Contain (labeled browser-only) → Verify (response proof NOT ESTABLISHED) → Report.
- 1:10–1:30 Public verification page: `INTEGRITY_VERIFIED` + `SYNTHETIC_REFERENCE` — integrity ≠ source truth.
- 1:30–1:50 Telecom switch (5 seconds) → "one canonical engine, honest per-plane truth, no overclaim."
- 1:50–2:00 Preservation note: 27 v1 + 45 v3 real persisted evaluations; everything else labeled simulation/reference.

## Submission checklist

- [x] Public repo with run instructions (root README).
- [x] Stable demo: frozen verified exports; works static/`file://` and deployed.
- [ ] Demo video (use the outline above).
- [ ] Participant talent registration — organizer portal.
- [ ] In-person Demo Day — October 30, 2026, 11:00 a.m. CDT.
