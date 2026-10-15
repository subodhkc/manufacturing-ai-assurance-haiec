'use strict';
/**
 * Bundle the frozen HAIEC evaluation exports + Station 217 replay into a
 * single JS data file the standalone dashboard can load under file:// —
 * no fetch(), no server, no live calls.
 *
 * Regenerate: node scripts/build-dashboard-data.cjs
 * Inputs:  data/evaluations/*.json (incl. manifest.json)
 *          data/station217/replay-bundle.json
 * Output:  dashboard/data/haiec-exports.js
 */
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { loadExportFile } = require('../packages/haiec-adapter/src/load-export.cjs');

const root = path.resolve(__dirname, '..');
const evalDir = path.join(root, 'data/evaluations');
const bundlePath = path.join(root, 'data/station217/replay-bundle.json');
const outPath = path.join(root, 'dashboard/data/haiec-exports.js');

const exportMap = {};
const problems = [];
for (const f of fs.readdirSync(evalDir).filter((f) => f.endsWith('.json') && f !== 'manifest.json').sort()) {
  const p = path.join(evalDir, f);
  const r = loadExportFile(fs, p);
  if (!r.ok) { problems.push(`${f}: ${r.errors.join('; ')}`); continue; }
  exportMap[r.artifact.sourceCase.caseId] = r.artifact;
}
const manifest = JSON.parse(fs.readFileSync(path.join(evalDir, 'manifest.json'), 'utf8'));
const station217 = fs.existsSync(bundlePath) ? JSON.parse(fs.readFileSync(bundlePath, 'utf8')) : null;

const payload = {
  schemaVersion: 'haiec-dashboard-data-1.0.0',
  generatedAt: new Date().toISOString(),
  origin: 'FROZEN_EVALUATION_EXPORT_SET + SYNTHETIC_LOCAL_FIXTURE',
  truthLabel: 'All evaluation content is HAIEC persisted output over a SYNTHETIC lab corpus. Station 217 is a local simulator replay — never a HAIEC verdict or plant observation.',
  exportMap,
  manifest,
  station217,
};
payload.payloadDigest = 'sha256:' + createHash('sha256').update(JSON.stringify(exportMap) + JSON.stringify(station217 ?? ''), 'utf8').digest('hex');

const js = `'use strict';
/* GENERATED FILE — scripts/build-dashboard-data.cjs. Do not edit.
 * Frozen HAIEC evaluation exports (digest-pinned) + Station 217 replay.
 * The dashboard re-verifies each exportDigest via crypto.subtle at load. */
window.HAIEC_DEMO_DATA = ${JSON.stringify(payload)};
`;
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, js);
console.log(`dashboard data: ${Object.keys(exportMap).length} verified exports + station217 ${station217 ? 'bundle' : 'ABSENT'} → ${outPath}`);
for (const p of problems) console.error('SKIPPED (integrity/shape failure):', p);
if (Object.keys(exportMap).length === 0) { console.error('FATAL: zero valid exports'); process.exit(1); }
