# Industry Assurance Experiences — Source and Release Contract

Status: STATIC INDUSTRY PRESENTATION; no new canonical HAIEC evaluations, telecom detections, or industrial adapters.
Design owners: HackFW Master v2.4, Multi-Industry Plan and Synthetic Source v3.1 (15 October 2026).

## What this adds

The existing manufacturing dashboard has one additional **Industry Experiences** navigation entry.
It retains the same authenticated-evaluation boundary and presentation shell, not a second
agent scanner or new score engine. Industry and fictional organization selectors are source typed.

| Industry | Profile | Source mode | Eligible for HAIEC verdict? |
|---|---|---|---|
| Manufacturing | Example Manufacturing Company | Historical 27 genuine frozen evaluations (v1 source world) | **Only** when exact digest-bound export verifies |
| Telecommunications | Fictional Telecom Operator | HISTORICAL_TMFORUM_REFERENCE | No; original TM Forum report narrative is illustrative |
| Electrical equipment | Example Electrical Works | SIMULATION_ONLY | No |
| Rail & transportation | Example Rail Operations | SIMULATION_ONLY | No |
| Electronics / AI infrastructure | Example Smart Electronics | SIMULATION_ONLY | No |
| Supplier network | Example Supplier Network | SIMULATION_ONLY | No |

Industrial Real Estate is backlog, NOT included in the shipping selector.
No company names, logos, judges or partnerships are implied by the fictional sector cases.

## Reference sources

- Telecom: Drive 'Sample Ideal Report for Competition Complete version.html',
  original https://drive.google.com/file/d/1yxBAE7jbXDAyGepqJgEUx3SC_STQNQvp/view.
  Curated source-safe derivative is `data/industry/telecom-reference.json`.
  Original reference is not edited or copied wholesale.
- Four sector profiles: existing `data/source-native/v3.1/profiles/*/events.json`.
  Authored consequence questions and evidence requirements are separate
  `data/industry/{electrical,rail,electronics,supplier}.json`.
- Manufacturing: unchanged `data/evaluations/` 27 canonical evaluation exports,
  `dashboard/data/haiec-exports.js` and its existing cryptographic render gates.

## Truth boundaries

- Historical TM Forum AL0/AL1/AL2 labels remain **scenario** labels.
  Original PASS/DIVERGENCE/TAMPERING text is shown as *original sample text*,
  never translated to a canonical U5 disposition.
- Telecom service impact is UNKNOWN because no independently qualified service
  KPI and network-state source is attached to this derivative.
- Sector narratives and timelines come from fictional v3.1 source records.
  `SIMULATED_TARGET_STATUS` does not qualify a native effect witness.
- No simulation profile carries `evaluationId`, UCP receipt, producer attestation,
  HAIEC risk score, customer event or compliance verdict.
- The browser cannot issue new HAIEC assessments, ingest production telemetry,
  send equipment commands or create a new signed Master Report.
- Profile switches reset stale system, run, report and evaluation selection;
  URL case/org/evaluation query parameters are removed.

## Build and narrow acceptance

```sh
npm run build:industry
npm run check:industry
node --test packages/fixtures/tests/industry-view.test.cjs
npm run verify
```

The Vercel build runs both dashboard-data and industry-data generators.
The source-to-presentation JSON build is a static serializer, not source qualification.
Existing manufacturing report digests remain unchanged.

## Next implementation gates

1. Integrate the new v3.1 manufacturing source profiles with the actual
   tenant-authorized HAIEC source registration/intake, then issue **new** evaluations.
2. Bind exact v3.1 results to a new frozen export set; never relabel the v1
   evaluations as v3.1 assessments.
3. Do a browser-only demo acceptance of the six profile views, AL switches,
   print references, responsiveness and cross-industry ID isolation.
4. Optional industrial property only after evaluated manufacturing and telecom
   presentation quality are accepted.

No separate SHA/signed evaluation artifact is required merely to render
a nonauthoritative HTML telecom presentation derivative.
