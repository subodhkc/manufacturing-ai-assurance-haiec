/* GENERATED from data/industry and data/source-native/v3.1; read-only presentation. */
window.HAIEC_INDUSTRY_DATA = {
  "schemaVersion": "haiec-industry-read-model-1.0.0",
  "buildSource": "EXPLICIT_SOURCE_TYPED_STATIC_PROJECTION",
  "profiles": [
    {
      "industryId": "manufacturing",
      "profileId": "MFG_DEFAULT",
      "name": "Example Manufacturing Company",
      "evidenceMode": "HAIEC_EVALUATED_SYNTHETIC_WHEN_EXACT_BOUND",
      "evaluationId": null,
      "operator": "Quality Supervisor / Manufacturing Engineer",
      "hero": "What can this AI system cause — and which consequences can HAIEC actually establish?",
      "sourceWorldVersion": "manufacturing-source-native-v3.1",
      "sourcePackageRef": "data/source-native/v3.1/"
    },
    {
      "industryId": "telecom",
      "profileId": "FICTIONAL_TELECOM_OPERATOR",
      "name": "Fictional Telecom Operator",
      "evidenceMode": "HISTORICAL_TMFORUM_REFERENCE",
      "evaluationId": null,
      "role": "NOC Manager · Network Reliability · CISO",
      "hero": "Which AI-directed network change was requested, who authorized it, what network path was reachable, and what service effect was independently observed?",
      "resourceLabel": "Network slice / service target",
      "referenceResource": "slice-DFW-043",
      "reference": {
        "schemaVersion": "haiec-industry-telecom-reference-1.0.0",
        "source": {
          "title": "HAIEC — Agentic Assurance: The Quest for Proof",
          "origin": "TM_FORUM_COMPETITION_REFERENCE_HTML",
          "sourceUrl": "https://drive.google.com/file/d/1yxBAE7jbXDAyGepqJgEUx3SC_STQNQvp/view",
          "evidenceMode": "HISTORICAL_TMFORUM_REFERENCE",
          "assertionPolicy": "Original report's simulated/illustrative labels are historical narrative, not newly issued HAIEC evaluations or verified operator events."
        },
        "profile": {
          "industryId": "telecom",
          "profileId": "FICTIONAL_TELECOM_OPERATOR",
          "name": "Fictional Telecom Operator",
          "role": "NOC Manager · Network Reliability · CISO",
          "hero": "Which AI-directed network change was requested, who authorized it, what network path was reachable, and what service effect was independently observed?",
          "resourceLabel": "Network slice / service target",
          "referenceResource": "slice-DFW-043",
          "evaluationId": null
        },
        "navigation": [
          "Overview",
          "Network AI Estate",
          "Service & Slice Topology",
          "Policy & Delegation",
          "Network Changes",
          "Service Quality",
          "Cross-Domain Forensics",
          "Controls & Guardrails",
          "Evidence Sources",
          "Telecom Reports"
        ],
        "states": [
          {
            "id": "AL0",
            "label": "Baseline",
            "originalSampleBadge": "PASS — All planes established",
            "context": "The historical sample presents AL0 as a reference baseline, not an authenticated HAIEC control pass.",
            "requested": "Reference baseline: service policy and network state nominal in the source narrative.",
            "approved": "Policy and service scope are described in the reference; no source-qualified authority evaluated in this derivative.",
            "observed": "No independent live network state is included with this derivative.",
            "effect": "NOT_ESTABLISHED_FROM_REFERENCE",
            "serviceImpact": "NOT_ESTABLISHED",
            "divergence": "NOT_ASSESSED",
            "nextOwner": "NOC Manager",
            "limitation": "Historical sample descriptions cannot prove actual baseline network performance."
          },
          {
            "id": "AL1",
            "label": "Degraded",
            "originalSampleBadge": "DIVERGENCE — Step 4 (Action)",
            "context": "The historical sample describes an action-level deviation during its degraded phase.",
            "requested": "Sample network-management request within a declared change scope.",
            "approved": "Business/network authorization is described but not independently source-qualified in this derivative.",
            "observed": "Sample attributes an action-path divergence to Step 4; no live action receipt carried.",
            "effect": "NOT_ESTABLISHED_FROM_REFERENCE",
            "serviceImpact": "UNKNOWN — QoS / KPI data not source-qualified",
            "divergence": "ILLUSTRATIVE_ACTION_DIVERGENCE",
            "nextOwner": "Network Reliability",
            "limitation": "Do not equate the AL1 label or the example red badge with a canonical detector MATCH."
          },
          {
            "id": "AL2",
            "label": "Compromised (sample label)",
            "originalSampleBadge": "TAMPERING — State Observation",
            "context": "The historical narrative flags conflicting example state hashes on the slice resource; malicious intent is not independently established.",
            "requested": "Reference AL2 change event described in the original mock forensic report.",
            "approved": "Authority and actor claims require independent tenant, principal and policy evidence.",
            "observed": "Reference states 'pre-state a3f2c1e9…' versus 'post-state b4e1a8d2…' for slice-DFW-043; these are illustrative truncated values.",
            "effect": "NOT_ESTABLISHED_FROM_REFERENCE",
            "serviceImpact": "UNKNOWN — requires network PM/QoS and native state witnesses",
            "divergence": "ILLUSTRATIVE_STATE_INTEGRITY_CONCERN",
            "nextOwner": "Incident Response / RAN Engineering",
            "limitation": "A hash disagreement alone does not establish tampering, compromise or root cause."
          }
        ],
        "sourceFamilies": [
          {
            "family": "A1 / R1 / O1",
            "role": "RAN policy, control and configuration records",
            "status": "REFERENCE_ONLY"
          },
          {
            "family": "API / OSS-BSS",
            "role": "Request, principal, dispatch and service-order lineage",
            "status": "REFERENCE_ONLY"
          },
          {
            "family": "RAN PM/FM/CM",
            "role": "Network counters, faults, alarms and configuration state",
            "status": "REFERENCE_ONLY"
          },
          {
            "family": "OTel / trace",
            "role": "Request and delegation path correlation",
            "status": "REFERENCE_ONLY"
          },
          {
            "family": "Independent QoS / KPI",
            "role": "Service impact and convergence readback",
            "status": "NOT_QUALIFIED"
          }
        ],
        "topology": [
          {
            "domain": "Customer / Service",
            "function": "Service intent and declared change request"
          },
          {
            "domain": "OSS / Orchestration",
            "function": "Agent orchestration, mediation and work-order scope"
          },
          {
            "domain": "RAN / O-RAN",
            "function": "A1 policy, R1/O1 operations and cell / slice application"
          },
          {
            "domain": "Core / Transport",
            "function": "Subscriber service reach and downstream paths"
          },
          {
            "domain": "Independent Observability",
            "function": "RAN PM/FM/CM, native state and service QoS witness"
          }
        ],
        "reportSections": [
          "Executive consequence and source mode",
          "Network target, actor and requested operation",
          "Delegation and network capability",
          "AL0 / AL1 / AL2 reference state comparison",
          "Network effect and QoS evidence frontier",
          "Cross-domain provenance",
          "Guardrail, rollback and human owner",
          "Limitations and original TM Forum reference"
        ],
        "limitations": [
          "No new HAIEC telecom evaluation ID, verdict, receipt or source attestation is issued by this page.",
          "AL0/AL1/AL2 are sample scenario labels, not canonical assurance dispositions.",
          "Example source hash strings are not independently authenticated or complete.",
          "Rollback accepted != service restored; API success != independently witnessed native effect.",
          "No telecom telemetry is fetched or ingested by the browser."
        ]
      }
    },
    {
      "industryId": "electrical",
      "profileId": "ELECTRICAL_EQUIPMENT",
      "name": "Example Electrical Works",
      "operator": "Panel Shop Quality Lead",
      "eyebrow": "Electrical equipment & industrial controls",
      "hero": "Could an AI release a serialized control panel while wiring, torque or revision evidence remains incomplete?",
      "resourceLabel": "Panel serial / job",
      "resource": "PANEL-DEMO-001 · JOB-DEMO-A",
      "action": "Propose quality containment of a panel inspection mismatch",
      "authority": "Quality Supervisor approval on exact serial, BOM, test evidence and revision",
      "nativeEffect": "Digital QMS panel hold / release (simulated source, no plant actuation)",
      "impact": "Potential shipment of a panel without qualified wiring and inspection evidence",
      "nextOwner": "Panel Shop Quality Lead",
      "riskCases": [
        {
          "name": "Terminal torque mismatch",
          "question": "Does the recorded torque test cover the exact terminal and panel serial?",
          "needed": "Calibrated test result + bound serial + independent QMS status"
        },
        {
          "name": "Unapproved BOM substitution",
          "question": "Is the installed component approved for the exact drawing/BOM revision?",
          "needed": "Controlled BOM + supplier approval + as-built part scan"
        },
        {
          "name": "Release without inspector sign-off",
          "question": "Who delegated authority to release this specific panel?",
          "needed": "Dated Quality authorization + test disposition + shipping readback"
        }
      ],
      "sourceFamilies": [
        "Controlled wiring drawing & revision",
        "Serialized assembly/BOM record",
        "Terminal torque / wire-label inspection",
        "QMS test and hold ledger",
        "Quality Supervisor approval"
      ],
      "controls": [
        "A03 · Delegated Action Integrity",
        "R01 · Effect witness requirement",
        "E01 · Evidence provenance"
      ],
      "limitations": [
        "Source events are fictional simulator records, not an electrical product certification.",
        "UL 508A/UL 891 are contextual equipment standards, not HAIEC compliance findings.",
        "A simulated QMS panel state does not establish a physical panel was held or released."
      ],
      "evidenceMode": "SIMULATION_ONLY",
      "evaluationId": null,
      "reportSourceMode": "FICTIONAL_SOURCE_WORLD",
      "brandUsageStatus": "FICTIONAL_UNAFFILIATED",
      "sourceWorldVersion": "manufacturing-simulation-profile-v1",
      "sourcePackageRef": "data/source-native/v3.1/profiles/ELECTRICAL_EQUIPMENT/events.json",
      "scenarioRunId": "syn-industry-electrical_equipment-case-01",
      "events": [
        {
          "id": "syn-industry-electrical_equipment-case-01-source",
          "step": "SOURCE_SIGNAL",
          "at": "2026-10-14T09:00:00.000Z",
          "detail": "Wiring torque mismatch and panel inspection"
        },
        {
          "id": "syn-industry-electrical_equipment-case-01-proposal",
          "step": "AGENT_PROPOSAL",
          "at": "2026-10-14T09:01:00.000Z",
          "detail": "Quarantine panel batch"
        },
        {
          "id": "syn-industry-electrical_equipment-case-01-review",
          "step": "SIMULATED_REVIEW",
          "at": "2026-10-14T09:02:00.000Z",
          "detail": "Quality supervisor lot hold"
        },
        {
          "id": "syn-industry-electrical_equipment-case-01-status",
          "step": "SIMULATED_TARGET_STATUS",
          "at": "2026-10-14T09:03:00.000Z",
          "detail": "Illustrative digital QMS panel state"
        }
      ]
    },
    {
      "industryId": "rail",
      "profileId": "RAIL_TRANSPORT",
      "name": "Example Rail Operations",
      "operator": "Track Maintenance Planner",
      "eyebrow": "Rail & transportation asset assurance",
      "hero": "Did a defect candidate become the correct, authorized maintenance task on the intended rail asset?",
      "resourceLabel": "Asset / track segment",
      "resource": "TRACK-DEMO-SEG-A · MP-DEMO-024",
      "action": "Recommend and submit a maintenance work request from an inspection alert",
      "authority": "Human-reviewed inspection plus task and segment-specific planner authorization",
      "nativeEffect": "CMMS work-request status only; field repair and return-to-service NOT ESTABLISHED",
      "impact": "Wrong-segment dispatch or treating an inspection alert as completed repair",
      "nextOwner": "Track Maintenance Planner / Safety Reviewer",
      "riskCases": [
        {
          "name": "Wrong track segment",
          "question": "Does the dispatch target match the verified defect-location asset?",
          "needed": "Geometry / milepost asset map + accepted work-order target"
        },
        {
          "name": "Machine alert mistaken for confirmed defect",
          "question": "Was the camera/inspection inference validated by a qualified reviewer?",
          "needed": "Raw observation, review provenance and approved defect disposition"
        },
        {
          "name": "Ticket mistaken for repair",
          "question": "Does an accepted maintenance request prove the work was performed?",
          "needed": "Crew execution logs + return-to-service approval + independent condition readback"
        }
      ],
      "sourceFamilies": [
        "Track inspection camera/geometry",
        "Segment identity and milepost version",
        "Human defect review",
        "CMMS work request and crew approval",
        "Independent post-repair condition"
      ],
      "controls": [
        "A02 · Code capability vs delegated action",
        "R01 · Action / repair witness",
        "E02 · Source completeness"
      ],
      "limitations": [
        "No physical railway dispatch, signal or track control is implemented.",
        "A CMMS request is not a performed repair, cleared restriction or safe-to-operate verdict.",
        "Example Rail Operations is fictional and unrelated to any named rail operator."
      ],
      "evidenceMode": "SIMULATION_ONLY",
      "evaluationId": null,
      "reportSourceMode": "FICTIONAL_SOURCE_WORLD",
      "brandUsageStatus": "FICTIONAL_UNAFFILIATED",
      "sourceWorldVersion": "manufacturing-simulation-profile-v1",
      "sourcePackageRef": "data/source-native/v3.1/profiles/RAIL_TRANSPORT/events.json",
      "scenarioRunId": "syn-industry-rail_transport-case-01",
      "events": [
        {
          "id": "syn-industry-rail_transport-case-01-source",
          "step": "SOURCE_SIGNAL",
          "at": "2026-10-14T09:00:00.000Z",
          "detail": "Equipment condition alarm"
        },
        {
          "id": "syn-industry-rail_transport-case-01-proposal",
          "step": "AGENT_PROPOSAL",
          "at": "2026-10-14T09:01:00.000Z",
          "detail": "Create maintenance work request"
        },
        {
          "id": "syn-industry-rail_transport-case-01-review",
          "step": "SIMULATED_REVIEW",
          "at": "2026-10-14T09:02:00.000Z",
          "detail": "Depot maintenance approval; no track actuation"
        },
        {
          "id": "syn-industry-rail_transport-case-01-status",
          "step": "SIMULATED_TARGET_STATUS",
          "at": "2026-10-14T09:03:00.000Z",
          "detail": "Illustrative CMMS work-request state"
        }
      ]
    },
    {
      "industryId": "electronics",
      "profileId": "SMART_ELECTRONICS",
      "name": "Example Smart Electronics",
      "operator": "Test & Traceability Manager",
      "eyebrow": "Electronics / AI compute manufacturing",
      "hero": "Could an agent approve a serial batch while firmware provenance, component revisions and test witnesses disagree?",
      "resourceLabel": "Board serial / manufacturing lot",
      "resource": "PCB-DEMO-120 · LOT-DEMO-07",
      "action": "Recommend quarantine after board-test and firmware-context inconsistency",
      "authority": "Test Engineering and Quality approval bound to exact board revision, firmware and serials",
      "nativeEffect": "Digital QMS quarantine / test batch state (simulated only)",
      "impact": "Shipping unqualified assemblies or conflating a retest request with a verified pass",
      "nextOwner": "Manufacturing Test & Traceability Manager",
      "riskCases": [
        {
          "name": "Firmware/test mismatch",
          "question": "Does the installed firmware digest match the authorized test matrix?",
          "needed": "Signed firmware provenance + immutable test rack result + serial identity"
        },
        {
          "name": "Serial genealogy mismatch",
          "question": "Do the board, component and supplier-lot identities correlate?",
          "needed": "As-built trace graph + revisioned lot records + receiving QMS"
        },
        {
          "name": "Burn-in failure overridden",
          "question": "Was a failed test independently resolved before release?",
          "needed": "Test failure witness + disposition authority + release readback"
        }
      ],
      "sourceFamilies": [
        "PCB AOI / defect candidate",
        "Board & component serial genealogy",
        "Firmware provenance / SBOM",
        "Burn-in and test-rack telemetry",
        "QMS / shipping release ledger"
      ],
      "controls": [
        "G07 · Change governance",
        "A03 · Delegation scope",
        "R01 · Native consequence witness"
      ],
      "limitations": [
        "No real boards, customers, proprietary firmware or manufacturing lines are represented.",
        "A test rerun request is not a successful retest or approved batch release.",
        "No measured yield, model accuracy or production cost claim is issued."
      ],
      "evidenceMode": "SIMULATION_ONLY",
      "evaluationId": null,
      "reportSourceMode": "FICTIONAL_SOURCE_WORLD",
      "brandUsageStatus": "FICTIONAL_UNAFFILIATED",
      "sourceWorldVersion": "manufacturing-simulation-profile-v1",
      "sourcePackageRef": "data/source-native/v3.1/profiles/SMART_ELECTRONICS/events.json",
      "scenarioRunId": "syn-industry-smart_electronics-case-01",
      "events": [
        {
          "id": "syn-industry-smart_electronics-case-01-source",
          "step": "SOURCE_SIGNAL",
          "at": "2026-10-14T09:00:00.000Z",
          "detail": "PCB defect and firmware provenance change"
        },
        {
          "id": "syn-industry-smart_electronics-case-01-proposal",
          "step": "AGENT_PROPOSAL",
          "at": "2026-10-14T09:01:00.000Z",
          "detail": "Hold affected serial batch"
        },
        {
          "id": "syn-industry-smart_electronics-case-01-review",
          "step": "SIMULATED_REVIEW",
          "at": "2026-10-14T09:02:00.000Z",
          "detail": "Test and Quality approval"
        },
        {
          "id": "syn-industry-smart_electronics-case-01-status",
          "step": "SIMULATED_TARGET_STATUS",
          "at": "2026-10-14T09:03:00.000Z",
          "detail": "Illustrative test-batch quarantine status"
        }
      ]
    },
    {
      "industryId": "supplier",
      "profileId": "SUPPLIER_NETWORK",
      "name": "Example Supplier Network",
      "operator": "Supplier Quality & Procurement",
      "eyebrow": "Cross-company supplier & procurement assurance",
      "hero": "Could an AI commit money or release material without matching supplier-part-site approval, buyer authority and ledger effect?",
      "resourceLabel": "Supplier / PO / receiving lot",
      "resource": "SUP-DEMO-04 · PO-DEMO-251 · LOT-DEMO-8",
      "action": "Recommend blocking receiving-lot release pending supplier qualification review",
      "authority": "Exact supplier-part-site-revision PPAP + buyer cap + separate payment-change approval",
      "nativeEffect": "Illustrative receiving status; no ERP PO or bank settlement proof",
      "impact": "Unapproved supplier exposure, duplicate purchase commitments or unverified payment change",
      "nextOwner": "Supplier Quality / Buyer / Accounts Payable",
      "riskCases": [
        {
          "name": "Expired supplier PPAP",
          "question": "Is this supplier approved for the exact part, site and revision today?",
          "needed": "Versioned qualification record + expiry + receiving QMS status"
        },
        {
          "name": "PO approval threshold",
          "question": "Does the $26,500 example PO exceed the hypothetical $15,000 approval limit?",
          "needed": "Approved spend envelope + buyer decision + independent ERP PO issuance"
        },
        {
          "name": "Vendor bank detail changed",
          "question": "Has the account change been independently approved before payment?",
          "needed": "Separate out-of-band approval + vendor master diff + actual settlement record"
        }
      ],
      "sourceFamilies": [
        "Supplier master and PPAP revisions",
        "Receiving/QMS nonconformance",
        "PO request, approval and ERP commit",
        "Vendor master change history",
        "Settlement / receiving native readback"
      ],
      "controls": [
        "A03 · Delegation and separation of duties",
        "G06 · Third-party governance",
        "R02 · Consequential effect envelope"
      ],
      "limitations": [
        "Dollar thresholds are fictional demo policy examples, not supplier industry rules.",
        "No bank transfer, crypto or settlement transaction is simulated as actual.",
        "Recommendation, PO creation and payment settlement are different evidence states."
      ],
      "evidenceMode": "SIMULATION_ONLY",
      "evaluationId": null,
      "reportSourceMode": "FICTIONAL_SOURCE_WORLD",
      "brandUsageStatus": "FICTIONAL_UNAFFILIATED",
      "sourceWorldVersion": "manufacturing-simulation-profile-v1",
      "sourcePackageRef": "data/source-native/v3.1/profiles/SUPPLIER_NETWORK/events.json",
      "scenarioRunId": "syn-industry-supplier_network-case-01",
      "events": [
        {
          "id": "syn-industry-supplier_network-case-01-source",
          "step": "SOURCE_SIGNAL",
          "at": "2026-10-14T09:00:00.000Z",
          "detail": "Expired supplier part-revision qualification"
        },
        {
          "id": "syn-industry-supplier_network-case-01-proposal",
          "step": "AGENT_PROPOSAL",
          "at": "2026-10-14T09:01:00.000Z",
          "detail": "Prevent material release and raise review"
        },
        {
          "id": "syn-industry-supplier_network-case-01-review",
          "step": "SIMULATED_REVIEW",
          "at": "2026-10-14T09:02:00.000Z",
          "detail": "Supplier Quality approval"
        },
        {
          "id": "syn-industry-supplier_network-case-01-status",
          "step": "SIMULATED_TARGET_STATUS",
          "at": "2026-10-14T09:03:00.000Z",
          "detail": "Illustrative receiving lot status"
        }
      ]
    }
  ],
  "mustClearEvaluationIdsOnProfileChange": true,
  "neverDeriveAssuranceVerdict": true,
  "backendActionsEnabled": false
};
