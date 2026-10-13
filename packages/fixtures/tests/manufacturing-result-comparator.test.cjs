'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const script=path.resolve(__dirname,'../../../scripts/compare-manufacturing-detector-results.cjs');
test('pack digest command generates 4 distinct SHA256 identities',()=>{
 const r=spawnSync(process.execPath,[script,'--digests'],{encoding:'utf8'});
 assert.equal(r.status,0);
 const lines=r.stdout.trim().split('\n');
 assert.equal(lines.length,4);
 assert.equal(new Set(lines.map(x=>x.slice(0,64))).size,4);
 for(const line of lines)assert.match(line,/^[a-f0-9]{64}  (semantic-pack|detector-acceptance-(spec|inputs|oracle))\.json$/);
});
test('real detector result gate fails closed when no output is supplied',()=>{
 const r=spawnSync(process.execPath,[script],{encoding:'utf8'});
 assert.equal(r.status,2);
 assert.match(r.stderr,/UNVERIFIED/);
});
