# Release Assurance v1.0.47

## Scope

v1.0.47 adds deterministic and browser-backed assurance for two network failure modes: an offline launch after the service-worker shell has been warmed, and a disconnect/reconnect while a wave is in progress. It also adds save-schema byte-preservation fuzzing across v1.0.42 through v1.0.46, provenance-checked device-trace ingestion, and compact browser evidence bundles.

## Exact Vite baseline policy

The v1.0.45 baseline is promoted only from a complete `DD-DIST-BUDGET-V144` report whose identity is exactly `1.0.45 / b24.45`, whose build kind is `vite`, and whose budget checks all passed. The promotion command records the canonical candidate SHA-256, approver, ticket, and approval time. No numeric baseline is invented when the candidate artifact is absent.

```bash
node scripts/promote-v145-dist-baseline-v147.mjs \
  --candidate logs/qa/v144/dist-budget-report.json \
  --approver release-engineering \
  --ticket QA-V145-BASELINE-001 \
  --approved-at 2026-07-28T00:00:00Z
```

Until an exact v1.0.45 artifact is supplied, the approved v1.0.44 absolute envelope remains mandatory and the release verifier reports the pending state explicitly.

## Network scenarios

- Warm the complete Vite shell under service-worker control.
- Switch Chromium to offline mode through CDP and reload.
- Require successful boot from the cached shell and byte-identical client storage.
- Resume network access, start a deterministic run, disconnect during wave progress, reconnect once, and require non-regressing wave state with no runtime exception.

## Save-schema fuzzing

The last five patch releases all carried save schema 21. v1.0.47 fuzzes 600 deterministic cases across those release identities. Safe and unknown keys must remain byte-identical, migration must report schema 21, and a second migration must be idempotent.

## Trace provenance

Raw trace ingestion requires a capture tool, QA authorization, capture timestamp, approval ticket, and source type. Device IDs, account identifiers, network identifiers, user-agent strings, tokens, email addresses, IP addresses, absolute paths, and UUID-like values are removed before a fixture can be committed. The sanitized fixture carries only the canonical source SHA-256 and non-identifying provenance.

## Evidence retention

Passing browser scenarios retain compact summaries and diagnostic counts. Failed scenarios retain compact diagnostic tails, screenshot references, stderr tails, and a copy of the complete failed JSON report under `logs/qa/v147/failed-full-reports/`.
