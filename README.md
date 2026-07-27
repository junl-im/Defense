> Current improvement patch: **v1.0.38 / b24.38** - active presentation scope CI hotfix

# Dokkaebi Luck Defense 3D

## v1.0.38 key changes

- Fixed the second GitHub Actions failure in `verify:dist:v123`.
- The legacy Korean title literals inside `title-presentation-guard-v123.js` are correction data, not visible branding.
- Branding checks now inspect only active presentation surfaces: `dist/index.html` and `dist/manifest.webmanifest`.
- Runtime JS bundles may retain legacy literals when they are required to replace old DOM text at runtime.
- Added a regression fixture that proves a bundle may contain the correction literals while active HTML and PWA metadata remain canonical.
- Updated the v1.0.37 deployment gate to remain forward-compatible with later patch releases.
- The clean package rule remains: `dist`, `node_modules`, and generated logs are excluded from the full source ZIP.
- The mandatory handoff history rule remains enforced.

## Commands

```bash
npm run verify:release:v138
npm run build
npm run verify:dist:v123
npm run verify:dist:v124
npm run verify:dist:v135
npm run verify:dist:v136
npm run verify:dist:v137
npm run verify:dist:v138
npm run stage:package:v138
npm run verify:package:v138
npm run create:patch:v138
npm run verify:patch:v138
```

For environments without installed Vite dependencies, `npm run build:static` remains available. The v1.0.38 dist gates accept both Vite and static fallback layouts.

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
- v1.0.37 Vite/static emitted-asset verification compatibility
