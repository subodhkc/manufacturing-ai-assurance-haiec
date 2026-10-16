'use strict';
/* Sprint 29 — judge showcase capture. Records a WebM screen recording and
   ordered PNG stills of the deployed manufacturing demo, timed to
   docs/hackfw/judge-path-subtitles.vtt (~116 s incl. title/closing cards
   added at render time). Real UI interaction throughout: held MES write,
   advisory note, held-stock release, two-gate PO approvals, anomaly modes.

   Dependency: playwright (chromium). Not a repo dependency — install in
   your environment: `npm i -D playwright && npx playwright install chromium`.
   Usage: `CAPTURE_DIR=docs/hackfw/screens-v29 node scripts/capture-judge-path.cjs` */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = path.resolve(process.env.CAPTURE_DIR || 'captures-sprint29');
const BASE = process.env.DEMO_URL || 'https://haiec-manufacturing-demo.vercel.app';

const dwell = (p, ms) => p.waitForTimeout(ms);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: OUT, size: { width: 1440, height: 900 } } });
  const page = await ctx.newPage();
  const shot = (n) => page.screenshot({ path: path.join(OUT, n + '.png') });
  const click = async (sel) => { await page.click(sel); await dwell(page, 400); };

  // Scene 1 — 0:00–0:12  Platform: command center, pillars, capability map
  await page.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
  await dwell(page, 9000); await shot('01-platform');

  // Scene 2 — 0:12–0:28  Station 217: delegated 4802 vs recorded 4803, REVIEW
  await page.goto(BASE + '/?report=s217', { waitUntil: 'networkidle' });
  await dwell(page, 10000);
  await page.evaluate(() => window.scrollTo(0, 560));
  await dwell(page, 6000); await shot('02-flagship');

  // Scene 3 — 0:28–0:42  Held MES write + permitted advisory on factory floor
  await page.evaluate(() => { STATE.page = 'factory'; window.scrollTo(0, 0); render(); });
  await dwell(page, 2500);
  await click('[data-act="df-mes-write"]');            // DENY — held write
  await dwell(page, 5500); await shot('03-mes-held');
  await click('[data-act="df-advisory"]');             // advisory proceeds
  await dwell(page, 5000);

  // Scene 4 — 0:42–0:56  Factory in action: held-stock release denied, gauges live
  await click('[data-act="df-lot-release"]');          // DENY — held stock
  await dwell(page, 6500); await shot('04-factory-live');
  await page.evaluate(() => window.scrollTo(0, 300));
  await dwell(page, 7000);

  // Scene 5 — 0:56–1:14  Two-gate PO pair: expired stays held, qualified commits
  await page.evaluate(() => window.scrollTo(0, 0));
  await click('[data-act="df-po"][data-id="REQ-2026-8842"]');
  await dwell(page, 1200);
  await page.locator('[data-act="open-review"]').last().click();   // open the pending request
  await dwell(page, 800);
  await click('[data-act="decide"][data-verdict="APPROVED"]');  // Authorized Buyer default
  await dwell(page, 3500); await shot('05-po-held');
  await click('[data-act="df-po"][data-id="REQ-2026-8855"]');
  await dwell(page, 1200);
  await page.locator('[data-act="open-review"]').last().click();
  await dwell(page, 800);
  await click('[data-act="decide"][data-verdict="APPROVED"]');
  await dwell(page, 4000); await shot('06-po-committed');

  // Scene 6 — 1:14–1:30  Monitoring: torque anomaly + signal loss, then record
  await click('[data-act="df-eq"][data-id="TORQUE_ANOMALY"]');
  await dwell(page, 3500); await shot('07-anomaly');
  await click('[data-act="df-eq"][data-id="SOURCE_GAP"]');
  await dwell(page, 3500);
  await page.goto(BASE + '/?report=demo', { waitUntil: 'networkidle' });
  await dwell(page, 6000); await shot('08-demo-record');

  // Scene 7 — 1:30–1:40  Close: capability map + entry points
  await page.goto(BASE + '/?report=judge', { waitUntil: 'networkidle' });
  await dwell(page, 8000); await shot('09-showcase-close');

  await ctx.close();
  await browser.close();
  console.log('done →', OUT);
})().catch(e => { console.error(e); process.exit(1); });
