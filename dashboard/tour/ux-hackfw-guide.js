/* UX-HACKFW-GUIDE-01: presenter-led tour of the existing dashboard.
 * Navigation and captions only: verified HAIEC exports remain read-only.
 * MES, ERP and monitoring actions reuse the existing browser-local fixture UI.
 */
(function () {
  'use strict';
  if (typeof STATE === 'undefined' || typeof render !== 'function' || !window.HAIEC_NAV) return;

  var SCENES = [
    {id:'platform',page:'exec',heading:'AI assurance starts with consequences.',
      section:'See / Executive Command Center',kind:'HAIEC platform',
      points:['Understand what AI systems can reach and affect.','Assure conclusions against qualified evidence.','Govern consequential operations with accountable decisions.'],
      note:'HAIEC is the Human AI Evidence Company. Manufacturing is one reference environment, not a separate product.',
      focus:['.ex-cap','.ex-strip','.ex-grid']},
    {id:'estate',page:'estate',heading:'Understand the full AI operating estate.',
      section:'See / AI Estate',kind:'Synthetic manufacturing estate',
      points:['Nine reference AI systems support different manufacturing functions.','Every system has its own agents, actions and authority boundaries.','Follow the torque quality workflow to Station 217.'],
      note:'Explain the importance of inventory, ownership and potential consequence before discussing model scores.',
      focus:['.tblwrap','.card']},
    {id:'wrong-target',page:'reports',report:'s217',heading:'The API succeeded. The business action was wrong.',
      section:'Prove / Station 217 flagship',kind:'Persisted HAIEC evaluation',
      points:['Approved target: WO-217-4802. Recorded target: WO-217-4803.','MFG-EFF-001 MATCH identifies a qualified target divergence.','R01 SATISFIED is a scoped witness; the overall disposition is REVIEW.'],
      note:'Say detected, not prevented. The original target mismatch was assessed by the HAIEC deterministic engine over synthetic source evidence.',
      focus:['.rp-exec-p1','.rp-sec','.rp-grid','.hero']},
    {id:'authority',page:'workflows',heading:'Permission is not delegated authority.',
      section:'See / Workflows & Authority',kind:'Reference authority model',
      points:['The operation and exact target must both be permitted.','Scope, magnitude and approver change the operating boundary.','A downstream workflow does not automatically inherit wider authority.'],
      note:'Point to the six workflow steps and nine delegated-action dimensions.',
      focus:['.flow','.grid.g3','.card']},
    {id:'decision',page:'lab',heading:'Let bounded work proceed. Escalate larger actions.',
      section:'Act / Decision Lab',kind:'Interactive local simulation',
      points:['Small containment actions may proceed automatically.','A 40-engine quality hold requires a human review in this fixture.','The reviewer must have the correct role for the exact action.'],
      note:'The Run button is deliberate. Advancing the tour alone never submits a request.',
      focus:['#scenario-value','.card','.hero'],
      actions:[['hold40','Run 40-engine containment'],['review40','Open pending quality review']]},
    {id:'mes',page:'factory',heading:'Govern what an AI may write to the MES.',
      section:'See / Digital Factory / MES',kind:'Interactive local simulation',
      points:['The earlier HAIEC evaluation detected the original recorded mismatch.','This later simulated direct MES write is held at the local boundary.','A permitted advisory note can still proceed.'],
      note:'Do not claim the historical wrong-target effect was blocked. This is a separate demonstration.',
      focus:['.df-grid .df-panel:nth-child(1)','#df-wo-WO-217-4802','.df-grid'],
      actions:[['mes','Attempt MES write'],['advisory','Issue permitted advisory']]},
    {id:'erp',page:'factory',heading:'Financial authority and supplier qualification are independent.',
      section:'See / Digital Factory / ERP',kind:'Interactive local simulation',
      points:['The expired-supplier PO stays held after buyer approval.','The qualified-supplier PO can commit with the required buyer approval.','Both outcomes follow the same fixture policy and ledger.'],
      note:'To show final outcomes, open the generated review and approve as Authorized Buyer. Do not confuse financial approval with supplier eligibility.',
      focus:['.df-grid .df-panel:nth-child(2)','.df-grid'],
      actions:[['expired','Request expired-supplier PO'],['reviewExpired','Review expired-supplier PO'],['qualified','Request qualified-supplier PO'],['reviewQualified','Review qualified-supplier PO']]},
    {id:'monitor',page:'monitor',heading:'A missing signal is not evidence of safety.',
      section:'Act / Monitoring',kind:'Interactive local simulation',
      points:['Review requests and actions are recorded with their outcomes.','Virtual equipment can generate a torque anomaly and a signal interruption.','Missing telemetry must remain visible as a coverage gap.'],
      note:'The monitoring module shows recorded local state, not a connected production sensor.',
      focus:['.grid.g4','.grid.g2','.card'],
      actions:[['anomaly','Record torque anomaly'],['signal','Interrupt virtual source signal']]},
    {id:'proof',page:'reports',report:'hub',heading:'The evidence must outlive the demo.',
      section:'Prove / Reports & Evidence',kind:'Canonical reports and demonstration records',
      points:['45 persisted v3 evaluations cover nine systems and five evidence states.','Rule-level proof and REVIEW dispositions remain inspectable.','Browser-local operating records are labeled separately from issued evaluations.'],
      note:'Show a canonical report, then distinguish digest-verified evidence from exported local simulator activity.',
      focus:['.rp-grid','.rp-tile','.rp-sec','.tblwrap','.hero']},
    {id:'connect',page:'setup',heading:'Connect real sources to evaluate real consequences.',
      section:'Connect / Connections & Setup',kind:'Customer proof-of-concept path',
      points:['Bind AI source, identity, granted authority and downstream effect evidence.','Run bounded source-qualified evaluations before release decisions.','Know what AI can do. Govern what it may do. Verify what happened.'],
      note:'The HackFW environment uses synthetic evidence; a customer POC would require real source qualification and effect witnesses.',
      focus:['.grid.g2','.field','.card']}
  ];
  var PRESETS = {quick:['platform','wrong-target','mes','erp','proof'],full:SCENES.map(function (s) { return s.id; })};
  var state = {mode:null,index:0,done:{},session:null,notes:false};
  var overlay=null,launcher=null,lit=null;
  var lastEventUrl=window.location.href;

  function esc(v) {return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function steps(){return PRESETS[state.mode] || [];}
  function scene(){var id=steps()[state.index];return SCENES.find(function(s){return s.id===id;});}
  function snapshot(){return window.HAIEC_NAV.snapshot();}
  function navRoute(s) {
    var before=snapshot(),item=window.history.state,index=item&&item.__haiecNavigationV1?item.index:0;
    // Preserve scroll and origin before switching views.
    if(item&&item.__haiecNavigationV1)window.history.replaceState(Object.assign({},item,{snapshot:before}),'',window.location.href);
    STATE.page=s.page;
    if(s.page==='lab'){STATE.selectedScenario='HOLD';STATE.simValue=40;}
    if(s.page==='reports'&&window.RPT){
      window.RPT.view=s.report||'hub';
      window.RPT.caseId=null;
      window.RPT.notice=null;
      window.RPT.s217mode='exec';
    }
    render();
    var after=snapshot(),from=JSON.stringify([before.page,before.reportView,before.reportCase,before.reportMode]),
        to=JSON.stringify([after.page,after.reportView,after.reportCase,after.reportMode]);
    if(from!==to){
      window.history.pushState({
        __haiecNavigationV1:true,index:index+1,
        backLabel:before.page==='reports'?'Reports & Evidence':before.page==='exec'?'Executive Command Center':before.page,
        snapshot:after
      },'',window.HAIEC_NAV.urlFor(after));
    }
    window.scrollTo(0,0);
  }
  function eraseFocus() {
    if(lit) {lit.classList.remove('ux-hackfw-lit');lit=null;}
  }
  function spotlight(){
    eraseFocus();
    if(!state.mode)return;
    var s=scene();
    if(!s)return;
    for(var i=0;i<s.focus.length;i++){
      var candidate=document.querySelector('#main '+s.focus[i]);
      if(candidate){lit=candidate;break;}
    }
    if(lit){
      lit.classList.add('ux-hackfw-lit');
      if(typeof lit.scrollIntoView==='function'){
        lit.scrollIntoView({behavior:'smooth',block:'center'});
      }
    }
  }
  function progress(){
    var n=steps().length;
    return '<div class="ux-hackfw-progress" aria-hidden="true">'+steps().map(function(_,i){
      return '<span class="'+(i<=state.index?'active':'')+'"></span>';
    }).join('')+'</div><div class="ux-hackfw-count">Step '+(state.index+1)+' of '+n+'</div>';
  }
  function button(text,action,disabled){
    return '<button type="button" data-ux-tour="'+action+'"'+(disabled?' disabled':'')+'>'+esc(text)+'</button>';
  }
  function renderGuide(){
    if(!state.mode){if(overlay)overlay.hidden=true;eraseFocus();return;}
    var s=scene();if(!s)return;
    if(!overlay){overlay=document.createElement('aside');overlay.className='ux-hackfw-guide';overlay.setAttribute('aria-label','HAIEC guided demonstration');document.body.appendChild(overlay);}
    overlay.hidden=false;
    if(state.session!==String(typeof DF!=='undefined'?DF.session:'none')){state.done={};state.session=String(typeof DF!=='undefined'?DF.session:'none');}
    var actions=s.actions||[];
    overlay.innerHTML='<div class="ux-hackfw-guide-head"><span>'+esc(state.mode==='quick'?'QUICK JUDGE TOUR':'FULL DASHBOARD TOUR')+'</span>'+
      button('Exit','exit',false)+'</div>'+progress()+
      '<div class="ux-hackfw-copy"><div class="ux-hackfw-location">'+esc(s.section)+'</div>'+
      '<h2>'+esc(s.heading)+'</h2><div class="ux-hackfw-kind">'+esc(s.kind)+'</div><ul>'+s.points.map(function(p){return '<li>'+esc(p)+'</li>';}).join('')+'</ul>'+
      (actions.length?'<div class="ux-hackfw-run"><div class="ux-hackfw-label">Interactive actions (optional)</div>'+
      actions.map(function(a){return button((state.done[a[0]]?'Completed: ':'')+a[1], 'act:'+a[0], !!state.done[a[0]]);}).join('')+'</div>':'')+
      '<button type="button" class="ux-hackfw-notes-toggle" data-ux-tour="notes">'+(state.notes?'Hide':'Show')+' presenter notes</button>'+
      (state.notes?'<p class="ux-hackfw-notes">'+esc(s.note)+'</p>':'')+'</div>'+
      '<div class="ux-hackfw-guide-footer">'+button('Previous','prev',state.index===0)+
      button(state.index===steps().length-1?'Finish tour':'Next', 'next',false)+'</div>';
    window.requestAnimationFrame(spotlight);
  }
  function renderLauncher(){
    if(launcher)launcher.remove();
    launcher=document.createElement('div');
    launcher.className='ux-hackfw-launcher';
    launcher.setAttribute('role','dialog');
    launcher.setAttribute('aria-modal','true');
    launcher.setAttribute('aria-label','Start guided experience');
    launcher.innerHTML='<div class="ux-hackfw-launcher-card">'+
      '<div class="ux-hackfw-launcher-top"><strong>Explore HAIEC Manufacturing</strong>'+button('Close','close',false)+'</div>'+
      '<p>Choose the depth of your presentation. All tours navigate the real dashboard; actions run only when you select them.</p>'+
      '<div class="ux-hackfw-launcher-options">'+
      '<button data-ux-tour="quick" type="button"><b>Quick Judge Tour</b><span>5 scenes · platform, Station 217, MES, ERP and proof</span></button>'+
      '<button data-ux-tour="full" type="button"><b>Full Guided Tour</b><span>10 scenes · dashboard navigation, authority, operations and reports</span></button>'+
      '<button data-ux-tour="deep" type="button"><b>Digital Factory Deep Dive</b><span>Existing 7-step guided factory demonstration</span></button>'+
      '<a href="?report=judge" aria-label="Open existing two-minute judge showcase"><b>Two-Minute Judge Showcase</b><span>Existing seven-scene reference, unchanged</span></a>'+
      '</div></div>';
    document.body.appendChild(launcher);
    var first=launcher.querySelector('button[data-ux-tour="quick"]');if(first)first.focus();
  }
  function closeLauncher(){if(launcher){launcher.remove();launcher=null;}}
  function open(mode){
    closeLauncher();eraseFocus();
    if(!PRESETS[mode])return;
    state.mode=mode;state.index=0;state.done={};state.session=null;
    navRoute(scene());renderGuide();
  }
  function deepDive(){
    closeLauncher();state.mode=null;renderGuide();
    navRoute({page:'factory'});
    if(typeof dfGuideStart==='function')dfGuideStart();
  }
  function advance(amount){
    if(!state.mode)return;
    var next=state.index+amount;
    if(next<0)return;
    if(next>=steps().length){end();return;}
    state.index=next;
    navRoute(scene());
    renderGuide();
  }
  function end(){
    state.mode=null;
    eraseFocus();
    renderGuide();
    closeLauncher();
  }
  function clickExisting(selector){
    var button=document.querySelector(selector);
    if(!button)return false;
    button.click();
    return true;
  }
  function pendingReview(target){
    var req=STATE.requests && STATE.requests.slice().reverse().find(function(r){return r.status==='PENDING'&&r.target===target;});
    if(!req || typeof openReview!=='function')return false;
    openReview(req.id);return true;
  }
  function act(id){
    var s=scene();
    if(!s||state.done[id])return;
    var ok=false;
    if(id==='hold40' && typeof runScenario==='function'){
      STATE.page='lab';STATE.selectedScenario='HOLD';STATE.simValue=40;
      var input=document.getElementById('scenario-value');
      if(input)input.value='40';
      runScenario();
      ok=true;
    }else if(id==='review40'){
      var r=STATE.requests.slice().reverse().find(function(x){return x.status==='PENDING'&&x.scenario==='HOLD';});
      if(r && typeof openReview==='function'){openReview(r.id);ok=true;}
    }else if(id==='mes'){
      ok=clickExisting('[data-act="df-mes-write"][data-id="WO-217-4802"]');
    }else if(id==='advisory'){
      ok=clickExisting('[data-act="df-advisory"][data-id="WO-217-4802"]');
    }else if(id==='expired'){
      ok=clickExisting('[data-act="df-po"][data-id="REQ-2026-8842"]');
    }else if(id==='qualified'){
      ok=clickExisting('[data-act="df-po"][data-id="REQ-2026-8855"]');
    }else if(id==='reviewExpired'){
      ok=pendingReview('REQ-2026-8842');
    }else if(id==='reviewQualified'){
      ok=pendingReview('REQ-2026-8855');
    }else if(id==='anomaly' || id==='signal'){
      if(STATE.page!=='factory'){ // Visit factory only to use its existing control.
        if(typeof dfSetMode==='function'){
          dfSetMode(id==='anomaly'?'TORQUE_ANOMALY':'SOURCE_GAP');ok=true;
        }
      }else ok=clickExisting('[data-act="df-eq"][data-id="'+(id==='anomaly'?'TORQUE_ANOMALY':'SOURCE_GAP')+'"]');
    }
    if(ok){state.done[id]=true;renderGuide();}
    else {var note=overlay&&overlay.querySelector('.ux-hackfw-action-note');if(!note&&overlay){note=document.createElement('p');note.className='ux-hackfw-action-note';overlay.appendChild(note);}if(note)note.textContent='No eligible control or pending review is available in this session.';}
  }
  document.addEventListener('click',function(event){
    var el=event.target.closest('[data-ux-tour]');
    if(!el)return;
    var a=el.getAttribute('data-ux-tour');
    event.preventDefault();event.stopPropagation();
    if(a==='launch')renderLauncher();
    else if(a==='close')closeLauncher();
    else if(a==='deep')deepDive();
    else if(a==='quick'||a==='full')open(a);
    else if(a==='next')advance(1);
    else if(a==='prev')advance(-1);
    else if(a==='exit')end();
    else if(a==='notes'){state.notes=!state.notes;renderGuide();}
    else if(a.indexOf('act:')===0)act(a.substring(4));
  });
  document.addEventListener('keydown',function(event){
    if(!state.mode||event.altKey||event.ctrlKey||event.metaKey)return;
    if(launcher || document.querySelector('.modal-shell'))return;
    var active=document.activeElement;
    if(active && (active.matches('input,textarea,select,[contenteditable="true"]')||active.closest('[role="dialog"]')))return;
    if(event.key==='ArrowRight'||event.key==='PageDown'){event.preventDefault();advance(1);}
    else if(event.key==='ArrowLeft'||event.key==='PageUp'){event.preventDefault();advance(-1);}
    else if(event.key==='Escape'){event.preventDefault();end();}
    else if(event.key===' ' && (active===document.body || active===document.documentElement)){event.preventDefault();advance(1);}
  });
  // Redraw tour panel after existing dashboard rerenders (e.g., approvals).
  var priorRender=render;
  render=function(){
    priorRender();
    if(state.mode)renderGuide();
  };
  window.HAIEC_GUIDE={open:open,exit:end,advance:advance,scenes:SCENES,quick:PRESETS.quick,full:PRESETS.full,action:act,state:state};
})();