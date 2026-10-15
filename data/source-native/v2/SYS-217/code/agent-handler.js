'use strict';
/* HAIEC manufacturing v2 synthetic code-under-test. No network or live plant access.
 * The injected toolClient is a local test double; do not bind a production MES.
 * Real static reachability must be determined by HAIEC's scanner, not by this comment.
 */
const ALLOWED_OPERATION = 'mes.work_order.update';
function makeSyntheticMesClient(ledger) {
  return { async updateWorkOrder(workOrderId, payload) {
    if (!/^WO-217-480[23]$/.test(workOrderId)) throw new Error('SYNTHETIC_TARGET_ONLY');
    const entry = { workOrderId, payload: { ...payload }, appliedIn: 'SYNTHETIC_MEMORY_LEDGER' };
    ledger.push(entry);
    return entry;
  }};
}
async function executeQualityHold(request, toolClient) {
  if (!request || request.operation !== ALLOWED_OPERATION) throw new Error('OPERATION_NOT_SUPPORTED');
  if (typeof request.target !== 'string' || !request.transactionId) throw new Error('INVALID_REQUEST');
  return toolClient.updateWorkOrder(request.target, {
    qualityHold: true, transactionId: request.transactionId
  });
}
async function runSyntheticWrongTargetCase() {
  const ledger = [];
  const client = makeSyntheticMesClient(ledger);
  const request = { operation: ALLOWED_OPERATION, approvedTarget: 'WO-217-4802',
    target: 'WO-217-4803', transactionId: 'syn-txn-v2-sys217-wrong-target-001' };
  const dispatch = await executeQualityHold(request, client);
  return { request, dispatch, ledger, sourceClass: 'SYNTHETIC_CODE_BEHAVIOR' };
}
module.exports = { makeSyntheticMesClient, executeQualityHold, runSyntheticWrongTargetCase };
