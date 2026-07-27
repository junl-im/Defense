> Current improvement patch: **v1.0.37 / b24.37** - CI dist artifact verification hotfix

# Dokkaebi Luck Defense 3D

## v1.0.37 key changes

- Fixed the GitHub Actions failure in `verify:dist:v123` after a successful Vite build.
- Asset deployment checks now compare source and emitted files by byte size and SHA-256 instead of requiring the original `src/assets/...` URL inside `dist/index.html`.
- Updated the matching v1.0.24 mascot check before it could fail on the next CI step.
- Updated v1.0.35 and v1.0.36 deployment gates to support both Vite bundles and the resilient static fallback layout.
- Active HTML, runtime bundles, CSS, and service-worker files are checked without treating historical documents or quarantined registries as active references.
- The clean package rule remains: `dist`, `node_modules`, and generated logs are excluded from the full source ZIP.
- The mandatory handoff history rule remains enforced.

## Commands

```bash
npm run verify:release:v137
npm run build
npm run verify:dist:v123
npm run verify:dist:v124
npm run verify:dist:v135
npm run verify:dist:v136
npm run verify:dist:v137
npm run stage:package:v137
npm run verify:package:v137
npm run create:patch:v137
npm run verify:patch:v137
```

For environments without installed Vite dependencies, `npm run build:static` remains available. The same v1.0.37 dist gates accept both layouts.

## Preserved release foundations

- v1.0.12 cross-platform visual foundation
- v1.0.17 approved asset boundary
- v1.0.20 11-direction hero runtime
- v1.0.29 derived atlas refinement
- v1.0.31 asset lineage audit
- v1.0.32 silhouette and 80-wave verification
- v1.0.33 boss identity and 90-wave stability
- v1.0.34 mobile HUD recovery
- v1.0.35 runtime lifecycle, offline shell, accessibility, and 100-wave checks
- v1.0.36 clean source packaging and generated-output exclusion
