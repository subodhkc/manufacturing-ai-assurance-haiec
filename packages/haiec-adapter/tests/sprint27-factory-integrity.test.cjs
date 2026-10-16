/* Sprint 27 — Digital Factory integrity: cross-system gates, coordinated
   session reset, portable demonstration record, guided judge path.
   Focused dependency-cone tests; no saved evaluation is recalculated. */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs'),path=require('path'),vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..','..','..');
const rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const html=rd('dashboard/index.html');
const fx=JSON.parse(rd('data/demo-factory/digital-factory.json'));

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
  return vm.runInContext('({STATE,DF,scen,sys,factoryAttempt,dfAdvisory,dfSetMode,dfRead,dfReset,dfResetSession,demoRecord,dfValidateRecord,dfGuideStart,dfGuideRun,dfGuideNext,DF_GUIDE,decide,pageFactory,rpDemo:window.rpDemo,policyVerdict,commitOutcome})',sandbox);
}

test('fixture: qualified-supplier positive path exists beside the expired-supplier case',()=>{
  const p1=fx.erp.purchaseOrders.find(p=>p.id==='REQ-2026-8842');
  const p2=fx.erp.purchaseOrders.find(p=>p.id==='REQ-2026-8855');
  assert.ok(p1&&p2,'both PO fixtures present');
  const s1=fx.erp.suppliers.find(s=>s.id===p1.supplierId);
  const s2=fx.erp.suppliers.find(s=>s.id===p2.supplierId);
  assert.strictEqual(s1.qualification,'PPAP_EXPIRED');
  assert.strictEqual(s2.qualification,'PPAP_CURRENT');
});

test('financial approval never satisfies the supplier-qualification gate',()=>{
  const T=loadDash();
  T.factoryAttempt('PO',86500,'po',{target:'REQ-2026-8842'});
  const req=T.STATE.requests.at(-1);
  assert.strictEqual(req.target,'REQ-2026-8842');
  T.decide(req.id,'APPROVED');
  assert.strictEqual(T.DF.pos.find(p=>p.id==='REQ-2026-8842').status,'HELD_SUPPLIER_QUALIFICATION');
  assert.strictEqual(T.STATE.mes.poValue,0,'held PO never enters committed value');
  assert.strictEqual(T.STATE.requests.find(r=>r.id===req.id).status,'APPROVED','human did approve — the hold is a second gate, not a hidden rejection');
});

test('coordinated session reset: closes pending, restores all state, preserves ledger',()=>{
  const T=loadDash();
  const s1=T.DF.session;
  T.factoryAttempt('HOLD',3,'a');
  T.factoryAttempt('HOLD',40,'b');           // pending request in session 1
  T.dfSetMode('TORQUE_ANOMALY');
  const pendId=T.STATE.requests.at(-1).id;
  const evCount=T.STATE.events.length;
  T.dfResetSession();
  assert.notStrictEqual(T.DF.session,s1,'new session identity');
  assert.strictEqual(T.STATE.mes.contained,0,'mes counters restored');
  assert.strictEqual(T.DF.wo['WO-217-4802'].heldQty,0,'factory baseline restored');
  assert.strictEqual(T.DF.mode,'NORMAL','anomaly reset');
  assert.strictEqual(T.STATE.events.length,evCount+1,'ledger preserved + boundary event');
  assert.strictEqual(T.STATE.requests.find(r=>r.id===pendId).status,'SESSION_CLOSED');
  // The old request cannot mutate the new session.
  T.decide(pendId,'APPROVED');
  assert.strictEqual(T.STATE.mes.contained,0,'prior-session request mutates nothing');
  assert.strictEqual(T.STATE.requests.find(r=>r.id===pendId).status,'SESSION_CLOSED');
  // Event identities remain unique across the reset boundary.
  const ids=T.STATE.events.map(e=>e.id);
  assert.strictEqual(new Set(ids).size,ids.length);
  // Prior events still tagged with their original session.
  assert.ok(T.STATE.events.some(e=>e.session===s1));
});

test('demonstration record reproduces final state and passes validation',()=>{
  const T=loadDash();
  T.factoryAttempt('HOLD',3,'a');
  T.factoryAttempt('MES',12,'b');
  T.factoryAttempt('PO',86500,'po',{target:'REQ-2026-8842'});
  T.dfSetMode('TORQUE_ANOMALY');
  const rec=T.demoRecord();
  assert.strictEqual(rec.schemaVersion,'demo-factory-record-1.0.0');
  assert.strictEqual(rec.artifactClass,'BROWSER_LOCAL_DEMONSTRATION_RECORD_NOT_HAIEC_ISSUED');
  assert.ok(T.dfValidateRecord(rec),'record validates');
  // Reproduces final state.
  assert.strictEqual(rec.current.mes.contained,3);
  assert.strictEqual(rec.current.workOrders.find(w=>w.id==='WO-217-4802').heldQty,3);
  assert.strictEqual(rec.current.purchaseOrders.find(p=>p.id==='REQ-2026-8842').status,'BUYER_REVIEW');
  assert.strictEqual(rec.current.equipment.find(e=>e.id==='EQ-TORQUE-217').mode,'TORQUE_ANOMALY');
  assert.ok(rec.events.some(e=>e.decision==='OBSERVED'),'monitoring event captured');
  // Session-tagged events belong to this session; seeded baseline history
  // (FCT-*/FAC-SYS-*) carries session:null — fixture history, not activity.
  const sessEvs=rec.events.filter(e=>e.session!==null);
  assert.ok(sessEvs.length>=4&&sessEvs.every(e=>e.session===T.DF.session));
  assert.ok(rec.events.some(e=>e.session===null),'seeded baseline preserved');
  // Baseline preserved for diff.
  assert.strictEqual(rec.baseline.purchaseOrders.find(p=>p.id==='REQ-2026-8842').status,'PROPOSED');
  // Evidence links, never minted verdicts.
  assert.ok(rec.evidence.flagshipCase==='SYS-217-WRONG_TARGET');
  assert.ok(/verify\/assurance/.test(rec.evidence.publicReceipt));
  // Invalid records rejected.
  assert.ok(!T.dfValidateRecord({schemaVersion:'demo-factory-record-1.0.0'}));
  assert.ok(!T.dfValidateRecord({schemaVersion:'x',artifactClass:'BROWSER_LOCAL_DEMONSTRATION_RECORD_NOT_HAIEC_ISSUED'}));
  assert.ok(!T.dfValidateRecord(null));
});

test('record after reset separates sessions and keeps prior history',()=>{
  const T=loadDash();
  T.factoryAttempt('HOLD',3,'a');
  const s1=T.DF.session;
  T.dfResetSession();
  T.factoryAttempt('MES',12,'b');
  const rec=T.demoRecord();
  assert.ok(rec.events.some(e=>e.session===s1),'prior session events preserved');
  assert.ok(rec.events.some(e=>e.session===T.DF.session));
  assert.strictEqual(rec.current.mes.contained,0,'current state is the new session');
  assert.strictEqual(rec.session.id,T.DF.session);
});

test('guided judge path exists and runs the six scenarios through the shared path',()=>{
  const T=loadDash();
  assert.ok(Array.isArray(T.DF_GUIDE)&&T.DF_GUIDE.length===7,'7 steps');
  T.dfGuideStart();
  assert.strictEqual(T.DF.guideIdx,0);
  T.dfGuideRun(); // HOLD 3
  assert.strictEqual(T.STATE.mes.contained,3);
  T.dfGuideNext();
  T.dfGuideRun(); // HOLD 40 → request; guide opened review but decide needs modal — call decide directly
  assert.strictEqual(T.STATE.requests.at(-1).status,'PENDING');
  T.decide(T.STATE.requests.at(-1).id,'APPROVED');
  assert.strictEqual(T.STATE.mes.contained,43);
  T.dfGuideNext();T.dfGuideRun(); // HOLD 60 → pending PQM
  assert.strictEqual(T.STATE.requests.at(-1).status,'PENDING');
  T.dfGuideNext();T.dfGuideRun(); // MES → DENY
  assert.strictEqual(T.STATE.events[0].decision,'DENY');
  T.dfGuideNext();T.dfGuideRun(); // PO → pending
  assert.strictEqual(T.STATE.requests.at(-1).scenario,'PO');
  T.dfGuideNext();T.dfGuideRun(); // anomaly observed
  assert.ok(T.STATE.events.some(e=>e.decision==='OBSERVED'));
});

test('3/40/60 outcomes unchanged; approved action touches only permitted targets',()=>{
  const T=loadDash();
  const hold=T.scen('HOLD');
  assert.strictEqual(T.policyVerdict(hold,3).decision,'PASS');
  assert.strictEqual(T.policyVerdict(hold,40).decision,'REVIEW_REQUIRED');
  assert.strictEqual(T.policyVerdict(hold,60).decision,'REVIEW_REQUIRED');
  // Approved containment mutates only WO-217-4802 — not WO-217-4803 or lots.
  T.factoryAttempt('HOLD',40,'x');
  T.decide(T.STATE.requests.at(-1).id,'APPROVED');
  assert.strictEqual(T.DF.wo['WO-217-4802'].heldQty,40);
  assert.strictEqual(T.DF.wo['WO-217-4803'].heldQty,0);
  assert.strictEqual(T.DF.lots.find(l=>l.lotId==='LOT-2026-4510').status,'QUALITY_HOLD');
});

test('demo report view wired: router, tile, projection, classification',()=>{
  const rpt=rd('dashboard/report/reports.js');
  assert.ok(rpt.includes("demo:'demo'"),'RPT_VIEWS');
  assert.ok(rpt.includes("RPT.view='demo'"),'router');
  assert.ok(rpt.includes('function rpDemo('),'renderer');
  assert.ok(rpt.includes('data-rp="demo"'),'hub tile');
  assert.ok(rpt.includes('BROWSER-LOCAL SCENARIO OUTPUT — NOT HAIEC ISSUED'));
  // Gov report shows current session and deltas.
  assert.ok(rpt.includes('DF.session'));
  const T=loadDash();
  T.factoryAttempt('MES',12,'x');
  T.factoryAttempt('PO',86500,'po',{target:'REQ-2026-8842'});
  T.decide(T.STATE.requests.at(-1).id,'APPROVED');
  const out=T.rpDemo(T.demoRecord());
  assert.ok(out.includes('SES-0001'));
  assert.ok(out.includes('WO-217-4802'));
  assert.ok(out.includes('HELD'),'supplier-qualification hold is visible');
});
