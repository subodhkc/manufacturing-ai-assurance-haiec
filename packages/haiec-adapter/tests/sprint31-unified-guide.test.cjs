'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const ROOT=path.join(__dirname,'../../..');
const code=fs.readFileSync(path.join(ROOT,'dashboard/tour/ux-hackfw-guide.js'),'utf8');
const html=fs.readFileSync(path.join(ROOT,'dashboard/index.html'),'utf8');

function setup() {
  const events={}; const calls=[]; const nodes=[];
  const STATE={page:'exec',selectedScenario:'HOLD',simValue:null,requests:[]};
  const RPT={view:'hub',caseId:null,notice:null,s217mode:'exec'};
  const window={RPT,location:{href:'https://manufacturing.haiec.com/'},scrollY:0,
    history:{state:{__haiecNavigationV1:true,index:0},pushState(s,unused,url){this.state=s;calls.push(['push',url]);},
      replaceState(s){this.state=s;}},scrollTo(){},requestAnimationFrame(fn){fn();}};
  const document={body:{appendChild(el){nodes.push(el);}},head:{},querySelector(sel){
    if(sel.indexOf('#main ')===0)return null;
    if(sel.indexOf('data-act="df-mes-write"')>=0)return {click(){calls.push(['mes','action']);}};
    if(sel.indexOf('data-act="df-advisory"')>=0)return {click(){calls.push(['advisory','action']);}};
    if(sel.indexOf('data-act="df-po"')>=0)return {click(){calls.push(['po',sel]);}};
    return null;
  },createElement(tag){return {tagName:tag,innerHTML:'',hidden:false,classList:{add(){},remove(){}},setAttribute(){},querySelector(){return null;},remove(){},};},
   addEventListener(type,fn){(events[type] ||= []).push(fn);}};
  let renders=0;
  const nav={snapshot(){return {page:STATE.page,system:'SYS-217',tab:null,
    reportView:STATE.page==='reports'?RPT.view:null,
    reportCase:STATE.page==='reports'?RPT.caseId:null,
    reportMode:STATE.page==='reports'?RPT.s217mode:null,scroll:0};},
    urlFor(s){return s.page==='reports'?'/?report='+s.reportView:'/?view='+s.page;}};
  window.HAIEC_NAV=nav;
  const context=vm.createContext({window,document,STATE,URL,URLSearchParams,render(){renders++;}});
  vm.runInContext(code,context,{filename:'ux-hackfw-guide.js'});
  return {guide:window.HAIEC_GUIDE,STATE,RPT,calls,events,renders:()=>renders};
}

test('entry points use one launcher and the existing judge/factory experiences are retained',()=>{
  assert.match(html,/data-ux-tour="launch">Start guided experience/);
  assert.match(html,/data-ux-tour="deep">Factory deep dive/);
  assert.match(html,/src="tour\/ux-hackfw-guide.js"/);
  assert.match(html,/href="tour\/ux-hackfw-guide.css"/);
  assert.match(html,/data-act="df-guide-start"/);
  assert.ok(!html.includes('<button class="btn sm" data-act="tour">'));
});

test('full mode has ten real, ordered dashboard scenes; quick preset has five',()=>{
  const x=setup();
  assert.equal(x.guide.full.length,10);
  assert.equal(x.guide.quick.length,5);
  assert.deepEqual(Array.from(x.guide.scenes.map(s=>s.page)),[
    'exec','estate','reports','workflows','lab','factory','factory','monitor','reports','setup']);
  assert.deepEqual(Array.from(x.guide.quick),['platform','wrong-target','mes','erp','proof']);
});

test('next/previous changes navigation but does not execute any factory scenario',()=>{
  const x=setup();x.guide.open('quick');
  assert.equal(x.STATE.page,'exec');
  x.guide.advance(1);
  assert.equal(x.STATE.page,'reports');
  assert.equal(x.RPT.view,'s217');
  x.guide.advance(1);
  assert.equal(x.STATE.page,'factory');
  assert.equal(x.calls.some(c=>['mes','po','advisory'].includes(c[0])),false);
  x.guide.advance(-1);
  assert.equal(x.RPT.view,'s217');
});

test('explicit MES and ERP actions reuse existing dashboard controls',()=>{
  const x=setup();x.guide.open('quick');x.guide.advance(1);x.guide.advance(1);
  x.guide.action('mes');
  assert.equal(x.calls.filter(c=>c[0]==='mes').length,1);
  x.guide.action('mes');
  assert.equal(x.calls.filter(c=>c[0]==='mes').length,1);
  x.guide.advance(1);
  x.guide.action('expired');
  x.guide.action('qualified');
  assert.equal(x.calls.filter(c=>c[0]==='po').length,2);
});

test('canonical evidence remains read-only and original seven-step guide is referenced',()=>{
  assert.ok(!code.includes('HXDATA.exportMap='));
  assert.ok(!code.includes('hxVerifyAll('));
  assert.ok(code.includes("typeof dfGuideStart==='function'"));
  assert.ok(code.includes('data-ux-tour="deep"'));
  assert.ok(code.includes('read-only'));
});
