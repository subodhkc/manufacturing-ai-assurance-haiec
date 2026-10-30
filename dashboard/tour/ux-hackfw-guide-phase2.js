/* UX-HACKFW-GUIDE-02: narrated presenter notes, shareable scenes,
 * and non-destructive technical branches of the existing guided tour.
 * No assurance evaluations or simulated factory actions are changed here.
 */
(function () {
  'use strict';
  var guide = window.HAIEC_GUIDE;
  if (!guide) return;

  var NOTES = {
    platform:{
      talk:'HAIEC is the Human AI Evidence Company. The problem we solve begins when an AI system can cause a business consequence, not just generate an answer. We separate what a system can reach, what it was authorized to do, what actually happened, and how well those conclusions are evidenced.',
      point:'Highlight the three pillars and the six independently usable capabilities. Manufacturing is a reference case for a broader enterprise platform.',
      bridge:'Let us look at the AI estate that an operator actually needs to govern.'
    },
    estate:{
      talk:'The example manufacturer runs nine synthetic AI systems across different operating functions. One flat risk score is not enough. Each agent has different access, different delegated actions, and different downstream effects.',
      point:'Show the system inventory. Find torque quality assurance, then connect it to the Station 217 case.',
      bridge:'Here is why knowing the estate is necessary, but not sufficient.'
    },
    'wrong-target':{
      talk:'The agent was approved to update WO-217-4802. The downstream API returned success, but qualified source evidence recorded a change to WO-217-4803. The saved HAIEC evaluation identifies that exact target divergence. MFG-EFF-001 is MATCH and R01 provides a scoped effect witness, while the overall disposition is REVIEW because other assurance questions remain unresolved.',
      point:'Point first to the approved and recorded targets, then to the rule-level finding and finally to the overall disposition. Do not imply that HAIEC blocked the original effect.',
      bridge:'The difference between technical permission and approved authority explains why this finding matters.'
    },
    authority:{
      talk:'Access to a tool is not a blanket delegation to perform every operation available through that tool. A consequential action has a target, scope, magnitude, purpose and possibly a named human approver. Those boundaries can narrow when a workflow hands work from one agent or system to another.',
      point:'Use the visible authority workflow and show why the exact work order matters more than whether the API was reachable.',
      bridge:'Now we can apply the same reasoning to an operating decision.'
    },
    decision:{
      talk:'Not every AI action needs to be held. A small containment request can remain inside an authorized automatic limit. A 40-engine containment request is larger and requires a Quality Supervisor in this demonstration. The reviewer has to authorize the exact request, not simply acknowledge a generic alert.',
      point:'Run the 40-engine action only if time permits. Open the pending request to show the approval boundary and role check.',
      bridge:'Next, watch a similar boundary applied to a simulated manufacturing execution system.'
    },
    mes:{
      talk:'HAIEC detected the earlier wrong-target record in persisted synthetic evidence. This screen is a separate, subsequent simulation. A direct MES write is outside the agent’s declared scope, so the local demonstration gateway holds the attempt. A permitted advisory note remains available. This shows how useful work and consequential restrictions can coexist.',
      point:'Select Attempt MES write, observe the held outcome, then Issue advisory note. The first historical action was detected, not prevented.',
      bridge:'The same principle applies when an AI action crosses into procurement.'
    },
    erp:{
      talk:'The procurement example makes two independent gates visible. A buyer can have authority to approve the amount while the selected supplier still fails qualification. For REQ-2026-8842, expired PPAP prevents commitment. The qualified supplier request, REQ-2026-8855, can proceed after buyer approval.',
      point:'Request each purchase order and, when desired, complete the pending review with the Authorized Buyer role. Financial approval does not override supplier qualification.',
      bridge:'Consequential AI also depends on what we can observe after a decision.'
    },
    monitor:{
      talk:'These monitoring events are generated inside the browser-local factory. A torque anomaly and a signal interruption should not be collapsed into one green or red badge. Missing source continuity means we do not have enough qualified evidence to conclude that the process is normal.',
      point:'Inspect the local action ledger and review status. For equipment changes, use the explicit optional action buttons.',
      bridge:'The evidence trail is what makes this useful to an auditor or release owner.'
    },
    proof:{
      talk:'The HAIEC reference corpus contains nine synthetic systems across five current evidence states, yielding 45 persisted v3 evaluations. The saved evaluation results preserve their original rule findings and REVIEW dispositions. Separate browser-local event exports show what happened during this presentation but are not HAIEC-issued assurance reports.',
      point:'Open a saved case report or the Station 217 technical appendix. Keep canonical evidence and factory activity distinct.',
      bridge:'Finally, consider how this pattern extends to a real enterprise environment.'
    },
    connect:{
      talk:'An enterprise proof of concept would connect qualified code and tool inventories, identity and permission sources, approved operating scope, and downstream business-system records. HAIEC would then assess exact consequences against those sources and preserve the gaps where proof is missing. The goal is deployable confidence with accountability, not unsupported certification.',
      point:'Show the source onboarding and integration workflow, then return to the platform value proposition.',
      bridge:'Know what your AI can do. Govern what it may do. Verify what happened.'
    }
  };

  // Optional branches open in another tab, preserving the presenter and its
  // factory session. They are established routes, not new evaluation runs.
  var BRANCHES = {
    platform:[['Six-stage operator journey','?view=journey'],['Industry experiences','?view=industry']],
    estate:[['Station 217 system detail','?view=system&system=SYS-217&tab=overview'],['Evaluation inventory','?view=evaluations']],
    'wrong-target':[['Technical evidence report','?report=s217-tech'],['Canonical wrong-target case','?report=case%3ASYS-217-WRONG_TARGET']],
    authority:[['Operator journey','?view=journey'],['Governance playback','?view=governance']],
    decision:[['Controls Studio','?view=controls'],['Governance playback','?view=governance']],
    mes:[['Governance playback','?view=governance'],['Evidence-condition comparison','?view=tryit']],
    erp:[['Operating and governance report','?report=gov'],['Factory demonstration record','?report=demo']],
    monitor:[['Monitoring ledger','?view=monitor'],['Demonstration record','?report=demo']],
    proof:[['Canonical wrong-target case','?report=case%3ASYS-217-WRONG_TARGET'],['Technical Station 217 report','?report=s217-tech']],
    connect:[['Integration and source setup','?view=setup'],['Operator journey','?view=journey']]
  };

  var narration = {enabled:false, speaking:false};
  var speech = window.speechSynthesis || null;
  var voiceSupported = !!(speech && typeof window.SpeechSynthesisUtterance === 'function');
  var statusMessage = '';
  var lastUnderlay = null;
  var lastMode = null;
  var lastScene = null;
  function esc(s) {return String(s==null?'':s).replace(/[&<>"']/g,function(c) {return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function current() {return guide.scenes.find(function(s){var set=guide.state.mode==='quick'?guide.quick:guide.full;return s.id===set[guide.state.index];});}
  function sceneURL() {
    var u=new URL(window.location.href);
    var s=current();
    if(s && guide.state.mode){u.searchParams.set('tour',guide.state.mode);u.searchParams.set('scene',s.id);}
    return u.href;
  }
  function routeIdentity(u) {
    var q=new URL(u.href);
    q.searchParams.delete('tour');q.searchParams.delete('scene');
    return q.pathname+q.search;
  }
  function replaceCurrentURL() {
    if(!guide.state.mode || !current())return;
    var u=new URL(window.location.href);
    var underlay=routeIdentity(u);
    var s=current();
    var link=sceneURL();
    var prior=window.history.state;
    // The previous scene can live on the same underlying dashboard page
    // (MES -> ERP, for example). Keep it in browser history as a real step.
    if(lastUnderlay===underlay && lastMode===guide.state.mode &&
       lastScene && lastScene!==s.id && prior && prior.__haiecNavigationV1){
      window.history.replaceState(prior,'',window.location.href);
      var next=Object.assign({},prior,{index:(prior.index||0)+1,
        backLabel:'Previous guided scene'});
      window.history.pushState(next,'',link);
    }else{
      window.history.replaceState(prior,'',link);
    }
    lastUnderlay=underlay;lastMode=guide.state.mode;lastScene=s.id;
  }
  function clearTourQuery(){
    var u=new URL(window.location.href);
    if(!u.searchParams.has('tour')&&!u.searchParams.has('scene'))return;
    u.searchParams.delete('tour');u.searchParams.delete('scene');
    window.history.replaceState(window.history.state,'',u.pathname+u.search+u.hash);
  }
  function stopVoice() {
    if(speech){try{speech.cancel();}catch(e){}}
    narration.speaking=false;
  }
  function say(s) {
    if(!voiceSupported || !s || !guide.state.mode)return;
    stopVoice();
    var n=NOTES[s.id];
    var content=s.heading+' '+s.points.join('. ')+'. '+(n?n.talk:'');
    var utterance=new window.SpeechSynthesisUtterance(content);
    utterance.lang='en-US';utterance.rate=0.96;
    utterance.onend=function(){narration.speaking=false;updateStatus();};
    utterance.onerror=function(){narration.speaking=false;updateStatus();};
    try{speech.speak(utterance);narration.speaking=true;statusMessage='Narrating this scene';updateStatus();}
    catch(e){narration.speaking=false;statusMessage='Browser narration unavailable';updateStatus();}
  }
  function updateStatus() {
    var label=document.querySelector('.ux-hackfw-p2-status');
    if(label)label.textContent=statusMessage;
  }
  function branchLink(href) {
    var u=new URL(window.location.href);
    u.search='';
    u.hash='';
    var qs=href.charAt(0)==='?'?href.slice(1):href;
    u.search='?'+qs;
    return u.href;
  }
  function onRender(panel,state,s) {
    if(!panel||!s||!state.mode)return;
    var text=panel.querySelector('.ux-hackfw-notes');
    var n=NOTES[s.id];
    if(text&&n){
      text.innerHTML='<strong>Talk track</strong><p>'+esc(n.talk)+'</p>'+
        '<strong>Show on screen</strong><p>'+esc(n.point)+'</p>'+
        '<strong>Transition</strong><p>'+esc(n.bridge)+'</p>';
    }
    var old=panel.querySelector('.ux-hackfw-phase2');
    if(old)old.remove();
    var section=document.createElement('section');
    section.className='ux-hackfw-phase2';
    section.setAttribute('aria-label','Presenter tools and technical deep dives');
    var links=(BRANCHES[s.id]||[]).map(function(b){
      return '<a href="'+esc(branchLink(b[1]))+'" target="_blank" rel="noopener noreferrer">'+esc(b[0])+' ↗</a>';
    });
    section.innerHTML='<div class="ux-hackfw-phase2-tools">'+
      '<button type="button" data-ux-p2="copy" title="Copy a URL that opens this exact tour scene">Copy scene link</button>'+
      (voiceSupported?'<button type="button" data-ux-p2="narrate">Read scene aloud</button>'+
        '<button type="button" data-ux-p2="auto" aria-pressed="'+narration.enabled+'">Auto narration: '+(narration.enabled?'On':'Off')+'</button>'+
        '<button type="button" data-ux-p2="stop">Stop audio</button>':
        '<span class="ux-hackfw-voice-unavailable">Audio narration unavailable in this browser</span>')+
      '</div><details class="ux-hackfw-branches"><summary>Technical deep dives (optional)</summary>'+
      '<p>These links open established technical views in a separate tab. Your tour stays in place.</p>'+
      '<div>'+links.join('')+'</div></details>'+
      '<div class="ux-hackfw-p2-status" role="status" aria-live="polite">'+esc(statusMessage)+'</div>';
    panel.appendChild(section);
  }
  function onSceneChange(state,s) {
    stopVoice();
    replaceCurrentURL();
    statusMessage='';
    if(narration.enabled && voiceSupported) say(s);
    else updateStatus();
  }
  function onExit() {
    narration.enabled=false;stopVoice();
    statusMessage='';
    lastUnderlay=null;lastMode=null;lastScene=null;
    clearTourQuery();
  }
  window.HAIEC_GUIDE_EXT={onRender:onRender,onSceneChange:onSceneChange,onExit:onExit};

  document.addEventListener('click',function(event){
    var target=event.target.closest('[data-ux-p2]');
    if(!target)return;
    event.preventDefault();event.stopPropagation();
    var a=target.getAttribute('data-ux-p2');
    if(a==='copy'){
      var link=sceneURL();
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(link).then(function(){statusMessage='Scene link copied';updateStatus();},
          function(){if(window.prompt)window.prompt('Copy this scene URL:',link);});
      }else if(window.prompt)window.prompt('Copy this scene URL:',link);
    }else if(a==='narrate'){say(current());}
    else if(a==='auto'){
      narration.enabled=!narration.enabled;
      if(narration.enabled)say(current());
      else stopVoice();
      var panel=document.querySelector('.ux-hackfw-guide');
      if(panel&&guide.state.mode)onRender(panel,guide.state,current());
    }else if(a==='stop'){
      stopVoice();statusMessage='Narration stopped';updateStatus();
    }
  });

  // Browser history should restore the tour scene, not just the underlying
  // report view. No additional history entries are created on restoration.
  window.addEventListener('popstate',function() {
    var q=new URLSearchParams(window.location.search);
    var mode=q.get('tour'),id=q.get('scene');
    if((mode==='quick'||mode==='full') && id){
      guide.syncScene(mode,id);
      lastMode=mode;lastScene=id;lastUnderlay=routeIdentity(new URL(window.location.href));
    }else if(guide.state.mode){
      guide.exit();
    }
    stopVoice();
  });

  // Support bookmarks on a hard refresh, including canonical report deep links.
  var initial=new URLSearchParams(window.location.search);
  var mode=initial.get('tour'),id=initial.get('scene');
  if((mode==='quick'||mode==='full') && id){
    if(!guide.openAt(mode,id)) clearTourQuery();
  }
})();
