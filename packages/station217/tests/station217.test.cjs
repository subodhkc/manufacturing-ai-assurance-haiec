'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const {Station217Run,POLICY_DIGEST}=require('../src/engine.cjs');
const trusted=(principalId,role)=>({principalId,role,verifiedBy:'SERVER_TRUSTED_PRINCIPAL'});
const agent=trusted('station217-agent','AGENT');
const supervisor=trusted('quality-supervisor','QUALITY_SUPERVISOR');
const manager=trusted('plant-quality-manager','PLANT_QUALITY_MANAGER');
const dispatcher=trusted('fixture-broker','DISPATCH_SERVICE');
const mk=(quantity=3,changes={})=>({requestId:'req-'+quantity,idempotencyKey:'idem-'+quantity,runId:'station217-local-001',synthetic:true,operation:'HOLD_ENGINES',target:'WO-217-4802',agentPrincipalId:agent.principalId,quantity,policyDigest:POLICY_DIGEST,expiresAt:'2026-10-13T00:05:00.000Z',...changes});
test('3-engine protective hold is in-scope and changes MES state exactly once',()=>{
 const run=new Station217Run();const before=run.readTarget('WO-217-4802');
 assert.equal(run.propose(mk(),agent).status,'AUTO_AUTHORIZED');
 const first=run.dispatch('req-3',dispatcher);
 assert.equal(first.status,'SYNTHETIC_EFFECT_CONFIRMED');
 assert.equal(first.targetWitness.before.hold,0);assert.equal(first.targetWitness.after.hold,3);
 assert.equal(run.readTarget('WO-217-4802').version,before.version+1);
 assert.deepEqual(run.dispatch('req-3',dispatcher),first);
 assert.equal(run.readTarget('WO-217-4802').hold,3);
 assert.equal(run.events.filter(x=>x.type==='BROKER_DISPATCH').length,1);
});
test('40-engine request requires supervisor, cannot self-approve, and exact dispatch approval',()=>{
 const run=new Station217Run(),request=mk(40);
 assert.equal(run.propose(request,agent).requiredApprover,'QUALITY_SUPERVISOR');
 assert.equal(run.dispatch(request.requestId,dispatcher).reason,'EXACT_HUMAN_APPROVAL_REQUIRED');
 assert.equal(run.approve(request.requestId,trusted(agent.principalId,'QUALITY_SUPERVISOR')).status,'DENIED');
 assert.equal(run.approve(request.requestId,manager).status,'DENIED');
 assert.equal(run.readTarget(request.target).hold,0);
 assert.equal(run.approve(request.requestId,supervisor).status,'APPROVED_FOR_SYNTHETIC_DISPATCH');
 assert.equal(run.approve(request.requestId,supervisor).reason,'APPROVAL_ALREADY_RECORDED');
 assert.equal(run.dispatch(request.requestId,dispatcher).status,'SYNTHETIC_EFFECT_CONFIRMED');
 assert.equal(run.readTarget(request.target).hold,40);
});
test('51-engine protective containment escalates to Plant Quality Manager, not automatic deny',()=>{
 const run=new Station217Run(),request=mk(51);
 assert.equal(run.propose(request,agent).requiredApprover,'PLANT_QUALITY_MANAGER');
 assert.equal(run.approve(request.requestId,supervisor).reason,'SEPARATION_OF_DUTIES_OR_ROLE_MISMATCH');
 assert.equal(run.readTarget(request.target).hold,0);
 assert.equal(run.approve(request.requestId,manager).status,'APPROVED_FOR_SYNTHETIC_DISPATCH');
 assert.equal(run.dispatch(request.requestId,dispatcher).status,'SYNTHETIC_EFFECT_CONFIRMED');
});
test('release, wrong resource, stale policy, wrong actor and wrong run fail without mutation',()=>{
 const negatives=[
  mk(3,{operation:'RELEASE_ENGINES'}),
  mk(3,{target:'WO-217-4803'}),
  mk(3,{policyDigest:'sha256:stale'}),
  mk(3,{runId:'other-run'}),
  mk(3,{agentPrincipalId:'another-agent'})
 ];
 for(const request of negatives){const run=new Station217Run();
  assert.equal(run.propose(request,agent).status,'DENIED');
  assert.equal(run.readTarget('WO-217-4802').hold,0);
  assert.equal(run.readTarget('WO-217-4803').hold,0);
 }
});
test('missing principal and viewer-like identities cannot submit or dispatch',()=>{
 const run=new Station217Run();
 assert.throws(()=>run.propose(mk(),{principalId:agent.principalId,role:'AGENT'}),/UNVERIFIED_PRINCIPAL/);
 assert.throws(()=>run.propose(mk(),trusted('viewer','VIEWER')),/UNVERIFIED_PRINCIPAL/);
 assert.equal(run.propose(mk(),agent).status,'AUTO_AUTHORIZED');
 assert.throws(()=>run.dispatch('req-3',agent),/UNVERIFIED_PRINCIPAL/);
 assert.equal(run.readTarget('WO-217-4802').hold,0);
});
test('idempotency key reuse with a different payload is rejected',()=>{
 const run=new Station217Run();assert.equal(run.propose(mk(),agent).status,'AUTO_AUTHORIZED');
 assert.equal(run.propose(mk(4,{idempotencyKey:'idem-3'}),agent).reason,'IDEMPOTENCY_CONFLICT');
 assert.equal(run.readTarget('WO-217-4802').hold,0);
});
test('missing readback means EFFECT_UNKNOWN even when emulator accepted dispatch',()=>{
 const run=new Station217Run({fault:'MISSING_READBACK'});assert.equal(run.propose(mk(),agent).status,'AUTO_AUTHORIZED');
 const outcome=run.dispatch('req-3',dispatcher);
 assert.equal(outcome.status,'EFFECT_UNKNOWN');
 assert.equal(outcome.evidenceBasis,'GATEWAY_RECEIPT_ONLY');
 assert.equal(run.readTarget('WO-217-4802').hold,3);
});
test('wrong-target effect is independently detected, not declared successful',()=>{
 const run=new Station217Run({fault:'WRONG_TARGET'});assert.equal(run.propose(mk(),agent).status,'AUTO_AUTHORIZED');
 const outcome=run.dispatch('req-3',dispatcher);
 assert.equal(outcome.status,'TARGET_MISMATCH');
 assert.equal(outcome.expectedTarget,'WO-217-4802');
 assert.equal(outcome.observedTarget,'WO-217-4803');
 assert.equal(run.readTarget('WO-217-4802').hold,0);
 assert.equal(run.readTarget('WO-217-4803').hold,3);
});
test('expired and unbounded requests cannot be submitted or dispatched',()=>{
 const run=new Station217Run();
 assert.equal(run.propose(mk(3,{expiresAt:'2026-10-13T00:00:00.000Z'}),agent).reason,'EXPIRED_OR_UNBOUNDED_REQUEST');
 assert.equal(run.propose(mk(3,{expiresAt:'2026-10-13T00:11:00.000Z'}),agent).reason,'EXPIRED_OR_UNBOUNDED_REQUEST');
 const valid=mk();
 assert.equal(run.propose(valid,agent).status,'AUTO_AUTHORIZED');
 const later=new Station217Run({now:'2026-10-13T00:06:00.000Z'});
 assert.equal(later.propose(valid,agent).reason,'EXPIRED_OR_UNBOUNDED_REQUEST');
});
test('no direct external write method is exposed by broker',()=>{
 const run=new Station217Run();
 assert.equal(typeof run.writeMES,'undefined');
 assert.equal(typeof run.applyHold,'undefined');
 assert.equal(run.readTarget('WO-217-4802').hold,0);
 const row=run.readTarget('WO-217-4802');row.hold=100;
 assert.equal(run.readTarget('WO-217-4802').hold,0);
});
