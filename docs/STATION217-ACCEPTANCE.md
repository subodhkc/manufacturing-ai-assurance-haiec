# Station 217: governed synthetic action acceptance

Status: implementation candidate; tests and PR/CI are the verification authority. **Not a HAIEC evaluation, certified plant interlock, deployment or production action service.**

## Run

Node.js 22+, no dependencies:

```sh
npm test
npm run demo:station217 > station217-replay.json
```

The replay produces six deterministic local cases (3, 40 and 51 engines; prohibited release; wrong-target execution; missing witness), exact synthetic policy digest, separate target before/after readbacks, event trail and output digest. Nothing is sent to HAIEC, a factory, a cloud API or a scheduled worker.

## Truth boundary

- **Requested:** Station 217 fictional agent proposes quantity and exact target `WO-217-4802` under immutable policy.
- **Policy-authorized:** 1–5 can auto-hold under the specific synthetic fixture policy; 6–50 need a separate Quality Supervisor; above 50 need a Plant Quality Manager. Protective holds above 50 are **escalated**, not summarily denied. `RELEASE_ENGINES` and wrong work orders are denied.
- **Effective grant:** The local broker exercises a synthetic permission only. It does not establish customer IAM/effective manufacturing privileges or delegation.
- **Code capable:** A private MES emulator method is reachable **only** from this broker implementation; external consumers get read-only cloned state.
- **Observed:** Broker dispatch is not enough. An emulator-local MES ledger readback of the exact requested target, quantity and version establishes only **synthetic** effect. Wrong-target is `TARGET_MISMATCH`; missing readback is `EFFECT_UNKNOWN`. An accepted transaction with missing proof must never show as green.

A denial is asserted as no mutation in these fixtures; this cannot establish production prevention. User-supplied role strings are **not proof of identity**. The module intentionally exposes no HTTP action endpoint: `principal` is a trusted adapter-injected context for isolated offline tests and MUST NOT be directly populated from user input. Any future web service needs actual identity, org/run scoping, CSRF/origin guards, replay-resistant approval, persisted transactional state, rate limits, logging and audited roles. This package is not sufficient for public authenticated multi-judge access.

## Evidence chain and verification

`packages/station217/src/engine.cjs` contains the local approval/broker state machine; its independent private `TargetLedger` maintains state and idempotent transaction receipts. `packages/station217/tests/station217.test.cjs` authors its own expected statuses and before/after invariants; it does **not** import the nine-system `expected-findings.cjs` oracle or generated outcome files. This is a first independent acceptance slice, **not a repair of the legacy nine-system oracle circularity**: `packages/fixtures/src/generate.cjs` still imports `expected-findings.cjs` when producing golden cases. That architectural weakness remains open before an estate-wide benchmark/accuracy claim.

The generated original corpus and v7.2 HTML dashboard are **not yet connected** to this local state machine. Station 217's CLI JSON is a separate, replayable fixture, not a canonical U5/U6 receipt. The exact exported case must be source-qualified through HAIEC's existing typed intake; issuer-supplied `sourceRole`, `authorityRole` or `SERVICE_NATIVE_RECORD` must never become authoritative merely because the simulator wrote it.

## Next integration gate

1. Run Node 22 CI; explicitly verify the independent 3/40/51/release/mismatch/unknown assertions and two separate runs with deterministic output.
2. Bind the UI to this source model **through authenticated server mediation**, preserving a fully marked offline fallback. Do not let browser JS directly modify state while claiming enforcement.
3. Make the original fixture generator independent of the authored golden/oracle, version seed/variant, and align every export digest.
4. Add held-out recorded-frame or torque-trace measurements with real input ID, labeled validation set, measurement method and honest error counts.
5. Use a dedicated HAIEC Manufacturing Lab organization, limited-scope secret storage, source registration, exact scenario/evidence binding, then **one genuinely persisted HAIEC evaluation**, report and receipt; otherwise show `NOT_VERIFIED`.
6. Expand 35-negative matrix; cross-session isolation, expiry/revoke, concurrent dispatch, restart/persistence and public-host security remain unfinished.

Ownership: the public manufacturing repo owns this simulator and independently testable source evidence; private HAIEC Main retains canonical qualification, DAI, U5/UCP verdicts, reports and MCP registrations. No production PLC, MES/QMS, AWS or HAIEC credentials are required to run this package.
