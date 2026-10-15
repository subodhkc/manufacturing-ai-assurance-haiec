#!/usr/bin/env node
'use strict';
/**
 * Static presentation build only. No HAIEC evaluation, source attestation,
 * score, finding or receipt is generated here.
 *
 * The manufacturing HAIEC results remain owned by build-dashboard-data.cjs.
 * Telecom is a historical TM Forum design reference; the four other sectors
 * are source-native v3.1 fictional simulation records.
 */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const writePath = path.join(root,'dashboard/data/industry-profiles.js');
const srcRegistry = read('data/source-native/v3.1/profiles/registry.json');
const telecom = read('data/industry/telecom-reference.json');
if(telecom.source.evidenceMode!=='HISTORICAL_TMFORUM_REFERENCE' || telecom.profile.evaluationId!==null)
  throw new Error('TELECOM_REFERENCE_CANNOT_ACQUIRE_EVALUATION');
const sectors = [
  ['electrical','ELECTRICAL_EQUIPMENT'],
  ['rail','RAIL_TRANSPORT'],
  ['electronics','SMART_ELECTRONICS'],
  ['supplier','SUPPLIER_NETWORK']
];
const profiles = sectors.map(([slug,profileId])=>{
  const meta=read('data/industry/'+slug+'.json');
  const source=read('data/source-native/v3.1/profiles/'+profileId+'/events.json');
  const registered=srcRegistry.profiles.find(p=>p.profileId===profileId);
  if(!registered || meta.profileId!==profileId || source.profileId!==profileId ||
     !source.simulationOnly || source.haiecEvaluationId!==null ||
     meta.evidenceMode!=='SIMULATION_ONLY' || meta.evaluationId!==null ||
     registered.assessmentBinding!=='NO_HAIEC_EVALUATIONS')
    throw new Error('CROSS_PROFILE_EVIDENCE_BOUNDARY:'+profileId);
  if(!Array.isArray(source.events)||source.events.length<4||
     !source.events.every(e=>e.eventId && e.step && e.recordedAt && e.detail))
    throw new Error('SIMULATION_EVENT_COVERAGE:'+profileId);
  return {...meta,sourceWorldVersion:registered.sourceWorldVersion,
    sourcePackageRef:'data/source-native/v3.1/profiles/'+profileId+'/events.json',
    scenarioRunId:source.runId,
    events:source.events.map(e=>({id:e.eventId,step:e.step,at:e.recordedAt,detail:e.detail}))};
});
const mfg=srcRegistry.profiles.find(p=>p.profileId==='MFG_DEFAULT');
if(!mfg || mfg.assessmentBinding!=='EXPLICIT_CANONICAL_EVALUATION_ONLY')throw new Error('MANUFACTURING_SOURCE_ABSENT');
const data={
  schemaVersion:'haiec-industry-read-model-1.0.0',
  buildSource:'EXPLICIT_SOURCE_TYPED_STATIC_PROJECTION',
  profiles:[
    {industryId:'manufacturing',profileId:'MFG_DEFAULT',name:mfg.label,evidenceMode:'HAIEC_EVALUATED_SYNTHETIC_WHEN_EXACT_BOUND',evaluationId:null,
      operator:'Quality Supervisor / Manufacturing Engineer',hero:'What can this AI system cause — and which consequences can HAIEC actually establish?',
      sourceWorldVersion:mfg.sourceWorldVersion,sourcePackageRef:mfg.sourcePackageRef},
    {industryId:'telecom',profileId:telecom.profile.profileId,name:telecom.profile.name,
      evidenceMode:'HISTORICAL_TMFORUM_REFERENCE',evaluationId:null,...telecom.profile,
      reference:telecom}
  ].concat(profiles),
  mustClearEvaluationIdsOnProfileChange:true,
  neverDeriveAssuranceVerdict:true,
  backendActionsEnabled:false
};
const out='/* GENERATED from data/industry and data/source-native/v3.1; read-only presentation. */\n'+
  'window.HAIEC_INDUSTRY_DATA = '+JSON.stringify(data,null,2)+';\n';
if(process.argv.includes('--check')){
  if(!fs.existsSync(writePath)||fs.readFileSync(writePath,'utf8')!==out)
    throw new Error('INDUSTRY_BUNDLE_DRIFT: run node scripts/build-industry-data.cjs');
  process.stdout.write('Industry profile build parity: OK\n');
}else{
  fs.mkdirSync(path.dirname(writePath),{recursive:true});
  fs.writeFileSync(writePath,out,'utf8');
  process.stdout.write('Built industry profile bundle: '+data.profiles.length+' profiles\n');
}
