/* HAIEC Industry Assurance Experience.
 * One presentation view inside the existing manufacturing shell.
 * No AI scoring, source qualification, permission changes, or evaluation runs.
 * Source: generated read-only industry profiles; canonical manufacturing
 * evaluations remain governed by HX digest verification elsewhere.
 */
(function(){
'use strict';
const source = window.HAIEC_INDUSTRY_DATA;
const modes = Object.freeze({
  manufacturing:'EVALUATED SYNTHETIC · EXACT SNAPSHOT ONLY',
  telecom:'HISTORICAL TM FORUM REFERENCE',
  electrical:'SIMULATION ONLY',
  rail:'SIMULATION ONLY',
  electronics:'SIMULATION ONLY',
  supplier:'SIMULATION ONLY'
});
const industryLabels = Object.freeze({
  manufacturing:'Manufacturing',telecom:'Telecommunications',
  electrical:'Electrical Equipment',rail:'Rail & Transportation',
  electronics:'Electronics / AI Infrastructure',supplier:'Supplier Network'
});
const members = source && Array.isArray(source.profiles) ? source.profiles : [];
const byId = id => members.find(p=>p.industryId===id) || null;
const valid = Object.keys(industryLabels);
let selected = 'manufacturing';
let telecomState = 'AL0';
let audience = 'executive';
const params = new URLSearchParams(window.location.search);
if(valid.includes(params.get('industry')) && byId(params.get('industry'))){
  selected=params.get('industry');
  STATE.page='industry';
}
function x(value){return esc(value==null?'—':String(value));}
function text(value){return x(value);}
function tag(label,kind){return '<span class="ind-tag '+x(kind||'')+'">'+x(label)+'</span>';}
function card(title,body,extra){return '<section class="ind-card '+(extra||'')+'"><h2>'+x(title)+'</h2>'+body+'</section>';}
function muted(s){return '<p class="ind-sub">'+x(s)+'</p>';}
function tile(label,value,note){return '<div class="ind-card"><div class="ind-overline">'+x(label)+'</div><div class="ind-value">'+x(value)+'</div><div class="ind-sub">'+x(note)+'</div></div>';}
function list(items){return '<ul>'+items.map(t=>'<li>'+x(t)+'</li>').join('')+'</ul>';}
function steps(items){return '<div class="ind-steps">'+items.map((e,i)=>
  '<div class="ind-step"><span class="ind-index">'+(i+1)+'</span><div><b>'+x(e.title)+'</b>'+
  (e.at?'<div class="ind-sub">'+x(e.at)+'</div>':'')+
  '<div class="ind-sub">'+x(e.detail)+'</div></div></div>').join('')+'</div>';}
function options(){return valid.filter(v=>byId(v)).map(id=>'<option value="'+x(id)+'" '+(selected===id?'selected':'')+'>'+x(industryLabels[id])+'</option>').join('');}
function auditNote(){return '<div class="ind-proof ind-warning"><b>Evidence boundary:</b> Historical telecom examples and simulated company profiles are not evaluated HAIEC findings. Only the existing manufacturing evaluation exports carry genuine persisted HAIEC results, and only when their exact digests verify.</div>';}
function shell(p,content){
 const mode=modes[p.industryId]||'NOT AVAILABLE',isRef=p.industryId==='telecom';
 const tabs=['executive','operations','engineer','auditor'];
 const profileSelector='<div class="ind-field"><label for="ind-org">Fictional organization / use case</label>'+
  '<select id="ind-org" aria-label="Fictional organization"><option value="'+x(p.profileId)+'">'+x(p.name)+'</option></select></div>';
 const toolbar='<div class="ind-controls" aria-label="Industry experience selectors">'+
  '<div class="ind-field"><label for="ind-sector">Industry</label><select id="ind-sector">'+options()+'</select></div>'+profileSelector+
  '<div class="ind-field"><label for="ind-audience">Audience</label><select id="ind-audience">'+tabs.map(t=>'<option value="'+t+'" '+(t===audience?'selected':'')+'>'+x(t[0].toUpperCase()+t.slice(1))+'</option>').join('')+'</select></div>'+
  '<span style="margin-left:auto">'+tag(mode,isRef?'reference':p.industryId==='manufacturing'?'':'sim')+'</span></div>';
 const audienceGuide={executive:'Decision: who owns the consequential action, what is established, and what remains open?',operations:'Operations: inspect the event sequence and distinguish a proposed change from an applied native effect.',engineer:'Engineering: inspect target identity, source families, executable path and readback provenance.',auditor:'Audit: distinguish canonical evaluation artifacts from reference or simulation-only source narratives.'};
 const hero='<div class="ind-hero"><div class="ind-eyebrow">HAIEC / INDUSTRY ASSURANCE / '+x(industryLabels[p.industryId])+'</div>'+
   '<h1>'+x(p.hero)+'</h1><p>'+x(p.name)+' · '+x(p.operator||p.role)+' · source-grounded, consequence-first experience. What can this AI system cause, and where does proof stop?</p>'+
   '<div class="ind-hero-foot">'+tag(mode)+(p.sourceWorldVersion?tag('Source world '+p.sourceWorldVersion):'')+tag('No browser-side assurance engine')+'</div></div>';
 const jump='<div class="ind-navtabs" aria-label="Sections"><a class="ind-tab" href="#ind-overview">Overview</a><a class="ind-tab" href="#ind-consequence">Action &amp; authority</a><a class="ind-tab" href="#ind-evidence">Evidence</a><a class="ind-tab" href="#ind-report">Report</a></div>';
 return '<div class="ind">'+toolbar+hero+'<div class="ind-proof" role="note"><b>'+x(audience.toUpperCase())+' VIEW:</b> '+x(audienceGuide[audience])+'</div>'+jump+content+
 '<div class="ind-footer">Presentation profile: '+x(p.profileId)+'. No customer, sponsor, judging or partnership claim. Profile selection never imports findings or evaluation IDs from another industry. The canonical HAIEC platform remains the only assurance evaluator.</div></div>';
}
function manufacturer(p){
 const keyOf=a=>a.sourceCase.caseId+'@'+((a.provenance&&a.provenance.sourceWorldId)||'unknown');
 const v3ok = typeof HX!=='undefined' && HX.digestsDone &&
  typeof HXDATA!=='undefined' && HXDATA && HXDATA.exportMapV3 &&
  Object.keys(HXDATA.exportMapV3).length===45 &&
  Object.values(HXDATA.exportMapV3).every(a=>HX.verified[keyOf(a)]===true);
 const v1ok = typeof HX!=='undefined' && HX.digestsDone &&
  typeof HXDATA!=='undefined' && HXDATA && HXDATA.exportMap &&
  Object.keys(HXDATA.exportMap).length===27 &&
  Object.values(HXDATA.exportMap).every(a=>HX.verified[keyOf(a)]===true);
 const headline=(v3ok&&v1ok)?'45 v3 + 27 v1 frozen exports verified':'VERIFYING / UNAVAILABLE';
 const content='<div class="ind-grid" id="ind-overview">'+
   tile('Nine-system scope',9,'Fictional manufacturing systems across source-world cases')+
   tile('Evaluation exports',headline,'45 canonical v3 assessments + 27 preserved v1 evaluations over synthetic source worlds')+
   tile('New v3.1 source inputs','NOT YET EVALUATED','Separate from the evaluated 27 + 45 exports')+'</div>'+
   auditNote()+
   '<div class="ind-split" id="ind-consequence">'+
   card('What makes the manufacturing view different?',
     muted('Work orders, protected releases, quality-hold status, test controller candidates, supplier PPAP, ERP PO approval and warehouse shipments are assessed as distinct consequences.')+
     '<div class="ind-proof">Permission is not delegation. A witnessed effect is not proof that its target was authorized.</div>')+
   card('Explore verified artifacts',
     muted('The canonical assurance page re-verifies all frozen exports; Reports &amp; Evidence holds the executive report, per-case reports and the Station 217 flagship.')+
     '<p style="margin-top:12px"><button class="ind-action" data-act="page" data-id="reports">Reports &amp; Evidence →</button></p>'+
     '<p style="margin-top:8px"><button class="ind-action" data-act="page" data-id="evaluations">Open 9-system HAIEC Assurance →</button></p>'+
     '<p style="margin-top:8px"><button class="ind-action" data-act="page" data-id="exec">Manufacturing executive view →</button></p>')+
   '</div>'+
   '<div class="ind-split" id="ind-evidence">'+
   card('Canonical source truth',muted('Real persisted HAIEC evaluation identities, deterministic rule results, exact snapshot digests and UCP receipts appear only on the manufacturing Assurance page, never inferred from this selector.'))+
   card('Still required',list(['New v3.1 registered manufacturer source qualification and fresh canonical evaluation IDs','No inheritance of historical v1 statuses onto v3.1 cases','No real production manufacturing equipment or customer effects in this demonstration']))+'</div>'+
   '<div id="ind-report">'+card('Report access',muted('Use the public synthetic sample or the evaluation-bound report links from the authenticated HAIEC experience. This industry selector does not produce a new report identity.')+
     '<p style="margin-top:10px"><a class="ind-action" href="report/sample-master-report.html" target="_blank" rel="noopener">Public SYS-217 sample report ↗</a></p>')+'</div>';
 return shell(p,content);
}
function telecom(p){
 const r=p.reference,selectedStage=r.states.find(s=>s.id===telecomState)||r.states[0];
 const selector='<div class="ind-navtabs" role="tablist" aria-label="TM Forum reference states">'+
 r.states.map(s=>'<button class="ind-tab" role="tab" aria-selected="'+(s.id===selectedStage.id)+'" data-ind-state="'+x(s.id)+'">'+x(s.id)+' · '+x(s.label)+'</button>').join('')+'</div>';
 const alert='<div class="ind-state">'+tag('ORIGINAL SAMPLE LABEL — NOT HAIEC VERDICT','reference')+
 '<div><b>'+x(selectedStage.originalSampleBadge)+'</b><p class="ind-sub">'+x(selectedStage.context)+'</p></div></div>';
 const stateCards='<div class="ind-compare">'+
  '<div><div class="ind-overline">Sample requested state</div>'+muted(selectedStage.requested)+'</div>'+
  '<div><div class="ind-overline">Authority claim in the reference</div>'+muted(selectedStage.approved)+'</div>'+
  '<div><div class="ind-overline">Sample observation</div>'+muted(selectedStage.observed)+'</div>'+
  '<div><div class="ind-overline">Native effect and service QoS</div>'+muted(selectedStage.effect+' · '+selectedStage.serviceImpact)+'</div></div>';
 const topo=r.topology.map((a,i)=>({title:a.domain,detail:a.function}));
 const rows=r.sourceFamilies.map(f=>'<tr><td>'+x(f.family)+'</td><td>'+x(f.role)+'</td><td>'+tag(f.status,'reference')+'</td></tr>').join('');
 const content='<div class="ind-grid" id="ind-overview">'+
 tile('AI system proof', 'NOT ISSUED', 'No canonical HAIEC telecom evaluation exists in this reference')+
 tile('Three states', 'AL0 / AL1 / AL2', 'Historical competition scenario labels, not dispositions')+
 tile('Service effect','UNKNOWN','No independently qualified KPI or native state readback included')+'</div>'+auditNote()+
 '<section class="ind-card" id="ind-consequence"><h2>Network change investigation · '+x(selectedStage.label)+'</h2>'+selector+alert+
 '<div class="ind-proof" style="margin-top:12px">Network target from original example: '+x(r.profile.referenceResource)+'. A change request, network configuration acceptance and independently observed service impact are three different claims.</div>'+
 '<div style="margin-top:12px">'+stateCards+'</div></section>'+
 '<section class="ind-card"><h2>Investigation narrative — how the reference reads end to end</h2>'+
 '<div class="ind-steps">'+
 '<div class="ind-step"><span class="ind-index">1</span><div><b>Request</b><div class="ind-sub">A network-management change is requested against '+x(r.profile.referenceResource)+' inside a declared scope. The reference narrative describes the request; the derivative carries no authenticated request receipt.</div></div></div>'+
 '<div class="ind-step"><span class="ind-index">2</span><div><b>Authority</b><div class="ind-sub">Business/network authorization is asserted by the source document but never source-qualified here — who approved what, under which policy, stays unverified.</div></div></div>'+
 '<div class="ind-step"><span class="ind-index">3</span><div><b>Target drift</b><div class="ind-sub">AL1 attributes an action-path divergence to Step 4; AL2 describes conflicting pre/post state hashes on the slice. Both are illustrative investigation leads — a state-hash disagreement is not proven tampering.</div></div></div>'+
 '<div class="ind-step"><span class="ind-index">4</span><div><b>Service effect</b><div class="ind-sub">No independent KPI/QoS time series or native readback is included — service impact remains UNKNOWN at every state, deliberately.</div></div></div>'+
 '<div class="ind-step"><span class="ind-index">5</span><div><b>Next NOC / security decision</b><div class="ind-sub">Treat the narrative as a lead, not an incident: require registered evidence sources, qualified delegation records and independent service witnesses before declaring impact — the same discipline the manufacturing evaluations demonstrate with real persisted verdicts.</div></div></div>'+
 '</div></section>'+
 '<div class="ind-split">'+
 card('Cross-domain path · reference topology',steps(topo))+
 card('State-specific analytic questions',list([
 'Who requested the action, and which policy/slice/cell was the precise approved target?',
 'Which agent, API gateway, A1/R1/O1 or OSS path could apply the change?',
 'Is the observed native resource identical to the approved resource?',
 'Is independent QoS / KPI evidence present, timely and lineage-distinct?',
 'Is rollback merely accepted, or has service convergence been independently observed?'
 ])+'<div class="ind-proof ind-warning">'+x(selectedStage.limitation)+'</div>')+'</div>'+
 '<div class="ind-split" id="ind-evidence">'+
 card('Source Binder · evidence-family coverage',
 '<table class="ind-table"><thead><tr><th>Family</th><th>What it might establish</th><th>Reference state</th></tr></thead><tbody>'+rows+'</tbody></table>'+
 '<div class="ind-proof ind-warning">Referenced sources are not authenticated emitter registrations. No HMAC attestation, receipt or independent observation is inferred from the sample.</div>')+
 card('Forensic distinctions',list([
 'AL0/AL1/AL2 are declared scenario states; no computed canonical confidence score.',
 'A state-hash mismatch is an integrity investigation lead, not automatic malicious-tampering proof.',
 'First qualified divergence requires comparable independently evidenced states; not established here.',
 'Alert != prevention. API success != service-state convergence.',
 'Original sample issue counts, timestamps and judges scores are not promoted to live metrics.'
 ]))+'</div>'+
 '<div id="ind-report">'+card('Telecom Master Investigation Report · printable reference derivative',
 '<div class="ind-overline">SOURCE MODE · HISTORICAL TM FORUM REFERENCE</div>'+
 '<div class="ind-grid" style="margin:12px 0">'+
 tile('Network target',r.profile.referenceResource,'Illustrative resource label from source HTML')+
 tile('Selected state',selectedStage.id,'Historical source-scenario label')+
 tile('Canonical evaluation','NOT AVAILABLE','No HAIEC-issued telecom disposition or report ID')+'</div>'+
 '<div class="ind-compare"><div><h3>Executive consequence</h3>'+muted('The sample illustrates how delegated network authority and observed network effects may diverge; this page does not establish an operational incident.')+'</div><div><h3>Responsible owner</h3>'+muted(selectedStage.nextOwner)+'</div></div>'+
 '<h3 style="margin-top:13px">Next evidence required</h3>'+list(['Exact policy/delegation and network-resource identity','Registered source and lineage for request, dispatch and native state','Independent KPI/QoS time series and recovery confirmation'])+
 '<h3 style="margin-top:13px">Limitations and provenance</h3>'+list(r.limitations)+
 '<p style="margin-top:13px"><a href="'+x(r.source.sourceUrl)+'" target="_blank" rel="noopener">View original TM Forum report source ↗</a></p>'+
 '<div class="ind-proof" style="margin-top:13px">Digital signature: NOT_APPLICABLE. This is an illustrative or historical reference artifact outside the signing workflow.</div>'+
 '<p style="margin-top:13px"><button class="ind-action" data-ind-print="true">Print this reference report</button></p>','ind-auditor')+'</div>';
 return shell(p,content);
}
function simulation(p){
 const events=p.events||[];
 const eventRows=events.map(e=>({title:e.step.replaceAll('_',' '),at:e.at+' · '+e.id,detail:e.detail}));
 const cases=p.riskCases||[];
 const sourceItems=p.sourceFamilies||[];
 const audit=audience==='auditor';
 const caseCards='<div class="ind-list">'+cases.map(c=>'<div class="ind-list-item"><b>'+x(c.name)+'</b><p>'+x(c.question)+'</p><div class="ind-overline" style="margin-top:7px">Evidence needed</div><p>'+x(c.needed)+'</p></div>').join('')+'</div>';
 const content='<div class="ind-grid" id="ind-overview">'+
 tile('Source mode','SIMULATION ONLY','No qualified HAIEC evaluation or published receipt')+
 tile(p.resourceLabel,p.resource,'Fictional entity ID for narrative context')+
 tile('Native effect','NOT VERIFIED','Illustrative simulation does not prove a business-system mutation')+'</div>'+auditNote()+
 '<div class="ind-split" id="ind-consequence">'+
 card('Requested action → delegated business authority',
 '<div class="ind-overline">Proposed action</div>'+muted(p.action)+
 '<div class="ind-overline" style="margin-top:14px">Who may authorize it?</div>'+muted(p.authority)+
 '<div class="ind-overline" style="margin-top:14px">Source says the result is</div>'+muted(p.nativeEffect)+
 '<div class="ind-proof ind-warning" style="margin-top:14px">Potential business consequence: '+x(p.impact)+'</div>')+
 card('Why this matters in '+industryLabels[p.industryId],caseCards)+'</div>'+
 '<div class="ind-split" id="ind-evidence">'+
 card('Recorded fictional source events',steps(eventRows)+
 '<div class="ind-proof ind-warning" style="margin-top:12px">Each event is a source-world illustration. SIMULATED_REVIEW is not approved HAIEC delegation. SIMULATED_TARGET_STATUS is not a native effect witness.</div>')+
 card('Evidence to connect before an assurance verdict',
 list(sourceItems)+
 '<div class="ind-overline" style="margin-top:14px">Example control questions · not executed tests</div>'+
 list(p.controls)+
 '<p class="ind-sub" style="margin-top:12px">Source: '+x(p.sourcePackageRef)+'</p>')+'</div>'+
 '<div id="ind-report">'+card('Executive + technical reference report · '+p.name,
 '<div class="ind-overline">NOT AN ISSUED HAIEC MASTER ASSURANCE REPORT</div>'+
 '<div class="ind-compare" style="margin:13px 0"><div><h3>Potential impact</h3>'+muted(p.impact)+'</div><div><h3>Responsible decision owner</h3>'+muted(p.nextOwner)+'</div></div>'+
 '<h3>Case anatomy</h3><table class="ind-table"><tbody>'+
 '<tr><td>Hypothetical operation</td><td>'+x(p.action)+'</td></tr>'+
 '<tr><td>Approval boundary</td><td>'+x(p.authority)+'</td></tr>'+
 '<tr><td>Affected resource</td><td>'+x(p.resourceLabel)+': '+x(p.resource)+'</td></tr>'+
 '<tr><td>Potential consequence</td><td>'+x(p.impact)+'</td></tr>'+
 '<tr><td>Missing witness</td><td>No independent native-effect witness is bound — '+x(p.nativeEffect)+'. First evidence needed: '+x((p.riskCases&&p.riskCases[0]&&p.riskCases[0].needed)||'qualified source registration')+'</td></tr>'+
 '<tr><td>Human next step</td><td>'+x(p.nextOwner)+' reviews the boundary and decides which evidence must exist before this operation type could be assured.</td></tr>'+
 '</tbody></table>'+
 '<h3>Sample action trace</h3>'+steps(eventRows)+
 '<h3 style="margin-top:15px">Unresolved evidence frontier</h3>'+list(p.limitations)+
 '<div class="ind-proof ind-warning" style="margin-top:13px">No evaluation ID, U5 disposition, DAI authorization result or UCP receipt exists for this fictional profile. A printout is only a simulation reference.</div>'+
 '<div class="ind-proof" style="margin-top:13px">Digital signature: NOT_APPLICABLE. This is an illustrative or historical reference artifact outside the signing workflow.</div>'+
 '<p style="margin-top:14px"><button class="ind-action" data-ind-print="true">Print simulation reference</button></p>',audit?'ind-auditor':'')+'</div>';
 return shell(p,content);
}
function pageIndustry(){
 if(!source || source.schemaVersion!=='haiec-industry-read-model-1.0.0' || !source.mustClearEvaluationIdsOnProfileChange)
  return '<div class="notice warn"><b>NOT AVAILABLE</b><p>The industry source read model is missing or invalid. No industry assurance content can be rendered.</p></div>';
 const p=byId(selected);
 if(!p)return '<div class="notice warn"><b>NOT AVAILABLE</b><p>Unknown industry profile; no source evidence bound.</p></div>';
 if(p.industryId==='manufacturing')return manufacturer(p);
 if(p.industryId==='telecom' && p.reference && p.evidenceMode==='HISTORICAL_TMFORUM_REFERENCE')return telecom(p);
 if(p.evidenceMode==='SIMULATION_ONLY' && p.evaluationId===null && Array.isArray(p.events))return simulation(p);
 return '<div class="notice warn"><b>PROFILE SOURCE BOUNDARY FAILED</b><p>Cannot safely display a simulation as an evaluated result.</p></div>';
}
function chooseIndustry(id){
 if(!valid.includes(id)||!byId(id))return;
 // Atomic selector reset: never borrow tenant, case, report or assessment
 // pointers from the prior industry, including the manufacturing view.
 selected=id;telecomState='AL0';audience='executive';
 STATE.selectedSystem=null;STATE.selectedScenario=null;STATE.selectedWorkflow=null;
 if(typeof HX!=='undefined'){HX.system=null;HX.caseId=null;HX.s217case=null;}
 const url=new URL(window.location.href);
 ['profile','case','evaluationId','org','systemId','runId','reportUrl'].forEach(k=>url.searchParams.delete(k));
 url.searchParams.set('industry',id);
 window.history.replaceState(null,'',url.pathname+'?'+url.searchParams.toString());
 STATE.page='industry';render();window.scrollTo({top:0,behavior:'instant'});
}
document.addEventListener('change',event=>{
 const node=event.target;
 if(node.id==='ind-sector')chooseIndustry(node.value);
 if(node.id==='ind-audience'&&['executive','operations','engineer','auditor'].includes(node.value)){audience=node.value;render();}
 if(node.id==='ind-org'){const p=byId(selected);if(p && node.value!==p.profileId)chooseIndustry(selected);}
});
document.addEventListener('click',event=>{
 const stage=event.target.closest('[data-ind-state]');
 if(stage){const p=byId(selected);if(p&&p.industryId==='telecom'&&p.reference.states.some(s=>s.id===stage.dataset.indState)){telecomState=stage.dataset.indState;render();}return;}
 if(event.target.closest('[data-ind-print]')){window.print();}
});
if(!PAGES.some(p=>p.id==='industry'))PAGES.push({id:'industry',group:'See',label:'Industry Experiences',icon:'IN'});
PAGE_RENDERERS.industry=pageIndustry;
render();
})();
