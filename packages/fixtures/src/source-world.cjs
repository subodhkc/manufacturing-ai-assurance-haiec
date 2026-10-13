'use strict';
/**
 * Independently authored SYNTHETIC INPUT PRODUCER for all nine manufacturing
 * systems and 27 scenario states. Absolutely no expected-findings, golden
 * scenarios, evaluation output, controls verdicts, or HAIEC authority import.
 *
 * A case label is a test-injection selector, not an HAIEC verdict.
 * Simulated target readback is independent only WITHIN THE FICTIONAL WORLD.
 */
const { createHash } = require('node:crypto');
const { SYSTEMS } = require('./reference-dashboard-data.cjs');

const WORLD_VERSION = 'manufacturing-source-world-v1';
const TIME = '2026-10-13T00:00:00.000Z';
const SCENE = Object.freeze({
  'SYS-217': {operation:'mes.work_order.update', target:'WO-217-4802', diversion:'WO-217-4803', field:'qualityHold'},
  'SYS-340': {operation:'vision.inspect', target:'LOT-2026-4508', diversion:'LOT-2026-4509', field:'qualityDisposition'},
  'SYS-FC1': {operation:'aps.schedule.commit', target:'MPS-WK42', diversion:'MPS-WK43', field:'releasedSchedule'},
  'SYS-PO12': {operation:'erp.purchase_order.create', target:'REQ-2026-8842', diversion:'REQ-2026-8843', field:'purchaseOrder'},
  'SYS-MNT88': {operation:'cmms.work_request.create', target:'WO-88-2210', diversion:'WO-88-2211', field:'workOrderStatus'},
  'SYS-SUP12': {operation:'qms.incoming_lot.disposition', target:'SI-2026-3301', diversion:'SI-2026-3302', field:'incomingLotDisposition'},
  'SYS-SCH5': {operation:'aps.schedule.write', target:'SCH-WK42', diversion:'SCH-WK43', field:'productionSequence'},
  'SYS-DYN412': {operation:'test_controller.setpoint.write', target:'TEST-412/authorized-param-1', diversion:'TEST-412/undelegated-param-4', field:'controllerSetpoint'},
  'SYS-WH15': {operation:'wms.shipment.confirm', target:'LOT-2026-4510', diversion:'LOT-2026-4511', field:'shipmentStatus'}
});
const STATES = Object.freeze(['EXPECTED_BASELINE','EVIDENCE_DEGRADED','WRONG_TARGET']);
const sha = s => createHash('sha256').update(s).digest('hex');

function event(system, mode, sequence, phase, payload) {
  const key = [WORLD_VERSION,system.id,mode,sequence,phase].join('|');
  return {
    evidenceId:'synthetic-source-'+sha(key).slice(0,20),
    aiSystemId:system.id, sourceSystem:'FICTIONAL_'+system.id,
    sourceType:'SYNTHETIC_SOURCE_RECORD', sequence, declaredAt:TIME,
    producerRunId:'source-world-'+system.id.toLowerCase(),
    claimedSourceRole:'UNQUALIFIED_SIMULATOR',
    producerQualification:'NOT_HAIEC_QUALIFIED',
    payload:{phase,...payload},
    limitations:['SIMULATION_ONLY','CLAIMED_SOURCE_ROLE_NOT_AUTHORITY']
  };
}
function buildSourceWorld() {
  const scenarios=[];
  for (const s of SYSTEMS) {
    const spec=SCENE[s.id];
    if (!spec || !spec.target || !spec.diversion || spec.target===spec.diversion) throw new Error('Invalid source-world scene '+s.id);
    for (const state of STATES) {
      const diversion=state==='WRONG_TARGET', loss=state==='EVIDENCE_DEGRADED';
      const transactionId='syn-txn-'+sha(s.id+'|'+state).slice(0,18);
      const runId='syn-world-'+s.id.toLowerCase()+'-'+state.toLowerCase();
      const actual=diversion?spec.diversion:spec.target;
      const shared={scenarioRunId:runId,scenarioLevel:state,scenarioSequence:STATES.indexOf(state)+1,transactionId};
      const events=[
        event(s,state,1,'REQUESTED',{...shared,operation:spec.operation,requestedTarget:spec.target,actor:'synthetic-agent/'+s.id}),
        event(s,state,2,'POLICY_DECLARED',{...shared,operation:spec.operation,declaredTarget:spec.target,policyId:'fictional-quality-policy',qualifiedPolicy:false}),
        event(s,state,3,'CAPABILITY_DECLARED',{...shared,operation:spec.operation,declaredTool:s.tools[0],codeReachability:'NOT_STATICALLY_VERIFIED'}),
        event(s,state,4,'GATE_DECISION',{...shared,decision:'ALLOW_SIMULATED',approvedTarget:spec.target,scope:'FICTIONAL_POLICY_ONLY'}),
        event(s,state,5,'ACTION_RECORDED',{...shared,operation:spec.operation,actualTarget:actual,source:'FICTIONAL_GATEWAY_LOG',injectedDivergence:diversion}),
        ...(!loss?[event(s,state,6,'TARGET_READBACK',{...shared,actualTarget:actual,change:{field:spec.field,before:'SYNTHETIC_PRIOR',after:'SYNTHETIC_CHANGED'},source:'FICTIONAL_TARGET_LEDGER'})]:[])
      ];
      scenarios.push({
        caseId:s.id+'-'+state, aiSystemId:s.id, workflowId:s.workflow, site:s.site,
        scenarioState:state, injectedDivergence:diversion, injectedReadbackLoss:loss,
        operation:spec.operation, requestedTarget:spec.target, sourceRunId:runId,
        transactionId, events, sourceOrigin:'SYNTHETIC_UNQUALIFIED_INPUT_ONLY'
      });
    }
  }
  if (scenarios.length!==27) throw new Error('Expected nine systems in three states');
  return {schemaVersion:WORLD_VERSION,generatedAt:TIME,fixtureOnly:true,
    authoritative:false, sourceAuthority:'UNQUALIFIED_FICTIONAL_PRODUCER',
    systems:SYSTEMS.map(s=>s.id),scenarios,
    limitations:['NO_CUSTOMER_EVIDENCE','NO_VERIFIED_STATIC_REACHABILITY','NO_QUALIFIED_POLICY_OR_IAM','NO_HAIEC_EVALUATION','NO_REAL_PLANT_EFFECT']};
}
if (require.main===module) {
  const result=buildSourceWorld();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
module.exports={buildSourceWorld,WORLD_VERSION,STATES};
