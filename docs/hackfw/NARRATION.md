# Judge-Path Narration Script (~105 s) — HackFW Demo Video

Timed to `judge-path-recording.webm` and `judge-path-subtitles.vtt`.
Record voiceover at a measured pace; the `.vtt` cue times below are the
authoritative timings and match the on-screen segments.

| Cue | Screen | Voiceover |
|-----|--------|-----------|
| 0:00–0:12 | Station 217 flagship (`?report=s217`) | "An AI assistant at Station 217 was delegated to update work order WO-217-4802. It committed the transaction on a different resource — WO-217-4803. HAIEC identified the consequential divergence." |
| 0:12–0:26 | Canonical result chips | "This is not a model opinion. The committed state was recorded and read back inside qualified, digest-bound evidence. The detector returned MFG-EFF-001 MATCH, the target comparison returned BROADER, and the disposition is REVIEW." |
| 0:26–0:58 | Operator Journey — Detect → Investigate → Authorize → Contain (real clicks; pause + simulated deny) | "The Operator Journey walks the human response — detect, investigate, authorize, contain. Containment is explicitly a browser-only simulation: a local pause, never real plant control. No real execution is attempted." |
| 0:58–1:14 | Verify stage — evidence boundary | "Verify shows what is not established: code reachability is NOT_ASSESSED, authority-plane coverage is partial, and there is no independent post-response witness. Unknown is never silently upgraded to pass." |
| 1:14–1:26 | Case report + public verification link | "Every case links to a public verification receipt — the persisted canonical evaluation, marked SYNTHETIC_REFERENCE because this is a fictional plant, honestly labeled." |
| 1:26–1:44 | Nine-system executive report | "The executive report scales the story: nine AI systems across five assessment states — 45 evaluations, all REVIEW. Nine wrong-target cases show divergence; nine corrected-state cases align with delegation." |
| 1:44–1:50 | Reports hub close | "HAIEC does not claim the plant is safe. It gives the responsible human verified facts, explicit unknowns, and a bounded next action. That is evidence-bound assurance." |

## Editing notes

- Source recording: `docs/hackfw/screens/judge-path-recording.webm` (1440×900, no audio — MediaRecorder screen-only).
- Subtitles: `docs/hackfw/judge-path-subtitles.vtt` — mux or burn in with any editor
  (e.g. `ffmpeg -i judge-path-recording.webm -vf "subtitles=judge-path-subtitles.vtt" -c:a aac voiceover.m4a → final.mp4`).
- Do not add claims beyond this script — no detection-accuracy percentages, no real
  OT control, no customer results.
