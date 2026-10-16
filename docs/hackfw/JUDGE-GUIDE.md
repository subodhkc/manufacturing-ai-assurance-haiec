# HackFW Judge Guide — HAIEC Manufacturing Assurance

**Submission deadline: October 30, 2026, 11:00 a.m. CDT.**
Public repo · demo video · participant talent registration · in-person Demo Day — all required.

## The 90-second path

1. Open `https://haiec-manufacturing-demo.vercel.app/?report=judge` — the
   **two-minute judge path** is a fixed seven-step sequence. Or press
   **"Judge demo — 2 minutes →"** on the Command Center.
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

## Shareable report URLs (Sprint 20)

| Destination | URL |
|---|---|
| Judge path (~2 min) | `/?report=judge` |
| Executive report | `/?report=exec` |
| Station 217 flagship (exec / tech) | `/?report=s217` · `/?report=s217-tech` |
| Any case report | `/?report=case:SYS-217-WRONG_TARGET` (all 45 IDs work) |
| Reports hub | `/?report=hub` |

All are public-safe (case IDs only — no org or principal data), refresh- and
bookmark-safe, and fail closed: unknown IDs land on the hub with a "Report not
found" notice; corrupt exports render INTEGRITY FAILURE, never findings.
Browser back/forward works via history state.

Full Devpost copy, judging-criteria matrix, FAQ and checklist:
`docs/hackfw/SUBMISSION.md`.

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
| 60-second Evidence Replay | Historical v1 source-world records bound to v1 evaluation `bce94772-…:assurance:1.1` — **not** the v3 assessment `f0647486-…:assurance:1.1` (Sprint 21: binding verified per-field, fails closed as `REPLAY_BINDING_MISMATCH`) |
| Telecom AL0/AL1/AL2 | Historical TM Forum reference — no new HAIEC finding |
| Other 4 industries | `SIMULATION_ONLY` fictional source stories |
| v3.1 pack | Source-native fixture/profile data — not an assessed corpus |

## Source → finding → consequence → report

`data/source-world` producer → canonical HAIEC ingest/evaluation →
`MFG-EFF-001 MATCH` + U5 `REVIEW` → export `f0647486-…:assurance:1.1` →
published 1.1.1 package → public verification page → dashboard projection.
The digest-pinned export is the single source of truth on screen.

**Reports & Evidence (Sprint 18/19):** the Reports page is a real destination —
nine-system Executive Assurance Report (45 canonical v3 evaluations, plain
language), a per-case report for each of the 45 (Industry → Manufacturing →
system → scenario → findings → report), the SYS-217 flagship in executive +
technical versions, and labeled links to the telecom historical reference and
four simulation-only sector reports. Signature status is explicit per report
(`SKIPPED` — signing not requested; unsigned ≠ invalid; reports are unsigned
read-only derivatives of persisted canonical evaluations, not authoritative
themselves). Digest verification still gates every canonical value; a failed
digest renders INTEGRITY FAILURE, never findings. Sprint 19 truth locks: all
45 dispositions are `REVIEW`; wrong-target = `MATCH`/`BROADER`/`SATISFIED`;
corrected-state = `NO_MATCH_WITH_ADEQUATE_COVERAGE`/`MATCHES`/`SATISFIED`;
detector + DAI + R01 are aligned views over shared evidence, not independent
producers.

**Sprint 21 — replay identity + reproducible judge path:** the Evidence
Replay now resolves its bound evaluation explicitly from the historical v1
register (`HXDATA.exportMap`) and validates every relationship — evaluation
ID, source world, scenario run, transaction ID, record count, and both
digests — before any finding renders; any divergence shows
`REPLAY_BINDING_MISMATCH`. The Command Center timeline is labeled historical
v1 alongside the current v3 assessment identity. A **Try It Yourself** page
(nav → Prove, Command Center, judge step 8 and the Reports hub) walks three
steps: (1) compare the four persisted SYS-217 evidence states verbatim —
baseline / wrong-target (`MATCH`/`BROADER`/`REVIEW`) / evidence-degraded
(`INSUFFICIENT_SOURCE`, missing `NATIVE_TARGET_READBACK`) / remediated
(`NO_MATCH`/`MATCHES`/`REVIEW`); (2) run the same Decision Lab fixture with
3 / 40 / 60 engines (pass · supervisor review · plant-manager review);
(3) inspect the local event in Monitoring and export a ledger labeled
`BROWSER_LOCAL_SIMULATION_NOT_HAIEC_EVALUATION`. Local effect labels were
corrected to `SIMULATED_LOCAL_READBACK` — no local path claims independently
witnessed production effects. Per-system report navigation now links real
persisted artifacts and marks never-issued types `NOT ISSUED`.

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
- [x] Demo video — `docs/hackfw/screens/judge-path-final.mp4` (CREATED, 113 s, 1440×900 H.264, AI voiceover + burned captions; source WebM + `judge-path-subtitles.vtt` + `NARRATION.md` retained).
- [ ] Hosted video URL (YouTube/Vimeo link for Devpost) — PENDING until provider-confirmed.
- [ ] Participant talent registration — talent.fwtx.city, human-owned, unconfirmed.
- [ ] In-person Demo Day — October 30, 2026, 9:30 a.m.–3:00 p.m. CDT (separate event; RSVP luma.com/ygyxb4yy).

## Why does HAIEC show REVIEW when a fictional human approved deployment?

The **HAIEC Assurance Result** expresses evidence-qualified assurance — what the
persisted, digest-verified evidence actually establishes, including explicit
unknowns. The Deployment Governance page shows a **separate, explicitly
simulated record** of fictional human decisions (3 scoped approvals, 2
rejections, 4 pending — including Station 217, whose write expansion stays
pending after the observed target mismatch). Neither substitutes for the other:
a fictional approval is a human's scoped operating decision, not a HAIEC
verdict; a "Review required" result is not a deployment ban, it is what the
evidence supports.

The page opens with a **coordinated scenario playback** — one shared clock
drives three lanes (Action & scope · Reviewer · Monitoring & evidence). The
default *Enterprise overview* (~78 s) contrasts three outcomes: Vision
Inspection operating inside its approved scope, Station 217's write expansion
held after the target mismatch, and a rejected schedule-commit expansion.
Selecting any of the nine systems plays its ~40 s human-review journey
(request → accountable role → notification previews → evidence → decision →
operating status → monitoring). Pause, step, restart, or change speed with the
player controls; reduced-motion shows a static equivalent. It is illustrative
workflow — no live dispatcher, connector, email or SMS is connected — and all
events come from the same versioned scenario artifact
(`scenario-shared.json`) that drives the HAIEC website demonstration, so both
apps tell one identical story. Monitoring coverage there is derived from demo
records inside the fictional scenario — live connectors stay not connected.

**Sprint 25 — full-platform showcase + Station 217 two-event story:**

- **Station 217 journey is now two linked episodes (~47 s).** Episode A
  (`RECORDED_MISMATCH_DETECTED`) is the saved HAIEC evaluation detecting the
  recorded target difference — approved `WO-217-4802`, committed
  `WO-217-4803`, result REVIEW, digest-verified. Episode B
  (`SUBSEQUENT_WRITE_HELD`, attempt `DEMO-GW-SYS-217-02`) is a *subsequent*
  simulated write request held at the demonstration gateway while request
  `DEMO-REQ-SYS-217-06` stays pending — advisory work continues. The recorded
  event was detected, never described as prevented.
- **Seven-facet readiness view** (`data/demo-governance/scenario-readiness.json`,
  schema `scenario-readiness-1.0.0`): platform readiness · org entitlement ·
  reviewer eligibility · operating boundary · monitoring connectivity ·
  qualified evidence · approval & execution control — honest authored states,
  each bound to a named source. Rendered inside the Station 217 governance
  block and the flagship report; one-page print version at
  `dashboard/report/supporting/station-217-readiness.html`.
- **Enterprise Operating & Governance Report** — Reports & Evidence →
  "Enterprise Operating & Governance Report" (or `?report=gov`): nine systems,
  scopes, the 3/2/4 decision split, reviewer roles, monitoring coverage,
  Station 217's two events, next business actions and a real-vs-authored
  provenance table. Presentation derivative — signature SKIPPED.
- **Twelve-page visual supporting report** —
  `dashboard/report/supporting/haiec-12p.html` (+ `.pdf`), generated by
  `scripts/build-supporting-report.cjs` from the shared scenario artifact and
  the export bundle: platform map (3 pillars / 6 selectable capabilities),
  evidence flow, assurance results, scope & decisions, review lifecycle,
  monitoring chronology, the two-event timeline, nine unique system cards and
  a verification/limits page. Classified `NOT AN ISSUED ASSURANCE REPORT`.
- **Command Center capability map** — the exec page leads with six
  independently selectable goal tiles (Discover · Evaluate · Authorize ·
  Monitor · Protect · Verify) grouped under Understand / Assure / Govern &
  Operate, each deep-linking an existing view.
- Player controls, pause/step/speed, hidden-tab pause and reduced-motion
  behavior are unchanged; CI now `--check`-s both generators for drift.

**Sprint 26 — interactive Digital Factory:**

- **Digital Factory page (nav "DF")** — one fictional plant in three panels:
  MES work orders (`WO-217-4802`, `WO-217-4803`, `WO-340-9110` with quality
  holds and per-order attempt history), ERP (`REQ-2026-8842` PO proposal,
  supplier qualifications, held/quarantined lots) and virtual equipment
  (`EQ-TORQUE-217`, `EQ-SPINDLE-88`, `EQ-DYNO-412` gauges with deterministic
  readings, heartbeat, alarm and signal-loss states).
- **Interactive actions all flow through the same local policy as the Decision
  Lab** — `policyVerdict`/`commitOutcome` are the single funnel: Attempt MES
  update → held (out of scope); Issue advisory note → applied in scope;
  Commit purchase order → pending buyer review (approve in the review modal
  to commit); held-stock and receiving-lot releases → denied; 3/40/60-engine
  outcomes unchanged.
- **Anomaly buttons** (torque anomaly, temperature rise, signal interruption,
  restore) change the virtual equipment deterministically and record one
  `OBSERVED` monitoring event each in the shared ledger — the same
  `EV-####`/`REV-####` sequence the Decision Lab uses, so an action can never
  show two different outcomes.
- **Interaction ribbon** at the top traces each action proposed → boundary →
  review → outcome → ledger; the live feed shows pending reviews with
  open-review buttons and links to the verified `SYS-217-WRONG_TARGET` report.
- **`?report=gov`** gained a Digital Factory Operations section: fixture
  baseline table plus in-session activity, classified separately from the
  digest-verified evaluations. Disclosure is concentrated in the "About this
  demonstration" card; the saved 45/27 evaluations are untouched.
- Fixture `data/demo-factory/digital-factory.json` (`demo-digital-factory-1.0.0`)
  is the single source for new identities; `scripts/build-factory-data.cjs`
  emits the browser bundle and is `--check`-enforced in CI.

**Sprint 27 — integrity, sessions and a portable record:**

- **Guided demonstration** — the factory page's "Guided demonstration →"
  button walks a judge through seven steps: 3-engine auto-pass, 40-engine
  supervisor approval, 60-engine plant-manager pending, the Station 217
  held write, the two-gate ERP story, anomaly + signal-loss monitoring, then
  a one-click record export. Each step calls the same functions the panel
  buttons call — no separate demo path.
- **Two independent gates on purchase orders** — approving `REQ-2026-8842`
  covers financial authority only; the commitment stays
  `HELD_SUPPLIER_QUALIFICATION` because `VND-FST-118`'s PPAP is expired.
  `REQ-2026-8855` (qualified supplier) commits on approval — the same policy
  path produces both outcomes.
- **Reset session** — coordinated reset: new `SES-####` identity, virtual
  plant + MES counters restored, prior pending requests closed (they cannot
  approve into the new session), append-only ledger preserved with prior
  sessions labeled.
- **Portable record** — `?report=demo` renders the session record; "Export
  record" downloads `haiec-demo-record-SES-####.json`
  (`demo-factory-record-1.0.0`, explicitly not HAIEC-issued); "Import record"
  replays a validated file read-only.

**Sprint 28 — decision integrity and reviewer roles:**

- **Fictional reviewer roles are enforced** — every review request names its
  required role (40 engines → Quality Supervisor; 60 → Plant Quality Manager;
  POs → Authorized Buyer). Pick a different role in the review dialog and the
  approval is refused with a `ROLE_MISMATCH` ledger event; the request stays
  pending and nothing mutates. Prohibited operations can't be approved under
  any role. This is scenario roleplay, not authentication.
- **Purchase orders gate twice before committing** — even under the buyer
  cap, an expired-supplier PO stays `HELD_SUPPLIER_QUALIFICATION` and never
  enters committed value; a qualified under-cap PO commits its own target.
- **Guide hardening** — each step shows its expected result and a live
  baseline→now table; steps can't be double-run; "Restart demonstration"
  starts a clean session boundary.
- **Hardened record review** — "Review saved demonstration record" validates
  imported JSON structurally (identities, references, contradictory states,
  URL safety, size caps) and renders it read-only.
- **NotebookLM packaging** — the exported `haiec-demo-record-SES-####.json`
  is self-describing; an authorized operator can pair it with the SYS-217
  case report, operating report and 12-page PDF for an executive report.
  Nothing uploads automatically.

**Problem track:** AI for Manufacturing — one of the three official Devpost submission problem tracks.
