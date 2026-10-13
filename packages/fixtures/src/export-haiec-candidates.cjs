'use strict';
/**
 * Export untrusted candidates from the independent source-only world.
 * NEVER ingest golden-scenarios, findings, illustrative reports, or expected
 * oracle outcomes. Caller-controlled authorityRole is never authoritative.
 */
const {buildSourceWorld}=require('./source-world.cjs');
const stamp='2026-10-13T00:00:00.000Z';
const sort=x=>Array.isArray(x)?x.map(sort):x&&typeof x==='object'
  ?Object.fromEntries(Object.entries(x).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,sort(v)])):x;
const stable=x=>JSON.stringify(sort(x),null,2)+'\n';

function candidates() {
  const records=[];
  for(const testcase of buildSourceWorld().scenarios) {
    for(const event of testcase.events) {
      const phase=event.payload.phase;
      const target=event.payload.actualTarget??event.payload.requestedTarget??
        event.payload.approvedTarget??event.payload.declaredTarget??testcase.requestedTarget;
      const record={
        rawContent:JSON.stringify({
          'detection.class':'scenario_run',phase,eventId:event.evidenceId,fixtureOnly:true,
          sourceOrigin:'SYNTHETIC_UNQUALIFIED_INPUT_ONLY',
          requestedTarget:testcase.requestedTarget,
          actualTarget:event.payload.actualTarget??null,
          operation:testcase.operation,transactionId:testcase.transactionId,
          injectedDivergence:testcase.injectedDivergence,
          notes:'synthetic source candidate, not verified policy, executable capability or effect'
        }),
        sourceSystem:'synthetic-source-world/'+testcase.aiSystemId+'/'+phase,
        evidenceType:'manufacturing_scenario_fixture',
        eventTime:new Date(Date.parse(stamp)+(testcase.scenarioState==='EXPECTED_BASELINE'?0:
          testcase.scenarioState==='EVIDENCE_DEGRADED'?600000:1200000)+event.sequence*1000).toISOString(),
        target:{type:'RESOURCE',id:target},
        eventId:event.evidenceId,nativeRecordId:event.evidenceId,
        sourceSchemaVersion:'manufacturing-source-world-v1',
        scenarioBinding:{scenarioRunId:testcase.sourceRunId,
          scenarioLevel:caseLevel(testcase.scenarioState),
          scenarioSequence:event.payload.scenarioSequence,bindingState:'EXPLICIT'},
        // Transport claim only. The HAIEC binder decides qualification.
        authorityRole:'EXTERNAL_IMPORTED_RECORD',
        authorityScope:'UNQUALIFIED_FICTIONAL_SIMULATOR',
        lineageId:'source-world-'+testcase.aiSystemId.toLowerCase()+'-'+testcase.scenarioState.toLowerCase()
      };
      records.push({aiSystemId:testcase.aiSystemId,sourceCaseId:testcase.caseId,
        record,needsHAIECQualification:true});
    }
  }
  return {schemaVersion:'manufacturing-haiec-ingest-candidates-v2',
    sourceWorldVersion:buildSourceWorld().schemaVersion,
    authoritative:false,records,
    limitations:['INPUT_WORLD_INDEPENDENT_OF_EXPECTED_FINDINGS',
      'GOLDEN_EXPECTED_OUTCOMES_NOT_USED_AS_SOURCE',
      'NOT_EXECUTED_AGAINST_HAIEC','CLIENT_INPUT_NOT_VERIFIED_EFFECT',
      'SOURCE_AUTHORITY_IS_UNQUALIFIED','NORMALIZATION_DOES_NOT_PROVE_CONSEQUENCE',
      'USER_CONSENT_AND_AUTHENTICATED_BINDER_REQUIRED']};
}
function caseLevel(s){return s==='EXPECTED_BASELINE'?'STATE_1':s==='EVIDENCE_DEGRADED'?'STATE_2':'STATE_3';}
if(require.main===module){
  const fs=require('node:fs'),path=require('node:path');
  const out=path.resolve(__dirname,'../../../data/generated/haiec-ingest-candidates.json');
  fs.mkdirSync(path.dirname(out),{recursive:true});
  fs.writeFileSync(out,stable(candidates()));
  console.log('Wrote UNQUALIFIED source-world candidates:',out);
}
module.exports={candidates};
