# Judge-Path Narration Script (~117 s) — HackFW Demo Video

Conversational voiceover for `judge-path-final.mp4` — explains the report
like a person, not a reader. `(beat)` = half-second pause. Timed to
`judge-path-subtitles.vtt`; the 4 s title card runs first (silent).

| Cue | Screen | Voiceover |
|-----|--------|-----------|
| 0:00–0:04 | Title card — "Manufacturing AI Assurance / by HAIEC" | *(silent)* |
| 0:04–0:17 | Station 217 flagship (`?report=s217`) | "Let me show you the moment that matters. An AI assistant on a plant floor was told to update one work order — forty-eight-oh-two. (beat) It did the job perfectly. On the wrong work order. (beat) Nothing failed. Nothing alarmed. That's exactly the problem." |
| 0:17–0:31 | Canonical result chips | "Now here's what HAIEC does. It doesn't take the agent's word for it — it compares what the agent was told to touch, against what the record shows it actually touched. (beat) The target came back broader. The call? A human needs to see this." |
| 0:31–1:02 | Operator Journey — real clicks through Detect → Investigate → Authorize → Contain (pause + SIMULATED_DENY) | "So what does a human do? Walk with me. Detect. Investigate. Authorize. (beat) And here — watch — I can pause the dispatcher, right from the browser. (beat) But look how honest the screen is about it. It tells you: this is a rehearsal. It's not touching real equipment. That honesty — that's the whole product." |
| 1:02–1:19 | Verify stage — evidence boundary | "This is the part most vendors will never show you. Everything we couldn't prove stays right there on screen — marked not assessed. (beat) Unknown doesn't get rounded up to 'fine.'" |
| 1:19–1:31 | Case report + public verification link | "And every finding links to a public receipt. You, an auditor — anyone — can check the integrity of this exact evaluation. No account. (beat) It's labeled synthetic — because it is." |
| 1:31–1:48 | Nine-system executive report | "Now zoom out. Nine AI systems. Forty-five evaluations. Nine times the target drifted — caught. Nine times it was clean — the record says so. (beat) And every single one still says review. Because the honest answer is always: here's what the evidence proves — and here's where it stops." |
| 1:48–1:57 | Reports hub close | "That's HAIEC. Not a score. Not a guess. Verified facts, explicit unknowns — and a human who finally knows what they're looking at." |

## Editing notes

- **Final cut (produced):** `docs/hackfw/screens/judge-path-final.mp4` — ~117 s,
  H.264/AAC 1440×900. Title card intro ("Manufacturing AI Assurance by HAIEC"),
  AI voiceover (edge-tts `en-US-AvaMultilingualNeural`), per-segment zoom focus
  on the relevant report section, captions burned in from
  `judge-path-subtitles.vtt`, ~9.5 s white lead-in trimmed from the source
  recording.
- Source recording: `docs/hackfw/screens/judge-path-recording.webm` (1440×900,
  no audio — MediaRecorder screen-only; re-capture via `scripts/capture-judge-path.cjs`).
- Subtitles: `docs/hackfw/judge-path-subtitles.vtt` — also usable as a separate
  YouTube caption upload (WebVTT is accepted).
- Do not add claims beyond this script — no detection-accuracy percentages, no real
  OT control, no customer results.
