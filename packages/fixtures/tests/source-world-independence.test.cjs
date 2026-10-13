'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {buildSourceWorld}=require('../src/source-world.cjs');
const {candidates}=require('../src/export-haiec-candidates.cjs');
const {EXPECTED}=require('../src/expected-findings.cjs');

const comparison=(item,expected)=>{
 const receipt=item.events.find(e=>e.payload.phase==='TARGET_READBACK');
 return !receipt?'CONSEQUENCE_UNKNOWN':receipt.payload.actualTarget===expected.target
  ?'ESTABLISHED_WITHIN_FIXTURE':'EXACT_TARGET_DIVERGENCE';
};
test('producer has 9 systems, 27 state cases and 153 event candidates',()=>{
 const world=buildSourceWorld();
 assert.equal(world.systems.length,9);
 assert.equal(world.scenarios.length,27);
 assert.equal(candidates().records.length,153);
 assert.equal(candidates().authoritative,false);
});
test('separate oracle agrees on expected, degraded and divergent source cases',()=>{
 for(const id of buildSourceWorld().systems){
  const rows=buildSourceWorld().scenarios.filter(s=>s.aiSystemId===id);
  assert.equal(rows.length,3);
  assert.equal(rows[0].requestedTarget,EXPECTED[id].target);
  assert.equal(rows[0].operation,EXPECTED[id].operation);
  assert.deepEqual(rows.map(s=>comparison(s,EXPECTED[id])),
    ['ESTABLISHED_WITHIN_FIXTURE','CONSEQUENCE_UNKNOWN','EXACT_TARGET_DIVERGENCE']);
  assert.equal(rows[2].events[3].payload.approvedTarget,EXPECTED[id].target);
  assert.notEqual(rows[2].events[4].payload.actualTarget,EXPECTED[id].target);
 }
});
test('oracle edits do not influence source or export',()=>{
 const world=JSON.stringify(buildSourceWorld()),exported=JSON.stringify(candidates());
 const prior=EXPECTED['SYS-217'].target;
 try{
   EXPECTED['SYS-217'].target='CHANGED_EXPECTATION';
   assert.equal(JSON.stringify(buildSourceWorld()),world);
   assert.equal(JSON.stringify(candidates()),exported);
 }finally{EXPECTED['SYS-217'].target=prior;}
});
test('source producer and exporter never load expectation generation',()=>{
 for(const name of ['source-world.cjs','export-haiec-candidates.cjs']){
  const text=fs.readFileSync(path.join(__dirname,'../src',name),'utf8');
  assert.equal(text.includes("require('./expected-findings.cjs')"),false);
  assert.equal(text.includes("require('./generate.cjs')"),false);
 }
});
test('source candidates do not assert authoritative policy, effects or code capability',()=>{
 for(const item of candidates().records){
  assert.equal(item.needsHAIECQualification,true);
  assert.equal(item.record.authorityRole,'EXTERNAL_IMPORTED_RECORD');
  assert.equal(item.record.authorityScope,'UNQUALIFIED_FICTIONAL_SIMULATOR');
  assert.ok(item.record.scenarioBinding.scenarioRunId);
 }
 for(const row of buildSourceWorld().scenarios){
  assert.ok(row.events.every(e=>e.producerQualification==='NOT_HAIEC_QUALIFIED'));
  if(row.scenarioState==='EVIDENCE_DEGRADED')
    assert.ok(row.events.every(e=>e.payload.phase!=='TARGET_READBACK'));
 }
});
test('unexpected target readback changes the independent comparison',()=>{
 const row=buildSourceWorld().scenarios[0];
 assert.equal(comparison(row,EXPECTED[row.aiSystemId]),'ESTABLISHED_WITHIN_FIXTURE');
 row.events.at(-1).payload.actualTarget='CHANGED_NATIVE_TARGET';
 assert.equal(comparison(row,EXPECTED[row.aiSystemId]),'EXACT_TARGET_DIVERGENCE');
});
