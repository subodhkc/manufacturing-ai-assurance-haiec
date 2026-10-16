/* Sprint 28 — decision integrity: PO commit-boundary gate, fictional
   reviewer-role enforcement, hardened record import, guided-path guards.
   Focused dependency-cone tests; no saved evaluation is recalculated. */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs'),path=require('path'),vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..','..','..');
const rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const html=rd('dashboard/index.html');

function stubEl(){return{innerHTML:'',textContent:'',value:'',title:'',dataset:{},
  classList:{add(){},remove(){},contains:()=>false,toggle(){}},
  setAttribute(){},getAttribute:()=>null,appendChild(){},
  querySelectorAll:()=>[],querySelector:()=>stubEl(),
  insertAdjacentHTML(){},click(){},style:{},remove(){}};}
function loadDash(){
  const blocks=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
  blocks.push(rd('dashboard/report/reports.js'));
  const elements=new Map();
  const doc={getElementById:id=>{if(!elements.has(id))elements.set(id,stubEl());return elements.get(id);},
    querySelectorAll:()=>[],querySelector:()=>stubEl(),
    addEventListener(){},body:{appendChild(){},classList:{toggle(){}}},head:{appendChild(){}},
    createElement:()=>stubEl(),createTreeWalker:()=>({nextNode:()=>null})};
  const win={scrollTo(){},location:{href:'https://demo.local/',search:'',pathname:'/'},
    history:{pushState(){},replaceState(){}},addEventListener(){},print(){}};
  for(const [k,f] of [['HAIEC_DEMO_DATA','haiec-exports.js'],['HAIEC_GOVERNANCE_DEMO','governance-scenarios.js'],
    ['HAIEC_SCENARIO_SHARED','scenario-shared.js'],['HAIEC_DIGITAL_FACTORY','digital-factory.js']])
    win[k]=JSON.parse(rd('dashboard/data/'+f).replace(/^[\s\S]*?window\.[A-Z_]+ = /,'').replace(/;\s*$/,''));
  const sandbox={window:win,document:doc,console:{log(){},warn(){},error(){}},
    setTimeout,clearTimeout,setInterval,clearInterval,
    requestAnimationFrame:f=>f(),crypto:globalThis.crypto,TextEncoder,
    fetch:()=>Promise.reject(new Error('no network')),
    navigator:{clipboard:{writeText:()=>Promise.resolve()}},
    URLSearchParams,Event,NodeFilter:{SHOW_TEXT:4,SHOW_ELEMENT:1},
    Blob:class{},URL:Object.assign(URL,{createObjectURL:()=>'blob:stub',revokeObjectURL(){}})};
  vm.createContext(sandbox);
  for(const b of blocks)vm.runInContext(b,sandbox);
  return vm.runInContext('({STATE,DF,scen,sys,factoryAttempt,dfSetMode,dfResetSession,demoRecord,dfValidateRecord,dfGuideStart,dfGuideRun,dfGuideNext,DF_GUIDE,decide,rpDemo:window.rpDemo,policyVerdict,commitOutcome})',sandbox);
}

test('commit boundary: under-threshold PO to expired supplier never increments committed value',()=>{
  const T=loadDash();
  const r=T.factoryAttempt('PO',12000,'po',{target:'REQ-2026-8842'});
  // Financial envelope passes, but the qualification gate holds before the
  // effect commits — poValue must stay zero and the PO stays held.
  assert.strictEqual(r.event.decision,'HELD');
  assert.strictEqual(r.event.effect,'HELD_SUPPLIER_QUALIFICATION');
  assert.strictEqual(T.STATE.mes.poValue,0,'held PO must not increment committed value');
  assert.strictEqual(T.DF.pos.find(p=>p.id==='REQ-2026-8842').status,'HELD_SUPPLIER_QUALIFICATION');
  assert.ok(/PPAP qualification is expired/.test(r.event.desc),'ledger explains the second gate');
  // Exactly one event identity carries this outcome.
  const poEvs=T.STATE.events.filter(e=>e.target==='REQ-2026-8842');
  assert.strictEqual(poEvs.length,1,'one coherent event per operation');
});

test('commit boundary: under-threshold PO to qualified supplier commits the correct target',()=>{
  const T=loadDash();
  T.factoryAttempt('PO',12000,'po',{target:'REQ-2026-8855'});
  assert.strictEqual(T.STATE.mes.poValue,12000,'qualified + in-envelope commits');
  assert.strictEqual(T.DF.pos.find(p=>p.id==='REQ-2026-8855').status,'COMMITTED');
  assert.strictEqual(T.DF.pos.find(p=>p.id==='REQ-2026-8842').status,'PROPOSED','other PO never retargeted');
});

test('commit boundary: above-threshold qualified PO commits only after eligible approval',()=>{
  const T=loadDash();
  T.factoryAttempt('PO',38900,'po',{target:'REQ-2026-8855'});
  const req=T.STATE.requests.at(-1);
  assert.strictEqual(req.status,'PENDING');
  assert.strictEqual(req.requiredRole,'Authorized Buyer');
  assert.strictEqual(T.STATE.mes.poValue,0,'pending must not commit');
  T.decide(req.id,'APPROVED','Authorized Buyer');
  assert.strictEqual(T.STATE.mes.poValue,38900);
  assert.strictEqual(T.DF.pos.find(p=>p.id==='REQ-2026-8855').status,'COMMITTED');
});

test('role enforcement: 40-engine containment refuses an ineligible reviewer',()=>{
  const T=loadDash();
  T.factoryAttempt('HOLD',40,'x');
  const req=T.STATE.requests.at(-1);
  assert.strictEqual(req.requiredRole,'Quality Supervisor');
  T.decide(req.id,'APPROVED','Authorized Buyer');
  assert.strictEqual(req.status,'PENDING','wrong-role approval refused — request stays pending');
  assert.strictEqual(T.STATE.mes.contained,0,'no state change');
  assert.strictEqual(T.DF.wo['WO-217-4802'].heldQty,0);
  assert.ok(T.STATE.events[0].decision==='ROLE_MISMATCH','refusal recorded in ledger');
  // The eligible role succeeds.
  T.decide(req.id,'APPROVED','Quality Supervisor');
  assert.strictEqual(req.status,'APPROVED');
  assert.strictEqual(req.decidedByRole,'Quality Supervisor');
  assert.strictEqual(T.STATE.mes.contained,40);
});

test('role enforcement: 60-engine containment requires Plant Quality Manager',()=>{
  const T=loadDash();
  T.factoryAttempt('HOLD',60,'x');
  const req=T.STATE.requests.at(-1);
  assert.strictEqual(req.requiredRole,'Plant Quality Manager');
  T.decide(req.id,'APPROVED','Quality Supervisor');
  assert.strictEqual(req.status,'PENDING','supervisor cannot approve above ceiling');
  assert.strictEqual(T.STATE.mes.contained,0);
  T.decide(req.id,'APPROVED','Plant Quality Manager');
  assert.strictEqual(T.STATE.mes.contained,60,'PQM approval applies');
});

test('forbidden operations stay forbidden under any reviewer role',()=>{
  const T=loadDash();
  // WMS release with an in-force hold routes to review; no role can approve it.
  T.factoryAttempt('WMS_HELD_SHIPMENT',0,'x');
  const req=T.STATE.requests.at(-1);
  assert.strictEqual(req.status,'PENDING');
  T.decide(req.id,'APPROVED','Supplier Quality Engineer');
  assert.strictEqual(req.status,'REJECTED');
  assert.strictEqual(T.STATE.events[0].decision,'FORBIDDEN_BY_ENVELOPE');
  assert.strictEqual(T.DF.lots.find(l=>l.lotId==='LOT-2026-4510').status,'QUALITY_HOLD');
});

test('guide guards: a step cannot double-apply consequential effects',()=>{
  const T=loadDash();
  T.dfGuideStart();
  T.dfGuideRun();           // HOLD 3 applied
  assert.strictEqual(T.STATE.mes.contained,3);
  T.dfGuideRun();           // accidental repeat — refused
  assert.strictEqual(T.STATE.mes.contained,3,'duplicate step run must not double-apply');
  T.dfGuideNext();
  assert.strictEqual(T.DF.guideIdx,1);
});

test('import validation: malformed or contradictory records are rejected',()=>{
  const T=loadDash();
  T.factoryAttempt('HOLD',3,'a');
  const base=T.demoRecord();
  assert.ok(T.dfValidateRecord(base),'genuine record validates');
  const mut=f=>{const r=JSON.parse(JSON.stringify(base));f(r);return r;};
  // Session / identity violations
  assert.ok(!T.dfValidateRecord(mut(r=>{r.session.id='SES-999';})),'bad session id');
  assert.ok(!T.dfValidateRecord(mut(r=>{r.fixture.schemaVersion='demo-digital-factory-9.9.9';})),'unknown fixture');
  // Structural violations
  assert.ok(!T.dfValidateRecord(mut(r=>{r.events.push({...r.events[0]});})),'duplicate event id');
  assert.ok(!T.dfValidateRecord(mut(r=>{r.events[0].requestId='REV-9999';})),'dangling request ref');
  assert.ok(!T.dfValidateRecord(mut(r=>{r.current.purchaseOrders[0].id='REQ-FAKE-0000';})),'unknown PO identity');
  assert.ok(!T.dfValidateRecord(mut(r=>{r.current.workOrders[0].heldQty=-5;})),'impossible heldQty');
  // Contradictory outcome: COMMITTED under an expired supplier qualification.
  assert.ok(!T.dfValidateRecord(mut(r=>{r.current.purchaseOrders.find(p=>p.id==='REQ-2026-8842').status='COMMITTED';})),'committed PO with expired supplier is contradictory');
  // Contradictory outcome: APPROVED request for a prohibited intent.
  assert.ok(!T.dfValidateRecord(mut(r=>{r.requests.push({id:'REV-0999',status:'APPROVED',scenario:'MES',action:'x',target:'WO-217-4802',amount:1,unit:'x',reason:'x'});})),'approved prohibited intent is contradictory');
  // Unsafe URL rejected.
  assert.ok(!T.dfValidateRecord(mut(r=>{r.evidence.publicReceipt='javascript:alert(1)';})),'non-haiec URL rejected');
  // The active session is untouched either way.
  assert.strictEqual(T.STATE.mes.contained,3);
});

test('record + demo report reflect role-aware decisions consistently',()=>{
  const T=loadDash();
  T.factoryAttempt('HOLD',40,'x');
  const req=T.STATE.requests.at(-1);
  T.decide(req.id,'APPROVED','Quality Supervisor');
  const rec=T.demoRecord();
  const recReq=rec.requests.find(r=>r.id===req.id);
  assert.strictEqual(recReq.requiredRole,'Quality Supervisor');
  assert.strictEqual(recReq.decidedByRole,'Quality Supervisor');
  const out=T.rpDemo(rec);
  assert.ok(out.includes('Quality Supervisor'),'report names the required reviewer');
  assert.ok(T.dfValidateRecord(rec),'role-annotated record still validates');
});

test('evaluations and digests untouched by role/gate changes',()=>{
  const src=rd('dashboard/index.html');
  assert.ok(!/fs\.writeFile|writeFileSync|generateDigest|mintReceipt/.test(src),'no artifact minting in dashboard');
});
