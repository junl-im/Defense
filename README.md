> Current improvement patch: **v1.0.44 / b24.44** - Complete Build Release Assurance

# Dokkaebi Luck Defense 3D

## v1.0.44 key changes

- Runs mobile layout QA against the complete Vite bundle after the real game boots and enters combat.
- Captures portrait, landscape, left-handed, and 150% zoom screenshots through Chromium DevTools Protocol, with failure screenshots and console/network diagnostics.
- Verifies the summon control remains visible, inside the viewport, at least 44px, touch-safe, and non-blocking in every matrix profile.
- Adds measured JavaScript chunk, initial JS/CSS gzip, request-count, and initial texture upload budgets.
- Reviews all 24 conservative v1.0.43 asset candidates and records zero deletion approvals.
- Replaces the v1.0.43 deployment check that depended on a removable CSS comment with behavior-level CSS assertions.
- Advances the service-worker cache to `1.0.44-b24.44`.
- Keeps the mandatory handoff history rule enforced.

## Commands

```bash
npm run verify:asset-review:v144
npm run verify:release:v144
npm run build
REQUIRE_BROWSER_V144=1 npm run verify:dist:all
npm run stage:package:v144
npm run verify:package:v144
npm run create:patch:v144
npm run verify:patch:v144
```

The browser matrix requires the complete Vite output (`dist/assets/game.js` and `dist/assets/game.css`). Results are written to `logs/qa/v144/mobile-matrix-report.json`; managed browser policies that block loopback HTTP are reported explicitly. `npm run build:static` remains a recovery deployment option but is intentionally not accepted as the v1.0.44 release-assurance target.

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
- v1.0.42 random summon control and edge-safe authored UI asset
- v1.0.43 mobile input recovery, presentation snapshots, and runtime asset reachability
- v1.0.44 complete-build mobile matrix, measured dist budgets, and reviewed asset candidates
