# v1.0.52 CI Hotfix R12 — Runtime Baseline Report Contract

## Reported failure

GitHub Actions completed the Vite build and the full dist verification chain, then failed at `npm run capture:baseline:v150` with `v150 baseline candidate requires a passing dist-budget report`.

## Root cause

`scripts/verify-dist-budget-v144.mjs` calculated every individual budget check and exited successfully, but wrote no top-level `passed` field to `logs/qa/v144/dist-budget-report.json`. The v1.0.50 baseline consumer required `dist.passed === true`, so a successful report was rejected. Earlier CI failures prevented this latent producer/consumer mismatch from being reached.

## Repair

- The v1.0.44 report now writes `passed: true|false` before the JSON is persisted.
- Failed reports remain written with `passed: false` for diagnostics and still exit non-zero.
- The v1.0.50 consumer accepts the old R11 report shape only when the report ID is exact and every recorded check passes. Explicit `passed: false`, any failed check, or an unidentified report is rejected.
- CI regenerates the dist-budget report immediately before baseline capture.
- Regression fixtures cover the new schema, R11 backward compatibility, failed checks, explicit failure, and unidentified evidence.

Game runtime, assets, performance thresholds, approved baselines, version `1.0.52`, and build ID `b24.52` are unchanged. Repair revision is R12.
