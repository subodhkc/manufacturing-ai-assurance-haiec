'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const ROOT=path.join(__dirname,'../../..');
const js=fs.readFileSync(path.join(ROOT,'dashboard/tour/ux-hackfw-guide-phase2.js'),'utf8');
const main=fs.readFileSync(path.join(ROOT,'dashboard/index.html'),'utf8');
function setup(start) {
  const events={}; const copied=[]; const spoken=[]; const historyCalls=[];
  let url=new URL(start||'https://manufacturing.haiec.com/?report=s217');
  const voices={cancel(){spoken.push('stop');},speak(value){spoken.push(value.text);}};
  const notes=[],panels=[];
  const SCENES=[
    {id:'platform',heading:'Platform',points:['Understand authority'],page:'exec'},
    {id:'mes',heading:'MES simulation',points:['Held write'],page:'factory'},
    {id:'erp',heading:'ERP simulation',points:['Held supplier'],page:'factory'},
    {id:'wrong-target',heading:'Evidence',points:['Approved target','Recorded target'],page:'reports'}
  ];
  const state={mode:null,index:0,notes:false};
  const guide={state,quick:['platform','wrong-target','mes','erp'],full:['platform','mes','erp','wrong-target'],scenes:SCENES,
    openAt(mode,id){historyCalls.push('openAt:'+mode+':'+id);state.mode=mode;state.index=this[mode].indexOf(id);return state.index>=0;},
    syncScene(mode,id){historyCalls.push('sync:'+mode+':'+id);state.mode=mode;state.index=this[mode].indexOf(id);return state.index>=0;},
    exit(){historyCalls.push('exit');state.mode=null;}
  };
  const window={
    HAIEC_GUIDE:guide,
    get location(){return url;},
    speechSynthesis:voices,
    SpeechSynthesisUtterance:function(text){this.text=text;this.rate=1;this.lang='en-US';},
    history:{state:{__haiecNavigationV1:true,index:1},
      replaceState(value,title,target){this.state=value;url=new URL(target,url.href);historyCalls.push('replace:'+url.search);},
      pushState(value,title,target){this.state=value;url=new URL(target,url.href);historyCalls.push('push:'+url.search);}
    },
    addEventListener(kind,fn){(events[kind] ||= []).push(fn);},
    prompt() {}
  };
  const doc={
    createElement(kind){return {kind,innerHTML:'',className:'',setAttribute(){},remove(){}};},
    querySelector(){return null;},
    addEventListener(kind,fn){(events[kind] ||= []).push(fn);}
  };
  const navigator={clipboard:{writeText(text){copied.push(text);return Promise.resolve();}}};
  vm.runInNewContext(js,{window,document:doc,navigator,URL,URLSearchParams}, {filename:'ux-hackfw-guide-phase2.js'});
  const ext=window.HAIEC_GUIDE_EXT;
  function choose(mode,id){state.mode=mode;state.index=guide[mode].indexOf(id);return SCENES.find(s=>s.id===id);}
  function click(action){const target={closest(){return {getAttribute(){return action;}}}};const e={target,preventDefault(){},stopPropagation(){}};events.click[0](e);}
  function pop(){for(const fn of events.popstate||[])fn({state:window.history.state});}
  return {window,guide,state,ext,choose,notes,panels,spoken,copied,historyCalls,click,pop,
    render(scene) {
      const panel={children:[],querySelector(){return null;},appendChild(child){this.children.push(child);}};
      ext.onRender(panel,state,scene);
      return panel.children[0].innerHTML;
    }};
}

test('phase two source and styles load after base tour, preserving source modules',()=>{
  assert.ok(main.includes('src="tour/ux-hackfw-guide-phase2.js"'));
  assert.ok(main.indexOf('src="tour/ux-hackfw-guide-phase2.js"') > main.indexOf('src="tour/ux-hackfw-guide.js"'));
  assert.ok(main.includes('href="tour/ux-hackfw-guide-phase2.css"'));
  assert.ok(js.includes('No assurance evaluations'));
  assert.ok(!js.includes('hxVerifyAll('));
});

test('bookmarked scene restores the correct mode and scene on page reload',()=>{
  const a=setup('https://manufacturing.haiec.com/?report=s217&tour=quick&scene=wrong-target');
  assert.ok(a.historyCalls.includes('openAt:quick:wrong-target'));
  assert.equal(a.state.index,1);
});

test('scene link retains the report route and the correct scene identifier',()=>{
  const a=setup();const s=a.choose('quick','wrong-target');
  a.ext.onSceneChange(a.state,s);
  const u=a.window.location;
  assert.equal(u.searchParams.get('report'),'s217');
  assert.equal(u.searchParams.get('tour'),'quick');
  assert.equal(u.searchParams.get('scene'),'wrong-target');
  a.click('copy');
  assert.equal(a.copied.length,1);
  assert.ok(a.copied[0].includes('scene=wrong-target'));
});

test('consecutive scenes on the same dashboard page become separate Back entries',()=>{
  const a=setup('https://manufacturing.haiec.com/?view=factory');
  a.ext.onSceneChange(a.state,a.choose('full','mes'));
  a.ext.onSceneChange(a.state,a.choose('full','erp'));
  assert.equal(a.historyCalls.filter(x=>x.startsWith('push:')).length,1);
  assert.equal(a.window.location.searchParams.get('scene'),'erp');
  a.ext.onExit();
  assert.equal(a.window.location.searchParams.has('tour'),false);
});

test('technical links use existing routes in new tabs and provide a long talk track',()=>{
  const a=setup();const s=a.choose('quick','wrong-target');a.state.notes=true;
  const markup=a.render(s);
  assert.match(markup,/s217-tech/);
  assert.match(markup,/target="_blank"/);
  assert.match(markup,/Technical deep dives/);
  const note={innerHTML:''};
  const panel={querySelector(selector){return selector==='.ux-hackfw-notes'?note:null;},appendChild(){}};
  a.ext.onRender(panel,a.state,s);
  assert.match(note.innerHTML,/Talk track/);
  assert.match(note.innerHTML,/identifies|detected/i);
  assert.match(note.innerHTML,/Transition/);
});

test('voice narration is opt-in, stops on exit and can be manually triggered',()=>{
  const a=setup();a.choose('quick','wrong-target');
  a.ext.onSceneChange(a.state,a.guide.scenes[3]);
  assert.equal(a.spoken.filter(x=>x!=='stop').length,0);
  a.click('narrate');
  assert.equal(a.spoken.filter(x=>x!=='stop').length,1);
  a.ext.onExit();
  assert.equal(a.window.location.searchParams.has('scene'),false);
});

test('browser Back synchronizes guide scene without executing actions',()=>{
  const a=setup();a.choose('quick','erp');
  a.window.history.replaceState(a.window.history.state,'','/?view=factory&tour=quick&scene=mes');
  a.pop();
  assert.ok(a.historyCalls.includes('sync:quick:mes'));
  assert.equal(a.state.index,2);
});
