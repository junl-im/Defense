> Current improvement patch: **v1.0.39 / b24.39** - Vite dist portability hotfix

# Dokkaebi Luck Defense 3D

## v1.0.39 key changes

- Fixed the GitHub Actions failure in `verify:dist:v134`.
- The v1.0.34 verifier no longer requires source-tree files such as `dist/src/main.js` after a Vite production build.
- A shared dual-mode verifier now supports both static fallback output and Vite emitted bundles.
- The Vite path validates mobile HUD runtime markers from emitted JavaScript and accessibility markers from emitted CSS.
- Added a source audit covering every remaining legacy verifier that still mentions `dist/src` and confirms it has an `dist/assets` fallback.
- Added a regression fixture with no `dist/src` directory; the v1.0.34 foundation gate must still pass.
- Updated v1.0.38 release and dist gates to remain forward-compatible with later patch releases.
- The clean package rule remains: `dist`, `node_modules`, and generated logs are excluded from the full source ZIP.
- The mandatory handoff history rule remains enforced.

## Commands

```bash
npm run verify:release:v139
npm run build
npm run verify:dist:v117
npm run verify:dist:v118
npm run verify:dist:v119
npm run verify:dist:v120
npm run verify:dist:v121
npm run verify:dist:v122
npm run verify:dist:v123
npm run verify:dist:v124
npm run verify:dist:v125
npm run verify:dist:v126
npm run verify:dist:v127
npm run verify:dist:v128
npm run verify:dist:v129
npm run verify:dist:v131
npm run verify:dist:v132
npm run verify:dist:v133
npm run verify:dist:v134
npm run verify:dist:v135
npm run verify:dist:v136
npm run verify:dist:v137
npm run verify:dist:v138
npm run verify:dist:v139
npm run stage:package:v139
npm run verify:package:v139
npm run create:patch:v139
npm run verify:patch:v139
```

For environments without installed Vite dependencies, `npm run build:static` remains available. The current dist gates accept both Vite and static fallback layouts.

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
- v1.0.38 active presentation-surface verification
