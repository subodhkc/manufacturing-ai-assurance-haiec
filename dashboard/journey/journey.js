/* Operator Action Assurance Journey. Presentation-only.
 * HAIEC verdict: from digest-verified persisted evaluation export only.
 * Incident response: visibly separate, browser-only fictional rehearsal.
 */
(function(){
'use strict';
const CASE='SYS-217-WRONG_TARGET';
const STEPS=[
  {id:'detect',title:'Detect',detail:'Canonical divergence'},
  {id:'investigate',title:'Investigate',detail:'Reconcile facts and gaps'},
  {id:'authorize',title:'Authorize',detail:'Review response envelope'},
  {id:'contain',title:'Contain',detail:'Simulator pause only'},
  {id:'verify',title:'Verify',detail:'Witness vs response proof'},
  {id:'report',title:'Report',detail:'Evidence-bound artifact'}
];
const S={stage:'detect',paused:false,attempts:[],simulationRun:0};
const urlStage=new URLSearchParams(window.location.search).get('journeyStep');
if(STEPS.some(s=>s.id===urlStage))S.stage=urlStage;
const h=v=>esc(v==null?'—':String(v));
const tag=(v,kind='')=>'<span class="oj-tag '+kind+'">'+h(v)+'</span>';
const note=(message,kind='')=>'<div class="oj-alert '+kind+'">'+message+'</div>';
const card=(title,body)=>'<section class="oj-card"><h2>'+h(title)+'</h2>'+body+'</section>';
const cta=(label,act,kind='',disabled=false)=>'<button type="button" class="oj-cta '+kind+'" data-oj="'+h(act)+'" '+(disabled?'disabled':'')+'>'+h(label)+'</button>';
const line=(k,v)=>'<div class="oj-kpi"><div class="oj-overline">'+h(k)+'</div><div class="val">'+h(v)+'</div></div>';
const list=(arr)=>'<ul>'+arr.map(a=>'<li>'+h(a)+'</li>').join('')+'</ul>';
/* Resolve the SYS-217 wrong-target export from the CURRENT evidence world
 * (the v3 program when published) — never pinned to a superseded artifact.
 * Digest verification keys are caseId@sourceWorldId via hxKey(). */
const read=()=>{
  if(typeof HXDATA==='undefined'||!HXDATA)return null;
  const cur=typeof hxCurrent==='function'?hxCurrent():null;
  if(cur&&cur[CASE])return cur[CASE];
  if(HXDATA.exportMap&&HXDATA.exportMap[CASE])return HXDATA.exportMap[CASE];
  if(HXDATA.exportMapV3&&HXDATA.exportMapV3[CASE])return HXDATA.exportMapV3[CASE];
  return null;
};
const worldOf=a=>a&&a.provenance&&a.provenance.sourceWorldId?a.provenance.sourceWorldId:'unknown-world';
const digestReady=()=>{
  if(typeof HX==='undefined'||!HX.digestsDone)return false;
  const a=read();if(!a)return false;
  const key=typeof hxKey==='function'?hxKey(a):a.sourceCase.caseId;
  return HX.verified[key]===true;
};
const rule=(a,id)=>(a.manufacturing.ruleOutcomes||[]).find(r=>r.ruleId===id)||null;
const receipt=a=>((a.manufacturing.controlMaturity||{}).rows||[]).find(r=>r.controlId==='R01')||null;
const eLink=()=>'<button class="oj-cta" type="button" data-act="hx-case" data-id="SYS-217|'+CASE+'">Open evaluated case →</button>';
const replayLink=()=>'<button class="oj-cta" type="button" data-act="page" data-id="replay">Play 60-second recorded replay →</button>';
function findTargets(a){
  const r=rule(a,'MFG-EFF-001');
  const match=r&&r.reason.match(/read back on "([^"]+)" while the approved target was "([^"]+)"/);
  if(!match)return{actual:null,approved:null,reason:r&&r.reason||'No qualified target-divergence reason in this export'};
  return {actual:match[1],approved:match[2],reason:r.reason};
}
function safeData(a){
 const outcome=rule(a,'MFG-EFF-001'),w=receipt(a),t=findTargets(a);
 return{outcome,w,t,collector:rule(a,'MFG-OBS-001'),continuity:rule(a,'MFG-EFF-002'),
  obs:a.evaluation.fourQuestions&&a.evaluation.fourQuestions.observed?a.evaluation.fourQuestions.observed.state:'NOT_ASSESSED'};
}
function stageContent(a){
 const e=a.evaluation,d=safeData(a),head='<div class="oj-inline">'+tag('PERSISTED HAIEC · SYNTHETIC LAB','haiec')+tag('EXACT EVALUATION SNAPSHOT')+tag('SOURCE WORLD '+h(worldOf(a)))+'</div>';
 if(S.stage==='detect'){
  return card('01 · Detection: the target diverged',head+
    '<p class="oj-headline">The agent-facing operation had an approved work-order target. The qualified manufacturing effect was recorded on a different target.</p>'+
    '<div class="oj-kpi-grid">'+line('Approved target',d.t.approved||'NOT ESTABLISHED')+line('Recorded effect target',d.t.actual||'NOT ESTABLISHED')+
      line('MFG-EFF-001 · rule predicate',d.outcome?d.outcome.status:'NOT ASSESSED')+line('Canonical system disposition',e.disposition||'NOT ASSESSED')+'</div>'+
    note('<b>Technical interpretation:</b> '+h(d.t.reason),'danger')+
    '<p class="oj-sub">A detector MATCH means its predicate matched. It is not a passing grade, remediation, or a proven cause of the overall U5 disposition.</p>'+
    '<div class="oj-inline">'+eLink()+replayLink()+'</div>');
 }
 if(S.stage==='investigate'){
  const m=a.manufacturing.ruleOutcomes||[];
  const rows=m.map(r=>'<tr><td><b>'+h(r.ruleId)+'</b></td><td>'+h(r.status)+'</td><td>'+h(r.missingClaims&&r.missingClaims.length?r.missingClaims.join(', '):'None declared for this rule')+'</td></tr>').join('');
  const replay=HXDATA&&HXDATA.replay&&HX.replayVerified===true?HXDATA.replay:null;
  // The recorded replay is bound to the historical v1 source world — it is
  // shown as this evaluation's consumed evidence ONLY when the resolved
  // artifact is that v1 export. Cross-world replay would fabricate lineage.
  const sameWorld=worldOf(a)==='manufacturing-source-world-v1';
  const records=replay&&sameWorld&&Array.isArray(replay.records)?replay.records:[];
  const samples=records.slice(0,6).map(x=>'<div><b>'+h(x.payload&&x.payload.phase||'SOURCE_RECORD')+'</b><span class="oj-sub">'+h(x.declaredAt||'Time not recorded')+' · source-world record, not an independent production witness</span></div>').join('');
  return card('02 · Investigate: evidence, authority and unknowns',head+
    '<p class="oj-headline">Trace the exact approved target to the recorded target. Do not infer model intent or root cause from a rule match.</p>'+
    '<div class="oj-two"><div>'+note('<b>Qualified divergence:</b> '+h(d.t.approved)+' → '+h(d.t.actual),'danger')+'</div><div>'+note('<b>Action-path observed plane:</b> '+h(d.obs)+'. The rule-qualified manufacturing effect does not upgrade the Four Assurance Questions projection.')+'</div></div>'+
    '<h3 style="margin-top:15px">Deterministic rule outcomes · verbatim statuses</h3>'+
    '<table class="oj-table"><thead><tr><th>Rule</th><th>Outcome</th><th>Missing evidence</th></tr></thead><tbody>'+rows+'</tbody></table>'+
    '<h3 style="margin-top:14px">Recorded replay source phases</h3>'+
    (records.length?'<div class="oj-timeline">'+samples+'</div>':sameWorld?note('Replay digest not yet verified or source records unavailable; no reconstructed phase sequence displayed.'):note('The recorded evidence replay belongs to the historical v1 source world — it is not the evidence this '+h(worldOf(a))+' evaluation consumed. This evaluation\u2019s bound records are on the case detail view.'))+
    '<div class="oj-inline">'+replayLink()+eLink()+'</div>');
 }
 if(S.stage==='authorize'){
  return card('03 · Authorize: the response is a new consequential action',
    tag('RESPONSE APPROVAL NOT EVALUATED','missing')+
    '<p class="oj-headline">Do not convert an earlier manufacturing policy approval into permission to operate an emergency control.</p>'+
    '<div class="oj-two">'+
    '<div class="oj-card"><div class="oj-overline">Original evaluated action</div><b>'+h(d.t.approved||'Not established')+'</b><p>Source-qualified policy target is part of the frozen evaluation. It is not a new containment delegation.</p></div>'+
    '<div class="oj-card"><div class="oj-overline">Proposed response · NOT AUTHORIZED</div><b>Pause additional Station 217 agent dispatch</b><p>A human incident owner must approve exact scope, duration, principal, affected systems, expiry and recovery conditions.</p></div></div>'+
    '<div class="oj-hr"></div><h3>Required before a real production response</h3>'+
    list(['Establish tenant-bound system → kill-switch registration and affected dispatch boundary.',
      'Bind authorized incident owner, action, target, timestamp, reason and separation of duties.',
      'Verify HAIEC guard is called by each protected agent/tool execution path.',
      'Exclude physical safety interlocks, PLC/OT shutdown and any unapproved MES transaction.'])+
    note('The public demo cannot issue response approval, create a signed delegated-control record or invoke the private HAIEC kill-switch API.')+
    '<p class="oj-sub">Owner: Quality Supervisor / Plant Quality Manager plus designated runtime administrator, according to an approved incident procedure.</p>');
 }
 if(S.stage==='contain'){
  const pause=S.paused?'PAUSED IN BROWSER':'NOT PAUSED IN BROWSER';
  const attempted=S.attempts.length?
   '<div class="oj-timeline">'+S.attempts.map((t,i)=>'<div><b>'+h(t.decision)+'</b><span class="oj-sub">Attempt '+(i+1)+' · '+h(t.note)+'</span></div>').join('')+'</div>':
   '<p class="oj-sub">No follow-up dispatch attempts have been rehearsed in this browser session.</p>';
  return card('04 · Contain: rehearse denial without touching equipment',
    tag('SIMULATED RESPONSE · BROWSER ONLY','sim')+
    '<p class="oj-headline">The kill-switch concept becomes visible as an operator action, but this rehearsal has no backend enforcement or production side effects.</p>'+
    '<div class="oj-kpi-grid">'+line('Local fictional dispatcher',pause)+line('Production HAIEC kill-switch status','NOT CONNECTED')+'</div>'+
    '<div class="oj-inline" style="margin:14px 0">'+
      cta(S.paused?'Resume fictional dispatcher':'Pause fictional dispatcher','pause','primary')+
      cta('Attempt follow-up dispatch','attempt')+
      cta('Reset this response rehearsal','reset')+'</div>'+
    attempted+
    note('No protected HAIEC system is killed. This page writes no production state, does not call an API, and does not add evidence to the persisted evaluation. The local denial is not a UCP or native readback receipt.')+
    '<p class="oj-sub">A real intervention requires registered kill-switch identity, authorized trigger, guard interception, a durable blocked-attempt event and independently established operational outcome.</p>');
 }
 if(S.stage==='verify'){
  const r01=d.w,local=S.attempts.filter(x=>x.decision==='SIMULATED_DENY').length;
  return card('05 · Verify: distinguish an effect witness from a response witness',head+
    '<div class="oj-two">'+
     '<div class="oj-card"><div class="oj-overline">Persisted manufacturing effect · frozen evaluation · '+h(worldOf(a))+'</div>'+
      tag('HAIEC UCP · '+h(r01?r01.ucpResult:'NOT ASSESSED'),'haiec')+
      '<h3 style="margin-top:11px">R01 effect traceability</h3><p>Receipt: <b>'+h(r01?r01.ucpReceiptState:'NO RECEIPT')+
      '</b>. This establishes eligible independent evidence of the wrong-target effect. It does NOT prove the effect was approved, prevented or remediated.</p></div>'+
     '<div class="oj-card"><div class="oj-overline">Response containment · browser rehearsal only</div>'+
      tag('INDEPENDENT RESPONSE WITNESS · NOT ESTABLISHED','missing')+
      '<h3 style="margin-top:11px">Post-control attempts</h3><p>'+local+' local attempts denied by the fictional dispatch toggle. No external guard log, source-qualified denied call or native post-response state was produced.</p></div></div>'+
    '<h3 style="margin-top:15px">Still required to verify real containment</h3>'+
    list(['Actual dispatcher guard invocation and its registered system identity.',
      'Denied execution attempt and durable event/receipt under the same authorized response.',
      'Independent readback that subsequent consequential effects did not occur.',
      'Human-reviewed recovery and post-recovery negative test.'])+
    '<div class="oj-hr"></div><b>Collector-continuity evidence:</b> '+h(d.continuity?d.continuity.status:'NOT ASSESSED')+
    ' · <b>Observation continuity:</b> '+h(d.collector?d.collector.status:'NOT ASSESSED')+
    '<p class="oj-sub">These statuses belong to the historical assessment; they must not be used as post-containment measurements.</p>');
 }
 return card('06 · Report: one canonical evidence source, separate response notes',head+
  '<p class="oj-headline">A report should explain what HAIEC established, what was simulated afterward, and which evidence is still needed.</p>'+
  '<div class="oj-kpi-grid">'+line('Evaluation ID',e.evaluationId)+line('Case ID',a.sourceCase.caseId)+
   line('Evaluation basis',e.evaluationBasis)+line('Canonical disposition',e.disposition)+'</div>'+
  '<div class="oj-hr"></div>'+
  note('The response rehearsal is not part of evaluation '+h(e.evaluationId)+'. The frozen export, its core truth digest and UCP receipts are unchanged.')+
  '<h3 style="margin-top:12px">Reportable finding and limitations</h3>'+
  list([d.t.reason,'Collector continuity: '+h(d.continuity?d.continuity.status:'NOT ASSESSED'),
    'No qualified post-control containment, denial or recovery evidence bound.',
    'Digest checking is content integrity relative to the published export, not proof that every source claim is independently authentic.'])+
  '<div class="oj-inline"><a href="report/sample-master-report.html" target="_blank" rel="noopener" class="oj-cta primary">Open public SYS-217 report ↗</a>'+eLink()+replayLink()+'</div>'+
  '<p class="oj-sub">The public report is a synthetic-data derivative. Original HAIEC report endpoints require proper tenant authorization.</p>');
}
function sidePanel(a){
 const e=a.evaluation,d=safeData(a);
 const listHtml='<div class="oj-section">'+
 '<div class="oj-overline">What we actually established</div>'+
 '<div>'+tag('DETECTOR · '+h(d.outcome?d.outcome.status:'UNKNOWN'),'missing')+'</div>'+
 '<p>'+h(d.t.approved||'Approved target not carried')+' → '+h(d.t.actual||'actual target not carried')+'</p>'+
 '<div>'+tag('U5 · '+h(e.disposition),'missing')+' '+tag(e.evaluationBasis)+'</div>'+
 '<div class="oj-hr"></div><div class="oj-overline">What remains unproven</div>'+
 list(['New response authorization','Live kill-switch attachment or guard interception',
 'Post-containment independent effect witness','Collector continuity and complete action-path observation'])+
 '<div class="oj-hr"></div><div class="oj-overline">Relevant standards · contextual only</div>'+
 '<p>OWASP Agentic ASI02 / ASI03 · NIST AI RMF MANAGE · ISA/IEC 62443 concepts · OWASP ASVS for product authorization.</p>'+
 tag('NOT AN EVALUATED FRAMEWORK MAPPING','missing')+
 '<p class="oj-sub">References illustrate potential applicability; no standards compliance or specific mapping edge is asserted for this evaluation.</p>'+
 '<div class="oj-hr"></div><div class="oj-overline">Operator handoff</div>'+
 '<p class="oj-owner">Manufacturing Quality owner investigates target mismatch. Runtime administrator separately owns any approved technical intervention. Never infer that HAIEC executed a real kill switch.</p></div>';
 return card('Proof and control boundary',listHtml);
}
function stepsRail(){
 return '<nav aria-label="Operator journey stages" class="oj-card oj-steps">'+STEPS.map((st,i)=>
  '<button type="button" class="oj-step" data-oj-step="'+st.id+'" aria-current="'+(S.stage===st.id?'step':'false')+'">'+
  '<span class="n">'+(i+1)+'</span><span><b>'+st.title+'</b><small>'+st.detail+'</small></span></button>').join('')+'</nav>';
}
function pageJourney(){
 if(typeof HX==='undefined'||!HX.digestsDone)return '<div class="oj">'+card('Verifying historical evaluation export','<p>No assurance facts render until SYS-217 export integrity verification completes.</p>')+'</div>';
 if(!digestReady()||!read())return '<div class="oj">'+card('INTEGRITY FAILURE — no assurance content rendered',
    note('SYS-217 evaluation export missing, unverified or digest mismatch. Reload the published release; this screen will not fall back to illustrative verdicts.','danger'))+'</div>';
 const a=read(),e=a.evaluation;
 const current=STEPS.findIndex(s=>s.id===S.stage);
 return '<div class="oj"><div class="oj-hero"><div class="oj-eyebrow">HAIEC / OPERATOR ACTION ASSURANCE / STATION 217</div>'+
  '<h1>The AI had access. It changed the wrong work order. What happens next?</h1>'+
  '<p>Follow an evidence-bound manufacturing detection into a separately labeled response rehearsal. Learn what is verified, what requires human authority, and what remains unproven.</p>'+
  '<div class="oj-tags">'+tag('SYNTHETIC LAB · REAL HAIEC EVALUATION','haiec')+tag('RESPONSE REHEARSAL · NOT LIVE','sim')+
    tag('U5 '+h(e.disposition))+
    tag('Digest checked against embedded export')+'</div></div>'+
  '<div class="oj-alert">Two different trust tracks: <b>persisted HAIEC evaluation evidence</b> ('+h(worldOf(a))+') covers detection, manufacturing effect and R01 witness. <b>Simulated incident response</b> covers only your local browser actions. They cannot become one receipt or one historical chronology.</div>'+
  '<div class="oj-layout">'+stepsRail()+
  '<div class="oj-section">'+stageContent(a)+
  '<div class="oj-inline">'+cta('← Previous','prev','',current===0)+cta('Next step →','next','primary',current===STEPS.length-1)+'</div></div>'+
  '<aside class="oj-sidebar">'+sidePanel(a)+'</aside></div>'+
  '<div class="oj-footer">Case '+h(CASE)+' · World '+h(worldOf(a))+' · Evaluation '+h(e.evaluationId)+'. No production OT action, new HAIEC evaluation, signed response approval, framework certification or real agent termination is performed by this demo.</div></div>';
}
document.addEventListener('click',event=>{
 const stage=event.target.closest('[data-oj-step]');
 if(stage){if(STEPS.some(s=>s.id===stage.dataset.ojStep)){S.stage=stage.dataset.ojStep;STATE.page='journey';render();}return;}
 const node=event.target.closest('[data-oj]');
 if(!node)return;
 if(!digestReady())return;
 switch(node.dataset.oj){
  case 'prev':{const i=STEPS.findIndex(s=>s.id===S.stage);if(i>0)S.stage=STEPS[i-1].id;break;}
  case 'next':{const i=STEPS.findIndex(s=>s.id===S.stage);if(i<STEPS.length-1)S.stage=STEPS[i+1].id;break;}
  case 'pause':S.paused=!S.paused;break;
  case 'attempt':S.attempts.push({decision:S.paused?'SIMULATED_DENY':'SIMULATED_PERMIT_CHECK_ONLY',note:S.paused?'Local fictional dispatch paused; no downstream call attempted.':'Local fictional dispatch not paused; no real execution or native write attempted.'});break;
  case 'reset':S.paused=false;S.attempts=[];S.simulationRun++;break;
  default:return;
 }
 STATE.page='journey';render();
});
if(!PAGES.some(p=>p.id==='journey'))PAGES.splice(1,0,{id:'journey',group:'See',label:'Operator Journey',icon:'OJ'});
PAGE_RENDERERS.journey=pageJourney;
render();
})();
