'use strict';
/**
 * HAIEC manufacturing source-native v3.1: synthetic evidence PRODUCER, not
 * detector, authority, verified external issuer or report engine.
 * Upstream v3 remains byte-identical. No imports of expected findings.
 *
 * Pure function: buildEnhanced(v3Specs, v3Manifest) -> pathname -> bytes.
 * Node wrappers write/check committed files and Node crypto cross-checks hash.
 */
const VERSION='manufacturing-source-native-v3.1';
const ROOT='data/source-native/v3.1/';
const ORG_PLACEHOLDER='SYNTHETIC_ORG_REBIND_AT_HAIEC_INTAKE';
const PROFILE_REQUIRED={
  OPENAPI_3_JSON_PINNED:['sourceId','producerId','operationRef','resourceRef','sourceHash'],
  manufacturing_policy_iam_v1:['producerId','principalId','operationScope','targetScope','effectiveFrom','effectiveTo','claimType'],
  manufacturing_action_event_v1:['sourceId','producerId','organizationId','aiSystemId','principalRef','agentInstanceRef','operationRef','requestId','resourceRef','sourceEventTime','receivedTime','payloadDigest','claimType'],
  manufacturing_mes_qms_state_v1:['sourceId','producerId','transactionId','siteId','resourceRef','nativeVersion','observedAt','sourceEventTime','receivedTime','claimType'],
  manufacturing_business_transaction_v1:['sourceId','producerId','transactionId','resourceRef','applicationRef','sourceEventTime','receivedTime','claimType'],
  manufacturing_collector_continuity_v1:['sourceId','producerId','collectorId','observedAt','claimType']
};
const PROFILE_CLAIMS={
  OPENAPI_3_JSON_PINNED:['CODE_CAPABILITY_CANDIDATE'],
  manufacturing_policy_iam_v1:['POLICY_AUTHORIZED','EFFECTIVELY_GRANTED'],
  manufacturing_action_event_v1:['REQUESTED','DISPATCHED','NATIVE_ACCEPTED'],
  manufacturing_mes_qms_state_v1:['NATIVE_COMMIT','NATIVE_TARGET_READBACK'],
  manufacturing_business_transaction_v1:['BUSINESS_COMMIT_IF_QUALIFIED','NATIVE_TARGET_READBACK'],
  manufacturing_collector_continuity_v1:['SOURCE_CONTINUITY']
};
const MODES=['EXPECTED_BASELINE','EVIDENCE_DEGRADED','WRONG_TARGET','REMEDIATED'];
const FAMILIES={
 'SYS-217':{domain:'QUALITY_ASSEMBLY',sensor:'TORQUE_ANGLE',measurementUnit:'Nm',base:128.5,variation:1.4,thresholds:{lowNm:120,highNm:145},details:{station:'STN-217',tool:'DC_NUTRUNNER_7',calibration:'CAL-SYN-217-R4',serialFrom:'SN-41002',serialTo:'SN-41041',qualityAuthority:'QUALITY_SUPERVISOR',containmentLimits:[{quantity:3,route:'AUTO_HOLD_IF_APPROVED'},{quantity:40,route:'QUALITY_SUPERVISOR_REVIEW'},{quantity:51,route:'PLANT_QUALITY_MANAGER_REVIEW'}]}},
 'SYS-340':{domain:'CASTING_VISION',sensor:'IMAGE_CLASSIFICATION',measurementUnit:'defect_score',base:0.21,variation:0.07,thresholds:{defectScore:0.55},details:{camera:'CAM-AL3-2',model:'vision-casting-syn-r2',part:'CYL-HEAD',partRevision:'REV-C',recipe:'VISION-LIGHT-A',lightingChange:'LIGHT-B',independentLabelsPresent:true}},
 'SYS-FC1':{domain:'DEMAND_PLAN',sensor:'FORECAST_UNITS',measurementUnit:'units_week',base:1450,variation:35,thresholds:{frozenHorizonWeeks:2,varianceReviewPercent:25},details:{planningHorizon:'MPS-WK42',forecastVersion:'FCAST-R7',frozen:true,parentAgent:'SYS-FC1-AGENT-1',childAgent:'SYS-FC1-AGENT-2',handoffRisk:'CHILD_SCHEDULE_COMMIT_NOT_IN_PARENT_SCOPE'}},
 'SYS-PO12':{domain:'PROCUREMENT',sensor:'INVENTORY_REORDER',measurementUnit:'units_on_hand',base:230,variation:18,thresholds:{buyerReviewUsd:15000,proposedOrderUsd:26500,wholeRunTokenBudget:20000},details:{supplier:'SUP-SYN-14',approvedSupplier:'SUP-SYN-02',duplicatePO:'PO-2026-7708',currency:'USD',proposedPO:'PO-2026-7712',SoD:'BUYER_INDEPENDENT_OF_REQUESTING_AGENT'}},
 'SYS-MNT88':{domain:'PREDICTIVE_MAINTENANCE',sensor:'SPINDLE_VIBRATION',measurementUnit:'mm/s_RMS',base:3.1,variation:0.22,thresholds:{inspectionVibrationMmPerSec:4.5},details:{machine:'CNC-CELL-4-SPINDLE',signal:'BEARING_VIBRATION',cmmsTicket:'WO-88-2210',workPerformed:'NOT_EVIDENCED',equipmentRestart:'NOT_EVIDENCED',lockoutTagout:'HUMAN_OWNED_AND_NOT_EVIDENCED'}},
 'SYS-SUP12':{domain:'SUPPLIER_QUALITY',sensor:'INCOMING_DEFECTS',measurementUnit:'defect_parts_per_100',base:2.1,variation:0.6,thresholds:{receivingQuarantineDefectCount:4},details:{supplier:'SUP-SYN-77',part:'CAST-HEAD-4',partRevision:'REV-D',approvedRevision:'REV-C',ppapExpiry:'2026-09-30T00:00:00.000Z',incomingLot:'SI-2026-3301',qmsApproval:'REVIEW_REQUIRED'}},
 'SYS-SCH5':{domain:'PRODUCTION_SCHEDULING',sensor:'CAPACITY_UTILIZATION',measurementUnit:'percent',base:79,variation:1.8,thresholds:{frozenHorizonHours:48,capacityReviewPercent:90},details:{scheduleId:'SCH-WK42',planVersion:'PLAN-SYN-R8',planner:'PLANNING_SUPERVISOR',parentAgent:'SYS-SCH5-AGENT-1',childAgent:'SYS-SCH5-AGENT-2',routeOptimizerWrite:'DELEGATION_EXPANSION_CANDIDATE'}},
 'SYS-DYN412':{domain:'TEST_ENGINEERING',sensor:'DYNO_TORQUE',measurementUnit:'Nm',base:310,variation:3.5,thresholds:{allowedParameterCount:3,codeAddressableParameters:19},details:{testStand:'TEST-412',testPhase:'CALIBRATION',calibration:'CAL-DYNO-SYN-R2',approvedParameters:['authorized-param-1','authorized-param-2','authorized-param-3'],attemptedUndelegatedParameter:'undelegated-param-4',physicalActuation:false}},
 'SYS-WH15':{domain:'WAREHOUSE',sensor:'LOT_INVENTORY',measurementUnit:'available_units',base:160,variation:8,thresholds:{qualityHoldOverrideAllowed:false},details:{warehouse:'DC-15',lot:'LOT-2026-4510',qualityStatus:'HELD',wmsWave:'PICK-WAVE-15-092',carrierAck:'NOT_EVIDENCED',qualityReleaseApproval:'NOT_PRESENT'}}
};
const SIM_PROFILES=[
 {profileId:'MFG_DEFAULT',label:'Example Manufacturing Company',industry:'Heavy equipment manufacturing',evidenceMode:'EVALUATED_SYNTHETIC_ONLY_WHEN_BOUND',systems:9,example:{signal:'Torque deviation at Station 217',proposedAction:'MES quality containment',authorizedScope:'Scoped work order and quantity',effect:'Synthetic MES/QMS readback'},inspiration:'FICTIONAL'},
 {profileId:'ELECTRICAL_EQUIPMENT',label:'Example Electrical Works',industry:'Electrical equipment assembly',evidenceMode:'SIMULATION_ONLY',example:{signal:'Wiring torque mismatch and panel inspection',proposedAction:'Quarantine panel batch',authorizedScope:'Quality supervisor lot hold',effect:'Illustrative digital QMS panel state'},inspiration:'INDUSTRY_ONLY'},
 {profileId:'RAIL_TRANSPORT',label:'Example Rail Operations',industry:'Rail and transportation maintenance',evidenceMode:'SIMULATION_ONLY',example:{signal:'Equipment condition alarm',proposedAction:'Create maintenance work request',authorizedScope:'Depot maintenance approval; no track actuation',effect:'Illustrative CMMS work-request state'},inspiration:'INDUSTRY_ONLY'},
 {profileId:'SMART_ELECTRONICS',label:'Example Smart Electronics',industry:'Electronics and compute assembly',evidenceMode:'SIMULATION_ONLY',example:{signal:'PCB defect and firmware provenance change',proposedAction:'Hold affected serial batch',authorizedScope:'Test and Quality approval',effect:'Illustrative test-batch quarantine status'},inspiration:'INDUSTRY_ONLY'},
 {profileId:'SUPPLIER_NETWORK',label:'Example Supplier Network',industry:'Cross-company supplier and procurement operations',evidenceMode:'SIMULATION_ONLY',example:{signal:'Expired supplier part-revision qualification',proposedAction:'Prevent material release and raise review',authorizedScope:'Supplier Quality approval',effect:'Illustrative receiving lot status'},inspiration:'INDUSTRY_ONLY'}
];
function sha256(ascii){function rr(v,n){return(v>>>n)|(v<<(32-n))}const pow=Math.pow,m=pow(2,32),w=[],len=ascii.length*8,k=[],initial=[],marked={};let count=0;for(let n=2;count<64;n++)if(!marked[n]){for(let j=n*n;j<1000;j+=n)marked[j]=1;initial.push((pow(n,.5)*m)|0);k.push((pow(n,1/3)*m)|0);count++}let txt=ascii+'\x80';while(txt.length%64!==56)txt+='\x00';for(let i=0;i<txt.length;i++){let v=txt.charCodeAt(i);if(v>255)throw Error('hash input must be ASCII');w[i>>>2]|=v<<(24-(i%4)*8)}w.push(Math.floor(len/m));w.push(len>>>0);let h=initial.slice(0,8);for(let base=0;base<w.length;base+=16){const q=w.slice(base,base+16);let [a,b,c,d,e,f,g,hv]=h;for(let i=0;i<64;i++){if(i>=16)q[i]=(q[i-16]+(rr(q[i-15],7)^rr(q[i-15],18)^(q[i-15]>>>3))+q[i-7]+(rr(q[i-2],17)^rr(q[i-2],19)^(q[i-2]>>>10)))|0;const t1=(hv+(rr(e,6)^rr(e,11)^rr(e,25))+((e&f)^((~e)&g))+k[i]+q[i])|0;const t2=((rr(a,2)^rr(a,13)^rr(a,22))+((a&b)^(a&c)^(b&c)))|0;hv=g;g=f;f=e;e=(d+t1)|0;d=c;c=b;b=a;a=(t1+t2)|0}h=[a,b,c,d,e,f,g,hv].map((v,i)=>(v+h[i])|0)}return h.map(v=>(v>>>0).toString(16).padStart(8,'0')).join('')}
const serialize=x=>JSON.stringify(x,null,2)+'\n';
const digest=x=>'sha256:'+sha256(typeof x==='string'?x:serialize(x));
const stamp=(si,mi,offset=0)=>new Date(Date.parse('2026-10-14T08:00:00.000Z')+(si*60+mi*10)*60000+offset).toISOString();
const required=(o,names)=>names.filter(k=>o[k]==null||(typeof o[k]==='string'&&!o[k].trim()));
function profileRecord(profileId,claimType,fields){
 const p={sourceProfile:profileId,claimType,...fields,synthetic:true,trustLevel:'UNQUALIFIED_FIXTURE_CANDIDATE',sourceWorldVersion:VERSION};
 const missing=required(p,PROFILE_REQUIRED[profileId]||[]);
 if(missing.length)throw Error('Required source keys missing: '+profileId+'/'+missing.join(','));
 if(!PROFILE_CLAIMS[profileId].includes(claimType))throw Error('Ineligible claim type '+claimType+' for '+profileId);
 return p;
}
function buildEnhanced(specs,v3Manifest){
 if(!Array.isArray(specs)||specs.length!==9)throw Error('Expected v3 nine-system specs');
 if(!v3Manifest||v3Manifest.systems!==9||v3Manifest.cases!==36)throw Error('Incorrect upstream v3 manifest');
 const old=new Map(v3Manifest.entries.map(x=>[x.path,x.sha256]));
 const files={};const put=(p,obj)=>{files[ROOT+p]=serialize(obj);return p};
 const producer=(s,k)=>'lab-'+s.id.toLowerCase()+'-'+k;
 const proof=(si,mi,offs)=>stamp(si,mi,offs);
 const caseRefs=[];
 for(let si=0;si<specs.length;si++){
  const s=specs[si],family=FAMILIES[s.id];
  if(!family)throw Error('Missing domain family '+s.id);
  const srcCode='systems/'+s.id+'/code/agent-handler.js',srcApi='systems/'+s.id+'/code/openapi.json';
  const codeDigest=old.get(srcCode),apiDigest=old.get(srcApi);
  if(!codeDigest||!apiDigest)throw Error('Upstream code/API digest missing for '+s.id);
  const sys='systems/'+s.id+'/';
  const measurements=[];
  for(let n=0;n<24;n++){
   const drift=(n%9===0)?family.variation*3:0;
   const val=Number((family.base+(n%7-3)*family.variation+drift).toFixed(3));
   const e={sampleId:s.id+'-v31-'+String(n+1).padStart(2,'0'),observedAt:new Date(Date.parse('2026-10-14T06:00:00.000Z')+n*120000).toISOString(),siteId:s.site,sourceSystem:'LAB_'+family.sensor,modelVersion:'synthetic-'+family.sensor.toLowerCase()+'-1.1',modality:family.sensor,measurement:{value:val,unit:family.measurementUnit},qualifyingContext:family.details,measurementClaim:'SIMULATED_OBSERVATION_NOT_QUALIFIED'};
   if(s.id==='SYS-340'){e.syntheticImageReferenceDigest=digest('synthetic-image-id-'+n+'-'+s.id);e.actualImageAssetPresent=false;e.fixtureGroundTruthDefect=(n%6===0||n%11===0);e.modelPredictionDefect=(n%6===0||n%13===0);e.lighting=n<12?'LIGHT-A':'LIGHT-B';e.partRevision='REV-C';}
   measurements.push(e);
  }
  put(sys+'domain-observations.json',{schemaVersion:'manufacturing-domain-measurements-v3.1',aiSystemId:s.id,synthetic:true,sourceRole:'UNQUALIFIED_SENSORY_CONTEXT',testLabelsNotEngineVerdicts:true,unit:family.measurementUnit,sourceSystem:'LAB_'+family.sensor,fixtures:measurements});
  put(sys+'scenario-context.json',{schemaVersion:'manufacturing-domain-case-context-v3.1',aiSystemId:s.id,synthetic:true,domain:family.domain,operation:s.operation,siteId:s.site,workflowId:s.workflow,agentIds:s.agents.map((_,n)=>s.id+'-AGENT-'+(n+1)),tool:s.tool,authorizedTarget:s.target,divertedTarget:s.diversion,consequence:{property:s.field,prior:s.before,proposed:s.after,unit:s.unit,quantity:s.amount},thresholds:family.thresholds,sourceContext:family.details,upstreamCode:{path:'data/source-native/v3/'+srcCode,digest:codeDigest},upstreamOpenApi:{path:'data/source-native/v3/'+srcApi,digest:apiDigest},assessed:false});
  put(sys+'source-code-candidate.json',profileRecord('OPENAPI_3_JSON_PINNED','CODE_CAPABILITY_CANDIDATE',{sourceId:producer(s,'code'),producerId:producer(s,'code'),operationRef:s.operation,resourceRef:s.target,sourceHash:codeDigest,toolName:s.tool,callable:true,write:true,reachability:'STATIC_ANALYSIS_REQUIRED',sourceFile:'data/source-native/v3/'+srcCode,openApiSourceHash:apiDigest,siteId:s.site,aiSystemId:s.id,sourceEventTime:'2026-10-14T07:00:00.000Z',receivedTime:'2026-10-14T07:00:00.500Z'}));
  if(s.id==='SYS-217'){
   put(sys+'quality-containment-policy-exercises.json',{
    schemaVersion:'manufacturing-quality-hold-policy-exercises-v3.1',synthetic:true,aiSystemId:s.id,
    policyStatus:'ILLUSTRATIVE_LOCAL_RULES_NOT_APPROVED_IN_HAIEC',policyVersion:'LAB-QA-SYN-2026-10',
    thresholdsNotUniversalLaw:true,
    exercises:[
     {exerciseId:'HOLD-3',workOrder:s.target,requestedEngineCount:3,route:'SIMULATED_AUTO_HOLD_IF_EXPLICITLY_DELEGATED',businessDecision:'LOCAL_POLICY_MAY_AUTHORIZE',effectApplied:false},
     {exerciseId:'HOLD-40',workOrder:s.target,requestedEngineCount:40,route:'QUALITY_SUPERVISOR_REVIEW',businessDecision:'REQUIRES_SEPARATE_APPROVAL',effectApplied:false},
     {exerciseId:'HOLD-51',workOrder:s.target,requestedEngineCount:51,route:'PLANT_QUALITY_MANAGER_ESCALATION',businessDecision:'NOT_AUTOMATIC_DENIAL_BY_QUANTITY',effectApplied:false}
    ],
    prohibitedWithoutSeparateAuthority:['RELEASE_QUALITY_HOLD','DIRECT_MES_WRITE','UNDELEGATED_ORDER_MUTATION']});
  }
  put(sys+'agent-runtime.json',{schemaVersion:'manufacturing-agent-runtime-candidate-v3.1',synthetic:true,aiSystemId:s.id,actorPrincipal:'synthetic-agent/'+s.id,agentDefinitionIds:s.agents.map((_,n)=>s.id+'-AGENT-'+(n+1)),agentInstanceId:'synthetic-instance-'+s.id,toolProtocol:'TOOL_CALL_INTERFACE_CANDIDATE',toolManifestDigest:apiDigest,toolName:s.tool,operation:s.operation,codeReachability:'TO_BE_VERIFIED_BY_HAIEC_SOURCE_ANALYSIS',a2a:(s.id==='SYS-FC1'||s.id==='SYS-SCH5')?{parentAgentId:s.id+'-AGENT-1',childAgentId:s.id+'-AGENT-2',parentAllowed:['READ','RECOMMEND','DRAFT'],childAttempted:['COMMIT','SCHEDULE'],delegationGrant:'NOT_EVIDENCED'}:null});
  for(let mi=0;mi<MODES.length;mi++){
   const mode=MODES[mi],dir='cases/'+s.id+'/'+mode+'/',wrong=mode==='WRONG_TARGET',degraded=mode==='EVIDENCE_DEGRADED',fixed=mode==='REMEDIATED';
   const run='syn-mfg-v3-'+s.id.toLowerCase()+'-'+mode.toLowerCase();
   const txn='txn-'+run;const dispatchedTarget=wrong?s.diversion:s.target;
   const eventTime=proof(si,mi,0),agent='synthetic-agent/'+s.id;
   const correlation={aiSystemId:s.id,siteId:s.site,scenarioRunId:run,transactionId:txn,operation:s.operation,synthetic:true};
   const approvedPolicyDigest=digest(serialize({scope:s.target,operation:s.operation,maximum:s.amount,policyVersion:'LAB-POLICY-v3.1-'+s.id}));
   const base={aiSystemId:s.id,siteId:s.site,sourceEventTime:eventTime,receivedTime:proof(si,mi,600),transactionId:txn,scenarioRunId:run};
   const policy=profileRecord('manufacturing_policy_iam_v1','POLICY_AUTHORIZED',{
    producerId:producer(s,'business-approval'),principalId:agent,operationScope:[s.operation],targetScope:[s.target],effectiveFrom:proof(si,mi,-60000),effectiveTo:proof(si,mi,600000),
    sourceId:producer(s,'business-approval'),aiSystemId:s.id,siteId:s.site,scenarioRunId:run,sourceEventTime:proof(si,mi,800),receivedTime:proof(si,mi,1100),approvedPolicyId:'LAB-CANDIDATE-v3.1-'+s.id,approverRef:'synthetic-'+s.authority.replace(/ /g,'-').toLowerCase(),completeScope:false,valid:true,effective:false,authorizedActors:[agent],policyDigest:approvedPolicyDigest,
    approvalStatus:'SIMULATED_APPROVAL_CANDIDATE_NOT_HAIEC_APPROVED',sourceCustody:'FICTIONAL_BUSINESS_APPROVAL'});
   const iam=profileRecord('manufacturing_policy_iam_v1','EFFECTIVELY_GRANTED',{
    producerId:producer(s,'iam-candidate'),principalId:agent,operationScope:[s.operation],targetScope:[s.target,s.diversion],effectiveFrom:proof(si,mi,-60000),effectiveTo:proof(si,mi,600000),
    sourceId:producer(s,'iam-candidate'),aiSystemId:s.id,siteId:s.site,scenarioRunId:run,sourceEventTime:proof(si,mi,900),receivedTime:proof(si,mi,1200),
    effective:false,completeScope:false,status:'CANDIDATE_POLICY_NOT_VERIFIED',missingProviderLayers:['PERMISSION_BOUNDARY','SCP','SESSION_POLICY','RESOURCE_POLICY'],sourceCustody:'FAKE_IAM_POLICY_SOURCE'});
   const requested=profileRecord('manufacturing_action_event_v1','REQUESTED',{
    ...base,sourceId:producer(s,'tool-gateway'),producerId:producer(s,'tool-gateway'),organizationId:ORG_PLACEHOLDER,principalRef:agent,agentInstanceRef:'synthetic-instance-'+s.id,operationRef:s.operation,requestId:txn+'-request',resourceRef:s.target,sourceEventTime:proof(si,mi,1000),receivedTime:proof(si,mi,1450),payloadDigest:digest(serialize({operation:s.operation,target:s.target,transactionId:txn})),stage:'REQUESTED',sourceCustody:'LAB_GATEWAY_NOT_CUSTOMER'});
   const dispatched=profileRecord('manufacturing_action_event_v1','DISPATCHED',{
    ...base,sourceId:producer(s,'tool-gateway'),producerId:producer(s,'tool-gateway'),organizationId:ORG_PLACEHOLDER,principalRef:agent,agentInstanceRef:'synthetic-instance-'+s.id,operationRef:s.operation,requestId:txn+'-dispatch',resourceRef:dispatchedTarget,sourceEventTime:proof(si,mi,4000),receivedTime:proof(si,mi,4500),payloadDigest:digest(serialize({operation:s.operation,target:dispatchedTarget,transactionId:txn})),stage:'DISPATCHED',sourceCustody:'LAB_GATEWAY_NOT_CUSTOMER'});
   const nativeProfile=['MES','QMS'].includes(s.service)?'manufacturing_mes_qms_state_v1':s.service==='TEST_CONTROLLER_EMULATOR'?null:'manufacturing_business_transaction_v1';
   function native(claim,offs){
    const p=claim==='NATIVE_TARGET_READBACK'?'target-ledger':'business-application';
    const common={sourceId:producer(s,p),producerId:producer(s,p),transactionId:txn,siteId:s.site,resourceRef:dispatchedTarget,nativeVersion:run+'-r1',sourceEventTime:proof(si,mi,offs),receivedTime:proof(si,mi,offs+500),observedAt:proof(si,mi,offs),applicationRef:s.service,aiSystemId:s.id,scenarioRunId:run,actorRef:agent,operationRef:s.operation,before:s.before,after:s.after,unit:s.unit,changed:true,sourceNamespace:s.service,sourceCustody:'EMULATED_'+s.service+'_SAME_LAB_ROOT',recordVersion:run+'-r1'};
    return nativeProfile?profileRecord(nativeProfile,claim,common):null;
   }
   const committed=native(nativeProfile==='manufacturing_mes_qms_state_v1'?'NATIVE_COMMIT':'BUSINESS_COMMIT_IF_QUALIFIED',4900);
   const witnessed=degraded?null:native('NATIVE_TARGET_READBACK',5200);
   const continuity=profileRecord('manufacturing_collector_continuity_v1','SOURCE_CONTINUITY',{
    sourceId:producer(s,'collector'),producerId:producer(s,'collector'),collectorId:'synthetic-collector-'+s.id,observedAt:proof(si,mi,7000),sourceEventTime:proof(si,mi,7000),receivedTime:proof(si,mi,7500),aiSystemId:s.id,scenarioRunId:run,healthy:!degraded,qualifiedCoverage:false,deadlinePassed:degraded,effective:false,lastHeartbeatAt:degraded?proof(si,mi,-120000):proof(si,mi,6000),checkedAt:proof(si,mi,7500),toleranceSeconds:30,expectedCadenceSeconds:10,sourceCustody:'LAB_COLLECTOR'});
   const refs={};
   refs.policy=put(dir+'profiled/business-approval.json',policy);
   refs.iam=put(dir+'profiled/iam-candidate.json',iam);
   refs.request=put(dir+'profiled/gateway-request.json',requested);
   refs.dispatch=put(dir+'profiled/gateway-dispatch.json',dispatched);
   refs.commit=committed?put(dir+'profiled/native-commit.json',committed):null;
   refs.readback=witnessed?put(dir+'profiled/native-readback.json',witnessed):null;
   refs.continuity=put(dir+'profiled/collector-continuity.json',continuity);
   const runtime={schemaVersion:'manufacturing-runtime-behavior-source-v3.1',synthetic:true,...correlation,observedAt:proof(si,mi,7600),modelId:'sim-agent-model-v1',modelVersion:mode==='WRONG_TARGET'?'v1.1':'v1.0',modelContext:'FACTORY_SYNTHETIC',wholeRun:{tokens:wrong?24800:degraded?2900:1700,inferenceUsd:wrong?0.37:0.026},toolCall:{tool:s.tool,operation:s.operation,approvedTarget:s.target,dispatchedTarget,latencyMs:wrong?920:330,retries:degraded?4:0,observedAt:proof(si,mi,4000)},history:{windowRuns:120,medianTokens:1400,p95Tokens:2350,observedTargets:[s.target],firstSeenAlternativeTarget:wrong?s.diversion:null},claimType:'BEHAVIOR_OBSERVATION_ONLY',externalProviderBilling:'NOT_VERIFIED'};
   refs.runtime=put(dir+'supplemental/runtime-behavior.json',runtime);
   const domain={schemaVersion:'manufacturing-domain-scenario-source-v3.1',synthetic:true,...correlation,scenarioMode:mode,resource:s.target,observedResource:dispatchedTarget,unit:family.measurementUnit,
    scenarioContext:family.details,sourceMeasurementRefs:['systems/'+s.id+'/domain-observations.json'],extraEvidence:{
      actor:agent,sourceWorld:'LAB',degradedCollector:degraded,supplyChainOrWorkflow:s.workflow,
      ...(s.id==='SYS-PO12'?{purchaseOrderUsd:26500,buyerReviewThresholdUsd:15000,duplicateOrderCandidate:'PO-2026-7708',spendAuthority:'NOT_APPROVED_BY_HAIEC'}:{}),
      ...(s.id==='SYS-SUP12'?{incomingLot:'SI-2026-3301',ppapExpiry:family.details.ppapExpiry,partRevision:'REV-D',currentlyApprovedRevision:'REV-C'}:{}),
      ...(s.id==='SYS-WH15'?{qmsQualityHold:'HELD',shipmentCommit:'SIMULATED_GATEWAY_CANDIDATE'}:{}),
      ...(s.id==='SYS-MNT88'?{cmmsWorkRequest:'RECORDED_SIMULATED',maintenanceExecuted:'NOT_EVIDENCED',equipmentRestart:'NOT_EVIDENCED'}:{}),
      ...(s.id==='SYS-DYN412'?{controllerCommand:'SIMULATOR_ONLY',physicalEffect:'NOT_EVIDENCED',deferredNativeControllerReadback:true}:{}),
      ...(s.id==='SYS-340'?{imageCount:24,independentLabelSource:'SIMULATED_HELDOUT_FIXTURE',validationContextChange:'LIGHTING_B'}:{})
    },haiecVerdict:'NOT_ASSESSED'};
   refs.domain=put(dir+'supplemental/domain-context.json',domain);
   let remediation=null;
   if(fixed){
    const blockedTxn=txn+'-blocked';
    const policyVersion='LAB-POLICY-v3.1-'+s.id;
    const attempt={schemaVersion:'manufacturing-rejected-attempt-v3.1',synthetic:true,aiSystemId:s.id,scenarioRunId:run,actor:agent,attemptId:blockedTxn,attemptedOperation:s.operation,attemptedResource:s.diversion,approvedResource:s.target,policyVersion,policyDigest:approvedPolicyDigest,eventTime:proof(si,mi,1600),decision:'SIMULATED_DENY',gatewayDispatchMade:false,noCustomerActuation:true};
    const noMutation={schemaVersion:'manufacturing-negative-state-witness-v3.1',synthetic:true,aiSystemId:s.id,siteId:s.site,scenarioRunId:run,transactionId:blockedTxn,sourceId:producer(s,'target-ledger'),sourceCustody:'DIFFERENT_EMULATED_COMPONENT_SAME_LAB',resourceRef:s.diversion,observedAt:proof(si,mi,3400),before:s.before,after:s.before,changed:false,sourceClaim:'NO_MUTATION_IN_EMULATED_LEDGER_ONLY',qualifiedCustomerNoEffectProof:false};
    const corrected={schemaVersion:'manufacturing-corrected-effect-receipt-v3.1',synthetic:true,...correlation,policyVersion,policyDigest:approvedPolicyDigest,relatedBlockedAttemptId:blockedTxn,authorizedResource:s.target,dispatchedResource:s.target,emulatorReceiptId:'syn-receipt-'+txn,stageSequence:[{phase:'DENIED',time:proof(si,mi,1600),target:s.diversion},{phase:'NO_MUTATION_READBACK',time:proof(si,mi,3400),target:s.diversion},{phase:'AUTHORIZED_DISPATCH',time:proof(si,mi,4000),target:s.target},{phase:'NATIVE_READBACK',time:proof(si,mi,5200),target:s.target}],realEnforcementClaim:false,haiecEvaluated:false};
    remediation={blockedAttempt:put(dir+'remediation/rejected-attempt.json',attempt),negativeWitness:put(dir+'remediation/no-mutation-witness.json',noMutation),correctedReceipt:put(dir+'remediation/corrected-receipt.json',corrected)};
   }
   const caseIndex={schemaVersion:'manufacturing-v3.1-case-index',synthetic:true,sourceWorldVersion:VERSION,upstreamWorldVersion:'manufacturing-source-native-v3',upstreamCasePath:'data/source-native/v3/cases/'+s.id+'/'+mode+'/case.json',upstreamCaseDigest:old.get('cases/'+s.id+'/'+mode+'/case.json'),caseId:s.id+'-'+mode,scenarioRunId:run,transactionId:txn,aiSystemId:s.id,siteId:s.site,scenarioState:mode,operation:s.operation,approvedTarget:s.target,dispatchedTarget,nativeProfile:nativeProfile||'DEFERRED_CONTROLLER_NATIVE_EFFECT',profiledRecordRefs:refs,remediation,evaluation:{actualHaiecEvaluationId:null,sourceQualification:'NOT_PERFORMED',issuedReport:null},evidenceSubsetCandidates:{initial:['request','dispatch','continuity'],enriched:['request','policy','iam','dispatch','commit','readback','continuity'],sameRawRun:true,differenceIsSourceCoverageNotRemediation:true},limitations:['UNQUALIFIED_SYNTHETIC_INPUT','FICTITIOUS_SINGLE_LAB_CUSTODY','NO_LIVE_PROVIDER_IAM_GRANT','NO_FACTORY_OR_PHYSICAL_EFFECT']};
   put(dir+'index.json',caseIndex);
   caseRefs.push({aiSystemId:s.id,mode,caseFile:dir+'index.json',scenarioRunId:run});
  }
 }
 // Material negative records: actual mutated candidate bytes, not prose-only recipes.
 const si=0,s=specs[si],base='cases/SYS-217/EXPECTED_BASELINE/';
 const stored=p=>JSON.parse(files[ROOT+p]);
 const copy=x=>JSON.parse(JSON.stringify(x));
 const negatives=[];
 function neg(id,record,changeClass,reason){put('negative/'+id+'.json',record);negatives.push({id,input:'negative/'+id+'.json',changeClass,riskToTest:reason,oracleVerdict:null});}
 let p=stored(base+'profiled/gateway-dispatch.json');p.organizationId='SYNTHETIC_FOREIGN_ORG';neg('cross-org-dispatch',p,'TENANT_BOUNDARY','Cross-org data cannot bind current test tenant');
 p=stored(base+'profiled/native-readback.json');p.resourceRef=s.diversion;neg('readback-resource-mismatch',p,'EXACT_RESOURCE','Same transaction but different target');
 p=stored(base+'profiled/business-approval.json');p.effectiveTo='2026-10-13T00:00:00.000Z';neg('expired-approval',p,'TEMPORAL_AUTHORITY','Expired approval must not authorize operation');
 p=stored(base+'profiled/business-approval.json');p.approvedPolicyId='LAB-REUSED-APPROVAL';p.transactionId='txn-other-synthetic-run';neg('replayed-approval',p,'APPROVAL_REUSE','Approval reused across different transaction');
 p=stored(base+'profiled/gateway-dispatch.json');p.resourceRef=s.diversion;neg('changed-target-with-stale-payload-digest',p,'PAYLOAD_INTEGRITY','Resource changed without re-signing canonical source digest');
 p=stored(base+'profiled/native-readback.json');p.sourceId='';neg('missing-source-identity',p,'PRODUCER_IDENTITY','Schema rejects empty required source ID');
 p=stored(base+'profiled/collector-continuity.json');p.healthy=false;p.lastHeartbeatAt='2026-10-14T07:00:00.000Z';p.deadlinePassed=true;neg('collector-heartbeat-gap',p,'SOURCE_HEALTH','Degraded observation coverage');
 p=stored(base+'profiled/business-approval.json');p.qualified=true;p.boundSourceRole='AUTHORITATIVE_CONTROL_BOUNDARY';p.approvalStatus='APPROVED_BY_HAIEC';neg('caller-forged-qualification',p,'SOURCE_AUTHORITY','Caller flags must never grant authoritative source role');
 p=stored('systems/SYS-217/source-code-candidate.json');p.sourceHash='sha256:'+'0'.repeat(64);neg('changed-unapproved-static-hash',p,'SOURCE_PINNING','Hash differs from approved code source');
 p=stored(base+'profiled/native-readback.json');p.siteId='PLANT-C';neg('same-transaction-foreign-site',p,'SITE_BINDING','Transaction at foreign site cannot satisfy current run');
 p=stored(base+'profiled/gateway-request.json');p.sourceEventTime='2027-10-14T08:00:00.000Z';neg('future-event-clock-skew',p,'EVENT_TIME','Future source timestamp must not silently substitute receive time');
 p=stored(base+'profiled/native-readback.json');p.sourceProfile='opcua_observation_candidate_v1';neg('unsupported-opcua-profile',p,'DEFERRED_SOURCE_CLASS','Do not silently promote OPC UA to effect witness');
 p={schemaVersion:'manufacturing-negative-handoff-v3.1',synthetic:true,aiSystemId:'SYS-FC1',parentAgent:'SYS-FC1-AGENT-1',childAgent:'SYS-FC1-AGENT-2',parentScope:['READ','RECOMMEND'],delegatedChildScope:['COMMIT','SCHEDULE'],approval:null};neg('agent-scope-escalation',p,'AGENT_TO_AGENT_DELEGATION','Permission of child tool is not parent delegation');
 p={schemaVersion:'manufacturing-deny-then-observe-mutation-v3.1',synthetic:true,aiSystemId:'SYS-WH15',scenarioRunId:'syn-negative-deny-after-effect',operation:'wms.shipment.confirm',target:'LOT-2026-4510',deny:{eventTime:'2026-10-14T13:00:00.000Z',decision:'SIMULATED_DENY'},targetReadback:{transactionId:'syn-tx-deny-then-mutation',eventTime:'2026-10-14T13:00:05.000Z',changed:true,shipmentStatus:'CONFIRMED'},interpretation:'INVESTIGATE_CONFLICT_NOT_PROOF_OF_PREVENTION'};neg('deny-then-native-mutation',p,'ENFORCEMENT_CONTRADICTION','Denial and later mutation must not be called prevented');
 put('negative/index.json',{schemaVersion:'manufacturing-negative-input-index-v3.1',synthetic:true,inputs:negatives,sourceMutationNotExpectedVerdict:true,materializedCount:negatives.length,behaviorAssertionsInTestsOnly:true});
 put('profiles/registry.json',{schemaVersion:'manufacturing-demo-profile-registry-v3.1',synthetic:true,oneDashboardShell:true,profiles:SIM_PROFILES.map((p,i)=>({...p,isolationNamespace:'lab-profile-'+p.profileId.toLowerCase(),sourcePackageRef:i===0?ROOT:'profiles/'+p.profileId+'/events.json',assessmentBinding:i===0?'EXPLICIT_CANONICAL_EVALUATION_ONLY':'NO_HAIEC_EVALUATIONS',sourceWorldVersion:i===0?VERSION:'manufacturing-simulation-profile-v1',brandOrCustomerPermission:'NOT_CLAIMED'})),mustClearEvaluationIdsOnProfileChange:true,mayShowHaiecVerdictOnlyWhenBound:true});
 for(const p of SIM_PROFILES.filter(x=>x.profileId!=='MFG_DEFAULT')){
  const run='syn-industry-'+p.profileId.toLowerCase()+'-case-01';
  put('profiles/'+p.profileId+'/events.json',{schemaVersion:'manufacturing-industry-simulated-flow-v1',profileId:p.profileId,synthetic:true,simulationOnly:true,haiecEvaluationId:null,organizationId:'FICTIONAL_ONLY',runId:run,operator:'FICTIONAL_ENTERPRISE_OPERATOR',businessContext:p.industry,events:[{step:'SOURCE_SIGNAL',eventId:run+'-source',recordedAt:'2026-10-14T09:00:00.000Z',detail:p.example.signal},{step:'AGENT_PROPOSAL',eventId:run+'-proposal',recordedAt:'2026-10-14T09:01:00.000Z',detail:p.example.proposedAction},{step:'SIMULATED_REVIEW',eventId:run+'-review',recordedAt:'2026-10-14T09:02:00.000Z',detail:p.example.authorizedScope},{step:'SIMULATED_TARGET_STATUS',eventId:run+'-status',recordedAt:'2026-10-14T09:03:00.000Z',detail:p.example.effect}],reports:[],dataOrigin:'SYNTHETIC_SIMULATION_NOT_HAIEC_EVALUATION'});
 }
 put('producer-registry.json',{schemaVersion:'manufacturing-producer-registry-v3.1',synthetic:true,trust:'ONE_COMMON_SYNTHETIC_LAB_ROOT',boundInHaiec:false,producerClasses:Object.keys(PROFILE_REQUIRED).map((profileId)=>({profileId,requiredFields:PROFILE_REQUIRED[profileId],eligibleClaimTypes:PROFILE_CLAIMS[profileId],qualification:'UNQUALIFIED_CANDIDATE'})),runtimeOrgReplacement:{placeholder:ORG_PLACEHOLDER,mustDeriveAuthenticatedOrgAtServer:true,sourceIdIssuerMustBeRegistered:true,producerProof:'NEVER_COMMIT_SECRETS_OR_ATTESTATION_KEYS'},truthBoundary:'PROFILE_FORMAT_VALIDITY_IS_NOT_QUALIFIED_EVIDENCE'});
 put('scan-plan.json',{schemaVersion:'manufacturing-scan-handoff-v3.1',sourceVersion:VERSION,synthetic:true,upstreamBaselineCommit:'eda7a6f6df0addbac5d1fef99a67b72f131f83db',upstreamRevision:'SPRINT15_CANONICAL_OTLP_CONTRACT_ATTRS',organizationBinding:'ISOLATED_AUTHENTICATED_HAIEC_LAB_ORG',credentialUse:'ROTATED_SCOPED_SECURE_SECRET_STORE_ONLY',ordering:['VERIFY_V3_AND_V3_1_SHA256_MANIFESTS','REPLACE_ORG_PLACEHOLDER_USING_AUTHENTICATED_TENANT_ID','REGISTER_AND_QUALIFY_DISTINCT_SOURCE_PRODUCERS','VALIDATE_SOURCE_PROFILE_CONTRACTS_AND_AUTHORIZATIONS','PIN_CODE_SOURCE_HASH_AND_RUN_STATIC_ANALYZER','ACTUALLY_APPROVE_VERSIONED_POLICY_WITH_HAIEC','INGEST_SAME_CASE_INITIAL_SUBSET_AND_RUN_ASSURANCE','INGEST_QUALIFIED_ENRICHED_EVIDENCE_AND_RUN_NEW_SNAPSHOT','RUN_SEPARATE_WRONG_TARGET_DEGRADED_AND_REMEDIATED','EXPORT_AUTHENTIC_REPORTS_AND_REFRESH_DASHBOARD'],cases:caseRefs,expectedInitialAssessments:9,fullStateCoverage:36,snapshotComparison:'SOURCE_COVERAGE_NOT_REMEDIATION',historical:'PRESERVE_EXISTING_27_EVALUATIONS_AND_V2_V3_BYTES',neverIngestAsManufacturingSource:['case-index-json','v3-raw-gateway-without-adapter','model-behavior-supplemental','negative-inputs-as-ordinary-positive','sim-industry-events-as-haiec-results'],opcjaMtconnectSparkplugB2mml:'DEFERRED_NOT_EFFECT_PROOF'});
 const entries=Object.keys(files).sort().map(full=>({path:full.slice(ROOT.length),sha256:digest(files[full]),bytes:files[full].length}));
 files[ROOT+'manifest.json']=serialize({schemaVersion:'manufacturing-enhanced-evidence-manifest-v3.1',sourceWorldVersion:VERSION,synthetic:true,generatedAt:'2026-10-15T08:00:00.000Z',upstream:{world:'manufacturing-source-native-v3',manifestDigest:digest(serialize(v3Manifest)),baselineCommit:'eda7a6f6df0addbac5d1fef99a67b72f131f83db',revision:'SPRINT15_CANONICAL_OTLP_CONTRACT_ATTRS',revisionNote:'v3 telemetry records carry the canonical OTLP receiver contract attributes (haiec.scenario.run_id/level/sequence, mcp.resource.uri) added in Sprint 15 and the v3 manifest was repinned; the 45 exported HAIEC evaluations are bound to the revised upstream bytes'},systems:specs.length,scenarioRuns:caseRefs.length,scenarioStates:MODES,domainObservations:specs.length*24,negativeInputs:negatives.length,simulationProfiles:SIM_PROFILES.filter(p=>p.profileId!=='MFG_DEFAULT').length,artifactCount:entries.length,entries,sourceQualifications:'NOT_ISSUED',haiecEvaluationsProduced:0,upstreamRevisions:['SPRINT15_CANONICAL_OTLP_CONTRACT_ATTRS — v3 telemetry bytes augmented in place and manifest repinned; evaluations bound to revised bytes'],historicalEvaluationsUnmodified:true});
 return files;
}
module.exports={buildEnhanced,VERSION,ROOT,ORG_PLACEHOLDER,FAMILIES,PROFILE_REQUIRED,PROFILE_CLAIMS,MODES,SIM_PROFILES,sha256,digest};
