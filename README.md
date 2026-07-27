> Current improvement patch: **v1.0.40 / b24.40** - Audit asset deployment boundary hotfix

# Dokkaebi Luck Defense 3D

## v1.0.40 key changes

- Fixed the GitHub Actions failure in `verify:dist:v135`.
- Ten full-resolution v13 source sheets are production/audit inputs, not runtime files.
- The sheets moved from `public/assets/ip-v13/sheets/` to `production/DokkaebiDefense/15_Source_Archives/ip-v13/sheets/`.
- All 415 runtime crops remain under `public/assets/ip-v13/crops/`.
- `clean:obsolete` removes stale public copies left by paste-overwrite patches before verification and build.
- Source-sheet hashes remain tied to `asset-manifest-v13.json`.
- `npm run verify:dist:all` runs the complete v117-v140 deployment chain.
- The mandatory handoff history rule remains enforced.

## Commands

```bash
npm run verify:release:v140
npm run build
npm run verify:dist:all
npm run stage:package:v140
npm run verify:package:v140
npm run create:patch:v140
npm run verify:patch:v140
```

For environments without installed Vite dependencies, `npm run build:static` remains available. The dist gates accept both Vite and static fallback layouts.

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
