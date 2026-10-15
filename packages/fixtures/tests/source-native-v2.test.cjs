'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const base = path.resolve(__dirname, '../../../data/source-native/v2/SYS-217');
const load = p => JSON.parse(fs.readFileSync(path.join(base,p),'utf8'));
const manifest=load('manifest.json');
test('source-native v2 manifest pins all native source files byte-exactly',()=>{
  assert.equal(manifest.entries.length, 10);
  for(const e of manifest.entries){
    const raw=fs.readFileSync(path.join(base,e.path));
    assert.equal('sha256:'+crypto.createHash('sha256').update(raw).digest('hex'),e.sha256,e.path);
  }
});
test('authority and IAM remain candidate evidence rather than HAIEC approval or provider grant',()=>{
  const env=load('authority/operating-envelope.proposal.json'),del=load('authority/delegation-approval.json'),iam=load('iam/access-observation.json');
  assert.equal(env.state,'PROPOSED_NOT_APPROVED_IN_HAIEC');
  assert.equal(del.evidenceType,'SIMULATED_BUSINESS_APPROVAL_RECORD');
  assert.equal(iam.conclusion,'TECHNICAL_GRANT_CANDIDATE_ONLY');
  assert.ok(iam.missingLayers.length>=4);
  assert.notEqual(env.authorizedTarget,env.observedTarget);
});
test('OTLP v2 spans have valid trace and parent IDs, advancing timestamps and correlated native transaction',()=>{
 const otlp=load('telemetry/otlp-traces.json'),sp=otlp.resourceSpans[0].scopeSpans[0].spans;
 assert.equal(sp.length,5);const ids=new Set(sp.map(x=>x.spanId));
 for(const s of sp){assert.match(s.traceId,/^[0-9a-f]{32}$/);assert.match(s.spanId,/^[0-9a-f]{16}$/);if(s.parentSpanId)assert.ok(ids.has(s.parentSpanId));assert.ok(BigInt(s.endTimeUnixNano)>BigInt(s.startTimeUnixNano));assert.ok(s.attributes.some(a=>a.key==='haiec.transaction_id'&&a.value.stringValue==='syn-txn-v2-sys217-wrong-target-001'));}
 for(let i=1;i<sp.length;i++)assert.ok(BigInt(sp[i].startTimeUnixNano)>BigInt(sp[i-1].startTimeUnixNano));
});
test('independent native-effect files correlate but disclose shared laboratory custody',()=>{
 const mes=load('native/mes-transaction.json'),qms=load('native/qms-readback.json');
 assert.equal(mes.transactionId,qms.transactionId);assert.equal(mes.actualTarget,qms.observedTarget);
 assert.notEqual(mes.sourceSystem,qms.sourceSystem);assert.match(qms.trustBoundary,/one fixture laboratory/);
});
test('collector explicitly models degraded and heartbeat-gap cases',()=>{
 const c=load('telemetry/collector-continuity.json');
 assert.ok(c.negativeCases.some(x=>x.injectedFailure==='TARGET_READBACK_MISSING'));
 assert.ok(c.negativeCases.some(x=>x.injectedFailure==='HEARTBEAT_MISSING'));
});
test('no expected findings, oracle verdicts, customer secrets or external runtime endpoint included',()=>{
 for(const e of manifest.entries){const data=fs.readFileSync(path.join(base,e.path),'utf8');assert.ok(!/golden-scenarios|expected-findings|API_KEY|Bearer\s+[A-Za-z0-9]/i.test(data),e.path);}
 const openapi=load('code/mes-openapi.json');
 assert.equal(openapi.servers[0].url,'https://synthetic.invalid');
});
test('test-only static source executes in an injected in-memory MES client',async()=>{
 const demo=require(path.join(base,'code/agent-handler.js'));
 const r=await demo.runSyntheticWrongTargetCase();
 assert.equal(r.dispatch.workOrderId,'WO-217-4803');
 assert.equal(r.request.approvedTarget,'WO-217-4802');
 assert.equal(r.ledger.length,1);
});
