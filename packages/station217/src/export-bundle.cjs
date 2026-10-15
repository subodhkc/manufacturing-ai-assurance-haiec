'use strict';
/**
 * Emit the Station 217 replay bundle as a frozen data artifact for the
 * dashboard's read-only presentation path. The bundle is produced by the
 * deterministic CLI replay — no browser action ever actuates anything.
 */
const fs = require('node:fs');
const path = require('node:path');
const { out } = require('./replay.cjs');

if (require.main === module) {
  const dest = path.resolve(__dirname, '../../../data/station217/replay-bundle.json');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, JSON.stringify(out, null, 2) + '\n');
  console.log('Wrote Station 217 replay bundle:', dest, out.digest);
}
