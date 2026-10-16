/* Sprint 25 — full showcase: scenario-readiness fixture, Station 217
   two-episode journey, supporting visual package, gov report wiring.
   Focused dependency-cone tests only; no saved evaluation is recalculated. */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert');
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..','..');
const rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const rj=p=>JSON.parse(rd(p));

const readiness=rj('data/demo-governance/scenario-readiness.json');
const shared=rj('data/demo-governance/scenario-shared.json');

test('readiness fixture: schema, system binding, seven facets, honest states',()=>{
  assert.strictEqual(readiness.schemaVersion,'scenario-readiness-1.0.0');
  assert.strictEqual(readiness.systemId,'SYS-217');
  assert.strictEqual(readiness.facets.length,7);
  const byId=Object.fromEntries(readiness.facets.map(f=>[f.id,f]));
  for(const id of ['platform-readiness','org-entitlement','reviewer-eligibility','operating-boundary','monitoring-connectivity','qualified-evidence','approval-and-control'])
    assert.ok(byId[id],`missing facet ${id}`);
  assert.strictEqual(byId['qualified-evidence'].state,'EVALUATED');
  assert.strictEqual(byId['org-entitlement'].state,'NOT_ASSESSED');
  assert.strictEqual(byId['approval-and-control'].state,'PENDING_DEMO_GATEWAY');
  // Only EVALUATED cites a saved evaluation; authored facets cite fixtures or nothing.
  assert.ok(byId['qualified-evidence'].source.ref.includes('sys-217-wrong-target'));
  for(const f of readiness.facets){assert.ok(f.label&&f.copy&&f.source&&'kind' in f.source);}
});

test('readiness is emitted inside the shared artifact',()=>{
  assert.deepStrictEqual(shared.readiness,readiness);
});

test('Station 217 journey is two distinct episodes',()=>{
  const j=shared.scripts.journey['SYS-217'];
  const types=j.events.map(e=>e.eventType);
  assert.ok(types.includes('RECORDED_MISMATCH_DETECTED'),'episode A marker');
  assert.ok(types.includes('SUBSEQUENT_WRITE_HELD'),'episode B marker');
  assert.ok(types.indexOf('RECORDED_MISMATCH_DETECTED')<types.indexOf('SUBSEQUENT_WRITE_HELD'));
  const epA=j.events.find(e=>e.eventType==='RECORDED_MISMATCH_DETECTED');
  const epB=j.events.find(e=>e.eventType==='SUBSEQUENT_WRITE_HELD');
  // Episode A binds the saved evaluation — detection of recorded evidence.
  assert.strictEqual(epA.evaluationRef,'SYS-217-WRONG_TARGET');
  assert.ok(epA.copy.includes('4803')&&epA.copy.includes('4802'));
  // Episode B is the subsequent held attempt — a different identifier.
  assert.strictEqual(epB.attemptRef,'DEMO-GW-SYS-217-02');
  assert.strictEqual(epB.decisionRequestId,'DEMO-REQ-SYS-217-06');
  // The recorded mismatch is never described as prevented/blocked.
  for(const e of j.events){
    assert.ok(!/prevented|blocked the recorded|stopped the/i.test(e.copy+e.headline),'copy must not claim prevention of the recorded event');
  }
  // Advisory continuation remains present and never promotes to write approval.
  const op=j.events.find(e=>e.eventType==='OPERATING_STATUS');
  assert.ok(/advisory/i.test(op.headline+op.copy));
  assert.ok(/pending/i.test(op.headline+op.copy));
});

test('supporting visual package exists and is correctly classified',()=>{
  const dir='dashboard/report/supporting';
  const twelve=rd(path.join(dir,'haiec-12p.html'));
  const ready=rd(path.join(dir,'station-217-readiness.html'));
  const pdf=path.join(ROOT,dir,'haiec-12p.pdf');
  // 12 pages, exactly 9 unique system cards.
  assert.strictEqual((twelve.match(/class="page"/g)||[]).length,12);
  const ids=[...twelve.matchAll(/<h4>(SYS-[A-Z0-9]+) — /g)].map(m=>m[1]);
  assert.strictEqual(ids.length,9);assert.strictEqual(new Set(ids).size,9);
  // Two-event Station 217 timeline present with distinct identifiers.
  for(const s of ['WO-217-4802','WO-217-4803','DEMO-REQ-SYS-217-06','DEMO-GW-SYS-217-02','EPISODE A','EPISODE B'])
    assert.ok(twelve.includes(s),`12p missing ${s}`);
  // Classification: presentation material, never issued-report phrasing.
  assert.ok(twelve.includes('NOT AN ISSUED ASSURANCE REPORT'));
  assert.ok(!/signed assurance certificate|receipt chain/i.test(twelve.replace(/NOT AN ISSUED ASSURANCE REPORT|no receipt, receipt chain or assurance finding/g,'')));
  // Readiness one-pager: 7 gates, honest labels, non-mandatory disclaimer.
  assert.strictEqual((ready.match(/class="gate"/g)||[]).length,7);
  assert.ok(ready.includes('not a mandatory lifecycle'));
  assert.ok(ready.includes('NOT_ASSESSED')||ready.includes('Not assessed'));
  // PDF exists and is non-trivial.
  assert.ok(fs.existsSync(pdf)&&fs.statSync(pdf).size>50000);
});

test('reports hub wires the gov report + supporting links with correct classification',()=>{
  const rpt=rd('dashboard/report/reports.js');
  assert.ok(rpt.includes("data-rp=\"gov\""),'gov tile');
  assert.ok(rpt.includes('function rpGov('),'gov renderer');
  assert.ok(rpt.includes("else if(v==='gov')RPT.view='gov'"),'gov click route');
  assert.ok(rpt.includes("gov:'gov'"),'gov deep link');
  assert.ok(rpt.includes('report/supporting/haiec-12p.html')&&rpt.includes('report/supporting/station-217-readiness.html'));
  assert.ok(rpt.includes('PRESENTATION — NOT HAIEC ISSUED'),'supporting classification');
  // Station 217 report carries the two-episode strip.
  assert.ok(rpt.includes('EPISODE A')||rpt.includes('Episode A'));
  assert.ok(rpt.includes('DEMO-GW-SYS-217-02'));
});

test('governance page carries readiness table + two-episode 217 block',()=>{
  const html=rd('dashboard/index.html');
  assert.ok(html.includes('govReadinessTable'),'readiness renderer');
  assert.ok(html.includes('s217-eps'),'two-episode markup');
  assert.ok(html.includes('DEMO-REQ-SYS-217-06')&&html.includes('DEMO-GW-SYS-217-02'));
  // Exec capability overview: six goals deep-linking existing pages.
  assert.ok(html.includes('exModCapabilities'));
  for(const g of ['Discover','Evaluate','Authorize','Monitor','Protect','Verify'])
    assert.ok(html.includes(`goal:'${g}'`),`missing goal ${g}`);
});
