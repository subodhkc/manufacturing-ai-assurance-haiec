# HackFW v2.5 — Operator Action Assurance: Enhanced UX, Security and Compliance Plan

Date: 2026-10-15
Status: Six-step UI in implementation. Remaining production-enforcement and cross-industry source gates are NOT completed.
Governing Drive master plan: https://docs.google.com/document/d/1fjw9j6Kl_ynJqzeCRlQ_Z-y7xSx8XyNpCL1n8tOqohE/edit

## North star

**Detect → Investigate → Authorize → Contain → Verify → Report.** Show what an operator can determine, investigate and do without converting an earlier HAIEC evaluation into proof of a new response. One shared manufacturing dashboard; no duplicate assurance engine.

### Evidence truth modes

| Track | Basis | Allowed | Not allowed |
|---|---|---|---|
| Persisted HAIEC synthetic | Exact digest-verified SYS-217-WRONG_TARGET v1 evaluation | Target divergence, U5 REVIEW, qualified R01 effect witness | Real-world plant event, authorization of wrong effect, automatic containment |
| Recorded replay | Pinned synthetic source-world records | Declared event sequence and source record time | Independent industrial witness not contained in source |
| Browser-only response | In-memory fictional pause, attempted request, reset | Interactive simulated-denial explanation | HAIEC kill-switch control, persisted receipt or downstream MES/PLC effect |
| Response NOT ESTABLISHED | No qualified post-control source | Honest gap and required next witness | Passing control state, compliance badge or safe-recovery claim |
| Contextual framework | Editorial OWASP/NIST reference | Candidate applicable risk families | Verified rule-level mapping, test coverage or certification |

## Six-stage UI contract

1. DETECT. Read-only persisted evaluation identity, MFG-EFF-001 MATCH, U5 REVIEW and exact approved WO-217-4802 versus recorded WO-217-4803. A match is a divergence finding, NOT a pass.
2. INVESTIGATE. Rule table, source claim coverage, missing COLLECTOR_CONTINUITY, action path and source-world replay. Four Assurance Questions' observed/action-path plane stays NOT_ASSESSED despite qualified manufacturing effect evidence.
3. AUTHORIZE. Separate the original approved manufacturing operation from a NEW incident-response permission. Never issue fake approval from the public browser. Show human owner, exact target, validity, scope, SoD, version and expiry as requirements.
4. CONTAIN. Browser-only scripted fictional dispatcher pause, follow-up attempt and reset. Local SIMULATED_DENY is not a real guard call or independent denial event. No backend API, HAIEC credential or physical OT action.
5. VERIFY. Two visible columns: existing R01 SATISFIED / RECEIPT_BOUND for historical wrong-target effect; post-containment response witness NOT ESTABLISHED. Cannot transfer receipts between actions.
6. REPORT. Public sample Master Assurance Report, verified evaluation detail and recorded replay links. Display evaluation ID, digest role and limitations. No newly signed report from a browser rehearsal.

Use status language persisted HAIEC synthetic / simulated response / not assessed. Keyboard-accessible stages, responsive mobile, printable but no regulatory badges or score gauges.

## Gate A: public manufacturing repo, current sprint

- [x] Dedicated six-stage Operator Journey module, responsive styling, dashboard navigation and CTA.
- [x] Render authority-bearing evidence ONLY after existing export digest verification, withholding on mismatch.
- [x] No changes to 27 canonical exports, historical v1 IDs, source digest, R01 receipts, or server-side HAIEC.
- [x] Local simulated pause and follow-up denial visibly separated from historical HAIEC evaluation.
- [x] First key copy corrections for monitoring and judge wording.
- [x] Focused tests for stages, fail-closed behavior, scope separation and report provenance.
- [ ] Browser UI review at 360px, desktop, keyboard and print. Deployed READY status is insufficient to claim interactive acceptance.
- [ ] Audit remaining legacy report cards and render only real links or conspicuous unavailable states.

## Gate B: private HAIEC kill-switch security (separate PR)

Code review identified that app/api/kill-switch/recover/route.ts checks recover permission but did not explicitly require the selected system's organizationId to equal the authenticated key organization before updating state. Add owner check BEFORE idempotency and mutation, cross-org deny and narrow regression tests. Also review app/api/kill-switch/trigger/route.ts: manual-only L3 detection currently uses request-controlled triggeredBy; actor/automation identity must be server-derived for security.

Central lib/kill-switch/execution-guard.ts genuinely checks registered OPEN versus KILLED state, but callsite inspection did not establish production dispatch/tool interception or L1/L2 throttling enforcement. Tested guard existence != end-to-end protected agent. HAIEC's ledger lists kill-switch-to-assessed-system binding PARTIAL. Check distributed cache freshness and guard audit event durability. No real kill-switch connection in the public simulator before review.

Live claim acceptance: exact tenant + system + killSwitchSystem binding, authorized approval and SoD, guard called at the actual execution boundary, rejected action and durable blocked attempt, post-control independent readback, authorized recovery and re-test, all source-qualified under exact evaluation and transaction references.

## Gate C: versioned compliance mapping, not certification

Reuse canonical HAIEC framework catalog and qualified mapping edges; NEVER duplicate as a browser source-of-truth registry. Every mapping needs framework ID/version, mapped finding/control ID, strength and reason, source evidence, test result, scope and limitations. If reviewed edge is absent, show CONTEXTUAL REFERENCE / NOT EVALUATED.

Future scenario candidates: OWASP Agentic ASI02 tool misuse, ASI03 identity abuse, ASI07 A2A scope propagation, ASI08 cascading effects, ASI09 human approval exploitation, ASI10 rogue repeated action; use OWASP ASVS 5.0 for HAIEC product authorization and API boundaries. Governance context: NIST AI RMF / GenAI Profile, ISO/IEC 42001; manufacturing OT reference NIST SP 800-82 Rev 3 and ISA/IEC 62443. Mapping != compliance; catalog reference != executed rule; simulated policy check != independently demonstrated enforcement.

## Gate D: source maturity, report parity and scenarios

1. Source-native manufacturing v3.1 needs NEW tenant-authorized canonical evaluations; historical 27 are from v1, not new v3.1.
2. Connect qualified collector continuity, independent native readback, approved envelopes, reviewed policy and real code reachability. Missing must stay UNKNOWN.
3. Produce separately evaluated remediated snapshot/delta instead of inferring post-control recovery from historical evidence.
4. One domain-specific consequence journey at a time: quality-held WMS shipment; supplier bank/PO change; electronics firmware/test mismatch; rail wrong segment; telecom slice AL0/AL1/AL2 remains a historical competition example until freshly evaluated.
5. User/tenant permissions, true external holdout, source-lineage integrity, security audit and network isolation before enterprise customer claims.

## Release acceptance and sequencing

P0 now: public journey UI; private recover-route tenant fix; source/copy isolation.
P1: versioned OWASP/NIST mapping facet; actual kill-switch dispatch attachment and independent denial witness; all nine fresh v3.1 evaluations.
P2: advanced industry-level experiences, evidence-bound deltas, multi-company onboarding.

Checks: 6 stages; exact rule/target/disposition/receipt; corrupt export fails closed; local simulation never mutates canonical data; cross-profile and cross-tenant protections; no fabricated compliance status or real OT operation; focused CI tests; Vercel commit READY + separate browser smoke.
