/* GENERATED from data/demo-governance/governance-scenarios.json; read-only presentation. */
window.HAIEC_GOVERNANCE_DEMO = {
  "schemaVersion": "demo-governance-scenario-1.0.0",
  "artifactClass": "FICTIONAL_DEPLOYMENT_GOVERNANCE_SCENARIOS_NOT_HAIEC_AUTHORIZATIONS",
  "generatedAt": "2026-10-15T00:00:00.000Z",
  "referenceClock": "2026-10-15T12:00:00.000Z",
  "freshnessMultiplier": 2,
  "provenance": "SIMULATION_ONLY",
  "notices": [
    "These are fictional deployment-governance records for demonstration. They are not HAIEC U5 dispositions, not U6 receipts, not enterprise authorizations and not real human attestations.",
    "No record here was consumed by any previously issued HAIEC evaluation. Canonical assurance state is read separately from the digest-verified export corpus."
  ],
  "policy": {
    "id": "DEMO-GOV-POLICY",
    "version": "demo-gov-policy-1.0",
    "title": "Fictional deployment governance exercise policy"
  },
  "decisions": [
    {
      "systemId": "SYS-340",
      "agentId": "SYS-340-AGENT-1",
      "canonicalCaseId": "SYS-340-EXPECTED_BASELINE",
      "environment": "FICTIONAL_PRODUCTION",
      "proposedOperation": "Score inspection images and route suspect cylinder heads to quality review",
      "humanDecision": "APPROVED_SCOPED",
      "allowedOperations": [
        "Read image batches",
        "Score surface-defect indicators",
        "Route suspect parts to human quality review"
      ],
      "prohibitedOperations": [
        "Autonomous part release",
        "Direct MES disposition write",
        "Model self-update without revalidation"
      ],
      "approverRole": "Inspection Quality Manager",
      "decisionRef": "GOV-2026-S340-A1",
      "decidedAt": "2026-10-14T15:20:00.000Z",
      "policyVersion": "demo-gov-policy-1.0",
      "rationale": "Read-and-route operation is reversible and bounded; every disposition lands on a human reviewer. Autonomous release stays prohibited until qualified release-authority evidence exists.",
      "requiredConditions": [
        "Model version pinned per batch",
        "Every suspect part routed to named human review",
        "Revalidation on part or lighting change"
      ],
      "reviewTrigger": "Model, part family or lighting change; any attempt at autonomous release",
      "expiresAt": "2027-01-14T15:20:00.000Z",
      "monitoringScenarioId": "MON-S340",
      "requestRecord": {
        "requestId": "DEMO-REQ-SYS-340-01",
        "changeTicket": "DEMO-CHG-340-14",
        "requestType": "INSPECTION_ADVISORY_SCOPE",
        "requestTime": "2026-10-12T08:00:00.000Z",
        "requestedByRole": "Vision Inspection Product Owner",
        "assignedReviewerRole": "Inspection Quality Manager",
        "requestedTarget": "Plant A / inspection cell V-340 / cylinder-head image batches",
        "requestedOperation": "Score inspection images and route suspect cylinder heads to quality review",
        "requestedEnvironment": "FICTIONAL_PRODUCTION",
        "policyRef": "DEMO-GOV-POLICY",
        "policyVersion": "demo-gov-policy-1.0",
        "allowedAdvisoryScope": [
          "Read image batches",
          "Score surface-defect indicators",
          "Route suspect parts to human quality review"
        ],
        "forbiddenConsequenceScope": [
          "Autonomous part release",
          "Direct MES disposition write",
          "Model self-update without revalidation"
        ],
        "accountableOwnerRole": "Inspection Quality Manager",
        "reviewerIdentityState": "FICTIONAL_ROLE_ONLY_NOT_AUTHENTICATED",
        "mfaState": "NOT_PERFORMED_SIMULATION",
        "separationOfDuties": "REQUESTER_ROLE_DIFFERS_FROM_REVIEWER_ROLE_IN_FIXTURE_ONLY",
        "supportingCaseId": "SYS-340-EXPECTED_BASELINE",
        "evidenceRequirements": [
          "Model version pinned per batch",
          "Every suspect part routed to named human review",
          "Revalidation on part or lighting change"
        ],
        "reviewDueAt": null,
        "decisionState": "APPROVED_SCOPED",
        "decisionTime": "2026-10-14T15:20:00.000Z",
        "decisionRationale": "Read-and-route operation is reversible and bounded; every disposition lands on a human reviewer. Autonomous release stays prohibited until qualified release-authority evidence exists.",
        "approvalExpiresAt": "2027-01-14T15:20:00.000Z",
        "liveDispatchEnforcement": "NOT_CONNECTED"
      },
      "reviewEvents": [
        {
          "eventType": "DEMO_REVIEW_REQUEST_SUBMITTED",
          "at": "2026-10-12T08:00:00.000Z",
          "actorRole": "Vision Inspection Product Owner",
          "requestId": "DEMO-REQ-SYS-340-01",
          "reason": "Requested governance review; no authority issued"
        },
        {
          "eventType": "DEMO_SCOPED_APPROVAL_RECORDED",
          "at": "2026-10-14T15:20:00.000Z",
          "actorRole": "Inspection Quality Manager",
          "requestId": "DEMO-REQ-SYS-340-01",
          "reason": "Read-and-route operation is reversible and bounded; every disposition lands on a human reviewer. Autonomous release stays prohibited until qualified release-authority evidence exists."
        }
      ]
    },
    {
      "systemId": "SYS-FC1",
      "agentId": "SYS-FC1-AGENT-1",
      "canonicalCaseId": "SYS-FC1-EXPECTED_BASELINE",
      "environment": "FICTIONAL_PRODUCTION",
      "proposedOperation": "Generate demand forecasts and propose production plans",
      "humanDecision": "APPROVED_SCOPED",
      "allowedOperations": [
        "Create demand forecasts",
        "Propose production-plan revisions for planner review"
      ],
      "prohibitedOperations": [
        "Commit changes to a frozen master schedule",
        "Release a production schedule",
        "Alter firm orders"
      ],
      "approverRole": "Supply Chain Planning Director",
      "decisionRef": "GOV-2026-SFC1-A1",
      "decidedAt": "2026-10-14T16:05:00.000Z",
      "policyVersion": "demo-gov-policy-1.0",
      "rationale": "Forecast generation is advisory; plan commitment authority remains with the accountable planner. A proposal is not a released schedule.",
      "requiredConditions": [
        "Frozen-horizon policy enforced at the planning boundary",
        "Planner sign-off recorded per released revision"
      ],
      "reviewTrigger": "Any attempt to write a frozen schedule",
      "expiresAt": "2027-01-14T16:05:00.000Z",
      "monitoringScenarioId": "MON-SFC1",
      "requestRecord": {
        "requestId": "DEMO-REQ-SYS-FC1-02",
        "changeTicket": "DEMO-CHG-FC1-15",
        "requestType": "FORECAST_ADVISORY_SCOPE",
        "requestTime": "2026-10-12T08:00:00.000Z",
        "requestedByRole": "Forecast Automation Product Owner",
        "assignedReviewerRole": "Supply Chain Planning Director",
        "requestedTarget": "Plant A / SKU family F-12 / advisory rolling forecast; no frozen APS commits",
        "requestedOperation": "Generate demand forecasts and propose production plans",
        "requestedEnvironment": "FICTIONAL_PRODUCTION",
        "policyRef": "DEMO-GOV-POLICY",
        "policyVersion": "demo-gov-policy-1.0",
        "allowedAdvisoryScope": [
          "Create demand forecasts",
          "Propose production-plan revisions for planner review"
        ],
        "forbiddenConsequenceScope": [
          "Commit changes to a frozen master schedule",
          "Release a production schedule",
          "Alter firm orders"
        ],
        "accountableOwnerRole": "Supply Chain Planning Director",
        "reviewerIdentityState": "FICTIONAL_ROLE_ONLY_NOT_AUTHENTICATED",
        "mfaState": "NOT_PERFORMED_SIMULATION",
        "separationOfDuties": "REQUESTER_ROLE_DIFFERS_FROM_REVIEWER_ROLE_IN_FIXTURE_ONLY",
        "supportingCaseId": "SYS-FC1-EXPECTED_BASELINE",
        "evidenceRequirements": [
          "Frozen-horizon policy enforced at the planning boundary",
          "Planner sign-off recorded per released revision"
        ],
        "reviewDueAt": null,
        "decisionState": "APPROVED_SCOPED",
        "decisionTime": "2026-10-14T16:05:00.000Z",
        "decisionRationale": "Forecast generation is advisory; plan commitment authority remains with the accountable planner. A proposal is not a released schedule.",
        "approvalExpiresAt": "2027-01-14T16:05:00.000Z",
        "liveDispatchEnforcement": "NOT_CONNECTED"
      },
      "reviewEvents": [
        {
          "eventType": "DEMO_REVIEW_REQUEST_SUBMITTED",
          "at": "2026-10-12T08:00:00.000Z",
          "actorRole": "Forecast Automation Product Owner",
          "requestId": "DEMO-REQ-SYS-FC1-02",
          "reason": "Requested governance review; no authority issued"
        },
        {
          "eventType": "DEMO_SCOPED_APPROVAL_RECORDED",
          "at": "2026-10-14T16:05:00.000Z",
          "actorRole": "Supply Chain Planning Director",
          "requestId": "DEMO-REQ-SYS-FC1-02",
          "reason": "Forecast generation is advisory; plan commitment authority remains with the accountable planner. A proposal is not a released schedule."
        }
      ]
    },
    {
      "systemId": "SYS-MNT88",
      "agentId": "SYS-MNT88-AGENT-1",
      "canonicalCaseId": "SYS-MNT88-EXPECTED_BASELINE",
      "environment": "FICTIONAL_CONTROLLED_PILOT",
      "proposedOperation": "Estimate equipment condition and recommend maintenance windows",
      "humanDecision": "APPROVED_SCOPED_PILOT",
      "allowedOperations": [
        "Read condition-monitoring data",
        "Estimate remaining-useful-life indicators",
        "Recommend maintenance windows to Maintenance Engineering"
      ],
      "prohibitedOperations": [
        "Stop or start equipment",
        "Dispatch maintenance work orders without authority",
        "Alter CMMS records"
      ],
      "approverRole": "Maintenance Engineering Manager",
      "decisionRef": "GOV-2026-M88-A1",
      "decidedAt": "2026-10-13T19:40:00.000Z",
      "policyVersion": "demo-gov-policy-1.0",
      "rationale": "Pilot scope limits the agent to advisory condition estimates on two monitored machines. A recommendation-to-stop requires its own work-authorization evidence.",
      "requiredConditions": [
        "Pilot asset list fixed (2 machines)",
        "CMMS ticket creation requires maintenance supervisor approval"
      ],
      "reviewTrigger": "Pilot exit review; any recommendation to stop equipment",
      "expiresAt": "2026-12-13T19:40:00.000Z",
      "monitoringScenarioId": "MON-M88",
      "requestRecord": {
        "requestId": "DEMO-REQ-SYS-MNT88-03",
        "changeTicket": "DEMO-CHG-M88-13",
        "requestType": "MAINTENANCE_PILOT_ADVISORY",
        "requestTime": "2026-10-12T08:00:00.000Z",
        "requestedByRole": "Reliability Analytics Product Owner",
        "assignedReviewerRole": "Maintenance Engineering Manager",
        "requestedTarget": "Two synthetic CNC pilot assets / condition and advisory recommendations only",
        "requestedOperation": "Estimate equipment condition and recommend maintenance windows",
        "requestedEnvironment": "FICTIONAL_CONTROLLED_PILOT",
        "policyRef": "DEMO-GOV-POLICY",
        "policyVersion": "demo-gov-policy-1.0",
        "allowedAdvisoryScope": [
          "Read condition-monitoring data",
          "Estimate remaining-useful-life indicators",
          "Recommend maintenance windows to Maintenance Engineering"
        ],
        "forbiddenConsequenceScope": [
          "Stop or start equipment",
          "Dispatch maintenance work orders without authority",
          "Alter CMMS records"
        ],
        "accountableOwnerRole": "Maintenance Engineering Manager",
        "reviewerIdentityState": "FICTIONAL_ROLE_ONLY_NOT_AUTHENTICATED",
        "mfaState": "NOT_PERFORMED_SIMULATION",
        "separationOfDuties": "REQUESTER_ROLE_DIFFERS_FROM_REVIEWER_ROLE_IN_FIXTURE_ONLY",
        "supportingCaseId": "SYS-MNT88-EXPECTED_BASELINE",
        "evidenceRequirements": [
          "Pilot asset list fixed (2 machines)",
          "CMMS ticket creation requires maintenance supervisor approval"
        ],
        "reviewDueAt": null,
        "decisionState": "APPROVED_SCOPED_PILOT",
        "decisionTime": "2026-10-13T19:40:00.000Z",
        "decisionRationale": "Pilot scope limits the agent to advisory condition estimates on two monitored machines. A recommendation-to-stop requires its own work-authorization evidence.",
        "approvalExpiresAt": "2026-12-13T19:40:00.000Z",
        "liveDispatchEnforcement": "NOT_CONNECTED"
      },
      "reviewEvents": [
        {
          "eventType": "DEMO_REVIEW_REQUEST_SUBMITTED",
          "at": "2026-10-12T08:00:00.000Z",
          "actorRole": "Reliability Analytics Product Owner",
          "requestId": "DEMO-REQ-SYS-MNT88-03",
          "reason": "Requested governance review; no authority issued"
        },
        {
          "eventType": "DEMO_SCOPED_APPROVAL_RECORDED",
          "at": "2026-10-13T19:40:00.000Z",
          "actorRole": "Maintenance Engineering Manager",
          "requestId": "DEMO-REQ-SYS-MNT88-03",
          "reason": "Pilot scope limits the agent to advisory condition estimates on two monitored machines. A recommendation-to-stop requires its own work-authorization evidence."
        }
      ]
    },
    {
      "systemId": "SYS-SUP12",
      "agentId": "SYS-SUP12-AGENT-1",
      "canonicalCaseId": "SYS-SUP12-WRONG_TARGET",
      "environment": "FICTIONAL_PRODUCTION",
      "proposedOperation": "Approve supplier or change receiving disposition",
      "humanDecision": "REJECTED",
      "allowedOperations": [
        "Read-only review of supplier qualification records",
        "Flag expired PPAP status for human review"
      ],
      "prohibitedOperations": [
        "Approve or change a supplier on the approved master",
        "Change a receiving-lot disposition",
        "Override expired supplier qualification"
      ],
      "approverRole": "Supplier Quality Engineering Manager",
      "decisionRef": "GOV-2026-S12-R1",
      "decidedAt": "2026-10-14T10:10:00.000Z",
      "policyVersion": "demo-gov-policy-1.0",
      "rationale": "Vendor qualification was expired in the scenario evidence; releasing it on an agent recommendation would bypass Supplier Quality authority. Rejection is scoped to the approval/change action â€” read-only review remains permitted.",
      "requiredConditions": [
        "Current PPAP qualification re-established by Supplier Quality before any resubmission"
      ],
      "reviewTrigger": "Resubmission only with qualified Supplier Quality evidence",
      "expiresAt": null,
      "monitoringScenarioId": "MON-S12",
      "requestRecord": {
        "requestId": "DEMO-REQ-SYS-SUP12-04",
        "changeTicket": "DEMO-CHG-SUP12-14",
        "requestType": "SUPPLIER_RELEASE_WRITE",
        "requestTime": "2026-10-13T08:00:00.000Z",
        "requestedByRole": "Supplier Qualification Automation Owner",
        "assignedReviewerRole": "Supplier Quality Engineering Manager",
        "requestedTarget": "Supplier-part-site-revision PPAP qualification and receiving-lot disposition",
        "requestedOperation": "Approve supplier or change receiving disposition",
        "requestedEnvironment": "FICTIONAL_PRODUCTION",
        "policyRef": "DEMO-GOV-POLICY",
        "policyVersion": "demo-gov-policy-1.0",
        "allowedAdvisoryScope": [
          "Read-only review of supplier qualification records",
          "Flag expired PPAP status for human review"
        ],
        "forbiddenConsequenceScope": [
          "Approve or change a supplier on the approved master",
          "Change a receiving-lot disposition",
          "Override expired supplier qualification"
        ],
        "accountableOwnerRole": "Supplier Quality Engineering Manager",
        "reviewerIdentityState": "FICTIONAL_ROLE_ONLY_NOT_AUTHENTICATED",
        "mfaState": "NOT_PERFORMED_SIMULATION",
        "separationOfDuties": "REQUESTER_ROLE_DIFFERS_FROM_REVIEWER_ROLE_IN_FIXTURE_ONLY",
        "supportingCaseId": "SYS-SUP12-WRONG_TARGET",
        "evidenceRequirements": [
          "Current PPAP qualification re-established by Supplier Quality before any resubmission"
        ],
        "reviewDueAt": null,
        "decisionState": "REJECTED",
        "decisionTime": "2026-10-14T10:10:00.000Z",
        "decisionRationale": "Vendor qualification was expired in the scenario evidence; releasing it on an agent recommendation would bypass Supplier Quality authority. Rejection is scoped to the approval/change action â€” read-only review remains permitted.",
        "approvalExpiresAt": null,
        "liveDispatchEnforcement": "NOT_CONNECTED"
      },
      "reviewEvents": [
        {
          "eventType": "DEMO_REVIEW_REQUEST_SUBMITTED",
          "at": "2026-10-13T08:00:00.000Z",
          "actorRole": "Supplier Qualification Automation Owner",
          "requestId": "DEMO-REQ-SYS-SUP12-04",
          "reason": "Requested governance review; no authority issued"
        },
        {
          "eventType": "DEMO_ACTION_REJECTED",
          "at": "2026-10-14T10:10:00.000Z",
          "actorRole": "Supplier Quality Engineering Manager",
          "requestId": "DEMO-REQ-SYS-SUP12-04",
          "reason": "Vendor qualification was expired in the scenario evidence; releasing it on an agent recommendation would bypass Supplier Quality authority. Rejection is scoped to the approval/change action â€” read-only review remains permitted."
        }
      ]
    },
    {
      "systemId": "SYS-SCH5",
      "agentId": "SYS-SCH5-AGENT-1",
      "canonicalCaseId": "SYS-SCH5-WRONG_TARGET",
      "environment": "FICTIONAL_PRODUCTION",
      "proposedOperation": "Commit an optimized production schedule",
      "humanDecision": "REJECTED",
      "allowedOperations": [
        "Generate read-only optimization proposals",
        "Annotate proposed sequence changes for planner review"
      ],
      "prohibitedOperations": [
        "Commit or release a production schedule",
        "Write to APS/MES dispatch state",
        "Bypass the planner release authority"
      ],
      "approverRole": "Production Planning Manager",
      "decisionRef": "GOV-2026-SS5-R1",
      "decidedAt": "2026-10-14T11:30:00.000Z",
      "policyVersion": "demo-gov-policy-1.0",
      "rationale": "The scheduling agent's release path could reach APS/MES without qualified mediation evidence â€” an unmediated write path is never authorized. Read-only optimization proposals remain a separate permitted workflow.",
      "requiredConditions": [
        "Mediated release path with qualified planner-authority evidence before any resubmission"
      ],
      "reviewTrigger": "Resubmission only after mediation evidence exists",
      "expiresAt": null,
      "monitoringScenarioId": "MON-SS5",
      "requestRecord": {
        "requestId": "DEMO-REQ-SYS-SCH5-05",
        "changeTicket": "DEMO-CHG-SCH5-14",
        "requestType": "PRODUCTION_SCHEDULE_COMMIT",
        "requestTime": "2026-10-13T08:00:00.000Z",
        "requestedByRole": "Scheduling Agent Product Owner",
        "assignedReviewerRole": "Production Planning Manager",
        "requestedTarget": "Plant A frozen-horizon APS/MES production schedule commit",
        "requestedOperation": "Commit an optimized production schedule",
        "requestedEnvironment": "FICTIONAL_PRODUCTION",
        "policyRef": "DEMO-GOV-POLICY",
        "policyVersion": "demo-gov-policy-1.0",
        "allowedAdvisoryScope": [
          "Generate read-only optimization proposals",
          "Annotate proposed sequence changes for planner review"
        ],
        "forbiddenConsequenceScope": [
          "Commit or release a production schedule",
          "Write to APS/MES dispatch state",
          "Bypass the planner release authority"
        ],
        "accountableOwnerRole": "Production Planning Manager",
        "reviewerIdentityState": "FICTIONAL_ROLE_ONLY_NOT_AUTHENTICATED",
        "mfaState": "NOT_PERFORMED_SIMULATION",
        "separationOfDuties": "REQUESTER_ROLE_DIFFERS_FROM_REVIEWER_ROLE_IN_FIXTURE_ONLY",
        "supportingCaseId": "SYS-SCH5-WRONG_TARGET",
        "evidenceRequirements": [
          "Mediated release path with qualified planner-authority evidence before any resubmission"
        ],
        "reviewDueAt": null,
        "decisionState": "REJECTED",
        "decisionTime": "2026-10-14T11:30:00.000Z",
        "decisionRationale": "The scheduling agent's release path could reach APS/MES without qualified mediation evidence â€” an unmediated write path is never authorized. Read-only optimization proposals remain a separate permitted workflow.",
        "approvalExpiresAt": null,
        "liveDispatchEnforcement": "NOT_CONNECTED"
      },
      "reviewEvents": [
        {
          "eventType": "DEMO_REVIEW_REQUEST_SUBMITTED",
          "at": "2026-10-13T08:00:00.000Z",
          "actorRole": "Scheduling Agent Product Owner",
          "requestId": "DEMO-REQ-SYS-SCH5-05",
          "reason": "Requested governance review; no authority issued"
        },
        {
          "eventType": "DEMO_ACTION_REJECTED",
          "at": "2026-10-14T11:30:00.000Z",
          "actorRole": "Production Planning Manager",
          "requestId": "DEMO-REQ-SYS-SCH5-05",
          "reason": "The scheduling agent's release path could reach APS/MES without qualified mediation evidence â€” an unmediated write path is never authorized. Read-only optimization proposals remain a separate permitted workflow."
        }
      ]
    },
    {
      "systemId": "SYS-217",
      "agentId": "SYS-217-AGENT-1",
      "canonicalCaseId": "SYS-217-WRONG_TARGET",
      "environment": "FICTIONAL_PRODUCTION",
      "proposedOperation": "Expand autonomous MES work-order write authority",
      "humanDecision": "PENDING",
      "allowedOperations": [
        "Existing scoped recommendations under the approved reaction plan"
      ],
      "prohibitedOperations": [
        "Autonomous MES work-order write",
        "Release of quality holds"
      ],
      "approverRole": "Quality Director",
      "decisionRef": "GOV-2026-S217-P1",
      "decidedAt": null,
      "policyVersion": "demo-gov-policy-1.0",
      "rationale": "The canonical wrong-target finding shows a recorded effect on WO-217-4803 while WO-217-4802 was the approved target. Authority expansion cannot proceed until an accountable owner reviews the divergence and the required authority evidence exists.",
      "requiredConditions": [
        "Scoped owner review of the divergence finding",
        "Qualified MES write authority evidence",
        "Independent effect readback for any expanded scope"
      ],
      "reviewTrigger": "Owner review of evaluation f0647486-ad18-46c8-834b-b4236037acd6:assurance:1.1",
      "expiresAt": null,
      "monitoringScenarioId": "MON-S217",
      "requestRecord": {
        "requestId": "DEMO-REQ-SYS-217-06",
        "changeTicket": "DEMO-CHG-217-15",
        "requestType": "AUTONOMOUS_MES_WRITE_EXPANSION",
        "requestTime": "2026-10-13T08:00:00.000Z",
        "requestedByRole": "Torque Quality Agent Product Owner",
        "assignedReviewerRole": "Quality Director",
        "requestedTarget": "Plant A / MES work order WO-217-4802; autonomous write expansion requested; WO-217-4803 observed in synthetic case",
        "requestedOperation": "Expand autonomous MES work-order write authority",
        "requestedEnvironment": "FICTIONAL_PRODUCTION",
        "policyRef": "DEMO-GOV-POLICY",
        "policyVersion": "demo-gov-policy-1.0",
        "allowedAdvisoryScope": [
          "Existing scoped recommendations under the approved reaction plan"
        ],
        "forbiddenConsequenceScope": [
          "Autonomous MES work-order write",
          "Release of quality holds"
        ],
        "accountableOwnerRole": "Quality Director",
        "reviewerIdentityState": "FICTIONAL_ROLE_ONLY_NOT_AUTHENTICATED",
        "mfaState": "NOT_PERFORMED_SIMULATION",
        "separationOfDuties": "REQUESTER_ROLE_DIFFERS_FROM_REVIEWER_ROLE_IN_FIXTURE_ONLY",
        "supportingCaseId": "SYS-217-WRONG_TARGET",
        "evidenceRequirements": [
          "Scoped owner review of the divergence finding",
          "Qualified MES write authority evidence",
          "Independent effect readback for any expanded scope"
        ],
        "reviewDueAt": "2026-10-25T12:00:00.000Z",
        "decisionState": "PENDING",
        "decisionTime": null,
        "decisionRationale": "The canonical wrong-target finding shows a recorded effect on WO-217-4803 while WO-217-4802 was the approved target. Authority expansion cannot proceed until an accountable owner reviews the divergence and the required authority evidence exists.",
        "approvalExpiresAt": null,
        "liveDispatchEnforcement": "NOT_CONNECTED"
      },
      "reviewEvents": [
        {
          "eventType": "DEMO_REVIEW_REQUEST_SUBMITTED",
          "at": "2026-10-13T08:00:00.000Z",
          "actorRole": "Torque Quality Agent Product Owner",
          "requestId": "DEMO-REQ-SYS-217-06",
          "reason": "Requested governance review; no authority issued"
        },
        {
          "eventType": "DEMO_REVIEW_PENDING",
          "at": "2026-10-15T11:00:00.000Z",
          "actorRole": "Quality Director",
          "requestId": "DEMO-REQ-SYS-217-06",
          "reason": "Additional evidence and accountable review required; no deployment expansion authorized"
        }
      ]
    },
    {
      "systemId": "SYS-PO12",
      "agentId": "SYS-PO12-AGENT-1",
      "canonicalCaseId": "SYS-PO12-WRONG_TARGET",
      "environment": "FICTIONAL_PRODUCTION",
      "proposedOperation": "Commit purchase orders to suppliers",
      "humanDecision": "PENDING",
      "allowedOperations": [
        "Draft purchase-order proposals for buyer review"
      ],
      "prohibitedOperations": [
        "Commit a purchase order",
        "Change supplier or quantity on a released PO"
      ],
      "approverRole": "Procurement Manager",
      "decisionRef": "GOV-2026-P12-P1",
      "decidedAt": null,
      "policyVersion": "demo-gov-policy-1.0",
      "rationale": "PO commitment requires appropriate supplier/part/amount evidence and a qualified human authority. Proposals may proceed; commitment waits for buyer-authority evidence.",
      "requiredConditions": [
        "Qualified buyer-authority evidence",
        "Supplier and amount bounds on any commitment"
      ],
      "reviewTrigger": "Buyer review of the proposal path",
      "expiresAt": null,
      "monitoringScenarioId": "MON-P12",
      "requestRecord": {
        "requestId": "DEMO-REQ-SYS-PO12-07",
        "changeTicket": "DEMO-CHG-PO12-15",
        "requestType": "ERP_PURCHASE_ORDER_COMMIT",
        "requestTime": "2026-10-14T08:00:00.000Z",
        "requestedByRole": "Procurement Agent Product Owner",
        "assignedReviewerRole": "Procurement Manager",
        "requestedTarget": "Supplier-specific ERP purchase-order commit / qualified buyer and amount threshold required",
        "requestedOperation": "Commit purchase orders to suppliers",
        "requestedEnvironment": "FICTIONAL_PRODUCTION",
        "policyRef": "DEMO-GOV-POLICY",
        "policyVersion": "demo-gov-policy-1.0",
        "allowedAdvisoryScope": [
          "Draft purchase-order proposals for buyer review"
        ],
        "forbiddenConsequenceScope": [
          "Commit a purchase order",
          "Change supplier or quantity on a released PO"
        ],
        "accountableOwnerRole": "Procurement Manager",
        "reviewerIdentityState": "FICTIONAL_ROLE_ONLY_NOT_AUTHENTICATED",
        "mfaState": "NOT_PERFORMED_SIMULATION",
        "separationOfDuties": "REQUESTER_ROLE_DIFFERS_FROM_REVIEWER_ROLE_IN_FIXTURE_ONLY",
        "supportingCaseId": "SYS-PO12-WRONG_TARGET",
        "evidenceRequirements": [
          "Qualified buyer-authority evidence",
          "Supplier and amount bounds on any commitment"
        ],
        "reviewDueAt": "2026-10-25T12:00:00.000Z",
        "decisionState": "PENDING",
        "decisionTime": null,
        "decisionRationale": "PO commitment requires appropriate supplier/part/amount evidence and a qualified human authority. Proposals may proceed; commitment waits for buyer-authority evidence.",
        "approvalExpiresAt": null,
        "liveDispatchEnforcement": "NOT_CONNECTED"
      },
      "reviewEvents": [
        {
          "eventType": "DEMO_REVIEW_REQUEST_SUBMITTED",
          "at": "2026-10-14T08:00:00.000Z",
          "actorRole": "Procurement Agent Product Owner",
          "requestId": "DEMO-REQ-SYS-PO12-07",
          "reason": "Requested governance review; no authority issued"
        },
        {
          "eventType": "DEMO_REVIEW_PENDING",
          "at": "2026-10-15T11:00:00.000Z",
          "actorRole": "Procurement Manager",
          "requestId": "DEMO-REQ-SYS-PO12-07",
          "reason": "Additional evidence and accountable review required; no deployment expansion authorized"
        }
      ]
    },
    {
      "systemId": "SYS-DYN412",
      "agentId": "SYS-DYN412-AGENT-1",
      "canonicalCaseId": "SYS-DYN412-WRONG_TARGET",
      "environment": "FICTIONAL_CONTROLLED_PILOT",
      "proposedOperation": "Tune dynamometer controller parameters outside the declared bounded set",
      "humanDecision": "PENDING",
      "allowedOperations": [
        "Recommend parameter changes within the declared three-parameter envelope"
      ],
      "prohibitedOperations": [
        "Write to non-delegated controller parameters",
        "Unmediated setpoint changes"
      ],
      "approverRole": "Test Engineering Manager",
      "decisionRef": "GOV-2026-D412-P1",
      "decidedAt": null,
      "policyVersion": "demo-gov-policy-1.0",
      "rationale": "The agent can technically reach 19 settings while the approved scope covers three, and the physical controller/readback evidence is missing. Out-of-scope writes stay prohibited pending qualified evidence.",
      "requiredConditions": [
        "Independent controller readback evidence",
        "Qualified test-engineering authorization for any expanded parameter set"
      ],
      "reviewTrigger": "Qualified physical readback evidence presented",
      "expiresAt": null,
      "monitoringScenarioId": "MON-D412",
      "requestRecord": {
        "requestId": "DEMO-REQ-SYS-DYN412-08",
        "changeTicket": "DEMO-CHG-DYN412-15",
        "requestType": "CONTROLLER_PARAMETER_EXPANSION",
        "requestTime": "2026-10-14T08:00:00.000Z",
        "requestedByRole": "Test Cell Agent Product Owner",
        "assignedReviewerRole": "Test Engineering Manager",
        "requestedTarget": "Synthetic dynamometer emulator / 19 accessible setpoints, only three delegated",
        "requestedOperation": "Tune dynamometer controller parameters outside the declared bounded set",
        "requestedEnvironment": "FICTIONAL_CONTROLLED_PILOT",
        "policyRef": "DEMO-GOV-POLICY",
        "policyVersion": "demo-gov-policy-1.0",
        "allowedAdvisoryScope": [
          "Recommend parameter changes within the declared three-parameter envelope"
        ],
        "forbiddenConsequenceScope": [
          "Write to non-delegated controller parameters",
          "Unmediated setpoint changes"
        ],
        "accountableOwnerRole": "Test Engineering Manager",
        "reviewerIdentityState": "FICTIONAL_ROLE_ONLY_NOT_AUTHENTICATED",
        "mfaState": "NOT_PERFORMED_SIMULATION",
        "separationOfDuties": "REQUESTER_ROLE_DIFFERS_FROM_REVIEWER_ROLE_IN_FIXTURE_ONLY",
        "supportingCaseId": "SYS-DYN412-WRONG_TARGET",
        "evidenceRequirements": [
          "Independent controller readback evidence",
          "Qualified test-engineering authorization for any expanded parameter set"
        ],
        "reviewDueAt": "2026-10-25T12:00:00.000Z",
        "decisionState": "PENDING",
        "decisionTime": null,
        "decisionRationale": "The agent can technically reach 19 settings while the approved scope covers three, and the physical controller/readback evidence is missing. Out-of-scope writes stay prohibited pending qualified evidence.",
        "approvalExpiresAt": null,
        "liveDispatchEnforcement": "NOT_CONNECTED"
      },
      "reviewEvents": [
        {
          "eventType": "DEMO_REVIEW_REQUEST_SUBMITTED",
          "at": "2026-10-14T08:00:00.000Z",
          "actorRole": "Test Cell Agent Product Owner",
          "requestId": "DEMO-REQ-SYS-DYN412-08",
          "reason": "Requested governance review; no authority issued"
        },
        {
          "eventType": "DEMO_REVIEW_PENDING",
          "at": "2026-10-15T11:00:00.000Z",
          "actorRole": "Test Engineering Manager",
          "requestId": "DEMO-REQ-SYS-DYN412-08",
          "reason": "Additional evidence and accountable review required; no deployment expansion authorized"
        }
      ]
    },
    {
      "systemId": "SYS-WH15",
      "agentId": "SYS-WH15-AGENT-1",
      "canonicalCaseId": "SYS-WH15-WRONG_TARGET",
      "environment": "FICTIONAL_PRODUCTION",
      "proposedOperation": "Adjust inventory or release/ship quality-held material",
      "humanDecision": "PENDING",
      "allowedOperations": [
        "Recommend inventory adjustments for warehouse lead review"
      ],
      "prohibitedOperations": [
        "Release or ship quality-held stock",
        "Adjust inventory without a bound WMS actor identity"
      ],
      "approverRole": "Warehouse Operations Lead",
      "decisionRef": "GOV-2026-W15-P1",
      "decidedAt": null,
      "policyVersion": "demo-gov-policy-1.0",
      "rationale": "Held-stock release requires a qualified QMS disposition and a bound WMS actor identity; the scenario evidence could not establish which agent executed the held-lot pick request.",
      "requiredConditions": [
        "Qualified QMS disposition",
        "Bound WMS actor identity for the action"
      ],
      "reviewTrigger": "Actor-identity evidence established",
      "expiresAt": null,
      "monitoringScenarioId": "MON-W15",
      "requestRecord": {
        "requestId": "DEMO-REQ-SYS-WH15-09",
        "changeTicket": "DEMO-CHG-WH15-15",
        "requestType": "WMS_QUALITY_HOLD_RELEASE",
        "requestTime": "2026-10-14T08:00:00.000Z",
        "requestedByRole": "Warehouse Agent Product Owner",
        "assignedReviewerRole": "Warehouse Operations Lead",
        "requestedTarget": "Plant A / held lot WMS pick, inventory write and shipment release with QMS disposition",
        "requestedOperation": "Adjust inventory or release/ship quality-held material",
        "requestedEnvironment": "FICTIONAL_PRODUCTION",
        "policyRef": "DEMO-GOV-POLICY",
        "policyVersion": "demo-gov-policy-1.0",
        "allowedAdvisoryScope": [
          "Recommend inventory adjustments for warehouse lead review"
        ],
        "forbiddenConsequenceScope": [
          "Release or ship quality-held stock",
          "Adjust inventory without a bound WMS actor identity"
        ],
        "accountableOwnerRole": "Warehouse Operations Lead",
        "reviewerIdentityState": "FICTIONAL_ROLE_ONLY_NOT_AUTHENTICATED",
        "mfaState": "NOT_PERFORMED_SIMULATION",
        "separationOfDuties": "REQUESTER_ROLE_DIFFERS_FROM_REVIEWER_ROLE_IN_FIXTURE_ONLY",
        "supportingCaseId": "SYS-WH15-WRONG_TARGET",
        "evidenceRequirements": [
          "Qualified QMS disposition",
          "Bound WMS actor identity for the action"
        ],
        "reviewDueAt": "2026-10-25T12:00:00.000Z",
        "decisionState": "PENDING",
        "decisionTime": null,
        "decisionRationale": "Held-stock release requires a qualified QMS disposition and a bound WMS actor identity; the scenario evidence could not establish which agent executed the held-lot pick request.",
        "approvalExpiresAt": null,
        "liveDispatchEnforcement": "NOT_CONNECTED"
      },
      "reviewEvents": [
        {
          "eventType": "DEMO_REVIEW_REQUEST_SUBMITTED",
          "at": "2026-10-14T08:00:00.000Z",
          "actorRole": "Warehouse Agent Product Owner",
          "requestId": "DEMO-REQ-SYS-WH15-09",
          "reason": "Requested governance review; no authority issued"
        },
        {
          "eventType": "DEMO_REVIEW_PENDING",
          "at": "2026-10-15T11:00:00.000Z",
          "actorRole": "Warehouse Operations Lead",
          "requestId": "DEMO-REQ-SYS-WH15-09",
          "reason": "Additional evidence and accountable review required; no deployment expansion authorized"
        }
      ]
    }
  ],
  "monitoringScenarios": [
    {
      "scenarioId": "MON-S340",
      "systemId": "SYS-340",
      "declaredStatus": "SYNTHETIC",
      "sources": [
        {
          "sourceId": "vision-inspector-batch-log",
          "cadenceSec": 300,
          "records": [
            {
              "eventType": "INSPECTION_BATCH_SCORED",
              "target": "batch B-340-118",
              "declaredAt": "2026-10-15T11:52:00.000Z",
              "observedAt": "2026-10-15T11:52:08.000Z"
            },
            {
              "eventType": "MODEL_VERSION_PINNED",
              "target": "defect-model v14.2",
              "declaredAt": "2026-10-15T11:47:00.000Z",
              "observedAt": "2026-10-15T11:47:05.000Z"
            }
          ]
        },
        {
          "sourceId": "quality-review-queue",
          "cadenceSec": 600,
          "records": [
            {
              "eventType": "SUSPECT_PART_ROUTED",
              "target": "part SN-77-4102 â†’ human review",
              "declaredAt": "2026-10-15T11:55:00.000Z",
              "observedAt": "2026-10-15T11:55:11.000Z"
            }
          ]
        }
      ]
    },
    {
      "scenarioId": "MON-SFC1",
      "systemId": "SYS-FC1",
      "declaredStatus": "SYNTHETIC",
      "sources": [
        {
          "sourceId": "forecast-generation-log",
          "cadenceSec": 900,
          "records": [
            {
              "eventType": "FORECAST_GENERATED",
              "target": "SKU-family F-12 rolling forecast",
              "declaredAt": "2026-10-15T11:45:00.000Z",
              "observedAt": "2026-10-15T11:45:22.000Z"
            },
            {
              "eventType": "PLAN_REVISION_PROPOSED",
              "target": "proposal PROP-77 awaiting planner",
              "declaredAt": "2026-10-15T11:50:00.000Z",
              "observedAt": "2026-10-15T11:50:19.000Z"
            }
          ]
        }
      ]
    },
    {
      "scenarioId": "MON-M88",
      "systemId": "SYS-MNT88",
      "declaredStatus": "SYNTHETIC",
      "sources": [
        {
          "sourceId": "condition-monitor-pilot",
          "cadenceSec": 600,
          "records": [
            {
              "eventType": "CONDITION_ESTIMATED",
              "target": "pilot asset CNC-4 spindle",
              "declaredAt": "2026-10-15T11:30:00.000Z",
              "observedAt": "2026-10-15T11:30:14.000Z"
            },
            {
              "eventType": "MAINTENANCE_WINDOW_RECOMMENDED",
              "target": "window W-221 routed to supervisor",
              "declaredAt": "2026-10-15T11:40:00.000Z",
              "observedAt": "2026-10-15T11:40:09.000Z"
            }
          ]
        },
        {
          "sourceId": "cmms-ticket-witness",
          "cadenceSec": 1800,
          "records": []
        }
      ]
    },
    {
      "scenarioId": "MON-S12",
      "systemId": "SYS-SUP12",
      "declaredStatus": "SYNTHETIC",
      "sources": [
        {
          "sourceId": "supplier-qualification-register",
          "cadenceSec": 3600,
          "records": [
            {
              "eventType": "PPAP_STATUS_FLAGGED_EXPIRED",
              "target": "vendor V-114 part-family castings",
              "declaredAt": "2026-10-12T08:00:00.000Z",
              "observedAt": "2026-10-12T08:00:30.000Z"
            }
          ]
        }
      ]
    },
    {
      "scenarioId": "MON-SS5",
      "systemId": "SYS-SCH5",
      "declaredStatus": "SYNTHETIC",
      "sources": [
        {
          "sourceId": "schedule-proposal-log",
          "cadenceSec": 900,
          "records": [
            {
              "eventType": "OPTIMIZATION_PROPOSAL_GENERATED",
              "target": "sequence revision R-88",
              "declaredAt": "2026-10-15T11:35:00.000Z",
              "observedAt": "2026-10-15T11:35:12.000Z"
            }
          ]
        },
        {
          "sourceId": "planner-release-witness",
          "cadenceSec": 1800,
          "records": []
        }
      ]
    },
    {
      "scenarioId": "MON-S217",
      "systemId": "SYS-217",
      "declaredStatus": "SYNTHETIC",
      "sources": [
        {
          "sourceId": "torque-tool-event-log",
          "cadenceSec": 600,
          "records": [
            {
              "eventType": "FASTENING_EVENT_RECORDED",
              "target": "work order WO-217-4803",
              "declaredAt": "2026-10-15T11:20:00.000Z",
              "observedAt": "2026-10-15T11:20:06.000Z"
            }
          ]
        },
        {
          "sourceId": "mes-release-readback",
          "cadenceSec": 600,
          "records": []
        }
      ]
    },
    {
      "scenarioId": "MON-P12",
      "systemId": "SYS-PO12",
      "declaredStatus": "SYNTHETIC",
      "sources": [
        {
          "sourceId": "po-proposal-log",
          "cadenceSec": 1800,
          "records": [
            {
              "eventType": "PO_PROPOSAL_DRAFTED",
              "target": "supplier S-44 amount pending buyer bounds",
              "declaredAt": "2026-10-14T06:10:00.000Z",
              "observedAt": "2026-10-14T06:10:22.000Z"
            }
          ]
        }
      ]
    },
    {
      "scenarioId": "MON-D412",
      "systemId": "SYS-DYN412",
      "declaredStatus": "SYNTHETIC",
      "sources": [
        {
          "sourceId": "controller-parameter-readback",
          "cadenceSec": 300,
          "records": []
        }
      ]
    },
    {
      "scenarioId": "MON-W15",
      "systemId": "SYS-WH15",
      "declaredStatus": "SYNTHETIC",
      "sources": [
        {
          "sourceId": "wms-held-lot-ledger",
          "cadenceSec": 900,
          "records": [
            {
              "eventType": "HELD_LOT_PICK_ATTEMPT",
              "target": "LOT-2026-4510 actor unresolved",
              "declaredAt": "2026-10-15T11:10:00.000Z",
              "observedAt": "2026-10-15T11:10:17.000Z"
            }
          ]
        },
        {
          "sourceId": "qms-disposition-witness",
          "cadenceSec": 1800,
          "records": []
        }
      ]
    }
  ],
  "reviewInfrastructure": {
    "type": "DEMONSTRATION_ONLY",
    "roleRegistry": "FICTIONAL_ROLE_DIRECTORY",
    "intake": "VERSIONED_FIXTURE_REQUEST_QUEUE",
    "reviewerIdentity": "ROLE_PERSONAS_ONLY_NO_AUTHENTICATED_HUMAN",
    "policyDecision": "DEMO_SCOPE_AND_ROLE_CHECK_NOT_HAIEC_PDP",
    "separationOfDuties": "FICTIONAL_REQUESTER_ROLE_DIFFERENT_FROM_REVIEWER_ROLE",
    "auditTrail": "SOURCE_FIXTURE_PLUS_EPHEMERAL_BROWSER_LEDGER",
    "reviewerAuthentication": "NOT_CONNECTED",
    "persistentApprovalStore": "NOT_PROVISIONED",
    "serverAuthorization": "NOT_PROVISIONED",
    "productionDispatcher": "NOT_CONNECTED",
    "liveMonitoring": "NO_LIVE_CONNECTORS",
    "canonicalAssurance": "READ_ONLY_DIGEST_VERIFIED_EXPORT_REFERENCE",
    "note": "The nine decisions and roleplay are educational synthetic inputs; this infrastructure has no authority to sign, deploy, release, actuate, override a policy, or grant API/MES permissions."
  }
};
