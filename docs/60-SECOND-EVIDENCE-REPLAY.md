# 60-Second Sequential Evidence Replay — Design Specification

Status: **MODE A IMPLEMENTED** (Sprint 14.3) — the dashboard `Evidence Replay` page plays the SYS-217-WRONG_TARGET sequence per this spec. Mode B remains deferred.

The manufacturing dashboard is **not** continuously connected to HAIEC telemetry. This document specifies a future judge-facing demonstration that plays a recorded, digest-pinned evidence sequence when the user clicks **Run Evidence Replay**.

## Modes

| | Mode A — Recorded evidence replay | Mode B — Future live HAIEC monitoring |
|---|---|---|
| What runs | Deterministic client-side presentation of persisted facts | Authenticated producer intake → canonical evaluation → authorized readback |
| Backend scan / new evidence | None. Ever. | Yes — real ingest + evaluation |
| Data source | Committed export bundle + Station 217 replay bundle + source-world records | Live producers with persistent correlation IDs |
| Ordering | Fixed 8-step script, wall-clock paced | Event-arrival order; UI reflects arrival truthfully |
| Scheduling | No cron needed — replay is user-triggered | May use existing HAIEC cron/queue for scheduled ingestion, source-health checks, notifications |
| Auth | None (public synthetic content) | Required: authorized org member or scoped read token (polling/SSE) |

Mode B is out of scope for this sprint. No cron jobs or live monitoring backend are created here.

## Mode A — the 60-second sequence

All displayed facts come from committed artifacts: `data/evaluations/sys-217-wrong-target.json` (evaluation `bce94772-…:assurance:1.1`), `data/station217/replay-bundle.json`, and `data/generated/` source-world records. **No event timestamps are fabricated** — on-screen times are *display pacing*, and each event card carries its real source record timestamp or an explicit `time not recorded` marker.

| Window (s) | Step | Content | Source of truth |
|---|---|---|---|
| 0–8 | Request | AI request card: action, exact target `WO-217-4802`, requesting agent | `sourceCase` + source-world request record |
| 8–15 | Principal | Principal identity, service credential, delegated authority scope | `policy` / `iam` claim records in the corpus |
| 15–22 | Policy | Applicable policy version and effective-access envelope | `qualifiedClaims` incl. `APPROVED_POLICY`, `EFFECTIVE_GRANT` |
| 22–30 | Dispatch | Permitted/denied dispatch decision record | `OBSERVED_DISPATCH` claim record |
| 30–38 | Effect | Native transaction commit + target-state readback on `WO-217-4803` | `commit`/`readback` claim records, `NATIVE_TARGET_READBACK` |
| 38–46 | Evaluation | HAIEC source qualification + verbatim rule outcomes | `manufacturing.ruleOutcomes` |
| 46–53 | Control | R01 UCP result `SATISFIED` / `RECEIPT_BOUND` + limitations | `manufacturing.controlMaturity` |
| 53–60 | Report | Master Assurance Report card: disposition `REVIEW`, finding, next action; links to public sample + authenticated original | `evaluation.links`, `report/` derivatives |

Each step must render even when its evidence is absent — absent facets show `NOT RECORDED`, never a guess.

## Controls

- **Start / Pause / Resume / Reset / Replay-from-step-N** — the sequence is a deterministic state machine: `stepIndex`, `elapsed`, `paused`. Reset returns to a pristine pre-run state.
- **Pacing** — nominal 60 s total; a "step-by-step" mode removes the timer for accessibility.
- **Judge isolation** — pure client-side state; two judges on separate devices cannot interfere. No shared session, no server-side run registry.
- **Missing evidence** — a step whose underlying claim is absent renders a `MISSING EVIDENCE` card (mirroring `INSUFFICIENT_SOURCE` semantics), never a synthetic substitute.
- **Failure states** — if the export or replay bundle digest fails verification, the replay does not start; the UI shows `INTEGRITY_FAILURE` and withholds all assurance content (same fail-closed contract as the evaluations page).
- **Mobile** — the timeline collapses to a vertical stepper; the active step card stays visible; all text readable at 360 px width.

## Honesty requirements

- The UI label is **"Run Evidence Replay"**, never "Run scan" or "Monitor live".
- A persistent banner during replay: *"Recorded evidence replay — no backend scan or new evidence collection."*
- The completion card distinguishes: replayed facts (recorded), evaluation (persisted, frozen), and open unknowns (verbatim limitations).
- Mode B is described in a collapsed "future" note only; it must never appear as available behavior.
