'use strict';
/**
 * Sprint 14.2 — public-safe sample Master Assurance Report.
 *
 * Renders a frozen, standalone HTML derivative of ONE genuine persisted
 * HAIEC evaluation export (SYS-217 wrong-target). The renderer performs
 * NO evaluation logic — every assurance field is a verbatim pass-through
 * from the digest-verified export artifact produced by an authorized
 * HAIEC read. If the export digest fails, this script fails the build.
 *
 * Output: dashboard/report/sample-master-report.html
 * The PDF derivative is generated separately by scripts/render-sample-pdf.cjs
 * (requires puppeteer; not part of the Vercel static build).
 */
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { loadExportFile } = require('../packages/haiec-adapter/src/load-export.cjs');

const ROOT = path.join(__dirname, '..');
const EXPORT_FILE = path.join(ROOT, 'data', 'evaluations', 'sys-217-wrong-target.json');
const OUT_HTML = path.join(ROOT, 'dashboard', 'report', 'sample-master-report.html');
const OUT_IDENTITY = path.join(ROOT, 'dashboard', 'report', 'sample-master-report.identity.json');
const HAIEC_ORIGIN = 'https://www.haiec.com';

/* Sprint 14.5 T8 — one deterministic derivative identity shared by every
 * artifact rendered from this canonical source (HTML, PDF, summaries).
 * Recomputed over CANONICAL SOURCE FIELDS ONLY — wall-clock time never
 * enters, so the identity is stable across rebuilds and lets release
 * verification prove HTML/PDF were regenerated from the same export. */
const DERIVATIVE_VERSION = 'sample-report-derivative-1.0.0';
function derivativeIdentity(a) {
  const e = a.evaluation || {};
  const source = {
    derivativeVersion: DERIVATIVE_VERSION,
    evaluationId: e.evaluationId,
    reportId: e.reportId,
    reportVersion: e.reportVersion,
    projectionVersion: e.projectionVersion,
    coreTruthDigest: e.coreTruthDigest,
    exportDigest: a.exportDigest,
    exportedAt: a.exportedAt,
    disposition: e.disposition,
  };
  return 'sha256:' + createHash('sha256').update(JSON.stringify(source), 'utf8').digest('hex');
}

function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function kv(label, value, mono = true) {
  return `<div class="kv"><span>${esc(label)}</span><strong class="${mono ? 'mono' : ''}">${esc(value ?? 'NOT RECORDED')}</strong></div>`;
}

function statusChip(status) {
  const cls = {
    MATCH: 'chip-neutral',
    NO_MATCH_WITH_ADEQUATE_COVERAGE: 'chip-ok',
    INSUFFICIENT_SOURCE: 'chip-warn',
    CONTRADICTED: 'chip-bad',
  }[status] || 'chip-neutral';
  return `<span class="chip ${cls}">${esc(status)}</span>`;
}

function listItems(arr) {
  if (!Array.isArray(arr) || !arr.length) return '<li>None recorded.</li>';
  return arr.map((x) => `<li class="mono">${esc(x)}</li>`).join('');
}

function buildHtml(a, derivId) {
  const e = a.evaluation;
  const fq = e.fourQuestions || {};
  const rules = a.manufacturing?.ruleOutcomes ?? [];
  const maturity = a.manufacturing?.controlMaturity ?? null;
  const links = e.links || {};
  // Strip query params — the export's links carry the evaluation-owning
  // org id (?org=…); public derivatives never disclose internal org
  // identifiers. Authorization resolves the org server-side anyway.
  const link = (pathRel) => {
    const clean = typeof pathRel === 'string' ? pathRel.split('?')[0] : pathRel;
    return typeof clean === 'string' && clean.startsWith('/')
      ? `<a href="${esc(HAIEC_ORIGIN + clean)}" target="_blank" rel="noopener noreferrer">${esc(HAIEC_ORIGIN + clean)}</a>`
      : '<span class="mono">NOT RECORDED</span>';
  };

  const divergent = rules.find((r) => r.ruleId === 'MFG-EFF-001' && r.status === 'MATCH');

  const rulesRows = rules.map((r) => `
    <tr>
      <td class="mono">${esc(r.ruleId)}</td>
      <td>${statusChip(r.status)}</td>
      <td>${esc(r.reason)}</td>
      <td class="mono small">${(r.qualifiedClaims ?? []).map(esc).join(', ') || '—'}</td>
      <td class="mono small">${(r.missingClaims ?? []).map(esc).join(', ') || '—'}</td>
      <td class="mono small">${(r.evidenceRefs ?? []).map(esc).join('<br>') || '—'}</td>
    </tr>`).join('');

  const maturityRows = (maturity?.rows ?? []).map((r) => `
    <tr>
      <td class="mono"><strong>${esc(r.controlId)}</strong><br><span class="small">${esc(r.title ?? '')}</span></td>
      <td>${Object.entries(r.facets ?? {}).map(([k, v]) => `<div class="facet"><span class="mono small">${esc(k)}</span> <strong>${esc(v)}</strong></div>`).join('')}</td>
      <td>${statusChip(r.ucpResult ?? 'NOT_EVALUATED')}<br><span class="mono small">${esc(r.ucpReceiptState ?? '')}</span></td>
      <td class="mono small">${(r.binding?.executedRuleIds ?? []).map(esc).join(', ')}</td>
    </tr>`).join('');

  const q = (name) => {
    const node = fq[name];
    if (!node) return '';
    return `<div class="qcard"><div class="qhead"><strong>${esc(name.toUpperCase())}</strong>${statusChip(node.state ?? 'NOT_ASSESSED')}</div><p class="small">${esc(node.summary ?? '')}</p></div>`;
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>HAIEC — Sample Master Assurance Report · SYS-217 Wrong-Target (Synthetic Lab)</title>
<meta name="description" content="Public frozen derivative of a genuine persisted HAIEC Master Assurance Report over synthetic manufacturing lab evidence. Evidence-only basis; not a source-code scan or live plant observation.">
<link rel="icon" type="image/png" href="../assets/brand/favicon.png">
<style>
  :root{--ink:#141d22;--muted:#5d6c75;--line:#e2e6e5;--green:#14855f;--greenbg:#e6f5ee;--amber:#8f651a;--amberbg:#fff4dc;--red:#ab4238;--redbg:#fcebe7;--blue:#2f6ba0;--bluebg:#eaf2fb;--sans:'IBM Plex Sans',-apple-system,'Segoe UI',Roboto,sans-serif;--mono:'IBM Plex Mono',Consolas,monospace}
  *{box-sizing:border-box}body{margin:0;background:#eef0ee;color:var(--ink);font-family:var(--sans);font-size:13px;line-height:1.55}
  .sheet{max-width:960px;margin:28px auto;background:#fff;border:1px solid var(--line);border-radius:12px;overflow:hidden}
  .rhead{padding:26px 34px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:20px;flex-wrap:wrap}
  .rhead img.eagle{width:58px;height:auto}
  .rhead img.wm{height:34px;width:auto}
  .rhead .titles{flex:1;min-width:240px}
  .rhead h1{font-size:21px;margin:0;letter-spacing:-.3px}
  .rhead .sub{color:var(--muted);font-size:12px;margin-top:3px}
  .classif{display:inline-flex;gap:8px;flex-wrap:wrap}
  .chip{display:inline-block;padding:4px 10px;border-radius:6px;font-size:10.5px;font-weight:750;letter-spacing:.2px;border:1px solid var(--line)}
  .chip-ok{background:var(--greenbg);color:var(--green);border-color:#b9dfcd}
  .chip-warn{background:var(--amberbg);color:var(--amber);border-color:#eedbab}
  .chip-bad{background:var(--redbg);color:var(--red);border-color:#efc8bf}
  .chip-neutral{background:#f1f4f4;color:var(--muted);border-color:var(--line)}
  .chip-blue{background:var(--bluebg);color:var(--blue);border-color:#c9dcf1}
  section{padding:22px 34px;border-bottom:1px solid var(--line)}
  h2{font-size:15px;margin:0 0 12px;letter-spacing:-.2px}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:10px 22px}
  .kv{border:1px solid var(--line);border-radius:8px;padding:9px 12px}
  .kv span{display:block;font-size:9.5px;text-transform:uppercase;letter-spacing:.7px;color:var(--muted)}
  .kv strong{font-size:11.5px;word-break:break-all}
  .mono{font-family:var(--mono);font-size:11px}
  .small{font-size:11px}
  .notice{border:1px solid #eedbab;background:var(--amberbg);border-radius:10px;padding:13px 16px;margin:0 0 6px}
  .notice.red{background:var(--redbg);border-color:#efc8bf}
  .notice.blue{background:var(--bluebg);border-color:#c9dcf1}
  .notice b{font-size:12px}
  .notice p{margin:5px 0 0;font-size:12px}
  table{width:100%;border-collapse:collapse;font-size:11.5px}
  th{text-align:left;font-size:9.5px;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);padding:7px 10px;border-bottom:1px solid var(--line)}
  td{padding:9px 10px;border-bottom:1px solid var(--line);vertical-align:top}
  .facet{display:inline-block;margin:2px 8px 2px 0;padding:3px 8px;background:#f5f7f7;border-radius:6px}
  .qgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}
  .qcard{border:1px solid var(--line);border-radius:8px;padding:11px 13px}
  .qhead{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
  .qhead strong{font-size:11px;letter-spacing:.5px}
  ul{margin:6px 0 0;padding-left:18px}
  li{margin:4px 0;font-size:11.5px}
  .rfoot{padding:20px 34px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;color:var(--muted);font-size:11px}
  .rfoot img{height:26px;width:auto}
  a{color:var(--blue);word-break:break-all}
  @media print{body{background:#fff}.sheet{margin:0;border:none;border-radius:0;max-width:none}}
</style>
</head>
<body>
<div class="sheet">
  <div class="rhead">
    <img class="eagle" src="../assets/brand/haiec-eagle.png" alt="HAIEC eagle mark">
    <div class="titles">
      <h1>Master Assurance Report — Public Sample</h1>
      <div class="sub">Frozen derivative of a genuine persisted HAIEC evaluation · rendered verbatim from export digest ${esc(a.exportDigest)}</div>
      <div class="classif" style="margin-top:8px">
        <span class="chip chip-warn">SYNTHETIC LAB DATA</span>
        <span class="chip chip-blue">EVIDENCE-ONLY BASIS</span>
        <span class="chip chip-neutral">FROZEN EXPORT · NOT A NEW EVALUATION</span>
      </div>
    </div>
    <img class="wm" src="../assets/brand/haiec-wordmark.png" alt="HAIEC — Human AI Evidence Company">
  </div>

  <section>
    <h2>What this report is — and is not</h2>
    <div class="notice">
      <b>Evaluated by HAIEC's deterministic assurance engine</b>
      <p>This report is bound to a persisted evaluation, its evidence digests and control-test receipts. It is an evidence-only assessment — not a source-code scan, a live factory-monitoring session, or proof of a production-plant event. The underlying manufacturing corpus is synthetic lab data; the evaluation results are genuine deterministic HAIEC output, frozen and re-verified by SHA-256 export digest.</p>
    </div>
    <div class="notice red">
      <b>A witnessed effect is not an authorized effect</b>
      <p>Rule MFG-EFF-001 reports MATCH because its predicate observed an effect — a transaction independently read back on the wrong work-order target. MATCH means the divergence predicate was satisfied; it is a consequential divergence finding, not a pass, and it is not evidence that the action was authorized, safe, or target-correct.</p>
    </div>
  </section>

  <section>
    <h2>Evaluation identity</h2>
    <div class="grid">
      ${kv('Evaluation ID', e.evaluationId)}
      ${kv('AI system', e.aiSystemId, false)}
      ${kv('Source case', a.sourceCase.caseId + ' · ' + a.sourceCase.scenarioState, false)}
      ${kv('Scenario run', a.sourceCase.scenarioRunId)}
      ${kv('Disposition', e.disposition, false)}
      ${kv('Evaluation basis', e.evaluationBasis, false)}
      ${kv('Methodology version', e.methodologyVersion)}
      ${kv('Report ID / version', e.reportId + ' · ' + e.reportVersion)}
      ${kv('Projection version', e.projectionVersion)}
      ${kv('Core truth digest', e.coreTruthDigest)}
      ${kv('Evidence bundle digest', e.evidenceBundleDigest)}
      ${kv('Export digest (integrity check)', a.exportDigest)}
      ${kv('Derivative identity', derivId)}
      ${kv('Data class', a.provenance.dataClass + ' · ' + a.provenance.truthLabel, false)}
      ${kv('Produced by', a.provenance.producedBy, false)}
      ${kv('Exported at', a.exportedAt)}
    </div>
    <p class="small" style="margin-top:10px;color:var(--muted)">SHA-256 digests are integrity checks recomputed over this frozen export. They are not cryptographic issuer signatures and do not authenticate who published the export.</p>
  </section>

  <section>
    <h2>Deterministic rule outcomes</h2>
    <table>
      <thead><tr><th>Rule</th><th>Outcome</th><th>Rule reason (verbatim)</th><th>Qualified claims</th><th>Missing claims</th><th>Evidence refs</th></tr></thead>
      <tbody>${rulesRows}</tbody>
    </table>
    <p class="small" style="margin-top:8px;color:var(--muted)">RULE_OUTCOME != ASSURANCE_VERDICT. A MATCH marks that a rule predicate was satisfied against qualified claims — read the verbatim reason for what was actually established.</p>
  </section>

  <section>
    <h2>Manufacturing control maturity — UCP control results</h2>
    <table>
      <thead><tr><th>Control</th><th>Facets</th><th>UCP result / receipt</th><th>Executed rules</th></tr></thead>
      <tbody>${maturityRows}</tbody>
    </table>
    <div class="notice blue" style="margin-top:12px">
      <b>Reading R01 SATISFIED correctly</b>
      <p>SATISFIED is an effect-witness / control-evaluation result: the control's executed rule observed the consequential effect and a UCP receipt is bound to this evaluation. It does not certify the action was authorized or safe — here it witnesses the wrong-target effect itself.</p>
    </div>
    ${maturity ? `<p class="small" style="margin-top:8px;color:var(--muted)">Facet version ${esc(maturity.version)} · qualified observations: ${esc(maturity.qualifiedObservationCount)} · rejected: ${esc(maturity.rejectedObservationCount)}</p>` : ''}
  </section>

  <section>
    <h2>Assurance question states</h2>
    <div class="qgrid">${q('reach')}${q('authority')}${q('observed')}${q('proofBoundary')}</div>
  </section>

  <section>
    <h2>Declared limitations</h2>
    <ul>${listItems(e.limitations)}</ul>
    ${maturity?.limitations?.length ? `<h2 style="margin-top:16px">Control-maturity limitations</h2><ul>${listItems(maturity.limitations)}</ul>` : ''}
    <h2 style="margin-top:16px">Product semantics</h2>
    <ul>${listItems(e.semantics)}</ul>
  </section>

  <section>
    <h2>Original authenticated report</h2>
    <p class="small">The canonical Master Report — HTML, PDF and detail views — is hosted by HAIEC and requires a signed-in member of the evaluation-owning organization. Unauthorized visitors receive HAIEC's normal fail-closed response.</p>
    <ul>
      <li>HTML report: ${link(links.html)}</li>
      <li>PDF report: ${link(links.pdf)}</li>
      <li>JSON API: ${link(links.api)}</li>
      <li>Evaluation detail: ${link(links.evaluation)}</li>
    </ul>
    <p class="small">Provenance: ${esc(a.provenance.note ?? '')} This public derivative omits internal user identities and nonpublic organization details; no credentials, customer or production factory data are present.</p>
  </section>

  <div class="rfoot">
    <img src="../assets/brand/haiec-wordmark.png" alt="HAIEC">
    <div>
      <strong>HAIEC — Human AI Evidence Company</strong> · "High assurance in every consequence."<br>
      Public sample rendered ${esc(new Date().toISOString())} from export ${esc(a.exportDigest)} · derivative ${esc(derivId)} · fictional manufacturer, synthetic evaluation corpus.
    </div>
  </div>
</div>
</body>
</html>`;
}

const res = loadExportFile(fs, EXPORT_FILE);
if (!res.ok || !res.verified) {
  console.error('BUILD FAILED — export failed integrity verification:');
  for (const e of res.errors) console.error('  ✗', e);
  process.exit(1);
}
const artifact = res.artifact;
const derivId = derivativeIdentity(artifact);
fs.mkdirSync(path.dirname(OUT_HTML), { recursive: true });
fs.writeFileSync(OUT_HTML, buildHtml(artifact, derivId));
// Parity manifest — tests and release verification compare these canonical
// fields inside the rendered derivatives rather than comparing PDF bytes.
fs.writeFileSync(OUT_IDENTITY, JSON.stringify({
  schemaVersion: 'sample-report-identity-1.0.0',
  derivativeId: derivId,
  evaluationId: artifact.evaluation.evaluationId,
  disposition: artifact.evaluation.disposition,
  evaluationBasis: artifact.evaluation.evaluationBasis,
  reportVersion: artifact.evaluation.reportVersion,
  methodologyVersion: artifact.evaluation.methodologyVersion,
  projectionVersion: artifact.evaluation.projectionVersion,
  coreTruthDigest: artifact.evaluation.coreTruthDigest,
  evidenceBundleDigest: artifact.evaluation.evidenceBundleDigest,
  exportDigest: artifact.exportDigest,
  ruleOutcomes: (artifact.manufacturing.ruleOutcomes || []).map((r) => ({ ruleId: r.ruleId, status: r.status })),
  r01: ((artifact.manufacturing.controlMaturity || {}).rows || []).find((r) => r.controlId === 'R01') || null,
}, null, 2));
console.log(`sample report: ${OUT_HTML}`);
console.log(`  evaluation: ${artifact.evaluation.evaluationId} · ${artifact.evaluation.disposition} · ${artifact.evaluation.evaluationBasis} · derivative ${derivId.slice(0, 20)}…`);
