# Judge Showcase Narration (~115 s) — Sprint 29 Demo Video

Conversational voiceover for `judge-path-final-v29.mp4` — the Sprint 29
two-minute HAIEC platform showcase. `(beat)` = half-second pause. Timed to
`judge-path-subtitles-v29.vtt`; the 4 s title card runs first (silent).
The Sprint 20.1 script and cut are preserved in `NARRATION.md` /
`judge-path-subtitles.vtt` / `judge-path-final.mp4`.

| Cue | Screen | Voiceover |
|-----|--------|-----------|
| 0:00–0:04 | Title card — "Deploy AI with confidence / HAIEC Manufacturing Demonstration" | *(silent)* |
| 0:04–0:16 | Executive Command Center — pillars + six capability tiles | "HAIEC gives you evidence-bound assurance for consequential AI. Understand what your AI can do. Assure what it does. Govern what it may do — in any industry. (beat) Let's see it on a manufacturing floor." |
| 0:16–0:28 | Station 217 flagship (`?report=s217`) | "A plant-floor AI was told to update work order forty-eight-oh-two. It performed flawlessly — (beat) on work order forty-eight-oh-three. Nothing alarmed. HAIEC's deterministic engine caught the divergence. The verdict: review required." |
| 0:28–0:42 | Digital Factory — MES write held, advisory proceeds | "Then the agent tried to write back to the factory system. Its declared scope doesn't allow it — so the action is held for a human, (beat) while a permitted advisory note proceeds. That's the difference between an agent acting and an agent being governed." |
| 0:42–0:56 | Factory live — held-stock release denied, gauges animating | "This is a working digital factory: work orders, purchase orders, live equipment telemetry — one shared state that responds to every action through the same operating boundary. Held material stays held." |
| 0:56–1:14 | ERP pair — REQ-2026-8842 held, REQ-2026-8855 commits | "Watch two decisions stay independent. The buyer approves the spend — (beat) but the supplier's qualification expired, so the commercial commitment holds. The qualified order? Approved — and committed. Financial authority and supplier qualification are different gates." |
| 1:14–1:30 | Torque anomaly + signal loss → demonstration record | "Anomalies become monitoring observations — a torque spike, a lost signal — alongside the human operating report and the exact record of what was asked, decided, and simulated." |
| 1:30–1:45 | Judge showcase close (`?report=judge`) | "Know what your AI can do. Govern what it may do. Verify what happened. Every finding is digest-verified — and this receipt is public." |
| 1:45–1:55 | Closing card — methodology + CTA | "Deploy AI with confidence. Stay in control of every consequential action. Explore the interactive digital factory yourself." |

## Editing notes

- **Final cut (produced):** `docs/hackfw/screens-v29/judge-path-final-v29.mp4` —
  ~115 s, H.264/AAC 1440×900. Title card + closing card, AI voiceover
  (edge-tts `en-US-AvaMultilingualNeural`), per-scene zoom focus, captions
  burned from `judge-path-subtitles-v29.vtt`.
- Source recording: `docs/hackfw/screens-v29/judge-path-recording.webm`
  (1440×900, screen-only; re-capture via `scripts/capture-judge-path.cjs`
  with `CAPTURE_DIR=docs/hackfw/screens-v29`).
- Render pipeline: `scripts/render-judge-video.cjs` (cards + TTS + ffmpeg).
- Subtitles: `judge-path-subtitles-v29.vtt` — also usable as a separate
  YouTube caption upload (WebVTT accepted).
- The Sprint 20.1 video, recording, script and subtitles are unchanged.
- No claims beyond this script — no detection-accuracy percentages, no real
  OT control, no customer results.

## Short video description (Devpost / hosting)

> HAIEC is evidence-bound assurance for consequential AI. In under two
> minutes, watch a manufacturing AI act on the wrong work order, see HAIEC's
> deterministic engine prove it, watch a consequential write get held for
> human review, and see independent financial and supplier-qualification
> gates keep a purchase order honest — all inside an interactive digital
> factory you can drive yourself. Know what your AI can do. Govern what it
> may do. Verify what happened. https://haiec-manufacturing-demo.vercel.app
