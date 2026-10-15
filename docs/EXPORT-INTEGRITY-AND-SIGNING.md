# Export Integrity vs Issuer Signing — Trust Boundary

Sprint 14.3 — documentation of the current trust boundary and the roadmap
to issuer-signed export manifests.

## What the dashboard verifies today

Every embedded `haiec-evaluation-export-1.0.0` artifact carries a HAIEC-computed
`exportDigest` (`sha256:<hex>` of the canonical payload). The dashboard
recomputes it in-browser (`crypto.subtle`) before rendering any assurance
content, and fails closed (`INTEGRITY FAILURE`) on mismatch.

**A SHA-256 digest is an integrity check, not an issuer signature.** It proves
the displayed bytes are identical to the bytes the digest was computed over —
it does not authenticate *who* produced those bytes. Anyone holding this
repository can recompute a matching digest over mutated content and update the
pinned value. The digest pins the artifact to the reviewed repository state;
its authenticity anchor is the repo itself plus the GitHub commit history.

The same applies to the Station 217 bundle digest, the evidence-replay record
digest, and `report/sample-master-report.sha256` (derivative digests stamped
at build for the *redacted* public sample — those cover the derivative bytes
only, never the original export).

## Roadmap — issuer-signed export manifest (not implemented)

A future export pipeline should attach issuer authenticity without a new PKI:

1. **Signed manifest.** On the HAIEC side, produce
   `manifest.signed.json` containing every export's `exportDigest`, the
   evaluation IDs, methodology versions, and an export timestamp — signed
   with an existing approved signing key (e.g., the
   `CERTIFICATE_SIGNING_SECRET` infrastructure already used for signed
   artifacts in the HAIEC platform, or Sigstore/cosign keyless signing on
   the release pipeline).
2. **Published verification key / identity.** The public key fingerprint or
   Sigstore identity is documented in this repo; the dashboard verifies the
   manifest signature before trusting `exportDigest` values.
3. **UI language.** Only after a verified signature may the UI say
   "HAIEC-signed". Until then: "digest-verified" / "integrity-pinned".

Until then, the honest statement remains: *integrity-verified, unsigned*.
