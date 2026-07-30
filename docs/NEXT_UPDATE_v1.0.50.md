# Update v1.0.50 — Completed

- [x] Move score submission and persistent reward orchestration out of `src/main.js`.
- [x] Add atomic multi-key save snapshots with schema-versioned rollback slots.
- [x] Add CI capture and approval gates for Vite CPU long-task, JS heap, draw-call, and texture residency baselines.
- [x] Add a production error-boundary screen preserving the last safe checkpoint without developer details.
- [x] Add SHA-256 patch provenance tying the received base ZIP, patch manifest, target source tree, and full target ZIP.

The actual approved hardware baseline remains intentionally pending until GitHub Actions evidence is reviewed.
