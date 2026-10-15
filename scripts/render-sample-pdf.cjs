'use strict';
/**
 * Renders dashboard/report/sample-master-report.html → sample-master-report.pdf.
 *
 * Puppeteer is resolved from this repo's node_modules first, then from a
 * sibling haiec-website checkout (env HAIEC_WEBSITE_DIR overrides). The PDF
 * is a committed frozen artifact — the Vercel static build does not run it.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const HTML = path.join(ROOT, 'dashboard', 'report', 'sample-master-report.html');
const PDF = path.join(ROOT, 'dashboard', 'report', 'sample-master-report.pdf');

function resolvePuppeteer() {
  const candidates = [
    'puppeteer',
    process.env.HAIEC_WEBSITE_DIR && path.join(process.env.HAIEC_WEBSITE_DIR, 'node_modules', 'puppeteer'),
    path.join(ROOT, '..', 'Haiec Website', 'node_modules', 'puppeteer'),
    path.join(ROOT, '..', 'haiec-website', 'node_modules', 'puppeteer'),
  ].filter(Boolean);
  for (const c of candidates) {
    try { return require(c); } catch (_) { /* next */ }
  }
  console.error('puppeteer not resolvable — set HAIEC_WEBSITE_DIR or install puppeteer');
  process.exit(1);
}

(async () => {
  const puppeteer = resolvePuppeteer();
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.goto('file://' + HTML.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
    await page.pdf({
      path: PDF,
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', bottom: '14mm', left: '10mm', right: '10mm' },
    });
    const size = fs.statSync(PDF).size;
    if (size < 50000) throw new Error(`PDF suspiciously small: ${size} bytes`);
    console.log(`sample pdf: ${PDF} (${(size / 1024).toFixed(0)} KB)`);
  } finally {
    await browser.close();
  }
})().catch((e) => { console.error(e.message || e); process.exit(1); });
