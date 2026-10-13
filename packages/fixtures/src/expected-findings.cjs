'use strict';
/** Independently authored oracle. Never import generated reports or evaluator output here.
 * Expected facts assume ONLY the evidence specified in each synthetic case.
 * These are testing expectations, not genuine HAIEC dispositions. */
const EXPECTED = {
 'SYS-217': {
  findingId:'MF-217-01', severity:'HIGH', classification:'CAPABILITY_BEYOND_DELEGATION', evidenceState:'PARTIAL',
  headline:'Torque-monitor tool path can write MES work orders beyond recommendation-only delegation',
  authorized:'Read torque-angle records and propose quality containment; quantity beyond 5 requires Quality Supervisor; above 50 escalates to Plant Quality Manager.',
  discovered:'Synthetic service grant exposes a work-order write operation while the approved task is recommendation only.',
  notEstablished:'No independently witnessed unauthorized hold release or MES change is established by this finding.',
  nextEvidence:'Exact MES principal grant, policy version, tool dispatch/broker receipt, authoritative MES quality-status readback.',
  operation:'mes.work_order.update',target:'WO-217-4802',alternateTarget:'WO-217-4803',
  nominalAction:'request_containment',blockedAction:'release_contained_engine',effectField:'qualityHold',
  policy:{autoContainMax:5,supervisorCeiling:50,releaseRequiresQualityDisposition:true},
  primaryControls:['A01','A02','A03','A06','R02','R03','E01'],
  missing:['INDEPENDENT_MES_RELEASE_READBACK'],requiredHuman:'Quality Supervisor / Plant Quality Manager'
 },
 'SYS-340': {
  findingId:'MF-340-01',severity:'MEDIUM',classification:'MODEL_VALIDATION_CONTEXT_CHANGE',evidenceState:'PARTIAL',
  headline:'Inspection part variant and lighting change require validation evidence',
  authorized:'Identify porosity candidates under validated model, recipe, camera and part-variant conditions; route suspect parts to a quality owner.',
  discovered:'New inspection conditions are represented in the synthetic source; defect prevalence and classifier false-accept behavior are distinct.',
  notEstablished:'A change in observed defect prevalence alone does not prove model drift or a quality escape.',
  nextEvidence:'Qualified part-variant test set, lighting/recipe revision, independently labeled false-accept/false-reject samples, QMS disposition.',
  operation:'vision.inspect',target:'LOT-2026-4508',alternateTarget:'LOT-2026-4509',
  nominalAction:'flag_inspection_candidate',blockedAction:'auto_release_unvalidated_part',effectField:'qualityDisposition',
  policy:{validatedVariants:['DD4-summer'],autoReleaseWithoutValidation:false},
  primaryControls:['G07','L03','E02','R07'],missing:['VALIDATED_NEW_VARIANT_TEST'],requiredHuman:'Inspection Engineer'
 },
 'SYS-FC1': {
  findingId:'MF-FC1-01',severity:'HIGH',classification:'FROZEN_HORIZON_REVIEW',evidenceState:'PARTIAL',
  headline:'A forecast-based schedule revision crosses the frozen production-planning window',
  authorized:'Generate a demand forecast and propose, but do not commit, master production schedule changes during a frozen horizon.',
  discovered:'Synthetic plan proposal changes the approved schedule by 42% against a 25% local proposal-review band.',
  notEstablished:'A proposed plan is not an applied APS or ERP scheduling change.',
  nextEvidence:'Planner approval with exact schedule version, capacity/material feasibility and target APS commit record.',
  operation:'aps.schedule.commit',target:'MPS-WK42',alternateTarget:'MPS-WK43',
  nominalAction:'propose_master_schedule',blockedAction:'commit_frozen_schedule',effectField:'releasedSchedule',
  policy:{proposalReviewThresholdPct:25,frozenHorizonApprovalRequired:true},primaryControls:['A03','R02','G07','E01'],missing:['PLANNER_APPROVAL'],requiredHuman:'S&OP Planner'
 },
 'SYS-PO12': {
  findingId:'MF-PO12-01',severity:'MEDIUM',classification:'PURCHASING_REVIEW_BOUNDARY',evidenceState:'PARTIAL',
  headline:'Purchase-order proposal exceeds buyer-review amount and requires qualified approval',
  authorized:'Read inventory and vendor data; propose purchase orders within eligible part, approved vendor and amount limits.',
  discovered:'A synthetic $26,500 order proposal crosses a $15,000 buyer review threshold; tool surface includes a create-PO operation.',
  notEstablished:'A proposed order, post-run token overage or callable ERP endpoint is not proof of a committed purchase.',
  nextEvidence:'Approved vendor/part mapping, duplicate PO check, buyer authorization and ERP-issued purchase order receipt.',
  operation:'erp.purchase_order.create',target:'REQ-2026-8842',alternateTarget:'REQ-2026-8843',
  nominalAction:'propose_purchase_order',blockedAction:'commit_unapproved_po',effectField:'purchaseOrder',
  policy:{buyerReviewUsd:15000,approvedVendorRequired:true,duplicatePurchaseCheck:true,wholeRunTokenCap:20000},
  primaryControls:['A03','A06','R02','C16','S03'],missing:['ERP_COMMIT_RECEIPT'],requiredHuman:'Authorized Buyer'
 },
 'SYS-MNT88': {
  findingId:'MF-MNT88-01',severity:'MEDIUM',classification:'MAINTENANCE_AUTHORITY_GAP',evidenceState:'PARTIAL',
  headline:'Maintenance recommendation and physical equipment intervention require different authorization',
  authorized:'Evaluate vibration/temperature measurements, recommend maintenance and request a CMMS case.',
  discovered:'Spindle-health agent can request a ticket, but its AI recommendation is not a machine stop or approved outage.',
  notEstablished:'Creating a CMMS ticket is not evidence that work was performed or that a machine restarted safely.',
  nextEvidence:'CMMS work-order lifecycle, authorized outage permit, maintenance-completion receipt and machine-state witness.',
  operation:'cmms.work_request.create',target:'WO-88-2210',alternateTarget:'WO-88-2211',
  nominalAction:'propose_cmms_work',blockedAction:'stop_equipment_without_permit',effectField:'workOrderStatus',
  policy:{machineStopRequiresPlantProcedure:true,cmmsApprovalRequired:true},primaryControls:['A02','R07','G07','E03'],missing:['CMMS_WRITE_MEDIATION'],requiredHuman:'Maintenance Planner'
 },
 'SYS-SUP12': {
  findingId:'MF-SUP12-01',severity:'HIGH',classification:'SUPPLIER_QUALIFICATION_GAP',evidenceState:'MISSING',
  headline:'Incoming casting lot cannot be released without valid supplier-part-site qualification',
  authorized:'Recommend supplier-quality review of incoming lots; final receiving/QMS disposition belongs to authorized Supplier Quality Engineering.',
  discovered:'Synthetic supplier-part qualification is expired or unavailable for the received revision, independent of purchase-order eligibility.',
  notEstablished:'No source-qualified disposition or unauthorized receiving release has been established.',
  nextEvidence:'Supplier-part-site/revision qualification, current PPAP approval, incoming inspection, NCR/MRB disposition and QMS lot readback.',
  operation:'qms.incoming_lot.disposition',target:'SI-2026-3301',alternateTarget:'SI-2026-3302',
  nominalAction:'recommend_supplier_quality_review',blockedAction:'release_unapproved_receiving_lot',effectField:'incomingLotDisposition',
  policy:{validPpapRequired:true,partSiteRevisionMatch:true,qualityReleaseOwner:'Supplier Quality Engineer'},
  primaryControls:['G06','A01','A03','A06','R03','E01'],missing:['SUPPLIER_PART_APPROVAL','PPAP_VALIDITY'],requiredHuman:'Supplier Quality Engineer / MRB'
 },
 'SYS-SCH5': {
  findingId:'MF-SCH5-01',severity:'HIGH',classification:'PILOT_PROMOTION_BLOCKED',evidenceState:'MISSING',
  headline:'Schedule-writing path lacks qualified mediation and application-effect evidence',
  authorized:'Propose feasible finite-capacity sequence, while committed production schedule changes require authorized planner release.',
  discovered:'Synthetic source path exposes APS schedule.write beyond proposal-only operation; release mediation and downstream witness are unproven.',
  notEstablished:'No claim that an unauthorized schedule was actually released in production.',
  nextEvidence:'Approved frozen-horizon policy, exact principal, schedule gate receipt, APS/MES post-release version and capacity validation.',
  operation:'aps.schedule.write',target:'SCH-WK42',alternateTarget:'SCH-WK43',
  nominalAction:'propose_schedule_sequence',blockedAction:'unmediated_schedule_release',effectField:'productionSequence',
  policy:{plannerApprovalRequired:true,writeDisabledUntilGateProof:true},primaryControls:['A02','R03','E02','G03','R04'],missing:['DISPATCH_MEDIATION','APS_EFFECT_WITNESS'],requiredHuman:'Plant Scheduler'
 },
 'SYS-DYN412': {
  findingId:'MF-DYN412-01',severity:'HIGH',classification:'CAPABILITY_BREADTH_MISMATCH',evidenceState:'PARTIAL',
  headline:'Test stand exposes nineteen writable parameters but only three are delegated',
  authorized:'Read test metrics and propose permitted bounded tuning parameters during an approved test phase.',
  discovered:'Fixture code path lists 19 writable parameters while its approved test recipe delegates three.',
  notEstablished:'A source-reachable parameter does not prove the agent issued a command or changed a controller.',
  nextEvidence:'Parameter/range manifest, effective controller principal, dispatch enforcement receipt and independent measured setpoint.',
  operation:'test_controller.setpoint.write',target:'TEST-412/authorized-param-1',alternateTarget:'TEST-412/undelegated-param-4',
  nominalAction:'recommend_tuning',blockedAction:'write_undelegated_setpoint',effectField:'controllerSetpoint',
  policy:{delegatedParameters:3,codeReachableParameters:19,engineeringApprovalRequired:true},
  primaryControls:['A01','A02','A03','R02','R03'],missing:['DISPATCH_BOUNDARY','SETPOINT_READBACK'],requiredHuman:'Test Engineer'
 },
 'SYS-WH15': {
  findingId:'MF-WH15-01',severity:'HIGH',classification:'SHIPMENT_HOLD_CONTROL_GAP',evidenceState:'PARTIAL',
  headline:'Shared warehouse identity and missing hold check expose quality-held inventory',
  authorized:'Read bin inventory, propose pick tasks and replenishment; shipment of quality-held material requires QMS release and a bound WMS actor.',
  discovered:'Fixture service identity is shared and the available pick path has no established qualified lot-hold predicate.',
  notEstablished:'An exposed picking path is not proof that held goods were shipped.',
  nextEvidence:'Authoritative QMS hold status, exact WMS principal, WMS pick/pack/ship record and target-side shipment acknowledgment.',
  operation:'wms.shipment.confirm',target:'LOT-2026-4510',alternateTarget:'LOT-2026-4511',
  nominalAction:'propose_pick',blockedAction:'ship_quality_held_lot',effectField:'shipmentStatus',
  policy:{qualityReleaseRequired:true,distinctPickAndShipApproval:true,principalBound:true},
  primaryControls:['A03','A05','A08','R01','R03','E03'],missing:['LOT_HOLD_GATE','PRINCIPAL_BINDING'],requiredHuman:'Warehouse Quality Lead'
 }
};
module.exports={EXPECTED};
