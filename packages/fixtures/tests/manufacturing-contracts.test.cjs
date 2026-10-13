'use strict';
// Static contract-verification tests only; these DO NOT execute HAIEC detectors.
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'../../../contracts/manufacturing/v0.1.0');
const fs=require('node:fs');
const load=n=>JSON.parse(fs.readFileSync(path.join(ROOT,n),'utf8'));
const pack=load('semantic-pack.json');
const spec=load('detector-acceptance-spec.json');
const src=load('detector-acceptance-inputs.json');
const oracle=load('detector-acceptance-oracle.json');
const ruleIds=new Set(['MFG-AUTH-001','MFG-EFF-001','MFG-EFF-002','MFG-QMS-001','MFG-OBS-001']);
const variants=['POSITIVE','HARD_NEGATIVE','INSUFFICIENT_SOURCE','CONTRADICTION','FOREIGN_VENDOR_SAME_SEMANTICS'];
const results=['MATCH','NO_MATCH_WITH_ADEQUATE_COVERAGE','INSUFFICIENT_SOURCE','CONTRADICTED','MATCH'];

test('versioned semantic contract has exact nine-system operation coverage',()=>{
 assert.equal(pack.version,'0.1.0');
 assert.equal(pack.packId,'haiec.manufacturing.semantic');
 assert.equal(pack.lifecycle,'PROPOSED_PUBLIC_CONTRACT_NOT_ACTIVE_HAIEC_ENGINE');
 assert.equal(pack.nativeMappings.length,9);
 assert.equal(new Set(pack.nativeMappings.map(x=>x.systemId)).size,9);
 for(const entry of pack.nativeMappings){
   assert.equal(entry.executableMapping,false);
   assert.equal(entry.aliasStatus,'DESCRIPTIVE_SAMPLE_NOT_APPROVED_ALIAS');
   assert.ok(entry.requiredWitnessSourceRoles.length>=2);
   assert.ok(entry.resourceFacet&&entry.nativeOperation&&entry.proposedEffectClass);
 }
});
test('typed identity/claim boundaries preserve authority and unknowns',()=>{
 assert.ok(pack.entityTypes.length>=30);
 assert.ok(pack.relationTypes.length>=17);
 assert.ok(pack.identityContract.requiredFields.includes('organizationId'));
 assert.ok(pack.identityContract.requiredFields.includes('sourceNamespace'));
 assert.ok(pack.identityContract.transactionJoin.includes('nativeTransactionId'));
 assert.ok(pack.sourceBoundary.cannotBePromotedByUploader.includes('authorityRole'));
 assert.equal(pack.sourceBoundary.defaultState,'UNQUALIFIED_CANDIDATE');
 assert.equal(pack.compatibility.licensedStandardsTextIncluded,false);
 assert.deepEqual(pack.ontologyNegatives.map(c=>c.caseId),Array.from({length:10},(_,i)=>'A'+String(i+1).padStart(2,'0')));
});
test('five P0 rules are specification only, not fictitiously executable',()=>{
 assert.equal(spec.state,'SPECIFICATION_ONLY_NO_CANONICAL_HAIEC_RULES_REGISTERED');
 assert.equal(spec.semanticPackRef.version,pack.version);
 assert.deepEqual(new Set(spec.ruleDefinitions.map(r=>r.ruleId)),ruleIds);
 for(const r of spec.ruleDefinitions){
   assert.equal(r.lifecycle,'PROPOSED_NOT_REGISTERED');
   assert.deepEqual(r.acceptanceVariants,variants);
   assert.ok(r.sourceClaims.length>0&&r.guard&&r.predicate&&r.neverClaim.length>0);
 }
 assert.equal(spec.acceptanceSets.find(s=>s.set==='C2').status,'NOT_CREATED_OR_EXECUTED');
});
test('25 cases split 1-to-1 between unqualified inputs and test-only oracle',()=>{
 assert.equal(src.inputs.length,25);
 assert.equal(oracle.cases.length,25);
 const keys=new Set(src.inputs.map(c=>c.caseId));
 assert.equal(keys.size,25);
 assert.deepEqual(new Set(oracle.cases.map(c=>c.caseId)),keys);
 for(const id of ruleIds){
   const cases=src.inputs.filter(c=>c.ruleId===id);
   assert.deepEqual(cases.map(c=>c.variant),variants);
   assert.deepEqual(cases.map(c=>oracle.cases.find(o=>o.caseId===c.caseId).expectedHarnessStatus),results);
 }
});
test('oracle outcomes never appear in producer inputs or registered run status',()=>{
 const bytes=fs.readFileSync(path.join(ROOT,'detector-acceptance-inputs.json'),'utf8');
 assert.doesNotMatch(bytes,/"expectedHarnessStatus"\s*:/);
 assert.doesNotMatch(bytes,/"forbiddenConclusions"\s*:/);
 assert.doesNotMatch(bytes,/"requiredRuleIds"\s*:/);
 for(const c of src.inputs){
   assert.equal(c.sourceOrigin,'SYNTHETIC_ACCEPTANCE_INPUT_ONLY');
   assert.equal(c.context.qualifiedProducerScope,'FIXTURE_TRUST_SIMULATION_ONLY');
   assert.ok(c.context.organizationId&&c.context.tenantId);
   assert.ok(c.facts && Object.keys(c.facts).length>0);
 }
 assert.equal(oracle.productionAcceptance.status,'NOT_RUN');
 assert.equal(oracle.productionAcceptance.allowFixtureOracleInProduction,false);
});
test('portable variants use foreign vendor identities, not nine-system labels',()=>{
 for(const id of ruleIds){
  const item=src.inputs.find(c=>c.ruleId===id&&c.variant==='FOREIGN_VENDOR_SAME_SEMANTICS');
  assert.ok(item);
  assert.equal(item.context.aiSystemId,'VENDOR-B-QA');
  assert.ok(JSON.stringify(item.facts).match(/vendorB|PLANT-N|B-TRAN|QB-|VB-QMS/i));
 }
});
test('artifact digest available for release pinning; CI does not claim engine pass',()=>{
 const digest=(name)=>crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,name))).digest('hex');
 for(const n of ['semantic-pack.json','detector-acceptance-spec.json','detector-acceptance-inputs.json','detector-acceptance-oracle.json']){
  assert.match(digest(n),/^[a-f0-9]{64}$/);
 }
 assert.ok(spec.gateCriteria.some(x=>x.includes('persisted evaluation')));
});
