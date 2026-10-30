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
  const window={RPT,location:{href:'https://manufacturing.haiec.com/'},scrollY:0,innerWidth:1200,innerHeight:800,addEventListener(){},
    history:{state:{__haiecNavigationV1:true,index:0},pushState(s,unused,url){this.state=s;calls.push(['push',url]);},
      replaceState(s){this.state=s;}},scrollTo(){},requestAnimationFrame(fn){fn();}};
  const document={body:{appendChild(el){nodes.push(el);}},head:{},querySelector(sel){
    if(sel.indexOf('#main ')===0)return null;
    if(sel.indexOf('data-act="df-mes-write"')>=0)return {click(){calls.push(['mes','action']);}};
    if(sel.indexOf('data-act="df-advisory"')>=0)return {click(){calls.push(['advisory','action']);}};
    if(sel.indexOf('data-act="df-po"')>=0)return {click(){calls.push(['po',sel]);}};
    return null;
  },createElement(tag){
    const handlers={};const classes=new Set();
    const element={tagName:tag,innerHTML:'',hidden:false,style:{},handlers,classes,
      classList:{add(name){classes.add(name);},remove(name){classes.delete(name);},toggle(name,on){if(on)classes.add(name);else classes.delete(name);}},
      setAttribute(){},querySelector(){return null;},remove(){},
      addEventListener(kind,fn){(handlers[kind] ||= []).push(fn);},
      getBoundingClientRect(){return {left:Number.parseFloat(element.style.left)||800,top:Number.parseFloat(element.style.top)||450,width:360,height:260};},
      setPointerCapture(){},hasPointerCapture(){return false;}
    };return element;
  },
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
  return {guide:window.HAIEC_GUIDE,STATE,RPT,calls,events,nodes,renders:()=>renders};
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


test('minimize preserves scene, explicit action completion and previous/next position',()=>{
  const x=setup();x.guide.open('quick');
  x.guide.advance(1);x.guide.advance(1);
  x.guide.action('mes');
  const before=x.guide.state.index;
  const actionCalls=x.calls.filter(c=>c[0]==='mes').length;
  x.guide.minimize();
  assert.equal(x.guide.state.minimized,true);
  assert.equal(x.guide.state.index,before);
  assert.equal(x.guide.state.done.mes,true);
  assert.ok(x.nodes[0].classes.has('is-minimized'));
  assert.match(x.nodes[0].innerHTML,/TOUR PAUSED/);
  assert.match(x.nodes[0].innerHTML,/Resume/);
  x.guide.resume();
  assert.equal(x.guide.state.minimized,false);
  assert.equal(x.guide.state.index,before);
  assert.equal(x.guide.state.done.mes,true);
  assert.equal(x.calls.filter(c=>c[0]==='mes').length,actionCalls);
  assert.ok(!x.nodes[0].classes.has('is-minimized'));
  x.guide.advance(1);
  assert.equal(x.guide.state.index,before+1);
});

test('pointer dragging moves the tour window within the viewport, but not via a button',()=>{
  const x=setup();x.guide.open('quick');
  const panel=x.nodes[0];
  const headerTarget={closest(selector){return selector==='.ux-hackfw-guide-head'?{}:null;}};
  for(const fn of panel.handlers.pointerdown || [])fn({target:headerTarget,pointerId:1,pointerType:'mouse',button:0,clientX:850,clientY:520,preventDefault(){}});
  for(const fn of panel.handlers.pointermove || [])fn({pointerId:1,clientX:550,clientY:280,preventDefault(){}});
  assert.equal(panel.style.left,'500px');
  assert.equal(panel.style.top,'210px');
  for(const fn of panel.handlers.pointerup || [])fn({pointerId:1});
  const left=panel.style.left;
  const buttonTarget={closest(selector){if(selector==='.ux-hackfw-guide-head')return {};if(selector==='button,a,input,select,textarea')return {};return null;}};
  for(const fn of panel.handlers.pointerdown || [])fn({target:buttonTarget,pointerId:2,pointerType:'mouse',button:0,clientX:550,clientY:280,preventDefault(){}});
  for(const fn of panel.handlers.pointermove || [])fn({pointerId:2,clientX:200,clientY:280,preventDefault(){}});
  assert.equal(panel.style.left,left);
});
