'use strict';
/**
 * Station 217 LOCAL SYNTHETIC action-control fixture.
 * Not an industrial actuator, HAIEC U5 verdict, customer policy decision or production authorization service.
 * All principal objects MUST be supplied by a trusted server adapter; never deserialize them from client JSON.
 */
const {createHash}=require('node:crypto');

const POLICY=Object.freeze({
  schemaVersion:'station217-local-policy-v1',
  synthetic:true,systemId:'SYS-217',site:'PLANT-A',
  operation:'HOLD_ENGINES',target:'WO-217-4802',
  autoMax:5,supervisorMax:50,policyVersion:'2026-10-13-fixture-v1'
});
const digest=x=>'sha256:'+createHash('sha256').update(JSON.stringify(x)).digest('hex');
const POLICY_DIGEST=digest(POLICY);
const clone=x=>JSON.parse(JSON.stringify(x));
const TYPES=Object.freeze({
  AGENT:'AGENT',QUALITY_SUPERVISOR:'QUALITY_SUPERVISOR',
  PLANT_QUALITY_MANAGER:'PLANT_QUALITY_MANAGER',DISPATCH_SERVICE:'DISPATCH_SERVICE'
});
function assertPrincipal(p,role){
  if(!p || p.verifiedBy!=='SERVER_TRUSTED_PRINCIPAL' || typeof p.principalId!=='string' || !p.principalId.trim() || (role&&p.role!==role))
    throw new Error('UNVERIFIED_PRINCIPAL');
}
function result(status,extra={}){return Object.freeze({status,synthetic:true,issuer:'LOCAL_STATION217_FIXTURE_NOT_HAIEC',...extra});}
class TargetLedger {
  #rows=new Map([['WO-217-4802',{total:100,hold:0,version:0}],['WO-217-4803',{total:100,hold:0,version:0}]]);
  #transactions=new Map();
  read(target){const row=this.#rows.get(target);return row?clone({target,...row}):null;}
  apply(txId,target,quantity,expectedVersion){
    if(this.#transactions.has(txId))return clone(this.#transactions.get(txId));
    const row=this.#rows.get(target);
    if(!row || row.version!==expectedVersion || row.hold+quantity>row.total)throw new Error('TARGET_PRESTATE_CONFLICT');
    const before=this.read(target);row.hold+=quantity;row.version++;
    const receipt={txId,target,before,after:this.read(target),source:'INDEPENDENT_SYNTHETIC_MES_TARGET_LEDGER'};
    this.#transactions.set(txId,receipt);return clone(receipt);
  }
}
class Station217Run {
  #ledger=new TargetLedger();#requests=new Map();#keys=new Map();#events=[];
  constructor({runId='station217-local-001',now='2026-10-13T00:00:00.000Z',fault='NONE'}={}){
    if(!/^[a-zA-Z0-9_-]{3,80}$/.test(runId))throw new Error('INVALID_RUN_ID');
    if(!Number.isFinite(Date.parse(now)))throw new Error('INVALID_CLOCK');
    if(!['NONE','WRONG_TARGET','MISSING_READBACK'].includes(fault))throw new Error('INVALID_FAULT');
    Object.defineProperties(this,{runId:{value:runId,enumerable:true},now:{value:now,enumerable:true},fault:{value:fault,enumerable:true}});
    Object.freeze(this);
  }
  get policy(){return clone({...POLICY,digest:POLICY_DIGEST});}
  get events(){return clone(this.#events);}
  readTarget(target){return this.#ledger.read(target);}
  #record(type,details){this.#events.push({seq:this.#events.length+1,type,runId:this.runId,time:this.now,...details});}
  propose(req,principal){
    assertPrincipal(principal,TYPES.AGENT);
    if(!req||typeof req!=='object')return result('DENIED',{reason:'INVALID_REQUEST'});
    const needed=['requestId','idempotencyKey','runId','operation','target','agentPrincipalId','policyDigest','expiresAt'];
    if(needed.some(k=>typeof req[k]!=='string'||!req[k]))return result('DENIED',{reason:'INVALID_REQUEST'});
    if(!Number.isInteger(req.quantity)||req.quantity<1||req.quantity>100)return result('DENIED',{reason:'INVALID_QUANTITY'});
    if(req.synthetic!==true||req.runId!==this.runId||req.agentPrincipalId!==principal.principalId)return result('DENIED',{reason:'BOUND_IDENTITY_OR_RUN_MISMATCH'});
    const key=req.idempotencyKey, requestDigest=digest(req);
    if(this.#keys.has(key)){
      const old=this.#keys.get(key);
      return old.digest===requestDigest?clone(old.result):result('DENIED',{reason:'IDEMPOTENCY_CONFLICT'});
    }
    if(this.#requests.has(req.requestId))return result('DENIED',{reason:'REQUEST_ID_CONFLICT'});
    const exp=Date.parse(req.expiresAt),now=Date.parse(this.now);
    if(!Number.isFinite(exp)||exp<=now||exp>now+600000)return result('DENIED',{reason:'EXPIRED_OR_UNBOUNDED_REQUEST'});
    if(req.policyDigest!==POLICY_DIGEST)return result('DENIED',{reason:'POLICY_VERSION_MISMATCH'});
    if(req.operation!==POLICY.operation)return result('DENIED',{reason:'OPERATION_NOT_DELEGATED'});
    if(req.target!==POLICY.target)return result('DENIED',{reason:'TARGET_NOT_DELEGATED'});
    const before=this.#ledger.read(req.target);
    if(!before || before.hold+req.quantity>before.total)return result('DENIED',{reason:'PRESTATE_NOT_ELIGIBLE'});
    const required=req.quantity<=POLICY.autoMax?'AUTO':req.quantity<=POLICY.supervisorMax?TYPES.QUALITY_SUPERVISOR:TYPES.PLANT_QUALITY_MANAGER;
    const status=required==='AUTO'?'AUTO_AUTHORIZED':'HUMAN_APPROVAL_REQUIRED';
    const proposal=result(status,{requestId:req.requestId,requiredApprover:required,requestDigest,policyDigest:POLICY_DIGEST,boundTarget:req.target,quantity:req.quantity});
    this.#requests.set(req.requestId,{req:clone(req),digest:requestDigest,before:clone(before),required,approved:null,committed:null});
    this.#keys.set(key,{digest:requestDigest,result:proposal});
    this.#record('POLICY_GATE',{requestId:req.requestId,status,required,policyDigest:POLICY_DIGEST,requestDigest});
    return proposal;
  }
  approve(requestId,principal){
    assertPrincipal(principal);
    const entry=this.#requests.get(requestId);
    if(!entry)return result('DENIED',{reason:'UNKNOWN_REQUEST'});
    if(entry.committed)return result('DENIED',{reason:'ALREADY_COMMITTED'});
    if(entry.required==='AUTO')return result('DENIED',{reason:'APPROVAL_NOT_REQUIRED'});
    if(principal.principalId===entry.req.agentPrincipalId || principal.role!==entry.required)return result('DENIED',{reason:'SEPARATION_OF_DUTIES_OR_ROLE_MISMATCH'});
    if(Date.parse(entry.req.expiresAt)<=Date.parse(this.now))return result('DENIED',{reason:'APPROVAL_EXPIRED'});
    if(entry.approved)return result('DENIED',{reason:'APPROVAL_ALREADY_RECORDED'});
    entry.approved={principalId:principal.principalId,role:principal.role,requestDigest:entry.digest,policyDigest:POLICY_DIGEST};
    this.#record('HUMAN_APPROVAL',{requestId,approver:principal.principalId,requestDigest:entry.digest});
    return result('APPROVED_FOR_SYNTHETIC_DISPATCH',{requestId,approver:principal.principalId,requestDigest:entry.digest});
  }
  dispatch(requestId,principal){
    assertPrincipal(principal,TYPES.DISPATCH_SERVICE);
    const entry=this.#requests.get(requestId);
    if(!entry)return result('DENIED',{reason:'UNKNOWN_REQUEST'});
    if(entry.committed)return clone(entry.committed);
    if(Date.parse(entry.req.expiresAt)<=Date.parse(this.now))return result('DENIED',{reason:'REQUEST_EXPIRED'});
    if(entry.req.policyDigest!==POLICY_DIGEST || entry.req.target!==POLICY.target)return result('DENIED',{reason:'POLICY_OR_SCOPE_CHANGED'});
    if(entry.required!=='AUTO' && (!entry.approved || entry.approved.requestDigest!==entry.digest))
      return result('DENIED',{reason:'EXACT_HUMAN_APPROVAL_REQUIRED'});
    const before=this.#ledger.read(entry.req.target);
    if(!before || before.version!==entry.before.version)return result('DENIED',{reason:'TARGET_PRESTATE_CONFLICT'});
    const effectiveTarget=this.fault==='WRONG_TARGET'?'WO-217-4803':entry.req.target;
    const actualBefore=this.#ledger.read(effectiveTarget);
    const txId='syn-tx-'+digest(this.runId+':'+requestId).slice(7,23);
    let receipt;
    try{receipt=this.#ledger.apply(txId,effectiveTarget,entry.req.quantity,actualBefore.version);}
    catch(e){return result('DENIED',{reason:e.message});}
    this.#record('BROKER_DISPATCH',{requestId,txId,requestedTarget:entry.req.target,transportStatus:'COMMITTED_BY_LOCAL_EMULATOR'});
    if(this.fault==='MISSING_READBACK'){
      entry.committed=result('EFFECT_UNKNOWN',{requestId,txId,reason:'DOWNSTREAM_WITNESS_UNAVAILABLE',evidenceBasis:'GATEWAY_RECEIPT_ONLY'});
    }else{
      const targetReadback=this.#ledger.read(entry.req.target);
      const appliedReadback=this.#ledger.read(effectiveTarget);
      const match=receipt.target===entry.req.target && targetReadback.version===entry.before.version+1 && targetReadback.hold===entry.before.hold+entry.req.quantity;
      entry.committed=result(match?'SYNTHETIC_EFFECT_CONFIRMED':'TARGET_MISMATCH',{requestId,txId,expectedTarget:entry.req.target,observedTarget:receipt.target,gateDecision:'AUTHORIZED',targetWitness:{before:receipt.before,after:appliedReadback,source:receipt.source},requestedTargetReadback:targetReadback});
    }
    this.#record('EFFECT_ASSESSMENT',{requestId,status:entry.committed.status,txId});
    return clone(entry.committed);
  }
}
module.exports={Station217Run,POLICY_DIGEST,TYPES};
