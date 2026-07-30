# Patch Notes v1.0.49 — Reproducible Runtime Architecture

## System and architecture
- `package.json` is the canonical release identity source; source/public identity files and lock metadata are generated from it.
- CI synchronizes identity before `npm ci`, while the generator rejects any package version other than `1.0.49` with an explicit remediation message.
- `src/main.js` delegates persistence, recovery state, run-state diagnostics, result presentation, and feature exposure to dedicated modules.

## Persistence and lifecycle
- Added a coalescing transactional queue with a replayable journal.
- Flush checkpoints cover `visibilitychange`, BFCache/pagehide, beforeunload, service-worker activation, score saves, and run completion.
- Pending values remain readable before the queue is committed; failed writes remain journaled for retry.

## Error, recovery, and production exposure
- User-visible recovery messages no longer expose internal source names, paths, URLs, or developer details.
- Developer diagnostics remain bounded and available only through approved QA surfaces.
- The full QA API is hidden in normal production sessions and enabled only for local/development or explicit `?qa=v149` sessions.

## Reproducibility and cumulative regression fixes
- Added a sorted SHA-256 build-input manifest covering package metadata, lockfile, Vite config, index, source, and public assets.
- Fixed v1.0.45 performance trend accounting so v1.0.46–v1.0.49 forward modules are measured by their own release budgets.
- Fixed generated top-level `package-lock.json.dokkaebi` metadata so historical v1.0.45 identity checks remain valid.
- Made the v1.0.48 system audit forward-compatible with generated service-worker identity in v1.0.49.
- Restored a non-empty, hash-verified v1.0.48→v1.0.49 direct-overlay manifest and added a cumulative v1.0.46+ recovery overlay for mixed partial-patch branches.

## CI long-session measurement reliability hotfix
- Preserved strict absolute frame and long-task limits for hardware and unknown renderers.
- Added explicit SwiftShader/llvmpipe detection and bounded baseline-relative regression checks for software-rendered CI.
- Normalized long tasks by measured frames instead of treating every slow software-renderer frame as a gameplay regression.
- Added frame-window coverage and timeout failures so calibration cannot hide a stalled or incomplete measurement.
- Added regression fixtures reproducing the reported 216.6ms p95 / 500+ long-task CI pattern while still rejecting hardware and worsening software-renderer cases.
