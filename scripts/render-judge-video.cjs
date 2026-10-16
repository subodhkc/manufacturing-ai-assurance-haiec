'use strict';
/* Sprint 29 — judge showcase render pipeline. Composes the final video from:
     docs/hackfw/screens-v29/judge-path-recording.webm  (screen-only capture)
   + generated title/closing cards (Playwright screenshots of inline HTML)
   + per-cue narration clips (edge-tts, requires network)
   + burned captions from docs/hackfw/judge-path-subtitles-v29.vtt

   Usage:
     FFMPEG=<path-to-ffmpeg> node scripts/render-judge-video.cjs
   Defaults: CAPTURE_DIR=docs/hackfw/screens-v29.
   Requires playwright + edge-tts in the environment (not repo deps). */
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.env.CAPTURE_DIR || path.join('docs', 'hackfw', 'screens-v29'));
const REC = path.join(OUT, 'judge-path-recording.webm');
const FINAL = path.join(OUT, 'judge-path-final-v29.mp4');
const VTT = path.join(ROOT, 'docs', 'hackfw', 'judge-path-subtitles-v29.vtt');
const FF = process.env.FFMPEG || 'ffmpeg';
const W = 1440, H = 900, FPS = 30;

/* Cue timeline on the FINAL video (seconds). Title card 0–4, recorded
   content 4–~99, closing card ~99–110. */
const CUES = [
  { at: 4.5, text: "HAIEC gives you evidence-bound assurance for consequential AI. Understand what your AI can do. Assure what it does. Govern what it may do — in any industry. Let's see it on a manufacturing floor." },
  { at: 16, text: "A plant-floor AI was told to update work order forty-eight-oh-two. It performed flawlessly — on work order forty-eight-oh-three. Nothing alarmed. HAIEC's deterministic engine caught the divergence. The verdict: review required." },
  { at: 28, text: "Then the agent tried to write back to the factory system. Its declared scope doesn't allow it — so the action is held for a human, while a permitted advisory note proceeds. That's the difference between an agent acting and an agent being governed." },
  { at: 42, text: "This is a working digital factory: work orders, purchase orders, live equipment telemetry — one shared state that responds to every action through the same operating boundary. Held material stays held." },
  { at: 56, text: "Watch two decisions stay independent. The buyer approves the spend — but the supplier's qualification expired, so the commercial commitment holds. The qualified order? Approved — and committed. Financial authority and supplier qualification are different gates." },
  { at: 74, text: "Anomalies become monitoring observations — a torque spike, a lost signal — alongside the human operating report and the exact record of what was asked, decided, and simulated." },
  { at: 90, text: "Know what your AI can do. Govern what it may do. Verify what happened. Every finding is digest-verified — and this receipt is public." },
  { at: 105, text: "Deploy AI with confidence. Stay in control of every consequential action. Explore the interactive digital factory yourself." },
];

/* Recorded-content scene windows (seconds inside the webm) with optional
   zoom focus: {w,h,x,y} are fractions of frame size. */
const SCENES = [
  { s: 0, e: 12 },                                  // exec command center
  { s: 12, e: 28, z: { w: 0.82, h: 0.82, x: 0.04, y: 0.10 } }, // s217 story
  { s: 28, e: 42, z: { w: 0.74, h: 0.74, x: 0.02, y: 0.16 } }, // MES panel
  { s: 42, e: 56 },                                  // factory live
  { s: 56, e: 74, z: { w: 0.66, h: 0.66, x: 0.30, y: 0.12 } }, // ERP panel
  { s: 74, e: 90 },                                  // anomaly + record
  { s: 90, e: 99 },                                  // judge showcase close
];

const cardCss = `body{margin:0;width:${W}px;height:${H}px;display:flex;flex-direction:column;justify-content:center;align-items:center;background:radial-gradient(1200px 700px at 50% 20%,#123c35,#0a1f1b 70%);color:#e8f4ef;font-family:'Segoe UI',system-ui,sans-serif;text-align:center}
.eyebrow{letter-spacing:.28em;font-size:15px;color:#7fd4bd;text-transform:uppercase}
h1{font-size:58px;margin:18px 0 8px;max-width:1100px;line-height:1.08}
p{font-size:22px;color:#b8d5c9;max-width:980px;line-height:1.5}
.fine{font-size:14px;color:#6f9a8c;max-width:960px;margin-top:34px;line-height:1.55}
.tag{margin-top:26px;padding:10px 22px;border:1px solid #2f7a6b;border-radius:999px;font-size:17px;color:#9fe3cf}`;

async function makeCards() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const eaglePath = path.join(ROOT, 'dashboard', 'assets', 'brand', 'haiec-eagle.png');
  const eagle = fs.existsSync(eaglePath)
    ? 'data:image/png;base64,' + fs.readFileSync(eaglePath).toString('base64') : '';
  await page.setContent(`<html><style>${cardCss}</style><body>
    ${eagle ? `<img src="${eagle}" style="width:74px;height:74px">` : ''}
    <div class="eyebrow">HAIEC · Manufacturing Demonstration</div>
    <h1>Deploy AI with confidence.<br>Stay in control of every consequential action.</h1>
    <div class="tag">Two-minute platform showcase</div></body></html>`);
  await page.screenshot({ path: path.join(OUT, 'title-card.png') });
  await page.setContent(`<html><style>${cardCss}</style><body>
    ${eagle ? `<img src="${eagle}" style="width:64px;height:64px">` : ''}
    <div class="eyebrow">HAIEC · Deploy AI with confidence</div>
    <h1>Know what your AI can do.<br>Govern what it may do.<br>Verify what happened.</h1>
    <p>Explore the interactive digital factory and the evidence yourself:<br><b>haiec-manufacturing-demo.vercel.app</b></p>
    <p class="fine">HAIEC's deterministic engine evaluated a synthetic manufacturing evidence package — digest-verified, publicly checkable. The digital factory, reviewer roles, notifications and equipment telemetry are versioned browser-local demonstration scenarios; no live MES, ERP or PLC connection exists.</p></body></html>`);
  await page.screenshot({ path: path.join(OUT, 'closing-card.png') });
  await browser.close();
}

function ttsAll() {
  CUES.forEach((c, i) => {
    const f = path.join(OUT, `cue${i}.mp3`);
    if (!fs.existsSync(f)) execFileSync('edge-tts', ['--voice', 'en-US-AvaMultilingualNeural', '--text', c.text, '--write-media', f], { stdio: 'inherit' });
  });
}

function render() {
  const inputs = ['-i', REC, '-loop', '1', '-t', '4', '-i', path.join(OUT, 'title-card.png'), '-loop', '1', '-t', '11', '-i', path.join(OUT, 'closing-card.png')];
  CUES.forEach((c, i) => inputs.push('-i', path.join(OUT, `cue${i}.mp3`)));
  const F = [];
  F.push('[1:v]scale=' + W + ':' + H + ',setsar=1,fps=' + FPS + ',format=yuv420p[vt]');
  F.push('[2:v]scale=' + W + ':' + H + ',setsar=1,fps=' + FPS + ',format=yuv420p[vc]');
  SCENES.forEach((sc, i) => {
    let chain = `[0:v]trim=${sc.s}:${sc.e},setpts=PTS-STARTPTS`;
    if (sc.z) chain += `,crop=iw*${sc.z.w}:ih*${sc.z.h}:iw*${sc.z.x}:ih*${sc.z.y},scale=${W}:${H}`;
    chain += `,setsar=1,fps=${FPS},format=yuv420p[v${i}]`;
    F.push(chain);
  });
  const order = ['[vt]', ...SCENES.map((_, i) => `[v${i}]`), '[vc]'];
  F.push(order.join('') + `concat=n=${order.length}:v=1:a=0[vcat]`);
  F.push(`[vcat]subtitles='${VTT.replace(/\\/g, '/').replace(/:/g, '\\:')}':force_style='FontName=Segoe UI,FontSize=17,OutlineColour=&H80000000,BorderStyle=3'[vout]`);
  CUES.forEach((c, i) => F.push(`[${i + 3}:a]adelay=${Math.round(c.at * 1000)}|${Math.round(c.at * 1000)}[a${i}]`));
  F.push(CUES.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${CUES.length}:normalize=0:duration=longest,aresample=44100[aout]`);
  const fscript = path.join(OUT, 'filtergraph.txt');
  fs.writeFileSync(fscript, F.join(';\n'));
  execFileSync(FF, ['-y', ...inputs, '-filter_complex_script', fscript, '-map', '[vout]', '-map', '[aout]',
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '21', '-c:a', 'aac', '-b:a', '128k', FINAL], { stdio: 'inherit' });
}

(async () => {
  if (!fs.existsSync(REC)) { console.error('missing recording: ' + REC); process.exit(1); }
  await makeCards();
  ttsAll();
  render();
  console.log('rendered →', FINAL);
})().catch(e => { console.error(e); process.exit(1); });
