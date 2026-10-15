'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {SPECS}=require('../src/source-native-v3.cjs');
const {buildEnhanced,ROOT,MODES,PROFILE_REQUIRED,PROFILE_CLAIMS,FAMILIES,ORG_PLACEHOLDER}=require('../src/source-native-v3-1-core.cjs');
const repo=path.resolve(__dirname,'../../..');
const read=p=>JSON.parse(fs.readFileSync(path.join(repo,p),'utf8'));
const v3=read('data/source-native/v3/manifest.json'),files=buildEnhanced(SPECS,v3),manifest=read(ROOT+'manifest.json');
const sha=c=>'sha256:'+crypto.createHash('sha256').update(c).digest('hex');
test('v3.1 is a deterministic additive 9-system 36-case SHA-256-pinned evidence pack',()=>{
  assert.equal(manifest.systems,9);assert.equal(manifest.scenarioRuns,36);assert.equal(manifest.domainObservations,216);
  assert.equal(manifest.artifactCount,manifest.entries.length);
  assert.ok(manifest.artifactCount>=400);assert.equal(manifest.negativeInputs,14);assert.equal(manifest.simulationProfiles,4);
  for(const [p,c] of Object.entries(files))assert.equal(fs.readFileSync(path.join(repo,p),'utf8'),c,p);
  for(const e of manifest.entries){
    const c=fs.readFileSync(path.join(repo,ROOT,e.path));assert.equal(sha(c),e.sha256,e.path);assert.equal(c.length,e.bytes,e.path);
  }
  assert.equal(sha('abc'),'sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});
test('upstream v3 evidence source & 27 evaluations remain untouched, pinned per raw byte',()=>{
  for(const e of v3.entries){
    const f=path.join(repo,'data/source-native/v3',e.path);
    assert.equal(sha(fs.readFileSync(f)),e.sha256,f);
  }
  assert.equal(read('data/source-native/v3/manifest.json').cases,36);
  assert.equal(manifest.upstream.baselineCommit,'eda7a6f6df0addbac5d1fef99a67b72f131f83db');
  // The derived pack must record the digest of the CURRENT upstream v3
  // manifest — a live comparison, so an upstream revision can never drift
  // silently under a stale pin.
  assert.equal(manifest.upstream.manifestDigest,sha(fs.readFileSync(path.join(repo,'data/source-native/v3/manifest.json'),'utf8')));
  assert.deepEqual(manifest.upstreamRevisions,['SPRINT15_CANONICAL_OTLP_CONTRACT_ATTRS — v3 telemetry bytes augmented in place and manifest repinned; evaluations bound to revised bytes']);
  assert.doesNotMatch(fs.readFileSync(path.join(__dirname,'../src/source-native-v3-1-core.cjs'),'utf8'),/require\s*\(\s*['"][^'"]*expected-findings/);
});
test('nine differentiated industrial modalities, source hashes and no fake physical image assets',()=>{
  assert.equal(Object.keys(FAMILIES).length,9);
  const units=new Set();
  for(const s of SPECS){
    const sensor=read(ROOT+'systems/'+s.id+'/domain-observations.json');
    const context=read(ROOT+'systems/'+s.id+'/scenario-context.json');
    const staticCode=read(ROOT+'systems/'+s.id+'/source-code-candidate.json');
    assert.equal(sensor.fixtures.length,24);
    assert.equal(sensor.fixtures[0].siteId,s.site);
    assert.equal(context.operation,s.operation);
    assert.equal(context.tool,s.tool);
    assert.equal(staticCode.sourceHash,context.upstreamCode.digest);
    assert.equal(staticCode.claimType,'CODE_CAPABILITY_CANDIDATE');
    assert.equal(staticCode.reachability,'STATIC_ANALYSIS_REQUIRED');
    units.add(sensor.unit);
    if(s.id==='SYS-340'){
      assert.equal(sensor.fixtures.some(x=>x.actualImageAssetPresent!==false),false);
      assert.ok(sensor.fixtures.some(x=>x.fixtureGroundTruthDefect!==x.modelPredictionDefect));
    }
  }
  assert.ok(units.size>=7,'sensor data should be domain-specific');
  const holds=read(ROOT+'systems/SYS-217/quality-containment-policy-exercises.json');
  assert.deepEqual(holds.exercises.map(x=>x.requestedEngineCount),[3,40,51]);
  assert.ok(holds.exercises.every(x=>x.effectApplied===false));
});
test('36 profile case bundles are schema-shaped, coherent and do not claim verified authority',()=>{
  let cases=0,readbacks=0,remediations=0,quarantined=0;
  for(const s of SPECS){
    for(const mode of MODES){
      const base=ROOT+'cases/'+s.id+'/'+mode+'/';
      const ix=read(base+'index.json'),refs=ix.profiledRecordRefs;
      assert.equal(ix.aiSystemId,s.id);assert.equal(ix.scenarioState,mode);
      assert.equal(ix.caseId,s.id+'-'+mode);
      assert.equal(ix.evaluation.actualHaiecEvaluationId,null);
      for(const [k,p] of Object.entries(refs)){
        if(k==='runtime'||k==='domain'||p===null)continue;
        const r=read(ROOT+p),fields=PROFILE_REQUIRED[r.sourceProfile];
        assert.ok(fields,'profile known for '+p);
        assert.ok(PROFILE_CLAIMS[r.sourceProfile].includes(r.claimType),p);
        for(const f of fields)assert.ok(r[f]!=null && r[f]!=='',p+' missing '+f);
        assert.equal(r.synthetic,true);
        assert.equal(r.trustLevel,'UNQUALIFIED_FIXTURE_CANDIDATE');
        if(r.organizationId)assert.equal(r.organizationId,ORG_PLACEHOLDER);
        if(r.transactionId)assert.equal(r.transactionId,ix.transactionId);
        if(r.sourceEventTime&&r.receivedTime)assert.ok(Date.parse(r.receivedTime)>=Date.parse(r.sourceEventTime));
        assert.notEqual(r.boundSourceRole,'AUTHORITATIVE_CONTROL_BOUNDARY');
        assert.notEqual(r.approvalStatus,'APPROVED_BY_HAIEC');
      }
      if(mode==='WRONG_TARGET')assert.equal(ix.dispatchedTarget,s.diversion);
      else assert.equal(ix.dispatchedTarget,s.target);
      if(mode==='EVIDENCE_DEGRADED'){assert.equal(refs.readback,null);assert.equal(read(ROOT+refs.continuity).healthy,false);quarantined++;}
      else if(ix.nativeProfile!=='DEFERRED_CONTROLLER_NATIVE_EFFECT'){assert.ok(refs.readback);readbacks++;}
      else{assert.equal(refs.readback,null);}
      if(mode==='REMEDIATED'){
        remediations++;const a=read(ROOT+ix.remediation.blockedAttempt),b=read(ROOT+ix.remediation.negativeWitness),c=read(ROOT+ix.remediation.correctedReceipt);
        assert.equal(a.decision,'SIMULATED_DENY');assert.equal(a.gatewayDispatchMade,false);
        assert.equal(a.attemptedResource,s.diversion);assert.equal(b.resourceRef,s.diversion);
        assert.deepEqual(b.before,b.after);assert.equal(b.changed,false);
        assert.equal(c.dispatchedResource,s.target);
        assert.notEqual(b.transactionId,c.transactionId);
        assert.equal(c.haiecEvaluated,false);
      }
      cases++;
    }
  }
  assert.equal(cases,36);assert.equal(remediations,9);assert.equal(quarantined,9);assert.equal(readbacks,24);
});
test('negative mutations are actual source files, including authority forgery and adversarial joins',()=>{
 const n=read(ROOT+'negative/index.json');
 assert.equal(n.inputs.length,14);const names=n.inputs.map(x=>x.id);
 for(const required of ['cross-org-dispatch','changed-target-with-stale-payload-digest','caller-forged-qualification','same-transaction-foreign-site','deny-then-native-mutation','agent-scope-escalation','unsupported-opcua-profile']){
  assert.ok(names.includes(required),required);
 }
 for(const e of n.inputs){assert.equal(e.oracleVerdict,null);assert.equal(typeof read(ROOT+e.input),'object');}
 assert.equal(read(ROOT+'negative/cross-org-dispatch.json').organizationId,'SYNTHETIC_FOREIGN_ORG');
 assert.equal(read(ROOT+'negative/caller-forged-qualification.json').qualified,true);
 assert.notEqual(read(ROOT+'negative/changed-unapproved-static-hash.json').sourceHash,read(ROOT+'systems/SYS-217/source-code-candidate.json').sourceHash);
});
test('optional industry simulation profiles are isolated, fictional and never inherit HAIEC evaluations',()=>{
 const registry=read(ROOT+'profiles/registry.json');assert.equal(registry.profiles.length,5);
 assert.equal(registry.mustClearEvaluationIdsOnProfileChange,true);
 for(const p of registry.profiles.filter(x=>x.profileId!=='MFG_DEFAULT')){
  assert.equal(p.evidenceMode,'SIMULATION_ONLY');assert.equal(p.assessmentBinding,'NO_HAIEC_EVALUATIONS');
  const e=read(ROOT+p.sourcePackageRef);
  assert.equal(e.haiecEvaluationId,null);assert.equal(e.reports.length,0);
  assert.equal(e.events.length,4);assert.equal(e.simulationOnly,true);
  assert.ok(!/BNSF|Moonshot|NVIDIA|Wistron/i.test(p.label));
 }
});
