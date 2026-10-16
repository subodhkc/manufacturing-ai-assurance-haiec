# Sprint 29 — Implementation Status

Status: **shipped** (one consolidated PR; see repository history for commit/PR
identity). Sprint 29 is a presentation sprint — it makes the platform built in
Sprints 24–28 visible to judges and enterprise buyers. No new simulation
engine, approval service, connector or evaluation was added.

## Judge journey reconciliation (P0)

- `?report=judge` (`rpJudge` in `dashboard/report/reports.js`) was rewritten
  from a nine-step "two-minute" list into a **Two-Minute Judge Showcase**:
  seven fixed scenes ordered platform → divergence → controls → factory →
  cross-system decisions → monitoring → close, each linking real routes.
- The **Interactive Deep Dive** (guided demonstration, 3/40/60-engine reviews,
  role enforcement, record export) is a separate section on the same page and
  on the Digital Factory — linked, never required.
- Reports Hub tile copy updated from the stale "fixed seven-step sequence" to
  the showcase + deep-dive description. All existing `?report=` routes,
  bookmarks and playback are unchanged.
- Platform-first ordering: pillars and six capabilities lead; manufacturing is
  presented as the reference demonstration. One consolidated methodology
  section at the end; a small "Interactive Demo Factory" marker sits near
  active controls instead of repeated disclaimers.

## Video package (P0)

New v29 package under `docs/hackfw/screens-v29/` (previous cut retained in
`docs/hackfw/screens/`):

- `judge-path-final-v29.mp4` — **113.8 s**, 1440×900 H.264/AAC, AI narration
  (edge-tts), burned captions, generated title + closing cards.
- `judge-path-recording.webm` — 94.7 s source screen capture of the live
  production UI (real interactions: held MES write, advisory, held-stock
  release, two-gate PO approvals, anomaly + signal loss).
- `01-platform.png` … `09-showcase-close.png` — ordered stills;
  `thumbnail-v29.png` — cover image.
- `docs/hackfw/NARRATION-V29.md` (script) + `judge-path-subtitles-v29.vtt`
  (timed captions, also burned in).
- `scripts/capture-judge-path.cjs` — rewritten for the v29 scene order;
  `scripts/render-judge-video.cjs` — card/TTS/ffmpeg compose pipeline
  (requires playwright + edge-tts + ffmpeg in the environment; all are
  external tools, not repo deps).

## Authentic sample record (P1)

`docs/hackfw/demo-record-sample.json` is a genuine browser export from the
production site (session `SES-0001`, 35 events, 2 review requests) captured by
`scripts/export-demo-record.cjs`. Its session ledger mirrors the video
scenario exactly: MES write denied, advisory applied, held-stock release
denied, `REQ-2026-8842` financially approved but `HELD_SUPPLIER_QUALIFICATION`,
`REQ-2026-8855` committed, torque anomaly + signal interruption observations.
It is `demo-factory-record-1.0.0`,
`BROWSER_LOCAL_DEMONSTRATION_RECORD_NOT_HAIEC_ISSUED` — a demonstration
artifact, not an assurance report.

## Documentation (P1)

- `docs/hackfw/JUDGE-GUIDE.md` — two-experience path, new URL table
  (`?report=judge`/`demo`/`gov` included), v29 video outline, checklist.
- `docs/hackfw/SUBMISSION.md` — new scene table, video inventory, updated
  "what is working" (digital factory, role enforcement, two-gate PO,
  monitoring, exportable record), test count updated to 209, hosted-URL and
  Devpost items remain explicitly human-owned/unconfirmed.
- Seven-step/nine-step terminology reconciled: the showcase is the short
  fixed path; the deep dive is the interactive guide.

## Boundaries kept

No new MES/ERP/PLC backend, browser simulation engine, approval or policy
service, native evaluation, telemetry infrastructure, or customer connectors.
The 45 current + 27 historical evaluations and source digests are unchanged.
HAIEC Main untouched — no shared-contract defect required a change.
