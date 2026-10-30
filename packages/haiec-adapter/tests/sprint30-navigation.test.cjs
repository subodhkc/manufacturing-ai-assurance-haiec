'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname,'../../../dashboard/navigation.js'),'utf8');

function mount(startUrl) {
  const origin = 'https://manufacturing.haiec.com';
  const location = { href:'', pathname:'', search:'', hash:'' };
  let current = 0;
  const entries = [{ url:new URL(startUrl || '/',origin).href, data:null }];
  const events = {}, jobs = [];
  const STATE = { page:'exec', selectedSystem:'SYS-217',systemTab:'overview',selectedWorkflow:'WF-QUALITY' };
  const RPT = { view:'hub', caseId:null, s217mode:'exec' };
  const renderers = Object.fromEntries(['exec','estate','system','reports','factory','overview','workflows','lab'].map(k=>[k,()=>{}]));
  function setLocation(u) {
    const next = new URL(u,origin);
    location.href=next.href;location.pathname=next.pathname;
    location.search=next.search;location.hash=next.hash;
  }
  setLocation(entries[0].url);
  const history = {
    get state() { return entries[current].data; },
    replaceState(data,unused,url) {
      entries[current]={data,url:new URL(url,location.href).href};
      setLocation(entries[current].url);
    },
    pushState(data,unused,url) {
      entries.splice(current+1);
      entries.push({data,url:new URL(url,location.href).href});
      current++;setLocation(entries[current].url);
    },
    back() {
      if (!current) return;
      current--;setLocation(entries[current].url);
      for (const fn of events.popstate || []) fn({state:history.state});
    },
    forward() {
      if (current>=entries.length-1) return;
      current++;setLocation(entries[current].url);
      for (const fn of events.popstate || []) fn({state:history.state});
    }
  };
  const window = {
    location,history,RPT,scrollY:0,
    setTimeout(fn){jobs.push(fn);},
    requestAnimationFrame(fn){fn();},
    scrollTo(){},
    addEventListener(name,fn){(events[name] ||= []).push(fn);}
  };
  const document = {
    getElementById(){return null;},
    createElement(){return {textContent:'',setAttribute(){}};},
    head:{appendChild(){}},
    addEventListener(name,fn){(events[name] ||= []).push(fn);}
  };
  const context = vm.createContext({STATE,window,document,URL,URLSearchParams,PAGE_RENDERERS:renderers,render(){}});
  vm.runInContext(source,context,{filename:'dashboard/navigation.js'});
  function click(change,alreadyPushedUrl) {
    const target = {closest(selector) {
      if (selector === '.haiec-navigation') return null;
      return {closest(){return null;}};
    }};
    const evt={target};
    // Capture listener runs before existing navigation or report handlers.
    events.click[0](evt);
    change();
    if (alreadyPushedUrl) history.pushState(null,'',alreadyPushedUrl);
    while(jobs.length) jobs.shift()();
  }
  return {STATE,RPT,history,location,entries,window,click};
}

test('dashboard Back and Forward restore the originating screen and selected system tab',()=>{
  const a=mount('/');
  a.click(()=>{a.STATE.page='estate';});
  assert.equal(new URL(a.location.href).searchParams.get('view'),'estate');
  a.click(()=>{a.STATE.page='system';a.STATE.systemTab='agents';});
  let url=new URL(a.location.href);
  assert.equal(url.searchParams.get('view'),'system');
  assert.equal(url.searchParams.get('system'),'SYS-217');
  assert.equal(url.searchParams.get('tab'),'agents');
  a.history.back();
  assert.equal(a.STATE.page,'estate');
  a.history.forward();
  assert.equal(a.STATE.page,'system');
  assert.equal(a.STATE.systemTab,'agents');
});

test('report module pushState is not duplicated and leaving a report clears stale report query',()=>{
  const a=mount('/');
  a.click(()=>{a.STATE.page='estate';});
  a.click(()=>{
    a.STATE.page='reports';
    a.RPT.view='case';
    a.RPT.caseId='SYS-217-WRONG_TARGET';
  },'/?report=case%3ASYS-217-WRONG_TARGET');
  assert.equal(a.entries.length,3);
  let url=new URL(a.location.href);
  assert.equal(url.searchParams.get('report'),'case:SYS-217-WRONG_TARGET');
  a.click(()=>{a.STATE.page='factory';});
  url=new URL(a.location.href);
  assert.equal(url.searchParams.has('report'),false);
  assert.equal(url.searchParams.get('view'),'factory');
  a.history.back();
  assert.equal(a.STATE.page,'reports');
  assert.equal(a.RPT.view,'case');
  assert.equal(a.RPT.caseId,'SYS-217-WRONG_TARGET');
  a.history.back();
  assert.equal(a.STATE.page,'estate');
});

test('direct links can be restored without a previous in-app entry',()=>{
  const a=mount('/?view=system&system=SYS-217&tab=agents');
  assert.equal(a.STATE.page,'system');
  assert.equal(a.STATE.systemTab,'agents');
  assert.equal(a.history.state.index,0);
  a.window.HAIEC_NAV.returnBack();
  assert.equal(a.STATE.page,'exec');
  assert.equal(new URL(a.location.href).searchParams.get('view'),'exec');
});

test('no history entry is created by a simulated factory action',()=>{
  const a=mount('/');
  a.click(()=>{a.STATE.page='factory';});
  const count=a.entries.length;
  a.click(()=>{a.STATE.simulatedContained=40;});
  assert.equal(a.entries.length,count);
});
