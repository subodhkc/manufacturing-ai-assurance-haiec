'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'../../..');
const script=fs.readFileSync(path.join(root,'dashboard/journey/journey.js'),'utf8');
const htmlSrc=fs.readFileSync(path.join(root,'dashboard/index.html'),'utf8');
const real=JSON.parse(fs.readFileSync(path.join(root,'data/evaluations/sys-217-wrong-target.json'),'utf8'));
const CASE='SYS-217-WRONG_TARGET';
const escape=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function setup(verified=true,loaded=true){
 const listeners={},pages=[],renderers={};
 const STATE={page:'journey'};
 const HX={digestsDone:loaded,verified:{[CASE]:verified},replayVerified:false};
 const HXDATA={exportMap:{[CASE]:real},replay:null};
 let html='';
 const ctx=vm.createContext({
   STATE,PAGES:pages,PAGE_RENDERERS:renderers,HX,HXDATA,
   window:{location:{search:''}},
   URLSearchParams,
   document:{addEventListener:(type,fn)=>{listeners[type]=fn}},
   esc:escape,
   render(){if(STATE.page==='journey')html=renderers.journey();}
 });
 vm.runInContext(script,ctx,{timeout:1500});
 function send(kind,id){
   listeners.click({target:{closest(sel){
     if(sel==='[data-oj-step]')return kind==='step'?{dataset:{ojStep:id}}:null;
     if(sel==='[data-oj]')return kind==='action'?{dataset:{oj:id}}:null;
     return null;
   }}});
 }
 return{send,ctx,HX,STATE,get html(){return html}};
}
test('journey is registered once and linked from the command center',()=>{
 const t=setup();
 assert.equal(t.ctx.PAGES.filter(p=>p.id==='journey').length,1);
 assert.match(htmlSrc,/data-id="journey">Operator Journey/);
 assert.match(htmlSrc,/journey\/journey.css/);
 assert.match(htmlSrc,/journey\/journey.js/);
 assert.match(htmlSrc,/STATE.page==='journey'\)render\(\)/);
});
test('historical finding uses actual frozen canonical status, never simulated pass',()=>{
 const t=setup();
 assert.match(t.html,/MFG-EFF-001/);
 assert.match(t.html,/WO-217-4802/);
 assert.match(t.html,/WO-217-4803/);
 assert.match(t.html,/MATCH/);
 assert.match(t.html,/REVIEW/);
 assert.match(t.html,/PERSISTED HAIEC/);
 assert.match(t.html,/RESPONSE REHEARSAL · NOT LIVE/);
});
test('investigate never upgrades Four Assurance Questions observed projection',()=>{
 const t=setup();
 t.send('step','investigate');
 assert.match(t.html,/NOT_ASSESSED/);
 assert.match(t.html,/INSUFFICIENT_SOURCE/);
 assert.match(t.html,/COLLECTOR_CONTINUITY/);
 assert.match(t.html,/rule outcomes/);
});
test('authorization step explicitly does not create a new approval',()=>{
 const t=setup();
 t.send('step','authorize');
 assert.match(t.html,/RESPONSE APPROVAL NOT EVALUATED/);
 assert.match(t.html,/must approve exact scope/);
 assert.match(t.html,/cannot issue response approval/);
});
test('simulated pause and denial remain local and separate from frozen evaluation',()=>{
 const digest=real.exportDigest,evalId=real.evaluation.evaluationId;
 const t=setup();
 t.send('step','contain');
 assert.match(t.html,/NOT CONNECTED/);
 t.send('action','pause');
 assert.match(t.html,/PAUSED IN BROWSER/);
 t.send('action','attempt');
 assert.match(t.html,/SIMULATED_DENY/);
 t.send('step','verify');
 assert.match(t.html,/RECEIPT_BOUND/);
 assert.match(t.html,/SATISFIED/);
 assert.match(t.html,/INDEPENDENT RESPONSE WITNESS · NOT ESTABLISHED/);
 assert.match(t.html,/1 local attempts denied/);
 assert.equal(real.exportDigest,digest);
 assert.equal(real.evaluation.evaluationId,evalId);
 t.send('step','contain');
 t.send('action','reset');
 assert.match(t.html,/NOT PAUSED IN BROWSER/);
 assert.doesNotMatch(t.html,/SIMULATED_DENY/);
});
test('verification gate withholds authority-bearing content on integrity failure',()=>{
 const t=setup(false,true);
 assert.match(t.html,/INTEGRITY FAILURE/);
 assert.doesNotMatch(t.html,/WO-217-4803/);
 const u=setup(true,false);
 assert.match(u.html,/Verifying historical evaluation export/);
 assert.doesNotMatch(u.html,/WO-217-4803/);
});
test('report view binds exact ID and treats response as separate non-issued record',()=>{
 const t=setup();
 t.send('step','report');
 assert.ok(t.html.includes(real.evaluation.evaluationId));
 assert.match(t.html,/The response rehearsal is not part of evaluation/);
 assert.match(t.html,/Open public SYS-217 report/);
 assert.match(t.html,/No qualified post-control containment/);
 assert.doesNotMatch(t.html,/OWASP Compliant/);
});
test('industry and journey share only the shell; no browser writes or pseudo-signed receipt',()=>{
 assert.doesNotMatch(script,/\bfetch\s*\(/);
 assert.doesNotMatch(script,/localStorage|sessionStorage|XMLHttpRequest|\/api\/kill-switch/);
 assert.doesNotMatch(script,/STATE\.mes\./);
 assert.match(script,/SIMULATED_DENY/);
 assert.match(script,/PERSISTED HAIEC/);
});
