# HackFW Submission Pack — HAIEC Manufacturing Assurance

Track: **AI for Manufacturing** · Demo: https://haiec-manufacturing-demo.vercel.app
Repo: https://github.com/subodhkc/manufacturing-ai-assurance-haiec (public)

## A. Final demo script (< 2 minutes)

Every step is a shareable URL — open the demo, then:

| # | Time | Screen | URL / action | Narration |
|---|------|--------|--------------|-----------|
| 1 | 0:00–0:15 | Station 217 flagship | `?report=s217` | "Nine AI systems run a fictional plant. One of them updated a work order — successfully — on the wrong work order. Approved: WO-217-4802. Recorded: WO-217-4803. Nothing failed visibly." |
| 2 | 0:15–0:35 | Case report | `?report=case:SYS-217-WRONG_TARGET` | "This is a real persisted evaluation — digest-verified in the browser. The detector matched a qualified target divergence, the delegated-action comparison reads BROADER, and the canonical disposition is REVIEW." |
| 3 | 0:35–0:55 | Operator Journey | nav → Operator Journey | "A human responds in six stages — detect, investigate, authorize, contain, verify, report. Containment here is a browser simulation, labeled as such." |
| 4 | 0:55–1:10 | Evidence planes | back on case report | "HAIEC shows exactly where proof stops: code reachability NOT_ASSESSED, authority planes partial. Unknown is rendered as unknown." |
| 5 | 1:10–1:25 | Public verification | case report → "Verify publicly on haiec.com" | "The evaluation is a view-only public receipt — integrity-verified, labeled SYNTHETIC_REFERENCE. Integrity is not source truth — and the page says so." |
| 6 | 1:25–1:50 | Executive report | `?report=exec` | "Nine systems, five states, 45 evaluations — all REVIEW, because the evidence never completes the whole picture. Wrong-target and corrected-state differ exactly where the evidence differs." |
| 7 | 1:50–2:00 | Optional: telecom | Reports hub → telecom tile | "Same canonical engine, historical reference — marked reference, not a second evaluation." |

## B. Video deliverable

The committed recording follows the cue order in `docs/hackfw/NARRATION.md`
(flagship → canonical chips → journey interaction → verify → case report →
executive → hub), not the live-walkthrough ordering in section A — both are
valid paths over the same deployed screens.

- Source recording: **CREATED** — `docs/hackfw/screens/judge-path-recording.webm` (WebM, ~110 s, 1440×900, real UI interaction incl. browser-only containment pause/attempt; reproducible via `scripts/capture-judge-path.cjs`, requires playwright).
- Voiceover script: `docs/hackfw/NARRATION.md`; timed subtitles: `docs/hackfw/judge-path-subtitles.vtt`.
- Ordered stills: `docs/hackfw/screens/01-flagship.png` … `07-hub.png`.
- Final edited video: **CREATED** — `docs/hackfw/screens/judge-path-final.mp4` (113 s, H.264/AAC, AI voiceover + burned-in captions, blank lead-in trimmed). Ready to upload as-is.
- Publicly hosted video URL (YouTube/Vimeo): **PENDING** — requires human upload; do not claim until the provider confirms.
- Devpost submission: **UNCONFIRMED** until actually submitted.

## C. Devpost submission copy

**Title:** HAIEC — evidence-bound assurance for manufacturing AI agents

**Problem:** A delegated AI system that acts on the wrong work order, part or
supplier does not announce itself — the operation succeeds and the divergence is
invisible to success monitoring. Factories need to know *what the AI actually
caused* and *whether it was authorized*, not just whether a call returned 200.

**Track:** AI for Manufacturing.

**How HAIEC solves it:** HAIEC ingests qualified source-world records, evaluates
them with a canonical deterministic engine (U5 disposition, delegated-action
comparison across nine dimensions, detector predicates, scoped effect-witness
controls), and binds every finding to a digest-verified, publicly verifiable
receipt. Wrong-target divergence is identified even when the action succeeds.

**Architecture:** source-world evidence producers → canonical ingestion +
qualification → Assurance Decision Engine (ALLOW/REVIEW/BLOCK) → U6 Assurance
Packages (integrity-pinned, publishable) → presentation layer. Manufacturing
adapter is a read-only projection — never a second engine.

**What is working:** 45 persisted canonical evaluations over a synthetic lab
corpus (9 systems × 5 states), publicly verifiable receipts, a full dashboard,
per-case reports, an executive report, and a six-stage operator journey.

**Evidence:** all 45 dispositions REVIEW; 9 wrong-target cases show
`MFG-EFF-001 MATCH` + `TARGET BROADER` + `R01 SATISFIED`; 9 corrected-state
cases show `NO_MATCH_WITH_ADEQUATE_COVERAGE` + `MATCHES` + `SATISFIED`;
reachability NOT_ASSESSED on all 45 — rendered honestly, not hidden.

**Limitations:** synthetic lab corpus (no real plant), code reachability
unassessed, no proven runtime containment path, no independent post-response
witness.

**Pilot path:** register real producers → qualify sources → canonical
evaluation → pilot operating envelope → runtime guards wired into a real
dispatcher → monitoring.

## D. Judging-criteria evidence matrix

| Criterion | Evidence | Honest boundary |
|---|---|---|
| Industrial usefulness | Wrong-target divergence on work orders is demonstrated; a successful wrong-target write is invisible to success monitoring | No invented losses, savings or severity claims |
| Physical robustness | Fail-closed digest verification; corrupt exports show INTEGRITY FAILURE only; simulation clearly labeled | No real OT integration — stated everywhere |
| Edge-to-AI pipeline | synthetic source-world capture → canonical ingestion → qualification → evaluation → report; replay bundle is digest-pinned | Replay is recorded synthetic evidence, not live telemetry |
| Data sovereignty | Tenant authorization server-side; exports are read-only projections; provenance `SYNTHETIC_LAB` + `AUTHORIZED_DB_READ` | Public receipts are view-only integrity proofs |
| Measured performance | 9/9 wrong-target cases produce the expected detector pattern; 136/142→142 repo tests; 37/37 browser acceptance | Scenario-acceptance coverage — **not** a real-world detection-accuracy claim |
| Enterprise readiness | Canonical engine, envelopes, U6 receipts, tenant model exist in production HAIEC | Runtime guard dispatch wiring and real adapters are listed gaps |

## E. Technical & judge FAQ

**Why do all 45 evaluations end in REVIEW — how is that a success?**
REVIEW is an evidence-bound disposition: the engine established specific facts
(target divergence, aligned corrected state) while honestly declaring what is
not established (reachability, planes). A tool reporting green here would be
inventing coverage.

**Observed effect vs authorized effect?**
The committed write on WO-217-4803 was *observed* — but the *delegated* target
was WO-217-4802. The DAI TARGET comparison = BROADER captures exactly that gap.

**Isn't this just an AI grading another AI?**
No. HAIEC is deterministic: detector predicates, dimension comparisons and
witness tests over digest-pinned records — no LLM judgment anywhere in the
verdict path.

**Source integrity vs producer authenticity?**
A verified digest proves the export is unchanged — it does not prove the
producer was authentic. Producer qualification and synthetic provenance are
separate, explicitly labeled axes.

**What does a real pilot need?**
Real registered producers, qualified source binding, dispatcher-wired runtime
guards, independent post-response witnesses, tenant authorization — all scoped
in the pilot path above.

**Other industries?**
Same canonical engine; the demo shows a telecom *historical reference* plus
four simulation-only sector narratives — labeled, never claimed as evaluations.

## F. Submission checklist

- [x] Public GitHub repo + working deployed demo
- [x] Judge guide + deep-linked reports
- [x] End-to-end source recording — `docs/hackfw/screens/judge-path-recording.webm` (~110 s, 1440×900, real Operator Journey interaction incl. browser-only SIMULATED_DENY, no audio track) + `judge-path-subtitles.vtt` + `NARRATION.md`
- [ ] Hosted video URL (YouTube/Vimeo) — human step; upload `judge-path-final.mp4`, Devpost needs the public link
- [ ] All participants registered at talent.fwtx.city — unconfirmed
- [ ] North Texas proximity/eligibility — human attestation
- [ ] Demo Day registration (luma.com/ygyxb4yy) + in-person attendance, Oct 30, 9:30 a.m.–3:00 p.m. CDT — human step
- [ ] Devpost submission before Oct 30, 2026 11:00 a.m. CDT — human step (deadline and event start are separate)
