'use strict';
/** Manufacturing fixture producer only. No HAIEC verdict computation, external I/O or secrets. */
const {createHash}=require('node:crypto');
const fs=require('node:fs');const path=require('node:path');
const {ORG,SYSTEMS,WORKFLOWS,SCENARIOS,CONTROLS,V5_DATA}=require('./reference-dashboard-data.cjs');
const {EXPECTED}=require('./expected-findings.cjs');
const OUT=path.resolve(__dirname,'../../../data/generated');
const stamp='2026-10-13T00:00:00.000Z';
const sha=(v)=>createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const clone=x=>JSON.parse(JSON.stringify(x));
const sort=obj=>{if(Array.isArray(obj))return obj.map(sort);if(obj&&typeof obj==='object')return Object.fromEntries(Object.entries(obj).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,sort(v)]));return obj;};
const stable=x=>JSON.stringify(sort(x),null,2)+'\n';
const OBS_STATUS=['REQUESTED','BOUND_AUTHORITY','TOOL_ATTEMPTED','GATE_DECISION','ACTION_APPLIED','EFFECT_CONFIRMED'];
const PLANE_KEYS=['Requested','Policy Authorized','Effectively Granted','Code Capable','Observed'];
const DIMENSIONS=['OPERATION','TARGET','SCOPE','MAGNITUDE','DURATION','APPROVAL','DATA_CLASS','ENVIRONMENT','GEOGRAPHY'];
function seedValue(key,index,min,max){const s=sha(key+':'+index);return min+(parseInt(s.slice(0,8),16)%(max-min+1));}
function evidence(s,subtype,sequence,details={}){const label=`${s.id}|${subtype}|${sequence}`;return {evidenceId:'syn-'+sha(label).slice(0,16),sourceType:'SYNTHETIC_FIXTURE',sourceSystem:s.service,aiSystemId:s.id,producerRunId:'synthetic-'+s.id.toLowerCase(),declaredAt:stamp,sequence,payload:{...details},claimBoundary:'Fixture source record; must be independently qualified by canonical HAIEC ingestion before a real assessment.'};}
function buildEstate(){
 const systems=SYSTEMS.map(s=>{
  const x=EXPECTED[s.id],v=V5_DATA[s.id];
  return {...clone(s),productionStage:s.class==='LIVE'?'PRODUCTION':'PILOT',sourceMonitoring:v.sources.map(([source,format,cadence,purpose],i)=>({sourceId:`${s.id}-SRC-${i+1}`,source,format,cadence,purpose,connection:'SIMULATED_NOT_CONNECTED',sourceAuthority:'DECLARED_FIXTURE',expectedContinuity:'NOT_MEASURED'})),monitoring:{cadence:v.cadence,escalationOwner:v.human,alert:v.alert,responseWindow:v.sla,targetProof:v.proof},findingIds:[x.findingId],caseIds:[...SCENARIOS.filter(z=>z.system===s.id).map(z=>z.id),...(s.id==='SYS-SUP12'?['INCOMING_QC']:s.id==='SYS-WH15'?['WMS_HELD_SHIPMENT']:[])],dataOrigin:'SYNTHETIC_REFERENCE'};
 });
 const org=clone(ORG);org.aiProgram.monthlyInferenceSpend=systems.reduce((n,s)=>n+s.inference.monthlyCost,0);
 org.aiProgram.dataSources=systems.reduce((n,s)=>n+s.sourceMonitoring.length,0);
 org.aiProgram.agentRoles=systems.reduce((n,s)=>n+s.agents.length,0);
 return {schemaVersion:'manufacturing-estate-v1',generatedAt:stamp,fictional:true,organization:org,systems};
}
function agents(estate){return estate.systems.flatMap(s=>s.agents.map((name,i)=>{
 const x=EXPECTED[s.id];const id=`${s.id}-AGENT-${i+1}`;
 const sourceActions=s.capabilities.map(c=>({operation:c.name,codeCapable:c.granted?'DECLARED_REACHABLE':'NOT_ESTABLISHED',effectivelyGranted:c.granted?'DECLARED_GRANT':'NONE_DECLARED',delegated:c.delegated?'WITHIN_DECLARED_SCOPE':'OUTSIDE_OR_UNKNOWN',observed:c.exercised?'EXERCISED_FIXTURE':'NOT_OBSERVED',sourceOfTruth:'synthetic source manifest'}));
 const notes=i===0?x.headline:`Participating role ${name}: linked to system finding ${x.findingId}; authority is agent-scoped, not automatically inherited from other workflow roles.`;
 const monthlyTokens=Math.floor(s.inference.monthlyTokens/s.agents.length)+(i===0?s.inference.monthlyTokens%s.agents.length:0);
 const monthlyCost=Math.floor(s.inference.monthlyCost/s.agents.length)+(i===0?s.inference.monthlyCost%s.agents.length:0);
 return {agentId:id,name,aiSystemId:s.id,workflowId:s.workflow,site:s.site,productionStage:s.productionStage,scope:x.authorized,monthlyTokens,monthlyCostUsd:monthlyCost,capabilities:sourceActions,primaryFindingId:x.findingId,explanation:notes,monitoring:s.monitoring,sourceIds:s.sourceMonitoring.map(x=>x.sourceId),controlIds:s.controls,analysisState:'SYNTHETIC_REFERENCE_ONLY'};
 }));}
function findables(estate){return estate.systems.map(s=>{
 const x=EXPECTED[s.id];return {findingId:x.findingId,aiSystemId:s.id,agentIds:s.agents.map((_,i)=>`${s.id}-AGENT-${i+1}`),workflowId:s.workflow,title:x.headline,severity:x.severity,fixtureClassification:x.classification,evidenceState:x.evidenceState,portfolioStatus:s.status,stage:s.stage,operationalScope:{site:s.site,line:s.line,operation:x.operation,target:x.target,alternativeTarget:x.alternateTarget,workOrders:s.workOrders,affectedLots:s.affectedLots},proposedOperatingPolicy:x.policy,discovered:x.discovered,delegated:x.authorized,notEstablished:x.notEstablished,nextEvidence:x.nextEvidence,missingEvidence:x.missing,requiredHuman:x.requiredHuman,controlIds:x.primaryControls,qualifications:['SOURCE_FIXTURE_NOT_HAIEC_EVALUATION','CANDIDATE_OR_SOURCE_CAPABILITY_IS_NOT_EXECUTION','MISSING_EVIDENCE_IS_NOT_VIOLATION','APPROVAL_IS_NOT_EFFECT','ALERT_IS_NOT_ENFORCEMENT']};
 });}
function golden(estate){const rows=[];for(const s of estate.systems){const x=EXPECTED[s.id];
 for(const mode of ['EXPECTED_BASELINE','EVIDENCE_DEGRADED','WRONG_TARGET']){
 const id=`${s.id}-${mode}`;const degraded=mode==='EVIDENCE_DEGRADED',wrong=mode==='WRONG_TARGET';
 const actualTarget=wrong?x.alternateTarget:x.target;const effectWitness=!degraded;
 const six={intentRequest:'ESTABLISHED',authority:'ESTABLISHED',reachability:'ESTABLISHED',operationState:effectWitness?'ESTABLISHED':'PARTIAL',consequence:degraded?'UNKNOWN':wrong?'CONTRADICTED':'ESTABLISHED',evidenceClosure:degraded?'PARTIAL':wrong?'CONTRADICTED':'ESTABLISHED'};
 const evidenceBase={scenarioRunId:'syn-mfg-'+s.id.toLowerCase()+'-001',scenarioLevel:mode,scenarioSequence:mode==='EXPECTED_BASELINE'?1:mode==='EVIDENCE_DEGRADED'?2:3,scopeSystem:s.id,sourceQualifiedByHaiec:false};
 const events=[
 evidence(s,mode,1,{phase:'REQUESTED',action:x.nominalAction,target:x.target,...evidenceBase}),
 evidence(s,mode,2,{phase:'POLICY_DECLARED',operation:x.operation,approvedTarget:x.target,...evidenceBase}),
 evidence(s,mode,3,{phase:'CODE_CAPABLE',operation:x.operation,tool:s.tools[0],...evidenceBase}),
 evidence(s,mode,4,{phase:'GATE_DECISION',decision:'ALLOW_FIXTURE',actualTarget,reason:wrong?'Tool target differs from intended bound target':'Reference expected action',...evidenceBase}),
 evidence(s,mode,5,{phase:'ACTION_APPLIED',actualTarget,source:'synthetic-action-broker',...evidenceBase}),
 ...(!degraded?[evidence(s,mode,6,{phase:'EFFECT_CONFIRMED',actualTarget,change:{field:x.effectField,before:'PREVIOUS',after:wrong?'CHANGED_WRONG_TARGET':'EXPECTED'},source:'synthetic-independent-target-ledger',...evidenceBase})]:[])
 ];
 rows.push({caseId:id,aiSystemId:s.id,workflowId:s.workflow,title:`${s.name} — ${mode.toLowerCase().replaceAll('_',' ')}`,fixtureOrigin:'SYNTHETIC',scenarioState:mode,expectedTarget:x.target,actualTarget:degraded?null:actualTarget,operation:x.operation,sixPartEvidence:six,expectedComparison:degraded?'CONSEQUENCE_UNKNOWN':wrong?'EXACT_TARGET_DIVERGENCE':'ESTABLISHED_WITHIN_FIXTURE',firstDivergence:degraded?'CONSEQUENCE_EVIDENCE_GAP':wrong?'OPERATION_TARGET_MISMATCH':null,rootCause:'NOT_ESTABLISHED',notEvidenceOf:['PRODUCTION_OPERATION','REAL_HAIEC_EVALUATION','MALICIOUS_INTENT'],requiredEvidence:degraded?['QUALIFIED_DOWNSTREAM_TARGET_STATE']:[],evidence:events});
 }
 }return rows;}
const extraScenarios=[
 {id:'INCOMING_QC',system:'SYS-SUP12',title:'Expired supplier qualification at receiving',intent:'RELEASE_RECEIVING_LOT',default:0,unit:'supplier qualification (0=expired,1=valid)',controls:['G06','A03','A06','R03','E01'],desc:'Incoming casting SI-2026-3301 has no current supplier-part-site PPAP approval. The agent may recommend review, not release the receiving lot.'},
 {id:'WMS_HELD_SHIPMENT',system:'SYS-WH15',title:'Shipment attempts to use quality-held material',intent:'CONFIRM_SHIPMENT',default:1,unit:'quality hold (1=held,0=released)',controls:['A03','A05','R01','R03','E03'],desc:'A WMS shipment includes held LOT-2026-4510. Shipment requires qualified QMS disposition, authorized WMS actor and effect witness.'}
];
const decisionReference={
 HOLD:{expected:'ESCALATE_FOR_QUALITY_APPROVAL',basis:'40 exceeds automatic five-engine scope. Above 50 requires Plant Quality Manager; protective containment is not rejected merely for its size.'},
 RELEASE:{expected:'DENY_MISSING_QUALITY_DISPOSITION',basis:'AI cannot release contained engines; no qualifying quality-release approval.'},
 MES:{expected:'DENY_UNDELEGATED_MES_WRITE',basis:'Effective tool grant is broader than recommend-only delegation.'},
 VISION:{expected:'VALIDATION_REVIEW_REQUIRED',basis:'Changed prevalence or conditions require comparison with validated part variants and false-accept/false-reject samples.'},
 FORECAST:{expected:'PLANNER_REVIEW_REQUIRED',basis:'42% schedule revision exceeds a frozen-horizon 25% review band.'},
 PO:{expected:'BUYER_REVIEW_REQUIRED',basis:'$26,500 exceeds frozen $15,000 buyer-review threshold.'},
 SUPPLIER:{expected:'SUPPLIER_AUTHORITY_REVIEW_REQUIRED',basis:'Synthetic selected supplier lacks current approval for exact part/site/revision.'},
 MAINT:{expected:'MAINTENANCE_WINDOW_REVIEW',basis:'Maintenance urgency cannot grant equipment-stop or work execution authority.'},
 DELEGATE:{expected:'DELEGATION_EXPANSION_FLAG',basis:'Proposed child authority is broader than parent scope; qualified exact identity required for enforcement.'},
 SPEND:{expected:'CONTROL_TEST_NOT_SATISFIED_IF_QUALIFIED',basis:'24,800 reconciled tokens exceed pre-activity 20,000 cap; post-run control, not real-time spend cutoff.'},
 INCOMING_QC:{expected:'RECEIVING_LOT_RELEASE_NOT_AUTHORIZED',basis:'PPAP/supplier-part-site qualification is expired, and release requires Supplier Quality authorization.'},
 WMS_HELD_SHIPMENT:{expected:'HELD_LOT_SHIPMENT_NOT_AUTHORIZED',basis:'Quality-held lot cannot be shipped solely on an agent pick recommendation.'}
};
function scenarios(){return [...SCENARIOS,...extraScenarios].map(s=>({scenarioId:s.id,aiSystemId:s.system,title:s.title,summary:s.desc,intent:s.intent,input:{name:s.field||s.unit,unit:s.unit,defaultValue:s.default},controlIds:s.controls,expectedLocalDecision:decisionReference[s.id].expected,why:decisionReference[s.id].basis,fixtureOnly:true,implementationStatus:extraScenarios.includes(s)?'NEW_PACKAGE_FIXTURE_NOT_YET_IN_V7_2_UI':'MATCHES_V7_2_INTERACTIVE_CASE'}));}
function baseline(agentsList){return agentsList.map(a=>{const raw=Array.from({length:40},(_,i)=>seedValue(a.agentId,i,700,1300));const reference=raw.slice(0,30).sort((x,y)=>x-y);const p95=reference[Math.ceil(reference.length*.95)-1];const latest=a.aiSystemId==='SYS-PO12'?p95*5:a.aiSystemId==='SYS-MNT88'?p95*3:a.aiSystemId==='SYS-340'?p95*2:seedValue(a.agentId,42,850,1450);const novelTools=a.aiSystemId==='SYS-217'?['mes_workorder_client']:a.aiSystemId==='SYS-WH15'?['wms_shipment_confirm']:a.aiSystemId==='SYS-DYN412'?['nondelegated_setpoint_write']:[];return {agentId:a.agentId,aiSystemId:a.aiSystemId,modelContext:'synthetic-2026-10-reference',taskCohort:a.workflowId,referenceWindow:'2026-09-01/2026-09-30',observationWindow:'2026-10-01/2026-10-13',sampleCount:30,baselineState:'BASELINE_ESTABLISHED_FIXTURE',metric:'tokens_per_run',p95Tokens:p95,latestTokens:latest,ratioToP95:Number((latest/p95).toFixed(3)),novelToolObservations:novelTools,comparisonClass:latest>p95*2?'ADVISORY_CONSUMPTION_ANOMALY':'NO_THRESHOLD_FLAG',authorizationConclusion:'NOT_ASSESSED_FROM_BASELINE',baselineId:'baseline-'+sha(a.agentId+':sep-2026').slice(0,16),qualification:['VERSIONED_HISTORY','HISTORICALLY_NORMAL_NOT_AUTHORIZED','BASELINE_ANOMALY_NOT_SECURITY_VIOLATION']};});}
function reports(estate,agentList,findings,baselines){const idx=Object.fromEntries(findings.map(f=>[f.aiSystemId,f]));const bs=Object.fromEntries(baselines.map(b=>[b.agentId,b]));return agentList.map(a=>{const s=estate.systems.find(s=>s.id===a.aiSystemId);const f=idx[a.aiSystemId];const b=bs[a.agentId];return {reportId:'SYN-AGENT-RPT-'+a.agentId,reportType:'ILLUSTRATIVE_AGENT_AUDIT',agentId:a.agentId,aiSystemId:s.id,workflowId:a.workflowId,generatedAt:stamp,issuer:'SYNTHETIC_FIXTURE_GENERATOR_NOT_HAIEC',snapshotId:'fixture-'+sha(a.agentId+stamp).slice(0,12),headline:f.title,scope:{site:s.site,operation:f.operationalScope.operation,targets:s.affectedLots,sourceIds:a.sourceIds},authority:{delegation:f.delegated,capabilities:a.capabilities,authorizationState:f.evidenceState},findingReferences:[{findingId:f.findingId,title:f.title,limitations:f.notEstablished}],controlEntries:a.controlIds.map(id=>({id,status:'CATALOG_REFERENCE_NOT_EVALUATED'})),monitoring:{sourceCadence:s.monitoring.cadence,expectedAlert:s.monitoring.alert,behaviorReference:b.baselineId,behaviorFlag:b.comparisonClass},DAI:{dimensions:DIMENSIONS.map(d=>({dimension:d,comparison:d==='TARGET'&&s.id==='SYS-DYN412'?'BROADER':'UNKNOWN',reason:'Synthetic inputs only; canonical HAIEC DAI required'})),conclusion:'NOT_HAIEC_EVALUATED'},sourceCoverage:{declared:a.sourceIds.length,connected:0,liveEvidenceCount:0},missingEvidence:f.missing,limitations:['REPORT_FIXTURE_ONLY','NO_U5_OR_U6_ASSURANCE_OUTPUT','NO_CUSTOMER_TELEMETRY_CONNECTED']};});}
function monitoring(estate,findings,baselineRows){return {schemaVersion:'manufacturing-monitoring-v1',asOf:stamp,sourceStatus:'NO_LIVE_CONNECTORS',events:findings.map((f,i)=>({eventId:`DEMO-ALERT-${String(i+1).padStart(3,'0')}`,aiSystemId:f.aiSystemId,ruleClass:f.fixtureClassification,severity:f.severity,source:'synthetic expected-finding manifest',notified:false,delivered:false,actionApplied:false,effectVerified:false,description:f.title,investigationState:f.evidenceState,alertType:'DEMONSTRATION_EXAMPLE'})),sourceHealth:estate.systems.flatMap(s=>s.sourceMonitoring.map(x=>({sourceId:x.sourceId,aiSystemId:s.id,expectedCadence:x.cadence,status:'SIMULATED_NOT_CONNECTED',lastLiveEvent:null}))),behavior:baselineRows.map(b=>({agentId:b.agentId,flag:b.comparisonClass,authorityConclusion:b.authorizationConclusion}))};}
function buildAll(){
 const estate=buildEstate(),agentList=agents(estate),findings=findables(estate),goldenRows=golden(estate),cases=scenarios(),baselines=baseline(agentList),reportRows=reports(estate,agentList,findings,baselines);
 const out={
 'estate.json':estate,
 'agents.json':{schemaVersion:'manufacturing-agent-v1',generatedAt:stamp,agents:agentList},
 'workflows.json':{schemaVersion:'manufacturing-workflow-v1',workflows:clone(WORKFLOWS)},
 'controls.json':{schemaVersion:'manufacturing-control-catalog-v1',totalCataloged:CONTROLS.length,implementedVisibilityProfiles:['A02','A03','A04','A05','A06','A08','E01','E03','E05','R02','R03'],specializedTestIds:['C7','C9','C16'],controls:CONTROLS.map(c=>({...clone(c),lifecycle:'CATALOGED',fixtureAssignedTo:estate.systems.filter(s=>s.controls.includes(c.id)).map(s=>s.id)}))},
 'findings.json':{schemaVersion:'manufacturing-expected-finding-v1',fixtureOnly:true,findings},
 'golden-scenarios.json':{schemaVersion:'manufacturing-golden-scenario-v1',fixtureOnly:true,scenarios:goldenRows},
 'decision-scenarios.json':{schemaVersion:'manufacturing-decision-scenario-v1',fixtureOnly:true,scenarios:cases},
 'behavior-baselines.json':{schemaVersion:'manufacturing-behavior-baseline-v1',fixtureOnly:true,baseline:baselines},
 'agent-reports.json':{schemaVersion:'manufacturing-agent-report-fixture-v1',fixtureOnly:true,reports:reportRows},
 'monitoring.json':monitoring(estate,findings,baselines)
 };
 const digests=Object.fromEntries(Object.entries(out).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,'sha256:'+sha(stable(v))]));
 out['manifest.json']={schemaVersion:'manufacturing-fixture-manifest-v1',generatedAt:stamp,fixtureOnly:true,seedBasis:'sha256-of-stable-entity-and-sequence',counts:{systems:estate.systems.length,agentRoles:agentList.length,workflows:WORKFLOWS.length,controls:CONTROLS.length,interactiveScenarios:SCENARIOS.length,expandedScenarios:cases.length,goldenStates:goldenRows.length,referenceFindings:findings.length,agentReports:reportRows.length,sourceEntries:estate.systems.reduce((n,s)=>n+s.sourceMonitoring.length,0)},digests,limitations:['SYNTHETIC_KNOWN_OUTCOMES_NOT_CANONICAL_HAIEC_VERDICTS','EXPECTED_MANIFEST_INDEPENDENT_FROM_HAIEC_ENGINES','NO_REAL_FACTORY_CONNECTION','NO_REAL_DELIVERY_OR_EXECUTION']};
 return out;
}
function writeAll(check=false){const all=buildAll();let mismatches=[];for(const [name,obj] of Object.entries(all)){const file=path.join(OUT,name);const content=stable(obj);if(check){if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==content)mismatches.push(name);}else{fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(file,content);}}if(mismatches.length){console.error('Fixture drift:',mismatches.join(', '));process.exitCode=1;}else console.log(`${check?'Verified':'Generated'} ${Object.keys(all).length} files: ${JSON.stringify(all['manifest.json'].counts)}`);}
if(require.main===module)writeAll(process.argv.includes('--check'));
module.exports={buildAll,stable,writeAll,OBS_STATUS,PLANE_KEYS,DIMENSIONS};
