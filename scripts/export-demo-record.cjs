'use strict';
/* Sprint 29 — export an authentic browser-local demonstration record from the
   deployed site. Runs a small representative scenario (held MES write, advisory
   note, qualified-supplier PO decision, anomaly) so the record isn't empty,
   then captures the real Export record download. The file is a
   demo-factory-record-1.0.0 artifact — BROWSER_LOCAL_DEMONSTRATION_RECORD_NOT_HAIEC_ISSUED.

   Usage: BASE=https://haiec-manufacturing-demo.vercel.app node scripts/export-demo-record.cjs
   Requires playwright in the environment (not a repo dep). */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = process.env.BASE || 'https://haiec-manufacturing-demo.vercel.app';
const OUT = path.join(__dirname, '..', 'docs', 'hackfw', 'demo-record-sample.json');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
  await page.evaluate(() => { STATE.page = 'factory'; render(); });
  await page.waitForSelector('[data-act="df-export"]', { timeout: 20000 });
  const click = async sel => { await page.click(sel); await page.waitForTimeout(400); };

  // Same scenario the video shows: held MES write (denied), permitted
  // advisory note, held-stock release (denied).
  await click('[data-act="df-mes-write"]');
  await click('[data-act="df-advisory"]');
  await click('[data-act="df-lot-release"]');
  // Expired-supplier PO → buyer approval → commitment stays held.
  await click('[data-act="df-po"][data-id="REQ-2026-8842"]');
  await page.locator('[data-act="open-review"]').last().click();
  await page.waitForTimeout(600);
  await click('[data-act="decide"][data-verdict="APPROVED"]');
  await page.waitForTimeout(1500);
  // Qualified-supplier PO → buyer approval → commits.
  await click('[data-act="df-po"][data-id="REQ-2026-8855"]');
  await page.locator('[data-act="open-review"]').last().click();
  await page.waitForTimeout(600);
  await click('[data-act="decide"][data-verdict="APPROVED"]');
  await page.waitForTimeout(1500);
  // Monitoring: torque anomaly + source-signal interruption.
  await click('[data-act="df-eq"][data-id="TORQUE_ANOMALY"]');
  await page.waitForTimeout(1500);
  await click('[data-act="df-eq"][data-id="SOURCE_GAP"]');
  await page.waitForTimeout(1500);

  const [dl] = await Promise.all([
    page.waitForEvent('download', { timeout: 15000 }),
    page.click('[data-act="df-export"]'),
  ]);
  const tmp = await dl.path();
  const json = JSON.parse(fs.readFileSync(tmp, 'utf8'));
  if (json.schemaVersion !== 'demo-factory-record-1.0.0') throw new Error('unexpected record schema: ' + json.schemaVersion);
  if (json.artifactClass !== 'BROWSER_LOCAL_DEMONSTRATION_RECORD_NOT_HAIEC_ISSUED') throw new Error('unexpected artifactClass');
  // The sample must mirror the video scenario, not just be well-formed.
  const po = id => (json.current.purchaseOrders || []).find(p => p.id === id);
  if (!po('REQ-2026-8842') || po('REQ-2026-8842').status !== 'HELD_SUPPLIER_QUALIFICATION')
    throw new Error('REQ-2026-8842 must be held on supplier qualification');
  if (!po('REQ-2026-8855') || po('REQ-2026-8855').status !== 'COMMITTED')
    throw new Error('REQ-2026-8855 must be committed');
  const monEvents = (json.events || []).filter(e => e.effect === 'SIMULATED_MONITORING_OBSERVATION'
    && e.session === json.session.id);
  if (monEvents.length < 2) throw new Error('expected torque anomaly + source interruption monitoring events, got ' + monEvents.length);
  if (json.session.anomalyMode !== 'SOURCE_GAP') throw new Error('final anomaly mode should be SOURCE_GAP');
  fs.writeFileSync(OUT, JSON.stringify(json, null, 2));
  console.log('record:', json.session && json.session.id,
    '· events:', json.events && json.events.length,
    '· requests:', json.requests && json.requests.length,
    '· console errors:', errors.length);
  await browser.close();
  if (errors.length) { console.error(errors.slice(0, 5)); process.exit(1); }
  console.log('saved →', OUT);
})().catch(e => { console.error(e); process.exit(1); });
