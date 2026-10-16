/* Sprint 29 — judge showcase: the rewritten ?report=judge page presents the
   two-minute platform-first showcase, separates the interactive deep dive,
   keeps real route links, and the committed sample record is a genuine
   browser-local artifact that passes the hardened import validator. */
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
  return vm.runInContext('({STATE,DF,RPT:window.RPT,dfValidateRecord,pageReports:PAGE_RENDERERS.reports})',sandbox);
}

test('judge page: platform-first showcase with seven timed scenes',()=>{
  const T=loadDash();
  T.RPT.view="judge";const out=T.pageReports();
  assert.ok(/HAIEC in two minutes/.test(out),'showcase header');
  // Platform pillars and capabilities appear before any manufacturing detail.
  const pi=out.indexOf('Understand');
  assert.ok(pi>-1 && pi<out.indexOf('Station 217'),'pillars lead, manufacturing follows');
  for(const c of ['Discover','Evaluate','Authorize','Monitor','Protect','Verify'])
    assert.ok(out.includes(c),'capability '+c);
  // Seven scenes with timing labels.
  assert.strictEqual((out.match(/rp-jstep/g)||[]).length,7,'exactly seven scenes');
  assert.ok(/0:00–0:12/.test(out)&&/1:28–1:55/.test(out),'timed scenes');
});

test('judge page: real routes, Station 217 identities, verification link',()=>{
  const T=loadDash();
  T.RPT.view="judge";const out=T.pageReports();
  for(const needle of ['data-rp="s217-exec"','data-id="SYS-217-WRONG_TARGET"','data-rp="gov"','data-rp="demo"',
    'data-act="page" data-id="factory"','verify/assurance/Q-4997girnnfIM62jTRJPYeX'])
    assert.ok(out.includes(needle),'link: '+needle);
  assert.ok(out.includes('WO-217-4802')&&out.includes('WO-217-4803'),'distinct work-order identities');
  assert.ok(/\bREVIEW\b/.test(out),'canonical disposition shown');
});

test('judge page: deep dive is separate, methodology consolidated at end',()=>{
  const T=loadDash();
  T.RPT.view="judge";const out=T.pageReports();
  assert.ok(/Interactive deep dive/.test(out),'deep-dive section present');
  assert.ok(/About this demonstration/.test(out),'methodology section present');
  assert.ok(out.indexOf('About this demonstration')>out.indexOf('Interactive deep dive'),'methodology last');
  // No old stale journey counts.
  assert.ok(!/fixed seven-step sequence/.test(out),'no stale step copy');
});

test('reports hub tile matches the new experience',()=>{
  const T=loadDash();
  T.RPT.view='hub';
  const out=T.pageReports();
  assert.ok(/Two-minute judge showcase/.test(out));
  assert.ok(/Seven timed scenes/.test(out));
  assert.ok(!/fixed seven-step sequence/.test(out),'stale copy removed');
});

test('committed sample record is a genuine browser-local artifact',()=>{
  const T=loadDash();
  const rec=JSON.parse(rd('docs/hackfw/demo-record-sample.json'));
  assert.strictEqual(rec.schemaVersion,'demo-factory-record-1.0.0');
  assert.strictEqual(rec.artifactClass,'BROWSER_LOCAL_DEMONSTRATION_RECORD_NOT_HAIEC_ISSUED');
  assert.ok(T.dfValidateRecord(rec),'production-exported record passes the hardened validator');
});
