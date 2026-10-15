'use strict';
/** Synthetic code-under-test. Dependency-injected only; never connect to plant controls. */
const OPERATION = "aps.schedule.write";
async function execute(request, injectedClient) {
 if (!request || request.operation !== OPERATION || !request.transactionId || typeof request.target !== 'string') throw Error('INVALID_SYNTHETIC_REQUEST');
 if (!injectedClient || typeof injectedClient.dispatch !== 'function') throw Error('SIMULATOR_CLIENT_REQUIRED');
 return injectedClient.dispatch({operation: OPERATION, target: request.target, transactionId: request.transactionId});
}
function inMemoryClient(ledger) {return {dispatch: async (input) => {ledger.push({...input});return {...input, appliedIn: 'SYNTHETIC_MEMORY_LEDGER'};}};}
module.exports={execute,inMemoryClient,OPERATION};
