# Next Update v1.0.50

- Move remaining score submission and persistent reward orchestration out of `src/main.js`.
- Add atomic multi-key save snapshots with schema-versioned rollback slots.
- Capture approved Vite CPU long-task, JS heap, draw-call, and texture residency baselines from GitHub Actions.
- Add a production error-boundary screen that preserves the last safe checkpoint without developer details.
- Add patch provenance signatures tying base ZIP, patch manifest, and target ZIP together.
