> Current improvement patch: **v1.0.41 / b24.41** - Full-map touch navigation and legacy loading retirement

# Dokkaebi Luck Defense 3D

## v1.0.41 key changes

- Restored floor tap movement by synchronizing app state to the body input contract.
- Added global pointer-up/cancel recovery when pointer capture is lost.
- Retired the obsolete purple logo loading presentation from boot and battle entry.
- Kept the current boot gate and title visible until the battle is ready.
- Advanced the service-worker cache to `1.0.41-b24.41`.
- Added release and dist regression gates for touch readiness and loading retirement.
- The mandatory handoff history rule remains enforced.

## Commands

```bash
npm run verify:release:v141
npm run build
npm run verify:dist:all
npm run stage:package:v141
npm run verify:package:v141
npm run create:patch:v141
npm run verify:patch:v141
```

For environments without installed Vite dependencies, `npm run build:static` remains available.

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
- v1.0.37-v1.0.39 Vite/static deployment portability
- v1.0.40 audit source-sheet deployment boundary
- v1.0.41 full-map touch input and legacy loading retirement
