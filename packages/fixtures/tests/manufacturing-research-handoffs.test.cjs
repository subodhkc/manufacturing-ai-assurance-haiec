'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../../../contracts/manufacturing/v0.1.0');
const read=n=>JSON.parse(fs.readFileSync(path.join(root,n),'utf8'));
const B=read('operation-effect-contract.json');
const D=read('trust-boundary-acceptance.json');
const E=read('source-qualification-matrix.json');
const F=read('independent-benchmark-protocol.json');
const G=read('control-maturity-crosswalk.json');
const H=read('product-release-acceptance.json');
const estate=require('../../../data/generated/estate.json');
const ids=estate.systems.map(s=>s.id).sort();

test('research handoffs are explicit proposed v0.1.0 contracts',()=>{
 for(const v of [B,D,E,F,G,H]){
  assert.equal(v.version,'0.1.0');
  assert.ok(v.schemaVersion);
  assert.match(JSON.stringify(v).slice(0,800),/PROPOSED|SPEC|REFERENCE|PROTOCOL/i);
 }
});
test('R-B native operation/effect contracts cover exact nine systems and 27 states',()=>{
 assert.deepEqual(B.systems.map(s=>s.systemId).sort(),ids);
 assert.equal(new Set(B.systems.map(s=>s.workflowId)).size,7);
 assert.equal(B.systems.flatMap(s=>s.threeStateCases).length,27);
 for(const s of B.systems){
  assert.ok(s.nativeEffectRequires.length>=3);
  assert.deepEqual(s.threeStateCases.map(x=>x.state),['EXPECTED_BASELINE','EVIDENCE_DEGRADED','WRONG_TARGET']);
  assert.ok(s.threeStateCases.every(c=>c.syntheticExpectationsNotHAIECVerdicts));
 }
});
test('R-D seven trust zones and hard negatives include source spoof and plant separation',()=>{
 assert.equal(D.zones.length,7);
 assert.ok(D.threatCases.length>=12);
 assert.ok(D.threatCases.some(t=>t.attack.includes('SERVICE_NATIVE_RECORD')));
 assert.ok(D.scope.includes('NO_REMOTE_INDUSTRIAL_ACTUATION'));
 assert.ok(D.threatCases.every(t=>t.implementedInProduct==='NOT_VERIFIED'));
});
test('R-E sources require server-side qualification and preserve external-source limits',()=>{
 assert.equal(E.sourceClasses.length,9);
 assert.ok(E.comparisonChecks.length>=10);
 assert.equal(E.sourceClasses.filter(s=>s.implementationStatus==='NOT_ESTABLISHED_FOR_MANUFACTURING').length,9);
 assert.ok(E.commonAdmissionRequired.includes('registeredProducerId'));
});
test('R-F source and oracle isolation and 40 hard negatives never claim C2 completion',()=>{
 assert.equal(F.coreStateCases.length,27);
 assert.deepEqual([...new Set(F.coreStateCases.map(c=>c.systemId))].sort(),ids);
 assert.equal(F.negativeCases.length,40);
 assert.equal(F.corpuses.C2.state,'NOT_CREATED_OR_EXECUTED');
 assert.ok(F.oracleIsolation.producerNeverImports.includes('expected-findings.cjs'));
 assert.ok(F.negativeCases.every(x=>x.oracleLocation==='INDEPENDENT_OF_PRODUCER'));
});
test('R-G canonical catalog/visibility maturity not misrepresented as UCP pass',()=>{
 assert.equal(G.referenceCatalogCount,45);
 assert.equal(G.specializedControlTestIds.length,3);
 assert.equal(G.implementedVisibilityIds.length,11);
 assert.deepEqual(G.systemCrosswalk.map(s=>s.systemId).sort(),ids);
 assert.ok(G.systemCrosswalk.every(s=>s.actualAssessedControls.length===0));
 assert.ok(G.systemCrosswalk.every(s=>s.reportStatus==='NOT_EVALUATED_IN_HAIEC_MANUFACTURING'));
});
test('R-H ten dashboard views and eight gates require source-bound truth',()=>{
 assert.equal(H.viewAcceptance.length,10);
 assert.equal(H.releaseGates.length,8);
 assert.equal(H.productScope.coreScenarioStates,27);
 assert.ok(H.viewAcceptance.every(v=>!v.rawHardcodedFindingAllowed && v.acceptanceStatus==='NOT_VERIFIED'));
 assert.ok(H.releaseGates.every(v=>v.state==='NOT_VERIFIED'));
});
