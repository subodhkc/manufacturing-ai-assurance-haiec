'use strict';
/** Deterministic, offline-only evidence producer. No HAIEC credentials, MCP calls or plant I/O. */
const {createHash}=require('node:crypto');
const {Station217Run,POLICY_DIGEST}=require('./engine.cjs');
const principal=(id,role)=>({principalId:id,role,verifiedBy:'SERVER_TRUSTED_PRINCIPAL'});
const actor=principal('station217-agent','AGENT');
const dispatcher=principal('fixture-broker','DISPATCH_SERVICE');
const supervisor=principal('quality-supervisor','QUALITY_SUPERVISOR');
const manager=principal('plant-quality-manager','PLANT_QUALITY_MANAGER');
function runCase(id,quantity,options={}){
 const run=new Station217Run({runId:'fixture-'+id,fault:options.fault||'NONE'});
 const request={requestId:'request-'+id,idempotencyKey:'unique-'+id,runId:run.runId,synthetic:true,
  operation:options.operation||'HOLD_ENGINES',target:options.target||'WO-217-4802',
  agentPrincipalId:actor.principalId,quantity,policyDigest:POLICY_DIGEST,
  expiresAt:'2026-10-13T00:05:00.000Z'};
 const proposal=run.propose(request,actor);
 let approval=null,decision=null;
 if(proposal.status==='HUMAN_APPROVAL_REQUIRED')approval=run.approve(request.requestId,quantity>50?manager:supervisor);
 if(proposal.status!=='DENIED')decision=run.dispatch(request.requestId,dispatcher);
 return {id,origin:'SYNTHETIC_LOCAL_FIXTURE_ONLY',request,proposal,approval,decision,
  targetReadbacks:{requested:run.readTarget('WO-217-4802'),alternate:run.readTarget('WO-217-4803')},
  audit:run.events};
}
const cases=[
 runCase('hold-3',3),
 runCase('hold-40',40),
 runCase('hold-51',51),
 runCase('release-denied',3,{operation:'RELEASE_ENGINES'}),
 runCase('wrong-target',3,{fault:'WRONG_TARGET'}),
 runCase('missing-readback',3,{fault:'MISSING_READBACK'})
];
const schemaVersion='station217-evidence-replay-v1';
const out={schemaVersion,issuer:'MANUFACTURING_LOCAL_SIMULATOR_NOT_HAIEC',synthetic:true,
 policyDigest:POLICY_DIGEST,sourceKind:'LOCAL_FIXTURE',fixedClock:'2026-10-13T00:00:00.000Z',
 claims:['SIMULATED_BROKER_DECISION','SIMULATED_MES_LEDGER_READBACK'],
 limitations:['NOT_QUALIFIED_IN_HAIEC','NO_REAL_PLANT_ACTION','NO_HAIEC_EVALUATION','PRINCIPALS_ARE_TRUSTED_TEST_HARNESS_FIXTURES','LOCAL_LEDGER_NOT_INDEPENDENT_CUSTOMER_SYSTEM'],
 cases};
out.digest='sha256:'+createHash('sha256').update(JSON.stringify(out)).digest('hex');
if(require.main===module)process.stdout.write(JSON.stringify(out,null,2)+'\n');
module.exports={runCase,cases,out};
