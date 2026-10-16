# Fictional Human Approval Evidence & Production Infrastructure Boundary

**HackFW Sprint 21.2** — this is a source-data-backed review demonstration, **not** real deployment authorization, identity attestation, dispatcher enforcement, or a new HAIEC assurance evaluation. It cannot grant access to MES, QMS, ERP, APS, CMMS, WMS or industrial control systems.

## Implemented in the manufacturing demo

- `data/demo-governance/governance-scenarios.json` contains nine immutable fictional decision scenarios and nine bound `requestRecord` dossiers: requester role, reviewer role, submitted time, ticket, exact operation, target and environment, allowed lower-risk advisory activity, prohibited consequential scope, conditions, expiry, and case reference.
- Each dossier has a chronological `reviewEvents` trail explicitly marked as a DEMO fixture. The role reference is not a real identity; the fixture contains no personal names, MFA assertion or cryptographic sign-off.
- `reviewInfrastructure` advertises its actual boundary: role directory is fictional; the browser ledger is ephemeral; authentication, persistent approval storage, production authorization and dispatch enforcement are **not provisioned**; monitoring has **NO_LIVE_CONNECTORS**.
- The dashboard shows the dossier and a separate browser-local roleplay. For the four pending consequential operations, **Continue lower-risk advisory scope only** does not change the proposed operation's `PENDING` state. A roleplay rejection can reject the request in local display, and reset clears the local governance roleplay overlay. Neither action writes to HAIEC.
- All 45 v3 canonical U5 dispositions remain REVIEW. The 27 historical v1 evaluations remain unchanged. The dossier's canonical case ID is a read-only contextual link, not a new evaluation or evidence input.

### Simulated record contracts

```
requestRecord:
  requestId, changeTicket, requestType, requestTime
  requestedByRole, assignedReviewerRole, requestedTarget
  requestedOperation, requestedEnvironment
  policyRef, policyVersion
  allowedAdvisoryScope[], forbiddenConsequenceScope[]
  accountableOwnerRole, separationOfDuties
  reviewerIdentityState, mfaState, supportingCaseId
  evidenceRequirements[], reviewDueAt
  decisionState, decisionTime, decisionRationale
  approvalExpiresAt, liveDispatchEnforcement

reviewEvents[]:
  eventType, at, actorRole, requestId, reason
```

The deterministic fixture build rejects mismatched request, decision, scope, actor, source case, timestamps, duplicate IDs and falsely connected approval infrastructure. Any new data is explicitly `SIMULATION_ONLY`.

## Later: minimum actual human approval infrastructure in HAIEC Main

The manufacturing repo must **not** become the production authority service. Reuse HAIEC's tenant/OAuth boundary, existing canonical evaluated evidence APIs, policy and operating-envelope semantics, and Neon transactional database.

1. **Request service** — authenticated tenant-bound `approval_request` with immutable request version, agent principal, operation, target resource, exact policy/effect envelope, environment, expiration, evidence-snapshot hash and decision-owner role. A material change creates a new review request.
2. **Reviewer eligibility** — server-resolved identity from verified login; never trust client-submitted approver identity. Enforce least privilege, tenant match, separation of duties (requester cannot self-approve), delegated approval ceilings, MFA/step-up for high-consequence actions, owner reassignment rules.
3. **Decision service** — transactional compare-and-swap on request version; `APPROVE_SCOPED`, `REJECT`, `REQUEST_EVIDENCE`, `REVOKE`, `EXPIRE`. Store immutable append-only `approval_event` records including reviewer ID, role-at-decision, time, policy version, rationale, authorized scope, prerequisites and correlated assessment. No silent overwrite or arbitrary rejected→approved update.
4. **Grant/use boundary** — an approved human decision does not itself grant execution rights. A separate authenticated policy decision point/dispatcher must verify exact organization, principal, tool, operation, target, amount, policy version, time window, request nonce and prior approval state **at execution time**. Deny missing/expired/revoked/replayed/broader requests and bypass attempts. Actual MES/OT enforcement and native effect proof require integration-specific adapters and operational safety review.
5. **Evidence/monitoring** — capture decision, dispatcher response, upstream authenticated source identity, native transaction/readback and continuity separately. Expose evidence to HAIEC through registered producers; do not treat self-reported execution success as an independent effect. Feed incident alerts, revocation and required human re-review back to governance.
6. **Outbox and notifications** — queue reviewer assignments and overdue/expiry notifications through authenticated, allowlisted channels with idempotency and rate limits. Notifications do not approve actions or substitute for the append-only ledger.

### Minimum backend storage / safeguards

- `approval_request`: tenant ID + request ID unique; exact resource/operation/effect envelope; policy/version; requested by, assigned owner, open/closed state, expiry; foreign keys to tenant-scoped resources.
- `approval_event`: immutable ID, request version, actor principal/role from session, decision, reason, before/after state, server time, scope diff, source references. Prevent update/delete at application role.
- `approval_revocation` and policy-change invalidation: append-only; new policy/agent/tool scope requires re-review.
- `approval_outbox`: durable delivery, idempotency and no credential/PII leakage.
- Authz: explicit governance read/request/review/revoke permissions; tenant row isolation, SoD, minimum roles, CSRF and replay protection, server-side validation, secret-store credentials, no trust in public dashboard inputs.
- Keep `U5 REVIEW` as independently truthful evidence output. No fictional approval turns a REVIEW into ALLOW or creates a U6 assurance receipt.

**Release decision:** No real approval DB/API/dispatcher is needed for HackFW. Build those only as the next enterprise HAIEC milestone, with a real authenticated reviewer and a controlled integration/pilot. Until then the public demo shows fictional governance and no actuation.
