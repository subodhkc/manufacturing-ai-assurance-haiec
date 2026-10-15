# Executive Command Center — Canonical Field Map

Every value rendered on the Executive Command Center resolves to one of these
sources. Nothing is computed by the browser beyond pass-through projection and
digest verification. If a source field is absent the UI renders an explicit
unavailable marker — never a substitute.

## Sources

| Symbol | Object | Role |
|---|---|---|
| `EXPORT` | `HXDATA.exportMap['SYS-217-WRONG_TARGET']` (`data/evaluations/sys-217-wrong-target.json`) | Frozen `haiec-evaluation-export-1.0.0` artifact, `exportDigest`-pinned |
| `SET` | `HXDATA.exportMap` + `manifest` | 27 exports (9 systems × 3 states) |
| `REPLAY` | `HXDATA.replay` (built by `scripts/build-dashboard-data.cjs` from `packages/fixtures/src/source-world.cjs`) | Recorded source-world records, digest-pinned |
| `FIXTURE` | `SYSTEMS` / `AGENTS` / `CONTROLS` / workflows in `dashboard/index.html` + `data/generated/*` | Fictional estate/catalog — never evaluation truth |
| `STUDY` | `docs/handoff/ucp/08-sprint13-out-of-box-capability-study.md` (HAIEC repo) | Separate measured benchmark — different population |

## Module → field mapping

### Module 1 — AI Estate & Inventory
| UI field | Source | Scope | Missing-data behavior |
|---|---|---|---|
| 9 AI systems / 16 agents / 45 controls / 7 workflows | `FIXTURE` | Estate catalog facts | Label `FICTIONAL MANUFACTURING ESTATE`; counts are catalog size, not executed checks |
| 27 persisted evaluations, 9×3, EVIDENCE_ONLY | `SET` count + `EXPORT.evaluation.evaluationBasis` | Synthetic-lab corpus | `NO EXPORTS` if set empty |
| Last frozen export timestamp | `EXPORT.exportedAt` / `manifest.exportedAt` | Export envelope | `—` |
| Methodology / report version | `EXPORT.evaluation.methodologyVersion` / `reportVersion` | Evaluation | `—` |
| System → case link | `EXPORT.sourceCase.aiSystemId` | Verified exports only | Row hidden if digest unverified |

### Module 2 — Five Independent Evidence Planes
| UI field | Source | Scope | Missing-data behavior |
|---|---|---|---|
| Plane state (all `NOT_ASSESSED`) | `EXPORT.evaluation.fourQuestions.authority.planes.{requested,policyAuthorized,effectivelyGranted,codeCapable,observed}.state` | Action-path planes, this evaluation | `NOT_ASSESSED` is the rendered value itself — never promoted to PASS |
| Path count | `…planes.<plane>.pathCount` | Same | `0` verbatim |
| Detail text | `…planes.<plane>.detail` | Same | verbatim |
| Plane meaning copy | static explanatory text | Educational | labeled explanation |

### Module 3 — Assurance & Integrity Posture
| UI field | Source | Scope | Missing-data behavior |
|---|---|---|---|
| Disposition `REVIEW` | `EXPORT.evaluation.disposition` | This evaluation | withheld if digest unverified |
| Basis `EVIDENCE_ONLY` / class `SYNTHETIC_LAB` | `EXPORT.evaluation.evaluationBasis` / `EXPORT.provenance.dataClass` | Export | verbatim |
| Digest verified / unsigned | runtime `crypto.subtle` recompute vs `EXPORT.exportDigest` | Integrity ≠ issuer signature | `INTEGRITY FAILURE` blocks module |
| R01 `SATISFIED` / `RECEIPT_BOUND` | `EXPORT.manufacturing.controlMaturity.rows[R01]` | Control test | `ABSENT_FACET` if facet missing |
| Rule coverage | `EXPORT.manufacturing.ruleOutcomes[]` verbatim (`status`,`reason`,`requiredClaims`,`qualifiedClaims`,`missingClaims`,`evidenceRefs`) | Manufacturing rules | verbatim `INSUFFICIENT_SOURCE` |
| Proof boundary `PARTIAL` | `EXPORT.evaluation.fourQuestions.proofBoundary.state` | Evaluation | verbatim |
| No bound static scan | `EXPORT.evaluation.limitations` (`EVIDENCE_ONLY_EVALUATION — no static scan`) | Evaluation | verbatim limitation |
| U5 reason codes | `proofBoundary.facts` verbatim (`NOT_EVALUATED`, `REQUESTED_NOT_AUTHORIZED`) | Evaluation | verbatim |

### Module 4 — Consequence Action Graph
| Node | Source | Edge semantics |
|---|---|---|
| Requested operation `mes.work_order.update` → `WO-217-4802` | `REPLAY` REQUESTED record payload | record-backed |
| Approved target `WO-217-4802` | `REPLAY` POLICY_DECLARED + GATE_DECISION records | record-backed |
| Dispatch / transaction `syn-txn-b855a022ebe42786bf` | `REPLAY` ACTION_RECORDED; txn id also inside `MFG-EFF-001` reason | record-backed |
| Witnessed readback `WO-217-4803` | `REPLAY` TARGET_READBACK | record-backed |
| Finding `MFG-EFF-001 = MATCH` | `EXPORT.manufacturing.ruleOutcomes` verbatim | export-backed |
| Reachability / delegated-path frontier | `fourQuestions` limitations | **dashed frontier edge** — not established |

### Module 5 — Delegation & Capability Boundary
| UI field | Source | Note |
|---|---|---|
| Permission-vs-delegation explainer | Educational copy + `dcd-mathematical-foundation.pdf` concepts | Framework concept label |
| `DCD = C \ (R ∩ P ∩ G)` | DCD brief | Rendered as *concept*, explicitly `NOT an evaluated SYS-217 result` |
| `Scope(S_k) ⊆ Scope(S_(k-1))` | DCD brief | Conditional DAI invariant under a defined delegation contract |
| Demonstrated finding | `MFG-EFF-001 MATCH` | Primary real result — the graph, not the formula |

### Module 6 — Proof Frontier & Next Evidence
| UI field | Source | Missing-data behavior |
|---|---|---|
| `PARTIAL` boundary + 5 frontier items + 1 open need | `fourQuestions.proofBoundary.facts` verbatim (AI-PROOF-003/012/014/015 + producer-disconnected facets) | verbatim `Not assessed:` rows |
| Limitations | `fourQuestions.proofBoundary.limitations` | verbatim |
| Next evidence | `fourQuestions.proofBoundary.nextEvidence` | verbatim |
| Closing producer | derived from the verbatim `…: producer not connected to this basis` fragment | labeled interpretation |

### Module 7 — Audit & Evidence Replay
| UI field | Source | Missing-data behavior |
|---|---|---|
| Timeline records (6) | `REPLAY.records` — `source-world.cjs` `buildSourceWorld()` SYS-217-WRONG_TARGET events | `MISSING EVIDENCE` per absent phase |
| `declaredAt`, `sequence`, `evidenceId`, `producerRunId`, `claimedSourceRole`, `producerQualification` | record fields verbatim | shown raw |
| Binding | `REPLAY.provenance`: `sourceWorldId` = `manufacturing-source-world-v1`, `scenarioRunId` = `syn-world-sys-217-wrong_target`, `transactionId` = `syn-txn-b855a022ebe42786bf`, `evidenceCount` 6 = `evaluationScenarioSnapshot.states[0].evidenceCount` | binding fields must all match or build fails |
| Rule findings / R01 / report links | `EXPORT` | digest-gated |
| Label | static | `Recorded Synthetic Evidence Replay` — never "live OTLP" |

## Boundaries

- A rule `MATCH` is a predicate finding, never green/`PASS`/`Action Safe`.
- `REVIEW` is the canonical disposition; the graph does not assert causality
  between MFG-EFF-001 and U5 REVIEW — U5 reasons are displayed verbatim.
- Benchmark numbers live only in the Study module with their own population
  (11-record SYS-217-EXPECTED_BASELINE run + 27-case acceptance corpus,
  LIVE_VERIFIED 2026-10-14) — never blended with the single SYS-217 evaluation.
- No FAR %, no code-reach numerator, no proof-completion gauge, no fabricated
  OTLP ms timestamps.
