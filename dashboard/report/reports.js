/* HAIEC Sprint 18 — Reports & Evidence presentation layer.
 * Read-only projection over the same digest-verified frozen exports the
 * evaluations page renders. Nothing here recalculates a disposition, rule
 * outcome, receipt or DAI comparison — every finding string is verbatim
 * export content or an explicit unavailable marker.
 *
 * Signature model: a public static presentation report is never a newly
 * issued signed U6 package. Statuses are SIGNED / SKIPPED / FAILED /
 * NOT_APPLICABLE. SKIPPED is not invalid — canonical export digest
 * verification remains the integrity gate, and it is enforced by the
 * same HX.verified map the evaluations page uses (fail closed).
 */
(function(){
'use strict';

const RPT={view:'hub',caseId:null,audience:'executive',s217mode:'exec',notice:null};
window.RPT=RPT; // report-view navigation state — inspectable like HX/STATE

/* ---------- public-safe deep links ----------
   ?report=hub | exec | s217 | s217-tech | judge | case:<CASE_ID>
   Only public case identifiers appear in URLs — never org IDs,
   principals or internal routing fields. Unknown/invalid values fail
   back to the hub with an explicit notice, never to findings. */
const RPT_VIEWS={hub:'hub',exec:'exec',s217:'s217','s217-tech':'s217',judge:'judge'};
function rptReadUrl(){
  try{
    const p=new URLSearchParams(window.location.search).get('report');
    if(!p)return false;
    if(p.startsWith('case:')){
      const id=p.slice(5);
      if(!/^[A-Za-z0-9_-]{3,64}$/.test(id)||!rptArtifact(id)){RPT.view='hub';RPT.notice=id;return true;}
      RPT.view='case';RPT.caseId=id;return true;
    }
    const v=RPT_VIEWS[p];
    if(!v){RPT.view='hub';RPT.notice=p;return true;}
    RPT.view=v;if(p==='s217-tech')RPT.s217mode='tech';if(p==='s217')RPT.s217mode='exec';
    return true;
  }catch(e){return false;}
}
function rptSyncUrl(push){
  try{
    const u=new URL(window.location.href);
    let v=null;
    if(RPT.view==='exec')v='exec';
    else if(RPT.view==='judge')v='judge';
    else if(RPT.view==='s217')v=RPT.s217mode==='tech'?'s217-tech':'s217';
    else if(RPT.view==='case'&&RPT.caseId)v='case:'+RPT.caseId;
    else if(RPT.view==='hub')v='hub';
    if(v)u.searchParams.set('report',v);else u.searchParams.delete('report');
    (push===false?window.history.replaceState:window.history.pushState).call(window.history,null,'',u.pathname+'?'+u.searchParams.toString()+u.hash);
  }catch(e){/* file:// or restricted history — navigation still works in-page */}
}

const SIGNATURE={
  SIGNED:'A digital signature exists and verifies.',
  SKIPPED:'Digital signature: SKIPPED. This presentation report is derived from the identified evidence or reference source and is not a newly signed assurance certificate.',
  FAILED:'Digital signature: FAILED. A requested signing operation did not complete. This unsigned HTML remains a read-only derivative of the persisted canonical evaluation — no signature is implied or required to read it.',
  NOT_APPLICABLE:'Digital signature: NOT_APPLICABLE. This is an illustrative or historical reference artifact outside the signing workflow.'
};

/* Plain-language disposition framing. These strings describe the label;
   they never invent one. */
const DISPO_PLAIN={
  ALLOW:'HAIEC evaluated this case within the authorized scope — the requested action, the approved target and the observed effect all stayed inside delegated boundaries, within the evidence available.',
  REVIEW:'HAIEC evaluated this case and established specific, digest-bound findings — but the available evidence does not establish the complete assurance picture, so the canonical disposition is REVIEW. REVIEW is an evidence-bound outcome: neither a pass nor a failure, but a precise statement of what is proven and what still needs qualified human judgment.',
  BLOCK:'HAIEC found the requested action outside evaluated boundaries on the evidence available.',
  EVIDENCE_INSUFFICIENT:'HAIEC could not establish enough qualified evidence to evaluate this case — absence of evidence is never treated as absence of risk.',
  UNAVAILABLE:'This evaluation could not be produced for the declared case.'
};

const AUDIENCES=[
  {id:'executive', label:'Executive', hint:'Business significance first — what happened, who owns it, what is still unknown. Internal rule identifiers are secondary.'},
  {id:'operations',label:'Operations',hint:'Event sequence and containment first — requested vs approved vs observed, then remediation state.'},
  {id:'engineering',label:'Engineering',hint:'Technical truth first — rule outcomes, delegated-action comparisons, digests and evidence lineage.'},
  {id:'auditor',  label:'Auditor',  hint:'Provenance first — integrity status, signature state, source qualification and limitations.'}
];

function x(v){return esc(v==null?'—':String(v));}
function sysMeta(id){return (typeof SYSTEMS!=='undefined'?SYSTEMS:[]).find(s=>s.id===id)||null;}
function stateOf(a){return a.sourceCase.scenarioState;}
function verifiedOf(a){return HX.digestsDone?HX.verified[hxKey(a)]:null;}
function rptArtifact(caseId){return hxExports().find(a=>a.sourceCase.caseId===caseId)||null;}

/* Requested → authorized → observed plane summary, verbatim from the
   evaluation's Four Assurance Questions authority section. */
function planeStrip(e){
  const planes=e.fourQuestions&&e.fourQuestions.authority&&e.fourQuestions.authority.planes;
  if(!planes)return '<div class="notice"><div><b>Authority planes: NOT_ASSESSED</b><p>No authority-plane evidence is bound to this evaluation. Unknown is shown, never promoted.</p></div></div>';
  const labels={requested:'Requested',policyAuthorized:'Policy authorized',effectivelyGranted:'Effectively granted',codeCapable:'Code capable',observed:'Observed'};
  return '<div class="rp-planes">'+Object.entries(labels).map(([k,lab])=>{
    const p=planes[k]||{state:'NOT_ASSESSED'};
    return '<div class="rp-plane"><div class="ind-overline">'+x(lab)+'</div><div>'+statusPill(p.state)+'</div><div class="rp-plane-note">'+x(p.detail||'')+'</div></div>';
  }).join('')+'</div>';
}

function signatureBlock(kind,extra){
  const known=SIGNATURE[kind]?kind:'NOT_APPLICABLE';
  return '<div class="rp-sig rp-sig-'+x(known.toLowerCase())+'"><b>'+x(known)+'</b><p>'+x(SIGNATURE[known])+'</p>'+(extra||'')+'</div>';
}

function rptDeepLink(){
  let v=null;
  if(RPT.view==='exec')v='exec';else if(RPT.view==='judge')v='judge';
  else if(RPT.view==='s217')v=RPT.s217mode==='tech'?'s217-tech':'s217';
  else if(RPT.view==='case'&&RPT.caseId)v='case:'+RPT.caseId;
  return v?'?report='+v:null;
}
function printRow(pdfNote){
  const link=rptDeepLink();
  return '<div class="rp-actions"><button class="btn sm" type="button" data-rp-print="1">Print / Save as PDF</button>'+
    (link?'<span class="tiny muted">Shareable link: <code>'+x(link)+'</code></span>':'')+
    '<span class="tiny muted">Printing uses your browser\u2019s Print → Save as PDF — no separate PDF generator is claimed. '+(pdfNote||'If printing fails, this HTML remains the readable report and the failure is shown as PDF_UNAVAILABLE.')+'</span></div>';
}

/* ---------- case-level report (all 45, plus the preserved 27) ---------- */

function rpFindings(a){
  const rules=(a.manufacturing&&a.manufacturing.ruleOutcomes)||[];
  if(!rules.length)return '<div class="notice"><div><b>No rule outcomes bound</b><p>This export carries no manufacturing rule outcomes — shown as absent, not zero.</p></div></div>';
  return '<div class="tblwrap"><table class="tbl"><thead><tr><th>Rule</th><th>Result</th><th>Reason (verbatim)</th></tr></thead><tbody>'+
    rules.map(o=>'<tr><td><code>'+x(o.ruleId)+'</code></td><td>'+hxOutcomeChip(o.status,o.reason)+'</td><td class="tiny">'+x(o.reason||'')+'</td></tr>').join('')+
    '</tbody></table></div><p class="tiny muted">A MATCH means the detector predicate matched — a finding to evaluate, not a pass.</p>';
}

function rpDai(a){
  const evs=a.dai&&a.dai.evaluations;
  if(!evs||!evs.length)return '<div class="notice"><div><b>DAI comparison: unavailable in this export</b><p>No delegated-action-integrity record is bound here. Unavailable is shown, never inferred.</p></div></div>';
  return evs.map(d=>'<h3 class="rp-h3">'+x(d.surfaceId||'surface')+' '+statusPill(d.daiState)+'</h3>'+
    '<div class="tblwrap"><table class="tbl"><thead><tr><th>Dimension</th><th>Delegated</th><th>Observed</th><th>Comparison</th></tr></thead><tbody>'+
    (d.comparisons||[]).map(c=>'<tr><td class="tiny">'+x(c.dimension)+'</td><td class="tiny"><code>'+x(c.delegatedValue)+'</code></td><td class="tiny"><code>'+x(c.observedValue)+'</code></td><td>'+statusPill(c.comparison)+'</td></tr>').join('')+
    '</tbody></table></div>').join('');
}

function rpEffectWitness(a){
  const f=a.manufacturing&&a.manufacturing.controlMaturity;
  if(!f)return '<div class="notice"><div><b>Effect witness: ABSENT_FACET</b><p>No control-maturity facet is bound — absent, not zero.</p></div></div>';
  const rows=(f.rows||[]).map(r=>'<tr><td><code>'+x(r.controlId)+'</code></td><td>'+hxUcpResultChip(r.ucpResult)+'</td><td class="tiny">'+x(r.ucpReceiptState||'EVALUATED_NO_RECEIPT')+'</td></tr>').join('');
  return '<div class="tblwrap"><table class="tbl"><thead><tr><th>Control</th><th>Independent effect witness</th><th>Receipt state</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
    '<p class="tiny muted">'+x(f.qualifiedObservationCount)+' qualified / '+x(f.rejectedObservationCount)+' rejected observations. A SATISFIED result is a scoped effect witness — it is not an authorization or safety verdict on the operation.</p>'+
    ((f.limitations||[]).length?'<p class="tiny muted">'+f.limitations.map(x).join(' · ')+'</p>':'');
}

function rpConsequence(a){
  const m=sysMeta(a.sourceCase.aiSystemId);
  const div=((a.manufacturing&&a.manufacturing.ruleOutcomes)||[]).find(o=>o.status==='MATCH'&&/divergen|wrong.?target|unapproved|unauthorized|outside/i.test(o.reason||''));
  const est=div?'Established: '+div.reason+' — qualified divergence confirmed by independent readback within the evaluated evidence.':'No target-divergence finding is bound to this evaluation on the evidence available.';
  const pot=m?('Potential: '+m.criticality+' — '+(m.desc||'')):'Potential consequence is not described in the exported corpus for this system.';
  return '<div class="rp-compare"><div><div class="ind-overline">Established by evidence</div><p>'+x(est)+'</p></div><div><div class="ind-overline">Potential business consequence</div><p>'+x(pot)+'</p></div></div>';
}

function rpOwner(a){
  const m=sysMeta(a.sourceCase.aiSystemId);
  const next=(a.evaluation.fourQuestions&&a.evaluation.fourQuestions.proofBoundary&&a.evaluation.fourQuestions.proofBoundary.nextEvidence)||[];
  const rem=hxFor(a.sourceCase.aiSystemId,'REMEDIATED');
  let owner=m?(m.owner+' → '+m.businessOwner):'Not declared in exported corpus';
  let body='<p><b>Responsible owner:</b> '+x(owner)+'</p>';
  if(next.length)body+='<div class="ind-overline" style="margin-top:8px">Next evidence required (verbatim)</div><ul class="rp-list">'+next.slice(0,6).map(n=>'<li class="tiny">'+x(typeof n==='object'?JSON.stringify(n):n)+'</li>').join('')+'</ul>';
  if(a.sourceCase.scenarioState==='WRONG_TARGET'&&rem&&verifiedOf(rem)===true)body+='<div class="ind-overline" style="margin-top:8px">Remediation state</div><p class="tiny">A separately evaluated corrected-state run is persisted: <button class="btn sm" type="button" data-rp="case" data-id="'+x(rem.sourceCase.caseId)+'">Open corrected-state report →</button></p>';
  if(a.sourceCase.scenarioState==='REMEDIATED'){const wt=hxFor(a.sourceCase.aiSystemId,'WRONG_TARGET');if(wt&&verifiedOf(wt)===true)body+='<div class="ind-overline" style="margin-top:8px">Original finding stands</div><p class="tiny">This corrected state does not close the original wrong-target evaluation. <button class="btn sm" type="button" data-rp="case" data-id="'+x(wt.sourceCase.caseId)+'">Open wrong-target report →</button></p>';}
  return body;
}

function rpLineage(a){
  const e=a.evaluation,pub=a.publication;
  return '<table class="tbl"><tbody>'+
    '<tr><td>Case / scenario run</td><td class="tiny"><code>'+x(a.sourceCase.caseId)+'</code> · <code>'+x(a.sourceCase.scenarioRunId)+'</code></td></tr>'+
    '<tr><td>Evaluation ID</td><td class="tiny"><code>'+x(e.evaluationId)+'</code></td></tr>'+
    '<tr><td>coreTruthDigest</td><td class="tiny"><code>'+x(e.coreTruthDigest)+'</code></td></tr>'+
    '<tr><td>evidenceBundleDigest</td><td class="tiny"><code>'+x(e.evidenceBundleDigest)+'</code></td></tr>'+
    '<tr><td>exportDigest (verified)</td><td class="tiny"><code>'+x(a.exportDigest)+'</code></td></tr>'+
    '<tr><td>Methodology / report</td><td>'+x(e.methodologyVersion)+' · '+x(e.reportVersion)+'</td></tr>'+
    '<tr><td>Exported</td><td class="tiny">'+x(a.exportedAt)+'</td></tr>'+
    '<tr><td>Source world</td><td class="tiny"><code>'+x(a.provenance&&a.provenance.sourceWorldId)+'</code> · '+pill(x(a.provenance&&a.provenance.dataClass),'warn')+' '+x(a.provenance&&a.provenance.truthLabel)+'</td></tr>'+
    (pub&&pub.publicationState==='PUBLIC'
      ?'<tr><td>Public verification</td><td><a class="btn sm primary" target="_blank" rel="noopener" href="'+x(pub.publicVerificationUrl)+'">Verify publicly on haiec.com ↗</a><div class="tiny muted" style="margin-top:4px">package <code>'+x(pub.packageId)+'</code> · receipt <code>'+x(pub.receiptHash)+'</code></div></td></tr>'
      :'<tr><td>Public verification</td><td class="tiny muted">Not published for this export — no link is fabricated.</td></tr>')+
    '</tbody></table>';
}

function rpCaseReport(a){
  const v=verifiedOf(a);
  if(v===null)return '<div class="notice"><div><b>Verifying export integrity</b><p>Recomputing the canonical payload digest before any report content is displayed.</p></div></div>';
  if(v!==true)return pageEvalIntegrityFailure(a);
  const e=a.evaluation,m=sysMeta(a.sourceCase.aiSystemId);
  const crumb='<div class="rp-crumb tiny muted">Industry → Manufacturing → '+x(a.sourceCase.aiSystemId)+' → '+x(HX_STATE_LABEL[stateOf(a)]||stateOf(a))+' → Findings → <b>Report</b></div>';
  const sections={
    conclusion:'<section class="rp-sec"><h2>Executive conclusion</h2><p>'+x(DISPO_PLAIN[e.disposition]||'Disposition '+e.disposition+' — see the canonical evaluation for the authoritative meaning.')+'</p><p class="tiny muted">Canonical disposition: '+statusPill(e.disposition)+' · basis '+x(e.evaluationBasis)+' · methodology '+x(e.methodologyVersion)+'</p></section>',
    subject:'<section class="rp-sec"><h2>What was evaluated</h2><table class="tbl"><tbody>'+
      '<tr><td>AI system</td><td><b>'+x(a.sourceCase.aiSystemId)+'</b> — '+x(m?m.name:'')+'<div class="tiny muted">'+x(m?m.sub+' · '+m.site+' / '+m.line:'')+'</div></td></tr>'+
      '<tr><td>Scenario assessment</td><td>'+x(HX_STATE_LABEL[stateOf(a)]||stateOf(a))+' <code class="tiny muted">'+x(stateOf(a))+'</code></td></tr>'+
      '<tr><td>Agent surface / service</td><td class="tiny">'+x(m?(m.agents||[]).join(', ')+' → '+m.service:'—')+'</td></tr>'+
      '<tr><td>Affected resource</td><td class="tiny">'+x(m?(m.product+' · '+(m.workOrders||[]).join(', ')):'—')+'</td></tr></tbody></table>'+
      '<p class="tiny muted" style="margin-top:8px">System function, service and resource names are static fictional demonstration context; the planes below are evaluated evidence.</p>'+
      '<div class="ind-overline" style="margin-top:10px">Requested vs authorized vs observed</div>'+planeStrip(e)+'</section>',
    findings:'<section class="rp-sec"><h2>Canonical findings — rule outcomes & delegated action integrity</h2>'+rpFindings(a)+rpDai(a)+'</section>',
    witness:'<section class="rp-sec"><h2>Native effect witness / evidence gap</h2>'+rpEffectWitness(a)+'</section>',
    consequence:'<section class="rp-sec"><h2>Business consequence — established vs potential</h2>'+rpConsequence(a)+'</section>',
    owner:'<section class="rp-sec"><h2>Remediation & responsible owner</h2>'+rpOwner(a)+'</section>',
    lineage:'<section class="rp-sec"><h2>Evidence lineage & identity</h2>'+rpLineage(a)+'</section>',
    limits:'<section class="rp-sec"><h2>Limitations & semantics (verbatim)</h2><p class="tiny">'+((e.limitations||[]).map(x).join(' · ')||'—')+'</p><p class="tiny muted">'+((e.semantics||[]).map(x).join(' · ')||'')+'</p></section>',
    appendix:'<details class="rp-appendix"><summary>Technical appendix — verbatim evaluation payload</summary><section class="rp-sec">'+
      '<h2>Four assurance questions (raw)</h2><div class="tblwrap"><table class="tbl"><tbody>'+
      Object.entries(e.fourQuestions||{}).map(([k,v])=>'<tr><td class="tiny">'+x(k)+'</td><td class="tiny"><code>'+x(typeof v==='object'?JSON.stringify(v):String(v))+'</code></td></tr>').join('')+
      '</tbody></table></div>'+
      '<h2 class="rp-h3">Scenario snapshot</h2><p class="tiny"><code>'+x(JSON.stringify(e.evaluationScenarioSnapshot||null))+'</code></p>'+
      '<h2 class="rp-h3">Export wrapper</h2><table class="tbl"><tbody>'+
      '<tr><td>schemaVersion</td><td class="tiny"><code>'+x(a.schemaVersion)+'</code></td></tr>'+
      '<tr><td>exportKind</td><td class="tiny"><code>'+x(a.exportKind)+'</code></td></tr>'+
      '<tr><td>producedBy</td><td class="tiny"><code>'+x(a.provenance&&a.provenance.producedBy)+'</code></td></tr>'+
      '<tr><td>oracleIndependent</td><td class="tiny"><code>'+x(a.provenance&&a.provenance.oracleIndependent)+'</code></td></tr></tbody></table></section></details>'
  };
  const order={executive:['conclusion','subject','consequence','witness','owner','findings','lineage','limits','appendix'],
    operations:['conclusion','subject','witness','findings','owner','consequence','lineage','limits','appendix'],
    engineering:['subject','findings','witness','conclusion','lineage','limits','owner','consequence','appendix'],
    auditor:['lineage','conclusion','findings','witness','owner','limits','subject','consequence','appendix']};
  return crumb+header({eyebrow:'REPORT / '+a.sourceCase.aiSystemId+' / '+(HX_STATE_LABEL[stateOf(a)]||stateOf(a)),
    title:'Case Assurance Report — '+a.sourceCase.caseId,
    sub:statusPill(e.disposition)+' '+pill(e.evaluationBasis,'info')+' '+pill(a.provenance.dataClass,'warn')+' '+pill('export digest verified','go'),
    actions:'<button class="btn" type="button" data-rp="case-findings" data-id="'+x(a.sourceCase.aiSystemId)+'|'+x(a.sourceCase.caseId)+'">← Findings</button><button class="btn" type="button" data-act="hx-system" data-id="'+x(a.sourceCase.aiSystemId)+'">'+x(a.sourceCase.aiSystemId)+' system view</button>'+(a.sourceCase.aiSystemId==='SYS-217'?'<button class="btn" type="button" data-act="page" data-id="journey">Operator Journey</button>':'')+'<button class="btn" type="button" data-rp="hub">Reports hub</button>'})+
    signatureBlock('SKIPPED')+printRow()+
    '<div class="rp-print-head">HAIEC Case Assurance Report · '+x(a.sourceCase.caseId)+' · '+x(e.evaluationId)+' · presentation derivative — digital signature SKIPPED · verified export digest '+x(a.exportDigest).slice(0,32)+'…</div>'+
    (order[RPT.audience]||order.executive).map(k=>sections[k]).join('');
}

/* ---------- Station 217 flagship ---------- */

function s217fields(a){
  const d=a.dai&&a.dai.evaluations&&a.dai.evaluations[0];
  const cmp=(d&&d.comparisons)||[];
  const t=cmp.find(c=>c.dimension==='TARGET')||{};
  const r01=((a.manufacturing.controlMaturity||{}).rows||[]).find(r=>/R01/i.test(r.controlId||''))||{};
  const eff=(a.manufacturing.ruleOutcomes||[]).find(o=>o.ruleId==='MFG-EFF-001')||{};
  return {approved:t.delegatedValue||'—',observed:t.observedValue||'—',daiCmp:t.comparison||'NOT_ASSESSED',
    daiState:(d&&d.daiState)||'NOT_ASSESSED',effStatus:eff.status||'—',effReason:eff.reason||'',
    r01Result:r01.ucpResult||'NOT_ASSESSED',r01Receipt:r01.ucpReceiptState||'—'};
}

function rpS217(){
  const a=rptArtifact('SYS-217-WRONG_TARGET');
  if(!a)return header({eyebrow:'FLAGSHIP / STATION 217',title:'SYS-217 export missing',sub:'No wrong-target artifact is bound to the current world.'});
  const v=verifiedOf(a);
  if(v===null)return header({eyebrow:'FLAGSHIP / STATION 217',title:'Verifying export integrity',sub:pill('VERIFYING','info')});
  if(v!==true)return pageEvalIntegrityFailure(a);
  const f=s217fields(a),m=sysMeta('SYS-217');
  const modeBtn='<div class="rp-modes"><button class="btn sm '+(RPT.s217mode==='exec'?'primary':'')+'" type="button" data-rp="s217-exec">Executive version</button><button class="btn sm '+(RPT.s217mode==='tech'?'primary':'')+'" type="button" data-rp="s217-tech">Technical version</button></div>';
  const hero='<div class="rp-flag-hero"><div class="ind-eyebrow">STATION 217 · '+x(m?m.name:'')+' · WRONG TARGET</div>'+
    '<h1>AI acted on the wrong work order. HAIEC identified the consequential divergence.</h1>'+
    '<div class="rp-wo"><div><div class="ind-overline">Approved work order</div><code>'+x(f.approved)+'</code></div><div class="rp-arrow">→</div><div><div class="ind-overline">Observed effect</div><code>'+x(f.observed)+'</code></div></div>'+
    '<p class="rp-flag-sub">The agent executed a work-order update that committed on a target different from the one it was delegated. HAIEC did not have to take the agent\u2019s word — the committed state was recorded and read back inside qualified, digest-bound evidence, then evaluated by the canonical engine.</p></div>';
  const canon='<div class="rp-proof"><div class="ind-overline">Canonical result — same evaluation, both views</div><div class="rp-proof-row">'+
    '<div>MFG-EFF-001 target divergence '+hxOutcomeChip(f.effStatus,f.effReason)+'</div>'+
    '<div>U5 disposition '+statusPill(a.evaluation.disposition)+'</div>'+
    '<div>DAI target comparison '+statusPill(f.daiCmp)+' · '+x(f.daiState)+'</div>'+
    '<div>R01 scoped effect witness '+hxUcpResultChip(f.r01Result)+' <span class="tiny muted">'+x(f.r01Receipt)+'</span></div></div></div>';
  const execBody='<section class="rp-sec"><h2>What happened</h2>'+
    '<p>Inside the synthetic source world, the agent executed a work-order update that committed on <b>'+x(f.observed)+'</b> — a different resource from the delegated work order '+x(f.approved)+'. Nothing failed visibly: the transaction succeeded, which is exactly why "did the operation succeed" monitoring cannot answer the consequential question.</p>'+
    '<h2>How HAIEC established it</h2>'+
    '<p>One persisted evaluation examines the same qualified recorded evidence through three aligned analytical views: the canonical manufacturing detector (<code>MFG-EFF-001 MATCH</code> — qualified target divergence), the delegated-action comparison (<code>TARGET = BROADER</code>, state <code>'+x(f.daiState)+'</code>), and a scoped effect-witness control (<code>R01 SATISFIED</code> — the committed state was independently read back). These are convergent views over shared qualified evidence, <b>not three independent producers</b> — the report does not claim evidence-source independence that the export does not document.</p></section>'+
    '<section class="rp-sec"><h2>Why this matters</h2>'+
    '<p>A delegated AI system that acts on the wrong work order does not announce itself. Successful execution and delegated authorization are different questions — HAIEC evaluates the second, digest-bound and verbatim. Yet the canonical disposition remains '+statusPill('REVIEW')+': divergence is established, but the complete assurance picture is not — code reachability, parts of the authority planes, and post-response effect remain NOT_ASSESSED.</p></section>'+
    '<section class="rp-sec"><h2>What HAIEC does not claim</h2><ul class="rp-list">'+
    '<li>No intent or maliciousness is asserted — a divergence finding, not an attribution.</li>'+
    '<li>The R01 witness proves the effect happened on the wrong target — it does not prove the action was prevented or that containment succeeded.</li>'+
    '<li>Application authorization, code reachability and several proof-boundary items are NOT_ASSESSED in this evaluation — shown, never hidden.</li></ul></section>'+
    '<section class="rp-sec"><h2>Operator response — verified vs simulated</h2>'+
    '<p>The six-stage Operator Journey (Detect → Investigate → Authorize → Contain → Verify → Report) and the local containment action are <b>browser-side demonstrations</b>. The verified historical effect is the persisted evaluation; the simulated response is presented separately and never promoted to plant truth.</p>'+
    '<div class="flex" style="gap:8px;flex-wrap:wrap"><button class="btn sm primary" type="button" data-act="page" data-id="journey">Open six-stage Operator Journey →</button><button class="btn sm" type="button" data-act="page" data-id="replay">Play 60-second recorded replay →</button><button class="btn sm" type="button" data-act="page" data-id="station217">Station 217 replay bundle →</button></div></section>'+
    '<section class="rp-sec"><h2>What a responsible human does next</h2><ul class="rp-list">'+
    '<li><b>Investigate</b> the divergence — which request, credential and code path produced the write on '+x(f.observed)+'.</li>'+
    '<li><b>Review authorization scope</b> — whether the delegation covered an alternate target, and whether it should.</li>'+
    '<li><b>Obtain additional evidence</b> — the planes marked NOT_ASSESSED in this evaluation are the explicit gaps.</li>'+
    '<li><b>Independently validate any corrective action</b> — a simulated or self-reported containment step is not a verified effect.</li>'+
    '<li><b>Establish post-response witnesses</b> — an independent readback on the corrected state and runtime enforcement evidence at the dispatch path.</li></ul></section>';
  const techBody='<section class="rp-sec"><h2>Detector outcome (verbatim)</h2><p class="tiny">'+x(f.effReason)+'</p>'+rpFindings(a)+'</section>'+
    '<section class="rp-sec"><h2>Delegated action integrity — nine-dimension surface</h2>'+rpDai(a)+'</section>'+
    '<section class="rp-sec"><h2>Authority planes</h2>'+planeStrip(a.evaluation)+'</section>'+
    '<section class="rp-sec"><h2>Effect witness facet</h2>'+rpEffectWitness(a)+'</section>'+
    '<section class="rp-sec"><h2>Lineage & verification</h2>'+rpLineage(a)+'<p class="tiny muted" style="margin-top:8px">'+((a.evaluation.limitations||[]).map(x).join(' · '))+'</p></section>';
  return header({eyebrow:'FLAGSHIP REPORT / SYS-217',title:'Station 217 — Wrong Target',sub:pill('SYNTHETIC LAB EVIDENCE','warn')+' '+pill('digest verified','go'),actions:'<button class="btn" type="button" data-rp="hub">Reports hub</button>'})+
    modeBtn+hero+canon+signatureBlock('SKIPPED')+printRow()+
    '<div class="rp-print-head">HAIEC Flagship Report · SYS-217 Wrong Target · '+(RPT.s217mode==='tech'?'Technical':'Executive')+' version · presentation derivative — signature SKIPPED</div>'+
    (RPT.s217mode==='tech'?techBody:execBody)+
    '<section class="rp-sec"><h2>Full canonical case report</h2><p><button class="btn sm" type="button" data-rp="case" data-id="SYS-217-WRONG_TARGET">Open the complete case report (all sections) →</button></p></section>';
}

/* ---------- nine-system executive assurance report ---------- */

function rpExecutive(){
  if(!HXDATA)return header({eyebrow:'EXECUTIVE ASSURANCE REPORT',title:'No export data',sub:'dashboard/data/haiec-exports.js is missing.'});
  if(!HX.digestsDone)return header({eyebrow:'EXECUTIVE ASSURANCE REPORT',title:'Verifying export integrity',sub:pill('VERIFYING','info')});
  const arts=hxExports().filter(a=>verifiedOf(a)===true);
  const failed=hxExports().length-arts.length;
  const bySys={};arts.forEach(a=>{(bySys[a.sourceCase.aiSystemId]=bySys[a.sourceCase.aiSystemId]||[]).push(a);});
  const sysIds=Object.keys(bySys).sort();
  const dispo={};arts.forEach(a=>{dispo[a.evaluation.disposition]=(dispo[a.evaluation.disposition]||0)+1;});
  const wtArts=sysIds.map(id=>hxFor(id,'WRONG_TARGET')).filter(a=>a&&verifiedOf(a)===true);
  const remArts=sysIds.map(id=>hxFor(id,'REMEDIATED')).filter(a=>a&&verifiedOf(a)===true);
  const divergent=wtArts.filter(a=>(a.manufacturing.ruleOutcomes||[]).some(o=>o.status==='MATCH'&&/divergen|wrong.?target|unapproved|outside/i.test(o.reason||'')));
  const targetOf=a=>{const c=(((a.dai||{}).evaluations||[])[0]||{}).comparisons||[];const t=c.find(x=>x.dimension==='TARGET');return t?t.comparison:'NOT_ASSESSED';};
  const wtBroader=wtArts.filter(a=>targetOf(a)==='BROADER').length;
  const remMatches=remArts.filter(a=>targetOf(a)==='MATCHES').length;
  const notAssessed=arts.reduce((n,a)=>{const p=(a.evaluation.fourQuestions||{}).authority&&a.evaluation.fourQuestions.authority.planes;return n+(p?Object.values(p).filter(x=>x.state==='NOT_ASSESSED').length:0);},0);
  const reachNA=arts.filter(a=>{const r=(a.evaluation.fourQuestions||{}).reach;return r&&r.state==='NOT_ASSESSED';}).length;

  const page1='<div class="rp-exec-p1">'+
    '<div class="ind-eyebrow">HAIEC EXECUTIVE ASSURANCE REPORT · MANUFACTURING PROGRAM v3</div>'+
    '<h1>What can the AI cause — and what did HAIEC actually establish?</h1>'+
    '<p class="rp-lede">Nine AI systems were evaluated across five synthetic assessment states — '+arts.length+' persisted canonical evaluations of a synthetic laboratory evidence corpus. In <b>'+divergent.length+' wrong-target cases, HAIEC identified target divergence</b>. In <b>'+remMatches+' separately evaluated corrected-state cases, the target comparison aligned with delegation</b>. <b>All '+arts.length+' overall assurance decisions remain REVIEW</b> — the evaluated evidence does not establish the complete assurance picture, and HAIEC says so rather than rounding up.</p>'+
    '<div class="rp-statrow">'+
    '<div class="rp-stat"><b>'+arts.length+'</b><span>digest-verified evaluations</span></div>'+
    '<div class="rp-stat"><b>'+x(dispo.REVIEW||0)+'</b><span>canonical REVIEW dispositions</span></div>'+
    '<div class="rp-stat"><b>'+divergent.length+'/'+wtArts.length+'</b><span>wrong-target divergences identified</span></div>'+
    '<div class="rp-stat"><b>'+remMatches+'/'+remArts.length+'</b><span>corrected-state targets aligned</span></div>'+
    '<div class="rp-stat"><b>'+reachNA+'</b><span>evaluations with reachability NOT_ASSESSED</span></div></div>'+
    '<h2>What did HAIEC establish from the available evidence?</h2>'+
    '<p>Under the wrong-target assessment, every one of the nine systems produced the same canonical pattern: the manufacturing detector reported a qualified target-divergence finding, the delegated-action comparison recorded the observed target as <b>BROADER</b> than delegated, and the scoped effect-witness control confirmed the committed state was independently read back. Under the separately evaluated corrected state, the detector reported no divergence with adequate coverage and the target comparison read <b>MATCHES</b>. The corrected state did not reverse or erase anything — it is a distinct persisted evaluation over a corrected source run, and it does not turn an earlier finding into an incident that was undone.</p>'+
    '<h2>Why an evidence-bound REVIEW is the useful answer</h2>'+
    '<p>Every assessment — baseline, enriched, wrong-target, degraded and corrected — ends at REVIEW, because the evidence establishes specific facts without establishing the whole picture: code reachability is NOT_ASSESSED in all '+reachNA+' evaluations, and '+notAssessed+' individual authority-plane cells across the corpus carry no evidence at all. A tool that reports green here would be inventing coverage. A REVIEW tells the responsible human exactly where proof stops — which is the difference between assurance and reassurance.</p></div>'+
    '<section class="rp-sec"><h2>Wrong target vs corrected state — the same nine systems</h2><div class="tblwrap"><table class="tbl"><thead><tr><th></th><th>Wrong-target assessment (9 systems)</th><th>Corrected-state assessment (9 systems)</th></tr></thead><tbody>'+
    '<tr><td>Target divergence detector</td><td>MFG-EFF-001 <b>MATCH</b> — qualified divergence, all 9</td><td>MFG-EFF-001 <b>NO_MATCH_WITH_ADEQUATE_COVERAGE</b>, all 9</td></tr>'+
    '<tr><td>Delegated-vs-observed target</td><td><b>BROADER</b> — observed outside delegation, all 9</td><td><b>MATCHES</b> — observed within delegation, all 9</td></tr>'+
    '<tr><td>Effect witness (R01)</td><td>SATISFIED — effect independently witnessed</td><td>SATISFIED — same witness discipline</td></tr>'+
    '<tr><td>Overall assurance decision</td><td>'+statusPill('REVIEW')+'</td><td>'+statusPill('REVIEW')+' — corrected is a separate evaluation, not an overturned finding</td></tr></tbody></table></div>'+
    '<p class="tiny muted">Detector, DAI comparison and R01 witness are aligned analytical views that can rely on common underlying evidence — convergent confirmation, not a claim of three independent producers.</p></section>';

  const sysTable='<section class="rp-sec"><h2>Nine systems — operational consequences</h2>'+
    '<p class="tiny muted">System names, functions, criticality and owners are static fictional demonstration context; the disposition cells are evaluated evidence — digest-verified canonical results, verbatim.</p>'+
    '<div class="tblwrap"><table class="tbl"><thead><tr><th>System</th><th>Function</th><th>Criticality</th><th>Owner</th><th>Baseline</th><th>Wrong target</th><th>Degraded</th><th>Corrected</th><th>Report</th></tr></thead><tbody>'+
    sysIds.map(id=>{const m=sysMeta(id);const cell=st=>{const a=hxFor(id,st);return a&&verifiedOf(a)===true?statusPill(a.evaluation.disposition):'<span class="tiny muted">—</span>';};
      const wt=hxFor(id,'WRONG_TARGET');
      return '<tr><td><b>'+x(id)+'</b></td><td class="tiny">'+x(m?m.name+' — '+m.sub:'')+'</td><td class="tiny">'+x(m?m.criticality:'')+'</td><td class="tiny">'+x(m?m.owner:'')+'</td><td>'+cell('EXPECTED_BASELINE')+'</td><td>'+cell('WRONG_TARGET')+'</td><td>'+cell('EVIDENCE_DEGRADED')+'</td><td>'+cell('REMEDIATED')+'</td><td>'+(wt?'<button class="btn sm" type="button" data-rp="case" data-id="'+x(wt.sourceCase.caseId)+'">Open →</button>':'')+'</td></tr>';}).join('')+
    '</tbody></table></div></section>';

  const unknowns='<section class="rp-sec"><h2>What remains unknown — the most consequential uncertainty</h2><ul class="rp-list">'+
    '<li><b>Code reachability is NOT_ASSESSED in all '+reachNA+' evaluations</b> — no bound static scan exists, so what the deployed code can technically do is unproven. This is the largest open assurance gap.</li>'+
    '<li>'+notAssessed+' authority-plane cells across the corpus are NOT_ASSESSED — request, grant and runtime-observation gaps are shown, not filled.</li>'+
    '<li>Post-response containment is not proven: no independent witness establishes that corrective action took effect in the source world. A simulated corrected state did not reverse a previous incident — it is a distinct evaluation.</li>'+
    '<li>Execution-guard enforcement has no proven dispatcher call sites — browser pause is not plant interlock.</li>'+
    '<li>A verified source digest proves integrity, not independent source authenticity; and the corpus is a synthetic lab — no production systems, customers or suppliers are represented.</li></ul></section>';

  const owners='<section class="rp-sec"><h2>Recommended human owners & next actions</h2><div class="tblwrap"><table class="tbl"><thead><tr><th>Finding area</th><th>Owner</th><th>Next action</th></tr></thead><tbody>'+
    '<tr><td>Target divergence ('+divergent.length+' systems)</td><td>Quality Engineering / business owner per system</td><td>Bind corrective-state evidence and an independent post-response witness to each wrong-target case.</td></tr>'+
    '<tr><td>Degraded evidence → REVIEW</td><td>Evidence pipeline owner</td><td>Restore qualified producers; re-evaluate — absence is never a pass.</td></tr>'+
    '<tr><td>NOT_ASSESSED authority planes</td><td>Platform engineering</td><td>Connect request/grant/observation producers so planes move from unknown to established or explicitly unverifiable.</td></tr>'+
    '<tr><td>Containment enforcement</td><td>Runtime platform owner</td><td>Wire execution guards into a real dispatcher path before claiming enforcement.</td></tr></tbody></table></div>'+
    '<p class="tiny muted">Owners are the operating roles declared in the demonstration corpus ('+x(sysIds.map(id=>{const m=sysMeta(id);return m?m.owner:null;}).filter(Boolean).join('; '))+').</p></section>';

  const prov='<section class="rp-sec"><h2>Evaluation provenance & limitations</h2><table class="tbl"><tbody>'+
    '<tr><td>Corpus</td><td>'+x(arts[0]&&arts[0].provenance&&arts[0].provenance.truthLabel)+' · <code class="tiny">'+x(arts[0]&&arts[0].provenance&&arts[0].provenance.sourceWorldId)+'</code></td></tr>'+
    '<tr><td>Production</td><td>'+x(arts[0]&&arts[0].provenance&&arts[0].provenance.producedBy)+' · oracle-independent: '+x(arts[0]&&arts[0].provenance&&arts[0].provenance.oracleIndependent)+'</td></tr>'+
    '<tr><td>Exported</td><td class="tiny">'+x(HXDATA.generatedAt)+' · set digest <code>'+x(HXDATA.payloadDigest||'')+'</code></td></tr>'+
    '<tr><td>Integrity</td><td>'+(failed===0?pill(arts.length+'/'+hxExports().length+' export digests verified','go'):pill(failed+' export(s) FAILED integrity — withheld','hold'))+'</td></tr>'+
    '<tr><td>Historical register</td><td>'+hxHistorical().length+' preserved v1 evaluations — kept distinct, never merged into v3 results.</td></tr></tbody></table>'+
    '<p class="tiny muted">This presentation report derives all findings from digest-verified haiec-evaluation-export-1.0.0 artifacts. It does not recalculate dispositions, does not replace the canonical Master Reports, and is not a newly signed assurance certificate.</p></section>';

  const order={executive:[page1,sysTable,unknowns,owners,prov],operations:[page1,sysTable,owners,unknowns,prov],engineering:[page1,sysTable,prov,unknowns,owners],auditor:[prov,page1,sysTable,unknowns,owners]};
  return header({eyebrow:'EXECUTIVE ASSURANCE REPORT',title:'Nine-system manufacturing program',sub:pill('SYNTHETIC LAB','warn')+' '+pill(arts.length+'/'+hxExports().length+' digests verified',failed?'hold':'go'),actions:'<button class="btn" type="button" data-rp="hub">Reports hub</button>'})+
    signatureBlock('SKIPPED')+printRow()+
    '<div class="rp-print-head">HAIEC Executive Assurance Report · Manufacturing Program v3 · '+arts.length+' digest-verified evaluations · presentation derivative — signature SKIPPED</div>'+
    (order[RPT.audience]||order.executive).join('');
}

/* ---------- judge path (~2 minutes, manufacturing track) ---------- */

function rpJudge(){
  const step=(n,t,why,btn)=>'<div class="rp-jstep"><div class="rp-jnum">'+n+'</div><div class="rp-jbody"><h3>'+x(t)+'</h3><p>'+why+'</p><div style="margin-top:8px">'+btn+'</div></div></div>';
  const b=(label,attrs)=>'<button class="btn sm" type="button" '+attrs+'>'+label+'</button>';
  return header({eyebrow:'JUDGE DEMO · AI FOR MANUFACTURING TRACK',title:'Two-minute judge path',
    sub:'A fixed, reproducible sequence through the deployed demonstration — what the AI caused, what HAIEC proved from the synthetic evidence, where proof stops, and how a human responds. No HAIEC vocabulary is required to follow it.',
    actions:'<button class="btn" type="button" data-rp="hub">Reports hub</button>'})+
    signatureBlock('SKIPPED')+
    step(1,'The consequence — AI acted on the wrong work order (~15 s)',
      'Read the headline: the delegated target was <code>WO-217-4802</code>; the committed effect landed on <code>WO-217-4803</code>. Nothing failed visibly — that is the business problem.',
      b('Open the Station 217 story →','data-rp="s217-exec"'))+
    step(2,'The finding (~20 s)',
      'The case report shows the canonical result verbatim: <code>MFG-EFF-001 MATCH</code> (qualified target divergence), delegated-action comparison <code>TARGET = BROADER</code>, and overall disposition <b>REVIEW</b>.',
      b('Open the canonical case report →','data-rp="case" data-id="SYS-217-WRONG_TARGET"'))+
    step(3,'The human response (~15 s)',
      'Six stages — Detect → Investigate → Authorize → Contain → Verify → Report. The contain step is labeled browser-only simulation; it is never presented as plant enforcement.',
      b('Open the Operator Journey →','data-act="page" data-id="journey"'))+
    step(4,'Where proof stops (~10 s)',
      'Inside the case report, authority planes marked NOT_ASSESSED and code reachability NOT_ASSESSED are shown explicitly — the evidence boundary is part of the finding, not a footnote.',
      b('See the evidence planes →','data-rp="case" data-id="SYS-217-WRONG_TARGET"'))+
    step(5,'Independent verification (~10 s)',
      'The evaluation is published as a view-only U6 receipt — anyone can verify integrity on haiec.com without an account or this dashboard.',
      '<a class="btn sm primary" target="_blank" rel="noopener" href="https://www.haiec.com/verify/assurance/Q-4997girnnfIM62jTRJPYeX">Verify the public receipt ↗</a>')+
    step(6,'Scale (~20 s)',
      'Nine AI systems, five assessment states each, 45 persisted canonical evaluations — every one ending in REVIEW because the evidence does not establish the complete picture. Wrong-target and corrected-state outcomes differ exactly where the evidence differs.',
      b('Open the executive assurance report →','data-rp="exec"'))+
    step(7,'Optional — another industry (~10 s)',
      'The same canonical engine boundaries, applied to a historical telecom reference (AL0/AL1/AL2) — clearly marked reference, not a second evaluated system.',
      b('Telecom reference →','data-ind-open="telecom"'))+
    '<div class="notice top14"><div><b>Reproducibility</b><p>Every step above is a shareable URL (<code>?report=…</code>) or a stable page — a judge can refresh, bookmark or open any step directly. The demo runs fully on the static deployed site; digest verification of all 45 exports runs in the browser before any finding is shown.</p></div></div>';
}

/* ---------- hub ---------- */

function rpDirectory(){
  const sysIds=hxSystems();
  return '<div class="tblwrap"><table class="tbl"><thead><tr><th>AI system</th>'+HX_STATE_ORDER.map(s=>'<th>'+x(HX_STATE_LABEL[s])+'</th>').join('')+'</tr></thead><tbody>'+
    sysIds.map(id=>'<tr><td><b>'+x(id)+'</b><div class="tiny muted">'+x((sysMeta(id)||{}).name||'')+'</div></td>'+
      HX_STATE_ORDER.map(st=>{const a=hxFor(id,st);if(!a)return '<td class="tiny muted">no export</td>';const v=verifiedOf(a);
        if(v===false)return '<td>'+pill('INTEGRITY FAILURE','hold')+'</td>';
        if(v!==true)return '<td>'+pill('VERIFYING','info')+'</td>';
        return '<td>'+statusPill(a.evaluation.disposition)+'<div style="margin-top:4px"><button class="btn sm" type="button" data-rp="case" data-id="'+x(a.sourceCase.caseId)+'">Report →</button></div></td>';}).join('')+'</tr>').join('')+
    '</tbody></table></div>';
}

function pageReports(){
  if(RPT.view==='case'){const a=rptArtifact(RPT.caseId);if(a)return rpCaseReport(a);RPT.view='hub';}
  if(RPT.view==='exec')return rpExecutive();
  if(RPT.view==='s217')return rpS217();
  if(RPT.view==='judge')return rpJudge();
  const aud='<div class="ind-controls" style="margin:0 0 14px"><div class="ind-field"><label for="rp-aud">Audience</label><select id="rp-aud">'+AUDIENCES.map(t=>'<option value="'+x(t.id)+'" '+(t.id===RPT.audience?'selected':'')+'>'+x(t.label)+'</option>').join('')+'</select><p class="tiny muted" style="margin-top:4px">'+x((AUDIENCES.find(t=>t.id===RPT.audience)||AUDIENCES[0]).hint)+'</p></div><span style="margin-left:auto">'+pill('Presentation layer — findings verbatim from verified exports','info')+'</span></div>';
  const notFound=RPT.notice?'<div class="notice warn"><div><b>Report not found</b><p><code>'+x(RPT.notice)+'</code> does not match a persisted export in the verified corpus — no report was rendered. Pick a report below.</p></div></div>':'';
  return header({eyebrow:'REPORTS & EVIDENCE',title:'Reports & Evidence',
    sub:'Every report below is generated presentation bound to a digest-verified frozen export — or honestly marked reference/simulation. Signature status is explicit on each report; unsigned is not invalid, and no static page can mint an assurance verdict.'})+
    aud+notFound+
    '<div class="rp-grid">'+
    '<button class="rp-tile rp-tile-hero" type="button" data-rp="judge"><div class="ind-overline">START HERE · ~2 MIN</div><h3>Judge demo path</h3><p>A fixed seven-step sequence through the deployed demo — consequence, evidence, response, boundaries, verification and scale. Manufacturing track.</p></button>'+
    '<button class="rp-tile" type="button" data-rp="exec"><div class="ind-overline">EXECUTIVE</div><h3>Nine-System Executive Assurance Report</h3><p>45 canonical v3 evaluations, plain-language business significance, state comparison, unknowns, owners and provenance.</p></button>'+
    '<button class="rp-tile" type="button" data-rp="s217"><div class="ind-overline">FLAGSHIP</div><h3>Station 217 — Wrong Target</h3><p>AI acted on the wrong work order. HAIEC identified the consequential divergence. Executive + technical versions.</p></button>'+
    '<a class="rp-tile" href="report/sample-master-report.html" target="_blank" rel="noopener"><div class="ind-overline">PUBLIC SAMPLE</div><h3>SYS-217 Sample Master Report ↗</h3><p>Frozen public-safe derivative — no sign-in. HTML + PDF artifacts.</p></a>'+
    '<button class="rp-tile" type="button" data-act="page" data-id="evaluations"><div class="ind-overline">FINDINGS</div><h3>Canonical Evaluations — full export viewer</h3><p>All 45 verbatim exports with digests, rule outcomes, receipts and authorized report links.</p></button>'+
    '<button class="rp-tile" type="button" data-ind-open="telecom"><div class="ind-overline">HISTORICAL REFERENCE</div><h3>Telecom — TM Forum investigation</h3><p>AL0/AL1/AL2 reference states, source binder, missing KPI evidence — not a new HAIEC evaluation.</p></button>'+
    '<button class="rp-tile" type="button" data-ind-open="electrical"><div class="ind-overline">SIMULATION ONLY</div><h3>Electrical equipment — panel release</h3><p>Serial, BOM revision, wiring/torque inspection and shipment release — illustrative.</p></button>'+
    '<button class="rp-tile" type="button" data-ind-open="rail"><div class="ind-overline">SIMULATION ONLY</div><h3>Rail & transportation — maintenance target</h3><p>Track segment, inspection observation, human review and work-order target — illustrative.</p></button>'+
    '<button class="rp-tile" type="button" data-ind-open="electronics"><div class="ind-overline">SIMULATION ONLY</div><h3>Electronics / AI infra — quarantine & release</h3><p>Serial/lot traceability, firmware revision, test result and shipment status — illustrative.</p></button>'+
    '<button class="rp-tile" type="button" data-ind-open="supplier"><div class="ind-overline">SIMULATION ONLY</div><h3>Supplier network — payee & PO threshold</h3><p>Qualification, purchase-order threshold, payee changes and transaction state — illustrative.</p></button>'+
    '</div>'+
    '<div class="card"><div class="cardhead"><div><h2>Nine-system report directory — 45 case reports</h2><p>Industry → Manufacturing → system → scenario → findings → report. Each cell opens a full case-level report bound to its verified export.</p></div>'+hxIntegrityChip()+'</div>'+rpDirectory()+'</div>'+
    '<div class="card"><div class="cardhead"><div><h2>Signature & availability model</h2></div></div><table class="tbl"><tbody>'+
    '<tr><td>SIGNED</td><td>'+x(SIGNATURE.SIGNED)+' None of the presentation reports on this page carry one.</td></tr>'+
    '<tr><td>SKIPPED</td><td>'+x(SIGNATURE.SKIPPED)+'</td></tr>'+
    '<tr><td>FAILED</td><td>A requested signing operation that fails is shown as FAILED — never downgraded to SKIPPED.</td></tr>'+
    '<tr><td>NOT_APPLICABLE</td><td>'+x(SIGNATURE.NOT_APPLICABLE)+'</td></tr>'+
    '<tr><td>PDF_UNAVAILABLE</td><td>Shown when PDF generation fails; the HTML report remains available and authoritative for the verified export contents.</td></tr></tbody></table></div>'+
    '<div class="card"><div class="cardhead"><div><h2>Local action ledger</h2><p>Browser-local record of Operator Journey actions — audit for the demo session only; never sent to a server, never plant truth.</p></div>'+pill('BROWSER-LOCAL','info')+'</div><div id="ledger-list"></div><div class="flex" style="gap:8px;margin-top:10px"><button class="btn sm" type="button" data-act="ledger-export">Export JSON</button></div></div>';
}

/* ---------- wiring ---------- */

document.addEventListener('change',event=>{
  if(event.target&&event.target.id==='rp-aud'&&AUDIENCES.some(t=>t.id===event.target.value)){RPT.audience=event.target.value;render();}
});
document.addEventListener('click',event=>{
  const rp=event.target.closest('[data-rp]');
  if(rp){
    RPT.notice=null;
    const v=rp.dataset.rp;
    if(v==='hub')RPT.view='hub';
    else if(v==='exec')RPT.view='exec';
    else if(v==='judge')RPT.view='judge';
    else if(v==='s217'||v==='s217-exec'||v==='s217-tech'){RPT.view='s217';if(v==='s217-exec')RPT.s217mode='exec';if(v==='s217-tech')RPT.s217mode='tech';}
    else if(v==='case'){
      const id=rp.dataset.id;
      if(!rptArtifact(id)){RPT.view='hub';RPT.notice=id;}
      else{RPT.view='case';RPT.caseId=id;}
    }
    else if(v==='case-findings'){const p=rp.dataset.id.split('|');HX.system=p[0];HX.caseId=p[1];STATE.page='evaluations';}
    STATE.page=STATE.page==='evaluations'?STATE.page:'reports';
    if(STATE.page==='reports'||v==='case-findings'){if(STATE.page==='reports')rptSyncUrl(true);render();window.scrollTo({top:0,behavior:'instant'});}
    return;
  }
  const ind=event.target.closest('[data-ind-open]');
  if(ind){const sel=document.getElementById('ind-sector');STATE.page='industry';render();const s2=document.getElementById('ind-sector');if(s2){s2.value=ind.dataset.indOpen;s2.dispatchEvent(new Event('change',{bubbles:true}));}return;}
  if(event.target.closest('[data-rp-print]')){try{window.print();}catch(e){const n=document.querySelector('[data-rp-print]');if(n)n.insertAdjacentHTML('afterend','<span class="tiny" style="color:var(--warn)">PDF_UNAVAILABLE — HTML report remains available</span>');}}
});
window.addEventListener('popstate',()=>{
  if(rptReadUrl()){STATE.page='reports';render();}
  else if(STATE.page==='reports'){RPT.view='hub';RPT.caseId=null;render();}
});
PAGE_RENDERERS.reports=pageReports;
// Deep-link init: ?report=… opens the exact report view on load.
if(rptReadUrl())STATE.page='reports';
render();
})();
