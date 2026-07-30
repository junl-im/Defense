# Patch Notes v1.0.50

## Atomic save checkpoints

Meta growth, hero mastery, equipment, codex progress, and local score records are now represented by one schema-versioned checkpoint envelope. Every successful generation keeps the previous active generation in a bounded rollback ring. Checksums are verified before a snapshot is trusted.

## Persistent reward and score extraction

End-of-run reward calculation, duplicate-run protection, local leaderboard persistence, online submission, and offline fallback have moved from `src/main.js` to `PersistentRewardOrchestratorV150`. Local atomic persistence must succeed before online score submission begins.

## Production recovery boundary

Fatal runtime errors reconcile the last valid checkpoint and display a fixed recovery screen. Player-facing copy contains no source path, internal URL, stack trace, or raw exception message. Developer diagnostics remain bounded and separate.

## Runtime performance evidence

`capture-runtime-baseline-v150.mjs` consumes only passing Vite/Chromium reports. `promote-runtime-baseline-v150.mjs` rejects non-GitHub candidates unless an explicit test-fixture override is used and requires approval metadata.

## Input package repair

The uploaded archive included an overlay with a stale v1.0.46 package manifest and a reduced workflow. The hotfix runtime changes were retained, while the stale identity and removed v147-v149 gates were not applied.
