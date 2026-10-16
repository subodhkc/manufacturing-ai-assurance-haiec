'use strict';
/* Sprint 20.1 — judge-path final-cut capture. Records a WebM screen recording
   and ordered PNG stills of the deployed manufacturing demo, timed to
   docs/hackfw/judge-path-subtitles.vtt (~110 s). Includes REAL UI interaction:
   clicking through Operator Journey stages and the browser-only containment
   pause/attempt — not just page navigation.

   Dependency: playwright (chromium). Not a repo dependency — install in
   your environment: `npm i -D playwright && npx playwright install chromium`.
   Usage: `CAPTURE_DIR=docs/hackfw/screens node scripts/capture-judge-path.cjs` */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = path.resolve(process.env.CAPTURE_DIR || 'captures-sprint20');
const BASE = process.env.DEMO_URL || 'https://haiec-manufacturing-demo.vercel.app';

const dwell = (p, ms) => p.waitForTimeout(ms);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: OUT, size: { width: 1440, height: 900 } } });
  const page = await ctx.newPage();
  const shot = (n) => page.screenshot({ path: path.join(OUT, n + '.png') });

  // Cue 1 — 0:00–0:12  Station 217 flagship: approved vs recorded target
  await page.goto(BASE + '/?report=s217', { waitUntil: 'networkidle' });
  await dwell(page, 12000); await shot('01-flagship');

  // Cue 2 — 0:12–0:26  canonical chips: MATCH / BROADER / REVIEW
  await page.evaluate(() => window.scrollTo(0, 620));
  await dwell(page, 14000); await shot('02-canonical-result');

  // Cue 3 — 0:26–0:58  Operator Journey, real clicks incl. containment sim
  await page.evaluate(() => { STATE.page = 'journey'; window.scrollTo(0, 0); render(); });
  await dwell(page, 6000);
  for (const st of ['investigate', 'authorize']) {
    await page.click('[data-oj-step="' + st + '"]'); await dwell(page, 6000);
  }
  await page.click('[data-oj-step="contain"]'); await dwell(page, 4000);
  await page.click('[data-oj="pause"]'); await dwell(page, 2500);          // browser-only pause
  await page.click('[data-oj="attempt"]'); await dwell(page, 4500);        // SIMULATED_DENY shown
  await shot('03-journey-contain');

  // Cue 4 — 0:58–1:14  Verify stage: NOT_ASSESSED evidence boundary
  await page.click('[data-oj-step="verify"]'); await dwell(page, 16000); await shot('04-journey-verify');

  // Cue 5 — 1:14–1:26  case report + public U6 verification link
  await page.goto(BASE + '/?report=case:SYS-217-WRONG_TARGET', { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, 900));
  await dwell(page, 12000); await shot('05-case-report');

  // Cue 6 — 1:26–1:44  nine-system executive report
  await page.goto(BASE + '/?report=exec', { waitUntil: 'networkidle' });
  await dwell(page, 9000);
  await page.evaluate(() => window.scrollTo(0, 1400));
  await dwell(page, 9000); await shot('06-exec-report');

  // Cue 7 — 1:44–1:50  Reports & Evidence hub close
  await page.goto(BASE + '/?report=hub', { waitUntil: 'networkidle' });
  await dwell(page, 6000); await shot('07-hub');

  await ctx.close();
  await browser.close();
  console.log('done →', OUT);
})().catch(e => { console.error(e); process.exit(1); });
