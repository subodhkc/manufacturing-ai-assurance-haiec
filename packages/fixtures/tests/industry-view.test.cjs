'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname,'../../..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const json = p => JSON.parse(read(p));

function makeDemo(query=''){
  const listeners={};
  const window={
    HAIEC_INDUSTRY_DATA:null,
    location:{search:query,href:'https://haiec-manufacturing-demo.vercel.app/'+query},
    history:{replaceState(_state,_title,uri){window.location.href='https://haiec-manufacturing-demo.vercel.app'+uri;window.location.search=new URL(window.location.href).search;}},
    scrollTo(){},print(){window.printed=true;}
  };
  const state={page:'exec',selectedSystem:'SYS-217',selectedScenario:'HOLD',selectedWorkflow:'WF-QUALITY'};
  const pages=[],renderers={};
  const context=vm.createContext({
    window,STATE:state,PAGES:pages,PAGE_RENDERERS:renderers,
    document:{addEventListener(type,fn){listeners[type]=fn;}},
    URL,URLSearchParams,console,
    HX:{system:'SYS-217',caseId:'SYS-217-EXPECTED_BASELINE',s217case:'local',digestsDone:false,verified:{}},
    HXDATA:{exportMap:{}},
    esc:x=>String(x).replace(/[&<>"']/g,a=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[a])),
    render(){},
  });
  vm.runInContext(read('dashboard/data/industry-profiles.js'),context,{timeout:2000});
  let html='';
  context.render=()=>{if(renderers[state.page])html=renderers[state.page]();};
  vm.runInContext(read('dashboard/industry/industry.js'),context,{timeout:2000});
  state.page='industry';context.render();
  return {window,state,pages,renderers,listeners,context,get html(){return html;}};
}

test('generated bundle matches versioned repo sources exactly',()=>{
  assert.match(execFileSync(process.execPath,['scripts/build-industry-data.cjs','--check'],{cwd:root,encoding:'utf8'}),/parity: OK/);
  const p=makeDemo().window.HAIEC_INDUSTRY_DATA.profiles;
  assert.equal(p.length,6);
  assert.deepEqual(Array.from(p,x=>x.industryId),['manufacturing','telecom','electrical','rail','electronics','supplier']);
});

test('telecom reference retains AL labels but does not fabricate a canonical evaluation',()=>{
  const d=makeDemo('?industry=telecom');
  assert.equal(d.state.page,'industry');
  assert.match(d.html,/HISTORICAL TM FORUM REFERENCE/);
  assert.match(d.html,/AL0/);
  assert.match(d.html,/AL1/);
  assert.match(d.html,/AL2/);
  assert.match(d.html,/No canonical HAIEC telecom evaluation/);
  assert.doesNotMatch(d.html,/bce94772-df56/);
  assert.match(d.html,/AL0\/AL1\/AL2 are declared scenario states/);
  d.listeners.click({target:{closest:()=>({dataset:{indState:'AL2'}})}});
  assert.match(d.html,/a3f2c1e9/);
  assert.match(d.html,/A hash disagreement alone does not establish tampering/);
  assert.doesNotMatch(d.html,/RECEIPT_BOUND/);
});

test('profile switching clears stale case, system, run and query identifiers atomically',()=>{
  const d=makeDemo('?industry=telecom&case=STALE&org=private-org');
  d.listeners.change({target:{id:'ind-sector',value:'rail'}});
  assert.equal(d.state.selectedSystem,null);
  assert.equal(d.state.selectedScenario,null);
  assert.equal(d.context.HX.caseId,null);
  assert.equal(d.context.HX.system,null);
  assert.equal(d.context.HX.s217case,null);
  assert.equal(new URL(d.window.location.href).searchParams.has('case'),false);
  assert.equal(new URL(d.window.location.href).searchParams.has('org'),false);
  assert.match(d.html,/Example Rail Operations/);
  assert.match(d.html,/SIMULATION ONLY/);
  assert.doesNotMatch(d.html,/bce94772-df56/);
  assert.doesNotMatch(d.html,/Sample Master Assurance Report/);
});

test('all four sector stories remain scoped to genuine fictional source events',()=>{
  const d=makeDemo();
  const data=d.window.HAIEC_INDUSTRY_DATA.profiles;
  for(const industry of ['electrical','rail','electronics','supplier']){
    d.listeners.change({target:{id:'ind-sector',value:industry}});
    const p=data.find(x=>x.industryId===industry);
    const native=json('data/source-native/v3.1/profiles/'+p.profileId+'/events.json');
    assert.equal(p.evaluationId,null);
    assert.equal(p.evidenceMode,'SIMULATION_ONLY');
    assert.equal(p.events.length,native.events.length);
    assert.ok(p.riskCases.length>=3);
    for(const ev of native.events)assert.ok(d.html.includes(ev.detail),'Missing '+ev.eventId);
    assert.match(d.html,/NOT AN ISSUED HAIEC MASTER ASSURANCE REPORT/);
    assert.match(d.html,/NOT VERIFIED/);
    assert.doesNotMatch(d.html,/haiec_get_master_report/);
  }
});

test('manufacturing only links back to evaluated-synthetic source, with integrity gating',()=>{
  const d=makeDemo();
  assert.match(d.html,/VERIFYING \/ UNAVAILABLE/);
  assert.match(d.html,/Open 9-system HAIEC Assurance/);
  assert.match(d.html,/New v3.1 source inputs/);
  assert.match(d.html,/NOT YET EVALUATED/);
});

test('audience selector changes explanatory lens; print is a direct user action',()=>{
  const d=makeDemo('?industry=telecom');
  d.listeners.change({target:{id:'ind-audience',value:'auditor'}});
  assert.match(d.html,/AUDITOR VIEW:/);
  assert.match(d.html,/Audit: distinguish canonical/);
  d.listeners.click({target:{closest:s=>s==='[data-ind-print]'?{}:null}});
  assert.equal(d.window.printed,true);
});

test('static HTML registers industry module without changing canonical evaluator',()=>{
  const html=read('dashboard/index.html');
  assert.match(html,/src="industry\/industry.js"/);
  assert.match(html,/src="data\/industry-profiles.js"/);
  assert.match(html,/href="industry\/industry.css"/);
  assert.doesNotMatch(read('dashboard/industry/industry.js'),/fetch\s*\(/);
  assert.doesNotMatch(read('dashboard/industry/industry.js'),/POST\s+\/api/);
});
