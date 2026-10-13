'use strict';
/** Candidate caller-owned input for the existing HAIEC normalizeStructuredRecord adapter.
 * This is NOT a canonical EvidenceEnvelope, not an approved producer, not a verified effect. */
const {createHash}=require('node:crypto');
const {buildAll}=require('./generate.cjs');
const stamp='2026-10-13T00:00:00.000Z';
const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
function candidates(){const arr=[];for(const testcase of buildAll()['golden-scenarios.json'].scenarios){for(const e of testcase.evidence){const phase=e.payload.phase;const seq=e.sequence;const t=e.payload.actualTarget||e.payload.target||e.payload.approvedTarget||testcase.expectedTarget;
 const authority=phase==='POLICY_DECLARED'?'DECLARED_CONFIGURATION':phase==='GATE_DECISION'?'AUTHORITATIVE_CONTROL_BOUNDARY':phase==='EFFECT_CONFIRMED'?'SERVICE_NATIVE_RECORD':'EXTERNAL_IMPORTED_RECORD';
 const record={
  rawContent:JSON.stringify({'detection.class':'scenario_run',phase,eventId:e.evidenceId,fixtureOnly:true,actualTarget:e.payload.actualTarget??null,expectedTarget:testcase.expectedTarget,operation:testcase.operation,notes:'synthetic training record, never assert this source is production-authoritative'}),
  sourceSystem:'synthetic-manufacturing/'+testcase.aiSystemId+'/'+phase,
  evidenceType:'manufacturing_scenario_fixture',eventTime:new Date(Date.parse(stamp)+(testcase.scenarioState==='EXPECTED_BASELINE'?0:testcase.scenarioState==='EVIDENCE_DEGRADED'?600000:1200000)+seq*1000).toISOString(),
  target:{type:'RESOURCE',id:t},eventId:e.evidenceId,nativeRecordId:e.evidenceId,sourceSchemaVersion:'manufacturing-fixture-v1',
  scenarioBinding:{scenarioRunId:e.payload.scenarioRunId,scenarioLevel:caseLevel(testcase.scenarioState),scenarioSequence:e.payload.scenarioSequence,bindingState:'EXPLICIT'},
  authorityRole:authority,
  authorityScope:'FICTIONAL_SOURCE_ASSERTION_ONLY',lineageId:'fixture-run-'+testcase.aiSystemId.toLowerCase()+'-'+testcase.scenarioState.toLowerCase()
 };
 arr.push({aiSystemId:testcase.aiSystemId,sourceCaseId:testcase.caseId,record,needsHAIECQualification:true});
 }}return {schemaVersion:'manufacturing-haiec-ingest-candidates-v1',authoritative:false,records:arr,limitations:['NOT_EXECUTED_AGAINST_HAIEC','CLIENT_INPUT_NOT_VERIFIED_EFFECT','SOURCE_AUTHORITY_IS_CLAIM_SCOPED','NORMALIZATION_DOES_NOT_PROVE_CONSEQUENCE','ACTUAL_DEPLOYMENT_MUST_USE_MCP_INGEST_STRUCTURED_WITH_USER_CONSENT']};}
function caseLevel(s){return s==='EXPECTED_BASELINE'?'STATE_1':s==='EVIDENCE_DEGRADED'?'STATE_2':'STATE_3';}
if(require.main===module){const fs=require('node:fs');const path=require('node:path');const {stable}=require('./generate.cjs');const out=path.resolve(__dirname,'../../../data/generated/haiec-ingest-candidates.json');fs.writeFileSync(out,stable(candidates()));console.log('Wrote candidate-only structured ingestion examples:',out);}
module.exports={candidates};
