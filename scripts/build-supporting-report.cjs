#!/usr/bin/env node
/* build-supporting-report.cjs — emits the Sprint 25 visual supporting
   package into dashboard/report/supporting/:
     - station-217-readiness.html  (one-page seven-facet readiness view)
     - haiec-12p.html              (twelve-page program visual report)
   Both are PRESENTATION MATERIAL generated from the versioned scenario
   fixtures and the digest-verified export bundle — never HAIEC-issued
   assurance reports, receipts or findings. Deterministic: same inputs
   produce byte-identical output. */
'use strict';
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));

const shared=read('data/demo-governance/scenario-shared.json');
if(shared.schemaVersion!=='haiec-scenario-playback-1.0.0')throw new Error('SHARED_SCHEMA');
const dossiers=shared.dossiers,readiness=shared.readiness;
if(dossiers.length!==9)throw new Error('SHARED_DOSSIERS');
const s217=dossiers.find(d=>d.systemId==='SYS-217');
if(!s217||!(s217.story||'').includes('WO-217-4803'))throw new Error('S217_INVARIANT');

/* Raw fixture — source records for the monitoring chronology column. */
const gov=read('data/demo-governance/governance-scenarios.json');
const monScenario=id=>(gov.monitoringScenarios||[]).find(m=>m.systemId===id);
function lastRecord(id){
  const m=monScenario(id);if(!m)return null;
  const recs=(m.sources||[]).flatMap(s=>(s.records||[]).map(r=>Object.assign({sourceId:s.sourceId},r)));
  recs.sort((a,b)=>String(b.declaredAt||'').localeCompare(String(a.declaredAt||'')));
  return recs[0]||null;
}
const exportsMeta={count:45,world:'manufacturing-source-native-v3',digestSet:true};

const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const decLabel={APPROVED:'APPROVED — SCOPED',REJECTED:'REJECTED',PENDING:'PENDING'};
const decColor={APPROVED:'#2b7869',REJECTED:'#b42318',PENDING:'#b45309'};
const monLabel=s=>s==='SIMULATED_MONITORING_ESTABLISHED'?'Established — simulated':s==='SIMULATED_MONITORING_PARTIAL'?'Partial — simulated':s==='SIMULATED_MONITORING_STALE'?'Stale — simulated':'No live connection';
const monColor=s=>/Established/i.test(s)?'#2b7869':/No live/i.test(s)?'#667085':'#b45309';

const BASE_CSS=`
*{box-sizing:border-box;margin:0;padding:0}
body{font:14px/1.55 -apple-system,'Segoe UI',Arial,sans-serif;color:#1c2b33;background:#fff}
.page{width:210mm;min-height:277mm;margin:10mm auto;padding:16mm 15mm 14mm;background:#fff;position:relative;box-shadow:0 2px 18px rgba(0,0,0,.14);display:flex;flex-direction:column}
.page+.page{page-break-before:always}
.band{font:700 10px/1 'Consolas',monospace;letter-spacing:.14em;text-transform:uppercase;color:#2b7869;margin-bottom:6mm}
h1{font-size:30px;line-height:1.15;letter-spacing:-.01em}
h2{font-size:19px;margin:5mm 0 2.5mm}
h3{font-size:13.5px;margin:3mm 0 1.5mm}
p{margin:0 0 3mm}
.lede{font-size:15px;color:#3a4a52}
.muted{color:#667085}.tiny{font-size:10.5px}.small{font-size:12px}
code{font:11px 'Consolas',monospace;background:#f0f4f3;padding:1px 4px;border-radius:3px}
.chip{display:inline-block;font:700 10px 'Consolas',monospace;padding:2px 8px;border-radius:999px;border:1px solid}
.go{color:#2b7869;border-color:#2b7869}.warn{color:#b45309;border-color:#d97706}.bad{color:#b42318;border-color:#b42318}.inf{color:#475467;border-color:#98a2b3}
table{width:100%;border-collapse:collapse;font-size:11px}
th{font:700 9px 'Consolas',monospace;letter-spacing:.08em;text-transform:uppercase;color:#667085;text-align:left;padding:5px 8px;border-bottom:2px solid #d9e2e1}
td{padding:6px 8px;border-bottom:1px solid #eef1f0;vertical-align:top}
.foot{position:absolute;bottom:8mm;left:15mm;right:15mm;display:flex;justify-content:space-between;font:9px 'Consolas',monospace;color:#98a2b3;border-top:1px solid #eef1f0;padding-top:2.5mm}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:5mm}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}
.card{border:1px solid #d9e2e1;border-radius:8px;padding:4mm}
.pill{display:inline-block;font-size:10px;padding:2px 8px;border-radius:4px;background:#f0f4f3;border-left:3px solid #2b7869;margin:1mm 1mm 0 0}
.notice{border-left:4px solid #d97706;background:#fffcf5;padding:3mm 4mm;margin:3mm 0;font-size:11.5px}
.notice.go{border-color:#2b7869;background:#f6fbfa}
.stat{display:inline-block;margin:0 8mm 4mm 0}
.stat b{display:block;font-size:30px;color:#2b7869}
.stat span{font-size:10.5px;color:#667085}
.sys-card{border:1px solid #d9e2e1;border-radius:8px;padding:3.5mm;break-inside:avoid}
.sys-card h4{font-size:12px}
.sys-card .meta{font-size:10px;color:#667085;margin-top:1mm}
.sys-card .scope{font-size:10px;margin-top:1.5mm;line-height:1.4}
@media print{body{background:#fff}.page{margin:0;box-shadow:none;min-height:260mm}@page{size:A4;margin:0}}
`;

function foot(n,total){return `<div class="foot"><span>HAIEC PROGRAM REPORT — SUPPORTING VISUAL · FICTIONAL MANUFACTURING · NOT AN ISSUED ASSURANCE REPORT</span><span>${n} / ${total}</span></div>`;}
const PAGES=[];
function page(band,inner){PAGES.push(`<section class="page">${band?`<div class="band">${esc(band)}</div>`:''}${inner}${foot(PAGES.length+1,12)}</section>`);}

/* ---- Page 1 — cover ---- */
page('',`
<div style="margin-top:22mm">
<div class="band">HAIEC ENTERPRISE AI ASSURANCE · MANUFACTURING PROGRAM</div>
<h1>Deploy AI with confidence.<br>Stay in control of every consequential action.</h1>
<p class="lede" style="margin-top:6mm">A twelve-page operating view of a fictional nine-system manufacturing enterprise — assembled from HAIEC's deterministic evaluation of the synthetic evidence corpus and the authored governance scenario. Supporting visual material; the issued assurance reports remain the digest-verified exports.</p>
<div style="margin-top:14mm">
<span class="stat"><b>9</b><span>fictional AI systems</span></span>
<span class="stat"><b>45</b><span>digest-verified evaluations</span></span>
<span class="stat"><b>3 · 2 · 4</b><span>approved · rejected · pending</span></span>
<span class="stat"><b>16</b><span>declared agent roles</span></span>
</div>
<div class="notice">Presentation material — generated from frozen exports and versioned scenario fixtures. No new evaluation was run for this document; fictional decisions, notifications and execution holds are demonstration behavior, not live plant control.</div>
<table style="margin-top:6mm"><tbody>
<tr><td style="width:38mm">Issued</td><td>October 2026 · supporting visual package v1.0.0</td></tr>
<tr><td>Environment</td><td>Example Manufacturing Co. — fictional enterprise, synthetic source world <code>${esc(exportsMeta.world)}</code></td></tr>
<tr><td>Basis</td><td>45 persisted haiec-evaluation-export-1.0.0 artifacts · scenario fixture <code>demo-governance-scenario-1.0.0</code> · readiness fixture <code>scenario-readiness-1.0.0</code></td></tr>
<tr><td>Verification</td><td>Public receipt <code>Q-4997girnnfIM62jTRJPYeX</code> · haiec.com/verify</td></tr>
</tbody></table></div>`);

/* ---- Page 2 — executive summary ---- */
page('EXECUTIVE SUMMARY',`
<h1>One accountable story across the whole enterprise</h1>
<p class="lede">Nine AI systems run consequential work — torque quality, vision inspection, scheduling, supplier onboarding, energy and more. HAIEC established what the evidence proves, the enterprise decided what may operate, and every consequential expansion waits for a named human.</p>
<h2>What HAIEC established — deterministic, verifiable</h2>
<p>Forty-five persisted evaluations over the synthetic corpus — five assessment states per system. In every wrong-target case, the detector identified a qualified target divergence and the delegated-vs-observed comparison read <b>BROADER</b>. <b>All 45 overall results are REVIEW</b>: specific findings are established; the complete assurance picture is not. Unknowns stay visible.</p>
<h2>What the enterprise decided — the authored operating layer</h2>
<table><thead><tr><th>Decision</th><th>Count</th><th>Systems</th></tr></thead><tbody>
<tr><td><span class="chip go">APPROVED — SCOPED</span></td><td>3</td><td>${esc(dossiers.filter(d=>d.humanDecision==='APPROVED').map(d=>d.systemId).join(' · '))} (incl. one controlled pilot)</td></tr>
<tr><td><span class="chip bad">REJECTED</span></td><td>2</td><td>${esc(dossiers.filter(d=>d.humanDecision==='REJECTED').map(d=>d.systemId).join(' · '))}</td></tr>
<tr><td><span class="chip warn">PENDING</span></td><td>4</td><td>${esc(dossiers.filter(d=>d.humanDecision==='PENDING').map(d=>d.systemId).join(' · '))}</td></tr>
</tbody></table>
<h2>The flagship</h2>
<p><b>Station 217.</b> Episode A: the saved evaluation detected that a delegated work-order update committed on <code>WO-217-4803</code> instead of approved <code>WO-217-4802</code>. Episode B: a subsequent request to expand autonomous MES write authority remains pending while a later attempt is held at the demonstration gateway — advisory work continues.</p>
<div class="notice go">Business outcome: permitted work keeps moving; consequential change comes into accountable review; nothing consequential is silently allowed.</div>`);

/* ---- Page 3 — platform map ---- */
page('PLATFORM MAP',`
<h1>Three pillars. Six independently selectable capabilities.</h1>
<p class="lede">HAIEC is the assurance and governance product; this manufacturing enterprise is the example environment. Customers select the capabilities they need — this is not a mandatory sequence.</p>
<h2>Understand</h2>
<div class="grid2"><div class="card"><h3>Discover</h3><p class="small">Catalog systems, agents, integrations, technical capabilities and potential consequential actions. Nine systems and sixteen declared agent roles are cataloged in this environment.</p></div>
<div class="card"><h3>Verify</h3><p class="small">Digest-verified reports, public receipts and lineage — anyone can confirm the evidence without trusting this page.</p></div></div>
<h2>Assure</h2>
<div class="grid2"><div class="card"><h3>Evaluate</h3><p class="small">Deterministic engine evaluates submitted evidence: requested vs authorized vs observed. Detected divergence at Station 217; REVIEW everywhere evidence is incomplete.</p></div>
<div class="card"><h3>Monitor</h3><p class="small">Source records, coverage and change context — gaps are shown as gaps: two sources currently stale or missing in this scenario.</p></div></div>
<h2>Govern &amp; Operate</h2>
<div class="grid2"><div class="card"><h3>Authorize</h3><p class="small">Declared operating scope plus an accountable human decision for each consequential change — 3 approved, 2 rejected, 4 pending.</p></div>
<div class="card"><h3>Protect</h3><p class="small">Execution-control story: scope check → human review → hold or proceed. Subsequent Station 217 write attempt held while advisory work continues.</p></div></div>
<p class="tiny muted" style="margin-top:4mm">Pillar assignment in this visual: Understand — Discover; Assure — Evaluate; Govern &amp; Operate — Authorize, Monitor, Protect; Verify spans all three as the evidence-backbone capability.</p>`);

/* ---- Page 4 — understanding / estate ---- */
page('UNDERSTAND · THE AI ESTATE',`
<h1>Know what the AI is — and what it could do</h1>
<p class="lede">Nine systems, each with a business purpose, declared capabilities and a proposed consequential change under governance.</p>
<table><thead><tr><th>System</th><th>Agent role</th><th>Environment</th><th>Proposed consequential change</th></tr></thead><tbody>
${dossiers.map(d=>`<tr><td><b>${esc(d.systemId)}</b><div class="tiny muted">${esc(d.systemName)}</div></td><td class="tiny"><code>${esc(d.agentId)}</code></td><td class="tiny">${esc(String(d.environment).replace(/_/g,' '))}</td><td class="tiny">${esc(d.proposedOperation)}</td></tr>`).join('')}
</tbody></table>
<p class="tiny muted">System names, roles and capabilities are static fictional demonstration context — the assurance layer is what the evaluations establish.</p>`);

/* ---- Page 5 — evidence ---- */
page('ASSURE · EVIDENCE FIRST',`
<h1>Evidence before conclusions</h1>
<p class="lede">HAIEC does not take the system's word for what happened. Submitted evidence is normalized, digest-bound and evaluated deterministically — the same input always produces the same result.</p>
<h2>The assurance flow</h2>
<table><tbody>
<tr><td style="width:34mm"><b>Synthetic source world</b></td><td>MES transactions, torque-tool events, release readbacks, scheduling and supplier records — recorded, not narrated.</td></tr>
<tr><td><b>Normalized evidence</b></td><td>Typed records bound to case identity; unmarked input stays digest-and-refs only.</td></tr>
<tr><td><b>Deterministic evaluation</b></td><td>Manufacturing detector, delegated-action comparison, scoped effect witness, authority planes — replayable, verbatim.</td></tr>
<tr><td><b>Persisted export</b></td><td><code>haiec-evaluation-export-1.0.0</code> — digest-verified in the browser before any finding is displayed.</td></tr>
<tr><td><b>Public receipt</b></td><td>View-only verification on haiec.com — anyone can confirm integrity without an account.</td></tr>
</tbody></table>
<div class="notice go">Integrity property: the same evidence always yields the same evaluation. A digest mismatch withholds the report — it never softens it.</div>
<p class="tiny muted">Scenario records carry declared vs observed timestamps; freshness is derived from the fixed 2026-10-15 reference clock.</p>`);

/* ---- Page 6 — assurance results ---- */
page('ASSURE · RESULTS',`
<h1>What the deterministic engine found</h1>
<p class="lede">Five assessment states per system — baseline, enriched, wrong target, degraded evidence, corrected state. Results differ exactly where the evidence differs.</p>
<table><thead><tr><th>Assessment</th><th>Detector (MFG-EFF-001)</th><th>Target comparison</th><th>Overall result</th></tr></thead><tbody>
<tr><td>Wrong target (9 systems)</td><td>MATCH — qualified divergence</td><td>BROADER</td><td><span class="chip warn">REVIEW</span></td></tr>
<tr><td>Corrected state (9 systems)</td><td>NO_MATCH_WITH_ADEQUATE_COVERAGE</td><td>MATCHES</td><td><span class="chip warn">REVIEW</span></td></tr>
<tr><td>Baseline / enriched / degraded</td><td>per export</td><td>per export</td><td><span class="chip warn">REVIEW</span></td></tr>
</tbody></table>
<h2>Honest boundaries — where proof stops</h2>
<p>Code reachability is NOT_ASSESSED across the corpus: no bound static scan exists. Authority-plane cells without evidence are shown as unknown — never rounded into a pass. A corrected-state evaluation is a distinct result; it does not undo the earlier finding.</p>
<div class="notice">All 45 overall results are REVIEW — an evidence-bound outcome, neither pass nor failure. REVIEW tells a responsible human exactly where proof stops.</div>`);

/* ---- Page 7 — operating scope & decisions ---- */
page('GOVERN & OPERATE · SCOPE & DECISIONS',`
<h1>Every consequential change has an accountable decision</h1>
<table><thead><tr><th>System</th><th>Proposed change</th><th>Decision</th><th>Accountable role</th><th>Conditions / expiry</th></tr></thead><tbody>
${dossiers.map(d=>`<tr><td><b>${esc(d.systemId)}</b></td><td class="tiny">${esc(d.proposedOperation)}</td><td><span class="chip" style="color:${decColor[d.humanDecision]};border-color:${decColor[d.humanDecision]}">${esc(decLabel[d.humanDecision])}</span></td><td class="tiny">${esc(d.approverRole)}</td><td class="tiny">${d.humanDecision==='APPROVED'?esc(((d.requiredConditions||[])[0]||'Scoped approval')+' · expires '+d.expiresAt):d.humanDecision==='REJECTED'?esc(d.rationale||'Outside declared scope'):'Awaiting decision'}</td></tr>`).join('')}
</tbody></table>
<p class="tiny muted">Fictional operating decisions from scenario fixture — approved means approved within declared scope, never a universal clearance. Advisory scope may continue while consequential requests wait.</p>`);

/* ---- Page 8 — human review lifecycle ---- */
page('GOVERN & OPERATE · HUMAN REVIEW',`
<h1>The accountable review lifecycle</h1>
<p class="lede">Request → boundary check → accountable role → notification previews → decision → scoped operating status → monitoring follow-up.</p>
<div class="grid2">
<div class="card"><h3>Requester</h3><p class="small">System proposes a consequential change — e.g., Station 217 requests autonomous MES write expansion (<code>DEMO-REQ-SYS-217-06</code>).</p><p class="small muted">Boundary check: outside approved scope → human review required.</p></div>
<div class="card"><h3>Reviewer — fictional Quality Director</h3><p class="small">Assigned accountable role; requesting and approving roles stay separate.</p><p class="small muted">Email and text previews are shown in the demo — no real dispatch is connected.</p></div>
</div>
<h2>What a pending decision means</h2>
<p>While <code>DEMO-REQ-SYS-217-06</code> is pending, the consequential expansion does not proceed — a subsequent write attempt (<code>DEMO-GW-SYS-217-02</code>) is held at the demonstration gateway. Lower-risk advisory work continues inside the approved scope. <b>Pending is an operating state, not a failure.</b></p>
<h2>Two contrasting outcomes</h2>
<p><b>SYS-340 Vision Inspection</b> — approved within scope; advisory quality reviews proceed under conditions and expiry. <b>SYS-SCH5 Scheduling</b> — production-floor control writes rejected; scope boundary held.</p>
<p class="tiny muted">All reviewer activity in this document is authored scenario material — the real HAIEC governance APIs are authenticated and tenant-bound; nothing here calls them.</p>`);

/* ---- Page 9 — monitoring ---- */
page('GOVERN & OPERATE · MONITORING',`
<h1>Monitoring coverage — shown honestly</h1>
<p class="lede">Per-system source coverage at the fixed scenario clock (2026-10-15). Stale and missing sources are shown as gaps, never smoothed over.</p>
<table><thead><tr><th>System</th><th>Coverage state</th><th>Latest recorded event</th></tr></thead><tbody>
${dossiers.map(d=>{const lr=lastRecord(d.systemId);return `<tr><td><b>${esc(d.systemId)}</b></td><td><span class="chip" style="color:${monColor(monLabel(d.monitoringState))};border-color:${monColor(monLabel(d.monitoringState))}">${esc(monLabel(d.monitoringState))}</span></td><td class="tiny">${lr?esc(lr.eventType+' — '+lr.target):'No source records in scenario'}</td></tr>`;}).join('')}
</tbody></table>
<h2>Station 217 source chronology</h2>
<p><code>torque-tool-event-log</code> — stale: last record <code>WO-217-4803</code> at declared 11:20:00Z (observed 11:20:06Z). <code>mes-release-readback</code> — no records: missing at the fixed clock. This is a later monitoring context, distinct from the evaluated Oct 14 transaction evidence.</p>
<p class="tiny muted">Freshness derived deterministically from fixture records — a coverage state is not proof of what a plant did.</p>`);

/* ---- Page 10 — Station 217 two events ---- */
page('STATION 217 · TWO LINKED EVENTS',`
<h1>Detection first. Demonstrated control second.</h1>
<div class="grid2">
<div class="card" style="border-left:4px solid #2b7869"><div class="band" style="color:#2b7869">EPISODE A · OCT 14 · RECORDED EVIDENCE</div>
<h3>What HAIEC detected</h3>
<p class="small">Delegated target <code>WO-217-4802</code> → committed effect on <code>WO-217-4803</code>. The saved evaluation detected the target divergence: MFG-EFF-001 MATCH · DAI BROADER · result <b>REVIEW</b>.</p>
<p class="tiny muted">Verified export <code>SYS-217-WRONG_TARGET</code> — digest-bound, publicly checkable. Detected ≠ prevented.</p></div>
<div class="card" style="border-left:4px solid #d97706"><div class="band" style="color:#b45309">EPISODE B · OCT 15 · GOVERNANCE SCENARIO</div>
<h3>What the operating model shows next</h3>
<p class="small">Request <code>DEMO-REQ-SYS-217-06</code> expands autonomous MES write authority → outside approved scope → Quality Director review → notification previews → decision pending → subsequent attempt <code>DEMO-GW-SYS-217-02</code> held at the demonstration gateway → advisory work continues.</p>
<p class="tiny muted">Simulated hold — legitimate blocked-action demonstration; no dispatcher, email or SMS is connected.</p></div>
</div>
<h2>Why the distinction matters</h2>
<p>The recorded mismatch is a finding established by deterministic evaluation — it already happened. The held write is a subsequent, simulated request demonstrating how consequential change waits for a human. Merging them would misstate both: detection is proven; prevention of the earlier event is not claimed.</p>`);

/* ---- Page 11 — nine system cards ---- */
page('PORTFOLIO · NINE SYSTEM CARDS',`
<h1>Nine systems — one card each</h1>
<div class="grid3">
${dossiers.map(d=>`<div class="sys-card"><h4>${esc(d.systemId)} — ${esc(d.systemName)}</h4>
<div class="meta">${esc(String(d.environment).replace(/_/g,' '))}</div>
<div class="scope"><b>Permitted:</b> ${esc(d.allowedOperations.join('; '))}</div>
<div class="scope"><b>Requested:</b> ${esc(d.proposedOperation)}</div>
<div class="scope"><b>Decision:</b> <span class="chip" style="color:${decColor[d.humanDecision]};border-color:${decColor[d.humanDecision]}">${esc(decLabel[d.humanDecision])}</span> <span class="muted">${esc(d.approverRole)}</span></div>
<div class="scope"><b>Monitoring:</b> ${esc(monLabel(d.monitoringState))}</div>
<div class="scope"><b>Assurance:</b> REVIEW — digest-verified evaluation</div>
<div class="scope"><b>Next:</b> ${esc(d.nextAction||'Complete the accountable review.')}</div>
</div>`).join('')}
</div>`);

/* ---- Page 12 — verification & limits ---- */
page('VERIFY · EVIDENCE & LIMITS',`
<h1>Verify it yourself</h1>
<p class="lede">Everything on the assurance side of this document resolves to a digest-verified artifact or a public receipt — nothing requires trusting this page.</p>
<table><thead><tr><th>Artifact</th><th>Where</th></tr></thead><tbody>
<tr><td>45 canonical evaluations</td><td><code>dashboard/data/haiec-exports.js</code> · <code>haiec-evaluation-export-1.0.0</code> · digest-verified on load</td></tr>
<tr><td>Station 217 case report</td><td>Reports &amp; Evidence → case <code>SYS-217-WRONG_TARGET</code></td></tr>
<tr><td>Public receipt</td><td><code>haiec.com/verify/assurance/Q-4997girnnfIM62jTRJPYeX</code></td></tr>
<tr><td>Scenario fixture</td><td><code>data/demo-governance/governance-scenarios.json</code> · <code>scenario-readiness.json</code> · shared artifact <code>haiec-scenario-playback-1.0.0</code></td></tr>
<tr><td>27 historical evaluations</td><td>Preserved v1 register — kept distinct, never merged into v3 results</td></tr>
</tbody></table>
<h2>Real vs demonstrated — the boundary</h2>
<div class="grid2"><div class="card"><h3>Real HAIEC output</h3><p class="small">Deterministic evaluations of the synthetic corpus; digest-verified exports; public receipt verification; authenticated tenant-bound governance APIs (exercised separately).</p></div>
<div class="card"><h3>Authored demonstration</h3><p class="small">Fictional reviewer roles and decisions; email/text previews; monitoring states on a fixed clock; the demonstration gateway hold; this document itself.</p></div></div>
<div class="notice">Not established: live MES/PLC/ERP connectivity, real notification delivery, physical command prevention, universal safety clearance, or complete code/authority evidence in every case.</div>`);

/* ---------- readiness one-pager ---------- */
const READINESS_HTML=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Station 217 — Demonstration Readiness View</title><style>${BASE_CSS}
.page{min-height:auto}.gate{display:grid;grid-template-columns:12mm 1fr;gap:4mm;padding:3.5mm 0;border-bottom:1px solid #eef1f0}
.gnum{font:700 20px 'Consolas',monospace;color:#2b7869}
.gstate{display:inline-block;font:700 10px 'Consolas',monospace;padding:2px 8px;border-radius:4px;border:1px solid;margin:1mm 0}
</style></head><body>
<section class="page">
<div class="band">FICTIONAL SCENARIO READINESS VIEW — STATION 217 · NOT A HAIEC-CUSTOMER GATE</div>
<h1>How HAIEC would govern Station 217</h1>
<p class="lede">Seven request-readiness facets for this fictional enterprise. Each state is authored for the scenario and bound to a named source — never live entitlement, identity or enforcement proof. This is a per-request checklist, not a mandatory lifecycle for every HAIEC customer.</p>
${readiness.facets.map((f,i)=>{
  const tone=f.state==='EVALUATED'||f.state==='DECLARED_SCOPE'?'#2b7869':f.state==='NOT_ASSESSED'?'#667085':f.state==='PENDING_DEMO_GATEWAY'||f.state==='SOURCE_STATE_AT_FIXED_CLOCK'?'#b45309':'#475467';
  return `<div class="gate"><div class="gnum">${String(i+1).padStart(2,'0')}</div><div>
  <b>${esc(f.facet)}</b> <span class="gstate" style="color:${tone};border-color:${tone}">${esc(f.label)}</span>
  <p class="small muted" style="margin:1mm 0 0">${esc(f.copy)}</p>
  <p class="tiny muted" style="margin:1mm 0 0">Source: <code>${esc(f.source.ref||'none declared')}</code></p></div></div>`;
}).join('')}
<div class="notice" style="margin-top:6mm"><b>Reading this honestly:</b> facet 6 is the only facet backed by a saved HAIEC evaluation. Facet 7 remains pending — a subsequent write attempt is held in the demonstration while advisory work continues. Facets 1, 3, 4, 5 are authored scenario states; facet 2 is not assessed.</div>
<div class="foot"><span>SUPPORTING VISUAL · scenario-readiness-1.0.0 · as of ${esc(readiness.asOf)}</span><span>1 / 1</span></div>
</section></body></html>`;

const REPORT_HTML=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>HAIEC Program Report — Fictional Manufacturing (Supporting Visual)</title><style>${BASE_CSS}</style></head><body>
${PAGES.join('\n')}
</body></html>`;

const OUT=path.join(ROOT,'dashboard/report/supporting');
fs.mkdirSync(OUT,{recursive:true});
const modeCheck=process.argv.includes('--check');
function emit(name,content){
  const p=path.join(OUT,name);
  if(modeCheck){
    if(!fs.existsSync(p)||fs.readFileSync(p,'utf8')!==content)throw new Error('STALE '+name);
    console.log('check ok:',name);return;
  }
  fs.writeFileSync(p,content);console.log('wrote',name,content.length,'bytes');
}
emit('station-217-readiness.html',READINESS_HTML);
emit('haiec-12p.html',REPORT_HTML);
if(!modeCheck)console.log('Built supporting package: 12 pages, '+dossiers.length+' unique system cards, '+readiness.facets.length+' readiness facets');
