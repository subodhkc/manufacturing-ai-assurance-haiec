'use strict';
/** Deterministic synthetic input producer. No expected findings / oracle imports. */
const fs=require('node:fs'), path=require('node:path');
const SPECS=[
  {
    "id": "SYS-217",
    "name": "Torque Quality Assurance",
    "site": "PLANT-A",
    "workflow": "WF-QUALITY",
    "agents": [
      "Torque Monitor"
    ],
    "operation": "mes.work_order.update",
    "tool": "mes_workorder_client",
    "service": "MES",
    "target": "WO-217-4802",
    "diversion": "WO-217-4803",
    "field": "qualityHold",
    "before": false,
    "after": true,
    "unit": "engine",
    "amount": 40,
    "authority": "Plant Quality Manager"
  },
  {
    "id": "SYS-340",
    "name": "Vision Inspection AI",
    "site": "PLANT-A",
    "workflow": "WF-QUALITY",
    "agents": [
      "Vision Inspector",
      "Quality Reviewer"
    ],
    "operation": "qms.quality_disposition.write",
    "tool": "quality_rework_case",
    "service": "QMS",
    "target": "LOT-2026-4508",
    "diversion": "LOT-2026-4509",
    "field": "qualityDisposition",
    "before": "PENDING_INSPECTION",
    "after": "QUARANTINED",
    "unit": "part",
    "amount": 20,
    "authority": "Quality Manager"
  },
  {
    "id": "SYS-FC1",
    "name": "Demand Forecast and S&OP",
    "site": "SUPPLY",
    "workflow": "WF-PLAN",
    "agents": [
      "Demand Forecaster",
      "Capacity Planner"
    ],
    "operation": "aps.schedule.commit",
    "tool": "propose_master_schedule",
    "service": "APS",
    "target": "MPS-WK42",
    "diversion": "MPS-WK43",
    "field": "releasedSchedule",
    "before": false,
    "after": true,
    "unit": "plan",
    "amount": 1,
    "authority": "Demand Planning Manager"
  },
  {
    "id": "SYS-PO12",
    "name": "Autonomous Replenishment",
    "site": "SUPPLY",
    "workflow": "WF-PROCURE",
    "agents": [
      "Inventory Monitor",
      "Sourcing Agent",
      "PO Assistant"
    ],
    "operation": "erp.purchase_order.create",
    "tool": "create_po",
    "service": "ERP",
    "target": "REQ-2026-8842",
    "diversion": "REQ-2026-8843",
    "field": "purchaseOrder",
    "before": "NONE",
    "after": "PO-2026-7712",
    "unit": "USD",
    "amount": 26500,
    "authority": "Procurement Manager"
  },
  {
    "id": "SYS-MNT88",
    "name": "Predictive Maintenance AI",
    "site": "PLANT-B",
    "workflow": "WF-MAINT",
    "agents": [
      "Spindle Health Analyst"
    ],
    "operation": "cmms.work_request.create",
    "tool": "propose_cmms_ticket",
    "service": "CMMS",
    "target": "WO-88-2210",
    "diversion": "WO-88-2211",
    "field": "workOrderStatus",
    "before": "NOT_OPENED",
    "after": "WORK_REQUEST_CREATED",
    "unit": "request",
    "amount": 1,
    "authority": "Maintenance Supervisor"
  },
  {
    "id": "SYS-SUP12",
    "name": "Supplier Quality Risk AI",
    "site": "PLANT-C",
    "workflow": "WF-SUPQUAL",
    "agents": [
      "Supplier Risk Analyst",
      "Vendor Recommender"
    ],
    "operation": "qms.incoming_lot.disposition",
    "tool": "request_supplier_change",
    "service": "QMS",
    "target": "SI-2026-3301",
    "diversion": "SI-2026-3302",
    "field": "incomingLotDisposition",
    "before": "RECEIVED",
    "after": "QUARANTINED",
    "unit": "lot",
    "amount": 1,
    "authority": "Supplier Quality Engineer"
  },
  {
    "id": "SYS-SCH5",
    "name": "Autonomous Line Scheduling",
    "site": "PLANT-A",
    "workflow": "WF-PLAN",
    "agents": [
      "Order Sequencer",
      "Route Optimizer"
    ],
    "operation": "aps.schedule.write",
    "tool": "write_schedule",
    "service": "APS",
    "target": "SCH-WK42",
    "diversion": "SCH-WK43",
    "field": "productionSequence",
    "before": "DRAFT",
    "after": "REVISED",
    "unit": "schedule",
    "amount": 1,
    "authority": "Production Planning Manager"
  },
  {
    "id": "SYS-DYN412",
    "name": "Dynamometer Tuning AI",
    "site": "PLANT-A",
    "workflow": "WF-DYNO",
    "agents": [
      "Dyno Tuning Agent"
    ],
    "operation": "test_controller.setpoint.write",
    "tool": "propose_setpoint",
    "service": "TEST_CONTROLLER_EMULATOR",
    "target": "TEST-412/authorized-param-1",
    "diversion": "TEST-412/undelegated-param-4",
    "field": "controllerSetpoint",
    "before": 40,
    "after": 42.5,
    "unit": "emulated-setpoint",
    "amount": 1,
    "authority": "Test Engineering Manager"
  },
  {
    "id": "SYS-WH15",
    "name": "Warehouse Fulfillment AI",
    "site": "DC-15",
    "workflow": "WF-WAREHOUSE",
    "agents": [
      "Pick Optimizer",
      "Replenishment Agent"
    ],
    "operation": "wms.shipment.confirm",
    "tool": "request_replenishment",
    "service": "WMS",
    "target": "LOT-2026-4510",
    "diversion": "LOT-2026-4511",
    "field": "shipmentStatus",
    "before": "PENDING",
    "after": "CONFIRMED",
    "unit": "shipment",
    "amount": 1,
    "authority": "Warehouse Operations Supervisor"
  }
];
const MODES=["EXPECTED_BASELINE","EVIDENCE_DEGRADED","WRONG_TARGET","REMEDIATED"];
const VERSION="manufacturing-source-native-v3";
const TIME="2026-10-14T08:00:00.000Z";
function sha256(ascii){
function rr(v,n){return(v>>>n)|(v<<(32-n))}
const pow=Math.pow,m=pow(2,32),w=[],len=ascii.length*8,k=[],initial=[],marked={};let count=0;
for(let n=2;count<64;n++)if(!marked[n]){for(let j=n*n;j<1000;j+=n)marked[j]=1;initial.push((pow(n,.5)*m)|0);k.push((pow(n,1/3)*m)|0);count++}
let txt=ascii+'\x80';while(txt.length%64!==56)txt+='\x00';
for(let i=0;i<txt.length;i++){let v=txt.charCodeAt(i);if(v>255)throw Error("non-ascii sha input");w[i>>>2]|=v<<(24-(i%4)*8)}
w.push(Math.floor(len/m));w.push(len>>>0);
let h=initial.slice(0,8);
for(let base=0;base<w.length;base+=16){const q=w.slice(base,base+16);let [a,b,c,d,e,f,g,hv]=h;for(let i=0;i<64;i++){if(i>=16)q[i]=(q[i-16]+(rr(q[i-15],7)^rr(q[i-15],18)^(q[i-15]>>>3))+q[i-7]+(rr(q[i-2],17)^rr(q[i-2],19)^(q[i-2]>>>10)))|0;const t1=(hv+(rr(e,6)^rr(e,11)^rr(e,25))+((e&f)^((~e)&g))+k[i]+q[i])|0;const t2=((rr(a,2)^rr(a,13)^rr(a,22))+((a&b)^(a&c)^(b&c)))|0;hv=g;g=f;f=e;e=(d+t1)|0;d=c;c=b;b=a;a=(t1+t2)|0}
h=[a,b,c,d,e,f,g,hv].map((v,i)=>(v+h[i])|0)}
return h.map(v=>(v>>>0).toString(16).padStart(8,'0')).join('');
}

function json(v){return JSON.stringify(v,null,2)+"\n"}

function mkId(s,state){return "syn-mfg-v3-"+s.id.toLowerCase()+"-"+state.toLowerCase()}

function when(i,j,n){return new Date(Date.parse(TIME)+(i*60+j*10)*60000+n).toISOString()}

function nativePayload(s,kind,txn,run,at,target,mode){
 const basic={schemaVersion:"manufacturing-native-record-v3",dataClass:"SYNTHETIC_MANUFACTURING_LAB",sourceWorldVersion:VERSION,aiSystemId:s.id,siteId:s.site,scenarioRunId:run,transactionId:txn,eventTime:at,resourceId:target,sourceSystem:"LAB_"+s.service+"_"+kind,producerRef:"syn-"+s.id.toLowerCase()+"-"+kind.toLowerCase(),sourceClaimRole:kind==="TARGET_LEDGER"?"SIMULATED_TARGET_READBACK":"SIMULATED_DISPATCH_EMITTER",qualification:"UNQUALIFIED_EXTERNAL_INPUT",custody:"DISTINCT_SIMULATOR_COMPONENT_SAME_LAB"};
 return {...basic,operation:s.operation,eventId:txn+"-"+kind.toLowerCase(),businessField:s.field,before:s.before,after:s.after,recordVersion:run+"-r1",consequenceScope:{unit:s.unit,quantity:s.amount},readbackStatus:kind==="TARGET_LEDGER"?"SIMULATED_READBACK":"EMITTER_RECORDED",modeInjection:mode==="WRONG_TARGET"?"TARGET_SUBSTITUTION":mode==="REMEDIATED"?"CORRECTED_TARGET_AND_BLOCKED_ATTEMPT":"NONE"};
}

function buildCase(s,state,i,j){
 const run=mkId(s,state),txn="txn-"+run,stamp=n=>when(i,j,n),isWrong=state==="WRONG_TARGET",degraded=state==="EVIDENCE_DEGRADED",fixed=state==="REMEDIATED",target=isWrong?s.diversion:s.target;
 const prefix="data/source-native/v3/cases/"+s.id+"/"+state+"/",root="data/source-native/v3/";
 const files={}; const add=(key,obj)=>{const p=prefix+key;files[p]=json(obj);return p.slice(root.length)};
 const authority={schemaVersion:"manufacturing-approval-delegation-v3",synthetic:true,sourceWorldVersion:VERSION,siteId:s.site,aiSystemId:s.id,scenarioRunId:run,transactionId:txn,request:{eventId:txn+"-request",actor:"synthetic-agent/"+s.id,operation:s.operation,target:s.target,requestedQuantity:s.amount,unit:s.unit,requestedAt:stamp(0)},businessApproval:{recordId:txn+"-approval",approver:"synthetic-"+s.authority.replaceAll(" ","-").toLowerCase(),decision:"APPROVED_IN_SIMULATED_SOURCE_ONLY",delegate:"synthetic-agent/"+s.id,operation:s.operation,authorizedTargets:[s.target],quantityMax:s.amount,validFrom:stamp(-60000),validUntil:stamp(600000),separationOfDuties:true},simulatedGate:{recordId:txn+"-gate",policyRef:"systems/"+s.id+"/authority/operating-envelope.proposal.json",requestedTarget:s.target,dispatchedTarget:target,decision:"SIMULATED_ALLOW",evaluatedAt:stamp(1800),blockedAttempts:fixed?[{eventId:txn+"-blocked",target:s.diversion,decision:"SIMULATED_DENY_OUTSIDE_DELEGATION",mutationApplied:false}]:[]},role:"AUTHORITY_CANDIDATE",approvalInHaiec:"NOT_REQUESTED",noImplicitAuthority:true};
 const iam={schemaVersion:"manufacturing-runtime-iam-observation-v3",synthetic:true,aiSystemId:s.id,scenarioRunId:run,transactionId:txn,observedAt:stamp(-1000),principal:"synthetic-agent/"+s.id,policyRef:"systems/"+s.id+"/iam/role-policy.aws-style.json",observedAccess:[{operation:"execute-api:Invoke",resource:"synthetic-api/"+s.service+"/"+s.operation+"/*",decision:"ALLOW_CANDIDATE_POLICY_ONLY"}],missingLayers:["SCP","PERMISSION_BOUNDARY","SESSION_POLICY","RESOURCE_POLICY","NETWORK_ENDPOINT_POLICY"],effectiveGrant:"NOT_PROVIDER_VERIFIED",codeSourceRef:"systems/"+s.id+"/code/agent-handler.js",openApiRef:"systems/"+s.id+"/code/openapi.json",buildIdentity:{sourceSha:"NOT_BOUND_TO_DEPLOYMENT",immutableImageDigest:null,observedRuntime:"SYNTHETIC_LAB"},sourceRole:"IAM_CANDIDATE"};
 const spans=[];
 const phases=["request.accepted","authority.approval_observed","tool.dispatch","native.commit"];
 if(!degraded)phases.push("target.readback");
 const trace=(i+1).toString(16).padStart(32,"0").slice(0,31)+(j+1).toString(16);
 for(let n=0;n<phases.length;n++){const ts=Date.parse(stamp(1000+n*1000));spans.push({traceId:trace,spanId:(n+1).toString(16).padStart(16,"0"),...(n?{parentSpanId:n.toString(16).padStart(16,"0")}:{}),name:phases[n],kind:3,startTimeUnixNano:(BigInt(ts)*1000000n).toString(),endTimeUnixNano:(BigInt(ts+250)*1000000n).toString(),attributes:[{key:"haiec.ai_system_id",value:{stringValue:s.id}},{key:"haiec.scenario_run_id",value:{stringValue:run}},{key:"haiec.transaction_id",value:{stringValue:txn}},{key:"manufacturing.target_id",value:{stringValue:target}},{key:"manufacturing.source_world_version",value:{stringValue:VERSION}}]})}
 const otlp={resourceSpans:[{resource:{attributes:[{key:"service.name",value:{stringValue:"synthetic-agent-"+s.id}},{key:"deployment.environment",value:{stringValue:"SYNTHETIC_LAB"}}]},scopeSpans:[{scope:{name:"synthetic-manufacturing-v3",version:"3.0.0"},spans}]}]};
 const continuity={schemaVersion:"manufacturing-collector-continuity-v3",synthetic:true,aiSystemId:s.id,scenarioRunId:run,transactionId:txn,collectorId:"synthetic-collector-"+s.id,coverageWindow:{start:stamp(-2000),end:stamp(10000)},expectedSpanCount:5,receivedSpanCount:spans.length,receivedSpanIds:spans.map(x=>x.spanId),lastSequence:spans.length,heartbeatStatus:degraded?"MISSING_IN_INJECTED_TEST":"OBSERVED_SIMULATED",gapReason:degraded?"READBACK_AND_HEARTBEAT_NOT_RECEIVED":null,sourceRole:"COLLECTOR_COVERAGE_CANDIDATE",custody:"SYNTHETIC_LAB"};
 const dispatch=nativePayload(s,"GATEWAY",txn,run,stamp(4000),target,state);
 const readback=degraded?null:nativePayload(s,"TARGET_LEDGER",txn,run,stamp(5200),target,state);
 const telemetry=add("telemetry/otlp-traces.json",otlp),cont=add("telemetry/collector-continuity.json",continuity),approval=add("authority/delegation-approval.json",authority),access=add("iam/access-observation.json",iam),emit=add("native/gateway-transaction.json",dispatch),witness=readback?add("native/target-readback.json",readback):null;
 const monitoring={schemaVersion:"manufacturing-behavior-record-v3",synthetic:true,aiSystemId:s.id,scenarioRunId:run,window:"2026-10-13T00:00:00Z/2026-10-14T00:00:00Z",modelVersion:"synthetic-model-1.0",context:{siteId:s.site,workflowId:s.workflow,toolVersion:"mock-tool-v3",environment:"SYNTHETIC_LAB"},historical:{n:120,medianTokens:1400,p95Tokens:2350,allowedOperation:s.operation,observedTargetSet:[s.target]},current:{tokens:isWrong?7100:fixed?1550:degraded?2550:1500,attemptedTarget:isWrong?s.diversion:s.target,firstSeenTool:isWrong?"synthetic-broader-write-tool":null,retryCount:degraded?4:0},interpretation:"OBSERVATIONAL_SIGNAL_ONLY_NOT_A_POLICY_VERDICT",sourceRole:"MODEL_USAGE_SIMULATION"};
 const beh=add("monitoring/behavior.json",monitoring);
 const index={schemaVersion:"manufacturing-evidence-case-v3",sourceWorldVersion:VERSION,synthetic:true,sourceQualification:"UNQUALIFIED_UNTIL_CANONICAL_HAIEC_BINDING",siteId:s.site,workflowId:s.workflow,aiSystemId:s.id,agentIds:s.agents.map((_,n)=>s.id+"-AGENT-"+(n+1)),scenarioState:state,caseId:s.id+"-"+state,scenarioRunId:run,transactionId:txn,operation:s.operation,approvedTarget:s.target,sourceRecords:{businessApproval:approval,iamObservation:access,otlpTelemetry:telemetry,collectorContinuity:cont,gatewayNative:emit,targetNativeReadback:witness,behavioralHistory:beh},sourceSystemRefs:{policy:"systems/"+s.id+"/authority/operating-envelope.proposal.json",iam:"systems/"+s.id+"/iam/role-policy.aws-style.json",code:"systems/"+s.id+"/code/agent-handler.js",openapi:"systems/"+s.id+"/code/openapi.json",sensor:"systems/"+s.id+"/observations/sensor-samples.json"},eventTime:stamp(0),recordedTarget:target,sourceContentFacts:{gatewayRecorded:true,targetLedgerRecordPresent:!!witness,extraRejectedAttemptRecordPresent:fixed,collectorGap:degraded},provenance:"SYNTHETIC_MULTIPLE_EMULATED_COMPONENTS_SINGLE_LAB",independentOfExpectedOracle:true,producerRegistrationRequired:true};
 add("case.json",index);
 return {files,index,mode:state};
}

function buildStatic(s){
 const out={},p="data/source-native/v3/systems/"+s.id+"/";
 const add=(name,obj)=>out[p+name]=json(obj);
 const envelope={schemaVersion:"manufacturing-operating-envelope-proposal-v3",synthetic:true,aiSystemId:s.id,siteId:s.site,workflowId:s.workflow,state:"PROPOSED_NOT_HAIEC_APPROVED",operation:s.operation,authorizedTargets:[s.target],excludedTargets:[s.diversion],maxQuantity:s.amount,unit:s.unit,approverRole:s.authority,delegationIsNotPermission:true,environment:"SYNTHETIC_LAB",effectiveFrom:"2026-10-14T00:00:00.000Z",effectiveUntil:"2026-10-15T00:00:00.000Z"};
 add("authority/operating-envelope.proposal.json",envelope);
 add("iam/role-policy.aws-style.json",{Version:"2012-10-17",Id:"synthetic-iam-"+s.id,Statement:[{Sid:"SourceOnlyToolCandidate",Effect:"Allow",Action:"execute-api:Invoke",Resource:"arn:aws:execute-api:us-east-1:000000000000:synthetic/"+s.service+"/*"}],sourceType:"AWS_STYLE_FIXTURE_NOT_AWS_API",sourceRole:"CANDIDATE_UNQUALIFIED",principal:"synthetic-agent/"+s.id});
 add("code/openapi.json",{openapi:"3.0.3",info:{title:s.name+" Synthetic Tool API",version:"3.0.0"},servers:[{url:"https://synthetic.invalid"}],paths:{"/synthetic/operations/dispatch":{post:{operationId:s.tool,summary:"Emulated "+s.operation,requestBody:{required:true,content:{"application/json":{schema:{type:"object",required:["target","transactionId"],properties:{target:{type:"string"},transactionId:{type:"string"},operation:{type:"string"}}}}}},responses:{"200":{description:"Synthetic in-memory response only"}}}}}, "x-manufacturing-operation":s.operation,"x-target-system":s.service});
 out[p+"code/agent-handler.js"]="'use strict';\n/** Synthetic code-under-test. Dependency-injected only; never connect to plant controls. */\nconst OPERATION = "+JSON.stringify(s.operation)+";\nasync function execute(request, injectedClient) {\n if (!request || request.operation !== OPERATION || !request.transactionId || typeof request.target !== 'string') throw Error('INVALID_SYNTHETIC_REQUEST');\n if (!injectedClient || typeof injectedClient.dispatch !== 'function') throw Error('SIMULATOR_CLIENT_REQUIRED');\n return injectedClient.dispatch({operation: OPERATION, target: request.target, transactionId: request.transactionId});\n}\nfunction inMemoryClient(ledger) {return {dispatch: async (input) => {ledger.push({...input});return {...input, appliedIn: 'SYNTHETIC_MEMORY_LEDGER'};}};}\nmodule.exports={execute,inMemoryClient,OPERATION};\n";
 const samples=[];for(let n=0;n<24;n++){const defect=s.id==="SYS-340"?(n%6===0||n%11===0):null; const predicted=s.id==="SYS-340"?(n%6===0||n%13===0):null;samples.push({sampleId:"syn-"+s.id+"-sample-"+String(n+1).padStart(2,"0"),recordedAt:"2026-10-14T06:"+String(n*2).padStart(2,"0")+":00.000Z",siteId:s.site,operation:s.operation,unit:s.unit,observedValue:Math.round((42+n%5+(n%9===0?8:0))*10)/10,modelVersion:"synthetic-model-1.0",context:{partRevision:"REV-C",lighting:s.id==="SYS-340"?"LIGHTING-A":"NOT_APPLICABLE"},...(s.id==="SYS-340"?{independentFixtureLabel:defect,modelPrediction:predicted}:{})});}
 add("observations/sensor-samples.json",{schemaVersion:"manufacturing-measurement-fixture-v3",synthetic:true,sourceRole:"SENSOR_RECORD_CANDIDATE",aiSystemId:s.id,measurementBasis:"SEE_DOMAIN_UNIT_AND_SAMPLE_IDS",holdoutSampleCount:24,fixtures: samples,interpretation:"GROUND_TRUTH_LABELS_IN_VISION_FIXTURE_ARE_TEST_LABELS_NOT_ENGINE_VERDICTS"});
 add("source-contract.json",{schemaVersion:"manufacturing-source-contract-v3",synthetic:true,aiSystemId:s.id,name:s.name,siteId:s.site,workflowId:s.workflow,agents:s.agents.map((name,n)=>({agentId:s.id+"-AGENT-"+(n+1),name})),operation:s.operation,resourceKey:{site:s.site,namespace:s.service,approvedTarget:s.target,alternateTarget:s.diversion},nativeEffect:{sourceSystem:s.service,property:s.field,preState:s.before,postState:s.after,unit:s.unit,quantity:s.amount},capability:{tool:s.tool,codePath:"code/agent-handler.js",openapiPath:"code/openapi.json",staticReachability:"NOT_YET_SCANNED"},claimBoundaries:["BUSINESS_APPROVAL_CANDIDATE","IAM_GRANT_CANDIDATE","CODE_STATIC_SOURCE","OTLP_TELEMETRY_CANDIDATE","NATIVE_TARGET_SIMULATOR_WITNESS"],safeForPhysicalActuation:false});
 return out;
}

function buildAll(){
 const output={},cases=[];
 for(let i=0;i<SPECS.length;i++){const s=SPECS[i];Object.assign(output,buildStatic(s));for(let j=0;j<MODES.length;j++){const r=buildCase(s,MODES[j],i,j);Object.assign(output,r.files);cases.push({aiSystemId:s.id,scenarioState:MODES[j],scenarioRunId:r.index.scenarioRunId,caseFile:"cases/"+s.id+"/"+MODES[j]+"/case.json"})}}
 const registry={schemaVersion:"manufacturing-source-producer-registry-v3",sourceWorldVersion:VERSION,synthetic:true,provenance:"MULTIPLE_EMULATED_PRODUCERS_COMMON_LAB_CUSTODY",trustLevel:"FIXTURE_ONLY",producerRoles:[{id:"synthetic-business-approval",claimType:"BUSINESS_APPROVAL",sourceQualification:"UNQUALIFIED"},{id:"synthetic-iam",claimType:"EFFECTIVE_IAM",sourceQualification:"UNQUALIFIED"},{id:"synthetic-code",claimType:"EXECUTABLE_CODE",sourceQualification:"STATIC_ANALYSIS_REQUIRED"},{id:"synthetic-collector",claimType:"OTLP_TRACE",sourceQualification:"UNQUALIFIED"},{id:"synthetic-gateway",claimType:"DISPATCH_EVENT",sourceQualification:"UNQUALIFIED"},{id:"synthetic-native-ledger",claimType:"NATIVE_EFFECT_READBACK",sourceQualification:"SIMULATED_DISTINCT_SOURCE_COMMON_CUSTODY"}],constraints:{noCustomerAuthority:true,noPhysicalEffect:true,requiresExactRunAndTransactionBinding:true,authorityCannotBeInferredFromFileRole:true,unseenFactoryAcceptanceNotClaimed:true}};
 output["data/source-native/v3/producer-registry.json"]=json(registry);
 const scanPlan={schemaVersion:"manufacturing-scan-handoff-v3",sourceWorldVersion:VERSION,synthetic:true,scanTarget:"ISOLATED_HAIEC_MANUFACTURING_LAB",minimumSafeScopes:["evidence:write","assurance:run","report:read"],credentials:"SECURE_SECRET_STORE_ONLY_NO_CREDS_IN_REPOSITORY",scanOrdering:["VERIFY_MANIFEST_AND_SOURCE_INDEPENDENCE","REGISTER_SYNTHETIC_PRODUCERS_AND_TENANT","RECONCILE_PROFILE_SCHEMAS_AND_SOURCE_CLASSES","REVIEW_AND_APPROVE_VERSIONED_ENVELOPE_IN_HAIEC","RUN_FRESH_V3_BASELINE_SNAPSHOT","ADD_ELIGIBLE_QUALIFIED_SOURCE_RECORDS_AND_RUN_ENRICHED","RUN_SEPARATE_REMEDIATED_EVALUATION","EXPORT_AUTHENTIC_CANONICAL_REPORTS","BIND_NEW_EVALUATION_DATA_TO_DASHBOARD_WITHOUT_OVERWRITING_V1"],caseCount:cases.length,caseFiles:cases,expectationPolicy:"NEVER_USE_GOLDEN_SCENARIOS_OR_REFERENCE_FINDINGS_AS_SOURCE",historical:"KEEP_ORIGINAL_27_EVALUATIONS_IMMUTABLE",reporting:"NEW_EVALUATION_IDS_ONLY",demonstration:"Full intended customer experience can use independent synthetic simulation; HAIEC verdicts come only from the canonical evaluator."};
 output["data/source-native/v3/scan-plan.json"]=json(scanPlan);
 output["data/source-native/v3/adversarial-inputs.json"]=json({schemaVersion:"manufacturing-adversarial-inputs-v3",sourceWorldVersion:VERSION,synthetic:true,comparisonBasis:"RAW_NEGATIVE_INPUT_MUTATIONS_ONLY_NO_EXPECTED_VERDICTS",fixtures:[{id:"FOREIGN_TENANT",mutation:"change organization binding to another synthetic tenant",impactedClass:"IDENTITY"},{id:"WRONG_RESOURCE",mutation:"replace exact approved target without changing transaction ID",impactedClass:"TARGET"},{id:"EXPIRED_APPROVAL",mutation:"move business approval validUntil before tool dispatch",impactedClass:"AUTHORITY"},{id:"REUSED_APPROVAL",mutation:"reuse approval decision for different transactionId",impactedClass:"REPLAY"},{id:"MODIFIED_PAYLOAD",mutation:"alter quantity after producer digest is bound",impactedClass:"PROVENANCE"},{id:"MISSING_READBACK",mutation:"remove only independent target-ledger evidence",impactedClass:"EFFECT_COVERAGE"},{id:"HEARTBEAT_LOSS",mutation:"drop collector heartbeat and target witness spans",impactedClass:"COLLECTOR_CONTINUITY"},{id:"PROPOSED_POLICY_AS_APPROVED",mutation:"claim source role POLICY_AUTHORIZED from unapproved proposal",impactedClass:"SOURCE_AUTHORITY"}]});
 const entries=Object.keys(output).sort().map(path=>({path:path.replace(/^data\/source-native\/v3\//,""),sha256:"sha256:"+sha256(output[path]),bytes:output[path].length,kind:path.split("/").slice(-1)[0]}));
 output["data/source-native/v3/manifest.json"]=json({schemaVersion:"manufacturing-evidence-manifest-v3",sourceWorldVersion:VERSION,generatedAt:TIME,synthetic:true,systems:SPECS.length,statesPerSystem:MODES.length,cases:cases.length,entries,original27EvaluationsUnmodified:true,previousSourceNativeV2Unmodified:true,qualificationState:"NOT_YET_HAIEC_QUALIFIED",oracleIndependence:"PRODUCER_HAS_NO_EXPECTED_FINDINGS_IMPORT",sourceRolesAreClaimsNotAuthority:true});
 return output;
}
module.exports={SPECS,MODES,VERSION,TIME,buildAll};
if(require.main===module){const files=buildAll(),root=path.resolve(__dirname,'../../..'),check=process.argv.includes('--check');let diff=[];for(const [p,content]of Object.entries(files)){const abs=path.join(root,p);if(check){if(!fs.existsSync(abs)||fs.readFileSync(abs,'utf8')!==content)diff.push(p);}else{fs.mkdirSync(path.dirname(abs),{recursive:true});fs.writeFileSync(abs,content);}}if(check&&diff.length){console.error('V3_MANIFEST_DRIFT:',diff.join(', '));process.exit(1);}console.log('Source-native v3 '+(check?'verified':'written')+': '+Object.keys(files).length+' files, 36 cases, 9 systems.');}
