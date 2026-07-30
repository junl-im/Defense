# Release Assurance v1.0.50

## Required gates

1. Canonical `1.0.50 / b24.50 / 1.0.50-b24.50` identity across package, lock, source, public runtime, HTML, and service worker.
2. Atomic snapshot commit, full-set carry-forward, checksum rejection, reconciliation, and rollback regression tests.
3. Persistent reward and score extraction with duplicate-run prevention and offline-safe leaderboard persistence.
4. Production error-boundary regression proving safe checkpoint restoration and separation of user/developer detail.
5. CI-only runtime baseline candidate and approval contract tests.
6. v1.0.49 architecture and SwiftShader measurement calibration preservation.
7. Clean source staging, direct-root overlay patch verification, SHA-256 provenance, build input reproducibility, root hygiene, and complete dist chain.

## Approval boundary

`docs/PERFORMANCE_BASELINE_STATUS_v1.0.50.json` deliberately remains `ci-capture-required`. This release does not fabricate approved device measurements. A future `docs/PERFORMANCE_BASELINE_v1.0.50_RUNTIME.json` is valid only when generated from a passing GitHub Actions candidate and signed with approver, ticket, and approval time.
