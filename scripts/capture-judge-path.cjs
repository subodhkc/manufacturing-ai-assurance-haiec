'use strict';
/* Sprint 20 — judge-path capture. Records a WebM screen recording and
   ordered PNG stills of the deployed manufacturing demo following the
   docs/hackfw/SUBMISSION.md demo script. Read-only on the public site.

   Dependency: playwright (chromium). Not a repo dependency — install in
   your environment: `npm i -D playwright && npx playwright install chromium`.
   Usage: `CAPTURE_DIR=docs/hackfw/screens node scripts/capture-judge-path.cjs` */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = path.resolve(process.env.CAPTURE_DIR || 'captures-sprint20');
const BASE = process.env.DEMO_URL || 'https://haiec-manufacturing-demo.vercel.app';
const SETTLE = 4500; // per-step dwell for digest verification + readability

const steps = [
  ['01-flagship', '?report=s217'],
  ['02-case-report', '?report=case:SYS-217-WRONG_TARGET'],
  ['03-journey', null, async (p) => { await p.evaluate(() => { STATE.page = 'journey'; render(); }); }],
  ['04-case-planes', '?report=case:SYS-217-WRONG_TARGET', async (p) => { await p.evaluate(() => window.scrollTo(0, 900)); }],
  ['05-exec-report', '?report=exec'],
  ['06-hub', '?report=hub'],
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: OUT, size: { width: 1440, height: 900 } } });
  const page = await ctx.newPage();
  for (const [name, url, act] of steps) {
    await page.goto(BASE + (url || ''), { waitUntil: 'networkidle' });
    await page.waitForTimeout(SETTLE);
    if (act) await act(page);
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, name + '.png') });
    console.log('captured', name);
  }
  await ctx.close();
  await browser.close();
  console.log('done →', OUT);
})().catch(e => { console.error(e); process.exit(1); });
