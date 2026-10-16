/* Sprint 26 — Interactive Digital Factory: versioned fixture, one shared
   browser-local state layer, single policy path (policyVerdict/commitOutcome)
   reused by the Decision Lab and factory actions, deterministic equipment
   readings, and honest classification. No saved evaluation is recalculated. */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs'),path=require('path'),vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..','..','..');
const rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const rj=p=>JSON.parse(rd(p));

const fx=rj('data/demo-factory/digital-factory.json');
const html=rd('dashboard/index.html');

test('digital-factory fixture: schema, provenance and preserved identities',()=>{
  assert.strictEqual(fx.schemaVersion,'demo-digital-factory-1.0.0');
  assert.strictEqual(fx.provenance,'SIMULATION_ONLY');
  assert.strictEqual(fx.plant,'PLANT-A');
  const wos=fx.workOrders.map(w=>w.id);
  for(const id of ['WO-217-4802','WO-217-4803','WO-340-9110'])assert.ok(wos.includes(id),`missing ${id}`);
  const w4802=fx.workOrders.find(w=>w.id==='WO-217-4802');
  assert.strictEqual(w4802.systemId,'SYS-217');assert.strictEqual(w4802.station,'STN-217');
  assert.ok(fx.erp.suppliers.some(s=>s.id==='VND-FST-118'&&s.qualification==='PPAP_EXPIRED'));
  assert.ok(fx.erp.purchaseOrders.some(p=>p.id==='REQ-2026-8842'&&p.status==='PROPOSED'));
  assert.ok(fx.erp.inventory.some(l=>l.lotId==='LOT-2026-4510'&&l.status==='QUALITY_HOLD'));
  assert.ok(fx.equipment.some(e=>e.id==='EQ-TORQUE-217'&&e.systemId==='SYS-217'));
  for(const k of ['TORQUE_ANOMALY','TEMP_RISE','SOURCE_GAP'])assert.ok(fx.anomalyPrograms[k],`missing program ${k}`);
  assert.ok(fx.anomalyPrograms.SOURCE_GAP.signalLoss===true);
});

test('generated browser bundle matches the versioned fixture',()=>{
  const bundle=rd('dashboard/data/digital-factory.js');
  const parsed=JSON.parse(bundle.replace(/^[\s\S]*?window\.HAIEC_DIGITAL_FACTORY = /,'').replace(/;\s*$/,''));
  assert.deepStrictEqual(parsed,fx);
});

test('one policy path: Decision Lab and factory share policyVerdict/commitOutcome',()=>{
  assert.ok(html.includes('function policyVerdict('),'policyVerdict exists');
  assert.ok(html.includes('function commitOutcome('),'commitOutcome exists');
  // runScenario delegates — no parallel inline policy on the lab path.
  const run=/function runScenario\(\)\{[\s\S]*?\n\}/.exec(html)[0];
  assert.ok(run.includes('policyVerdict(sc, v)'),'runScenario uses policyVerdict');
  assert.ok(run.includes('commitOutcome(sc, s, v, r)'),'runScenario uses commitOutcome');
  const fa=/function factoryAttempt\([\s\S]*?\n\}/.exec(html)[0];
  assert.ok(fa.includes('policyVerdict(sc, v)')&&fa.includes('commitOutcome('),'factoryAttempt shares the same path');
  // Factory state sync lives inside commitOutcome — one funnel, no fork.
  assert.ok(html.includes('dfApplyOutcome(sc, v, r, request, ev)'));
  assert.ok(html.includes('dfApplyDecision(r, verdict)'));
});

test('dashboard wiring: nav, renderer, dispatcher cases, disclosure',()=>{
  assert.ok(html.includes("{ id:'factory'"),'nav entry');
  assert.ok(html.includes('PAGE_RENDERERS.factory = pageFactory'),'renderer registered');
  for(const a of ['df-mes-write','df-advisory','df-release','df-po','df-lot-release','df-receiving','df-eq','df-reset'])
    assert.ok(html.includes(`'${a}'`),`missing dispatch case ${a}`);
  assert.ok(html.includes('dfLifecycle()'),'lifecycle hook in render');
  assert.ok(html.includes('visibilitychange'),'hidden-tab pause');
  assert.ok(html.includes('prefers-reduced-motion'),'reduced motion honored');
  // Disclosure concentrated: badge near controls + About section, not per-card.
  assert.ok(html.includes('Interactive Demo Factory'));
  assert.ok(html.includes('About this demonstration'));
  assert.ok(html.includes('no MES, ERP or PLC connection exists'));
});

/* ---------- behavior in a vm sandbox ---------- */
function stubEl(){return{innerHTML:'',textContent:'',value:'',title:'',dataset:{},
  classList:{add(){},remove(){},contains:()=>false,toggle(){}},
  setAttribute(){},getAttribute:()=>null,appendChild(){},
  querySelectorAll:()=>[],querySelector:()=>stubEl(),
  insertAdjacentHTML(){},click(){},style:{},remove(){}};}
function loadDash(){
  const blocks=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
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
  return vm.runInContext('({STATE,DF,scen,sys,factoryAttempt,dfAdvisory,dfSetMode,dfRead,dfReset,dfTick,policyVerdict,commitOutcome,decide,pageFactory,addEvent})',sandbox);
}

test('baseline: fixture seeds one shared state; reset restores it',()=>{
  const T=loadDash();
  assert.ok(T.DF.loaded,'fixture loaded');
  assert.strictEqual(T.DF.wo['WO-217-4802'].heldQty,0);
  assert.strictEqual(T.DF.pos[0].status,'PROPOSED');
  T.factoryAttempt('HOLD',3,'t');
  assert.strictEqual(T.DF.wo['WO-217-4802'].heldQty,3);
  T.dfReset();
  assert.strictEqual(T.DF.wo['WO-217-4802'].heldQty,0,'reset restores baseline');
  assert.strictEqual(T.DF.pos[0].status,'PROPOSED');
});

test('3/40/60 engine policy outcomes unchanged through the factory path',()=>{
  const T=loadDash();
  const hold=T.scen('HOLD');
  assert.strictEqual(T.policyVerdict(hold,3).decision,'PASS');
  assert.strictEqual(T.policyVerdict(hold,40).decision,'REVIEW_REQUIRED');
  assert.strictEqual(T.policyVerdict(hold,60).decision,'REVIEW_REQUIRED');
  // Same outcomes when driven through factoryAttempt.
  const base=T.STATE.events.length;
  const reqBase=T.STATE.requests.length;
  T.factoryAttempt('HOLD',3);assert.strictEqual(T.STATE.mes.contained,3);
  T.factoryAttempt('HOLD',40);
  assert.strictEqual(T.STATE.requests.at(-1).status,'PENDING');
  assert.strictEqual(T.STATE.mes.contained,3,'pending request must not mutate state');
  T.factoryAttempt('HOLD',60);
  assert.strictEqual(T.STATE.requests.length,reqBase+2,'60 engines routes to plant-manager review');
  assert.strictEqual(T.STATE.mes.contained,3,'unapproved request must not mutate state');
  assert.strictEqual(T.DF.wo['WO-217-4802'].heldQty,3,'only the allowed 3 applied');
  assert.ok(T.STATE.events.length>base,'ledger recorded all three outcomes');
});

test('MES write attempt is held; advisory proceeds; state stays consistent',()=>{
  const T=loadDash();
  const n0=T.STATE.events.length;
  T.factoryAttempt('MES',12,'Attempted MES work-order update');
  const ev=T.STATE.events[0];
  assert.strictEqual(ev.decision,'DENY');
  assert.strictEqual(ev.channel,'FACTORY');
  assert.strictEqual(T.STATE.mes.contained,0,'no restricted mutation');
  assert.strictEqual(T.DF.wo['WO-217-4802'].attempts.at(-1).result,'DENY');
  T.dfAdvisory('WO-217-4802');
  const adv=T.STATE.events[0];
  assert.strictEqual(adv.decision,'ADVISORY');
  assert.strictEqual(T.DF.wo['WO-217-4802'].lastAdvisory,adv.id);
  assert.ok(T.STATE.events.length===n0+2,'append-only ledger');
});

test('ERP: financial approval cannot bypass supplier qualification; qualified PO commits',()=>{
  const T=loadDash();
  T.factoryAttempt('PO',86500,'po',{target:'REQ-2026-8842'});
  const req=T.STATE.requests.at(-1);
  assert.strictEqual(req.status,'PENDING');
  assert.strictEqual(T.DF.pos[0].status,'BUYER_REVIEW');
  assert.strictEqual(T.STATE.mes.poValue,0);
  T.decide(req.id,'APPROVED');
  // Buyer approval covers financial authority only — VND-FST-118 PPAP expired.
  assert.strictEqual(T.STATE.mes.poValue,0,'unqualified supplier must not commit');
  assert.strictEqual(T.DF.pos[0].status,'HELD_SUPPLIER_QUALIFICATION');
  const hold=T.STATE.events.find(e=>e.decision==='HELD');
  assert.ok(hold&&/supplier/i.test(hold.title),'hold event explains the second gate');
  // The qualified-supplier proposal commits fully on approval.
  T.factoryAttempt('PO',38900,'po2',{target:'REQ-2026-8855'});
  const req2=T.STATE.requests.at(-1);
  T.decide(req2.id,'APPROVED');
  assert.strictEqual(T.STATE.mes.poValue,38900,'qualified supplier commits');
  assert.strictEqual(T.DF.pos.find(p=>p.id==='REQ-2026-8855').status,'COMMITTED');
  // Quality-held stock release denied — lot stays held.
  T.factoryAttempt('WMS_HELD_SHIPMENT',1,'lot');
  assert.strictEqual(T.STATE.events[0].decision,'DENY');
  assert.strictEqual(T.DF.lots.find(l=>l.lotId==='LOT-2026-4510').status,'QUALITY_HOLD');
  assert.strictEqual(T.DF.lots.find(l=>l.lotId==='LOT-2026-4510').lastAttempt.result,'DENY');
  T.factoryAttempt('INCOMING_QC',0,'recv');
  assert.strictEqual(T.STATE.events[0].decision,'DENY');
  assert.strictEqual(T.DF.lots.find(l=>l.lotId==='SI-2026-3301').status,'QUARANTINE_RECEIVING');
});

test('equipment: deterministic readings; anomalies record one monitoring event each',()=>{
  const T=loadDash();
  const r1=T.dfRead('EQ-TORQUE-217');T.dfTick();const r2=T.dfRead('EQ-TORQUE-217');
  assert.notStrictEqual(r1.torque,r2.torque,'readings evolve with virtual time');
  // Reproducible: same fixture + same tick → same value.
  const T2=loadDash();T2.dfTick();
  assert.strictEqual(T2.dfRead('EQ-TORQUE-217').torque,r2.torque,'deterministic');
  const n0=T.STATE.events.length;
  T.dfSetMode('TORQUE_ANOMALY');
  assert.strictEqual(T.dfRead('EQ-TORQUE-217').alarm,true);
  assert.strictEqual(T.STATE.events.length,n0+1);
  assert.strictEqual(T.STATE.events[0].decision,'OBSERVED');
  assert.strictEqual(T.STATE.events[0].systemId,'SYS-217','event matches originating equipment system');
  T.dfSetMode('TORQUE_ANOMALY'); // same mode — no duplicate event
  assert.strictEqual(T.STATE.events.length,n0+1);
  T.dfSetMode('SOURCE_GAP');
  assert.strictEqual(T.dfRead('EQ-TORQUE-217').dead,true);
  assert.strictEqual(T.dfRead('EQ-TORQUE-217').heartbeat,'LOST');
  T.dfSetMode('NORMAL');
  assert.strictEqual(T.dfRead('EQ-TORQUE-217').dead,false);
});

test('replay and visitor actions share one ledger without conflicting outcomes',()=>{
  const T=loadDash();
  T.factoryAttempt('MES',12,'factory attempt');
  T.factoryAttempt('HOLD',3,'factory hold');
  // Decision Lab entry path uses the same commitOutcome — same EV- sequence.
  const ids=T.STATE.events.map(e=>e.id);
  assert.strictEqual(new Set(ids).size,ids.length,'no duplicate event ids');
  const mes=T.STATE.events.find(e=>e.scenario==='MES');
  const hold=T.STATE.events.find(e=>e.scenario==='HOLD');
  assert.strictEqual(mes.decision,'DENY');assert.strictEqual(hold.decision,'PASS');
  // Same ids surface in the factory attempt record — never two verdicts.
  assert.strictEqual(T.DF.wo['WO-217-4802'].attempts.find(a=>a.ref===mes.id).result,'DENY');
});

test('factory page renders panels, ribbon and honest disclosure',()=>{
  const T=loadDash();
  T.STATE.page='factory';
  const htmlOut=T.pageFactory();
  for(const m of ['WO-217-4802','WO-217-4803','REQ-2026-8842','LOT-2026-4510','EQ-TORQUE-217',
    'Attempt MES update','Issue advisory note','Commit purchase order','Torque anomaly',
    'Interactive Demo Factory','About this demonstration','DEMO-REQ-SYS-217-06','SYS-217-WRONG_TARGET'])
    assert.ok(htmlOut.includes(m),`factory page missing ${m}`);
  // Saved-eval evidence link present; demo state never called an assurance record.
  assert.ok(htmlOut.includes('Review required'));
});

test('reports: gov report carries Digital Factory Operations classified separately',()=>{
  const rpt=rd('dashboard/report/reports.js');
  assert.ok(rpt.includes('Digital Factory Operations'));
  assert.ok(rpt.includes('HAIEC_DIGITAL_FACTORY'));
  assert.ok(rpt.includes('browser-local'));
  assert.ok(rpt.includes('classified as browser-generated')||rpt.includes('Browser-generated demonstration'),'separate classification');
});

test('no saved evaluation files or digests touched by the factory layer',()=>{
  // The factory code only reads the fixture + shared artifact; it must not
  // reference haiec export writes, signing, or evaluation ids as outputs.
  const dfSrc=html.slice(html.indexOf('DIGITAL FACTORY — browser-local'),html.indexOf('const SHARED=window.HAIEC_SCENARIO_SHARED'));
  assert.ok(!dfSrc.includes('HAIEC_DEMO_DATA'),'factory must not read persisted exports');
  assert.ok(!/exportDigest|signatureBlock|hxExports|hxVerifyAll|\.sign\(|SIGNED/.test(dfSrc),'factory never mints or signs assurance artifacts');
});
