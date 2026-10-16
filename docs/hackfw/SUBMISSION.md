# HackFW Submission Pack — HAIEC Manufacturing Assurance

Track: **AI for Manufacturing** · Demo: https://haiec-manufacturing-demo.vercel.app
Repo: https://github.com/subodhkc/manufacturing-ai-assurance-haiec (public)

## A. Two-Minute Judge Showcase (< 2 minutes)

`?report=judge` is a fixed, concise showcase — platform first, then the
manufacturing proof. The video below follows the same seven scenes:

| # | Time | Screen | Narration beat |
|---|------|--------|----------------|
| 1 | 0:04–0:16 | Executive Command Center | "HAIEC gives you evidence-bound assurance for consequential AI. Understand what your AI can do. Assure what it does. Govern what it may do — in any industry." |
| 2 | 0:16–0:28 | Station 217 flagship `?report=s217` | "A plant-floor AI was told to update work order 4802. It performed flawlessly — on work order 4803. HAIEC's deterministic engine caught the divergence. The verdict: review required." |
| 3 | 0:28–0:42 | Digital Factory — MES | "The agent tried to write back. Its declared scope doesn't allow it — held for a human, while a permitted advisory note proceeds." |
| 4 | 0:42–0:56 | Digital Factory — live | "Work orders, purchase orders, live equipment telemetry — one shared state, one operating boundary. Held material stays held." |
| 5 | 0:56–1:14 | ERP — two-gate decisions | "The buyer approves the spend — but the supplier qualification expired, so the commitment holds. The qualified order approves and commits." |
| 6 | 1:14–1:30 | Monitoring + record | "Anomalies become monitoring observations — alongside the operating report and the exact record of what was asked, decided and simulated." |
| 7 | 1:30–1:53 | Showcase close + card | "Know what your AI can do. Govern what it may do. Verify what happened. Deploy AI with confidence." |

Optional afterwards: the **Interactive Deep Dive** on the Digital Factory page
(guided demonstration — 3/40/60-engine reviews, role enforcement, record
export). No step is mandatory.

## B. Video deliverable

- Final video: **CREATED** — `docs/hackfw/screens-v29/judge-path-final-v29.mp4` (113.8 s, 1440×900 H.264/AAC, AI voiceover via edge-tts + burned-in captions, title + closing cards). Ready to upload as-is.
- Source recording: `docs/hackfw/screens-v29/judge-path-recording.webm` (94.7 s WebM of real production UI interaction) — reproducible via `scripts/capture-judge-path.cjs` (playwright).
- Voiceover script: `docs/hackfw/NARRATION-V29.md`; timed captions: `docs/hackfw/judge-path-subtitles-v29.vtt` (also burned in).
- Stills: `docs/hackfw/screens-v29/01-platform.png` … `09-showcase-close.png`; thumbnail/cover: `docs/hackfw/screens-v29/thumbnail-v29.png`.
- Render pipeline: `scripts/render-judge-video.cjs` (cards via Playwright, narration via edge-tts, assembly via ffmpeg).
- Prior video retained unchanged in `docs/hackfw/screens/`.
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
per-case reports, an executive report, a nine-system operating & governance
report, and a six-stage operator journey. On top of that sits an interactive
browser-local digital factory: MES work orders, ERP purchase orders and
virtual equipment telemetry sharing one policy boundary — held MES writes,
permitted advisories, two-gate supplier/financial PO decisions, fictional
reviewer-role enforcement (Quality Supervisor / Plant Quality Manager /
Authorized Buyer), equipment anomalies and signal-loss monitoring, and an
exportable `demo-factory-record-1.0.0` session record that stays explicitly
labeled non-HAIEC-issued.

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
| Measured performance | 9/9 wrong-target cases produce the expected detector pattern; 209/209 repo tests; 24/24 production browser checks (Sprint 28) | Scenario-acceptance coverage — **not** a real-world detection-accuracy claim |
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
- [x] End-to-end source recording + final video — `docs/hackfw/screens-v29/` (113.8 s MP4, real production UI, AI narration + burned captions) + `judge-path-subtitles-v29.vtt` + `NARRATION-V29.md` + `demo-record-sample.json` (authentic browser export)
- [ ] Hosted video URL (YouTube/Vimeo) — human step; upload `judge-path-final-v29.mp4`, Devpost needs the public link
- [ ] All participants registered at talent.fwtx.city — unconfirmed
- [ ] North Texas proximity/eligibility — human attestation
- [ ] Demo Day registration (luma.com/ygyxb4yy) + in-person attendance, Oct 30, 9:30 a.m.–3:00 p.m. CDT — human step
- [ ] Devpost submission before Oct 30, 2026 11:00 a.m. CDT — human step (deadline and event start are separate)
