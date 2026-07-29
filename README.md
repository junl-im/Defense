# Dokkaebi Luck Defense 3D

> Current release: **v1.0.49 / b24.49** — reproducible runtime architecture, transactional persistence, generated release identity, recovery/diagnostic separation, and production QA exposure control.

## v1.0.49 verification

```bash
node scripts/generate-release-identity-v149.mjs
npm ci
npm run verify:identity:v149
npm run verify:ci
VITE_BASE_PATH=/Defense/ npm run build
REQUIRE_BROWSER_V144=1 REQUIRE_BROWSER_V145=1 REQUIRE_BROWSER_V146=1 REQUIRE_BROWSER_V147=1 REQUIRE_BROWSER_V149=1 npm run verify:dist:all
```

The direct patch is cumulative from v1.0.46+ and overwrites `package.json` and `package-lock.json`; a CI log that still reports `package=1.0.46` is running an unpatched commit.


## v1.0.45 key changes

- Advances the complete game through 100 deterministic wave lifecycles while preserving real wave, reward, UI, progression, and renderer code paths.
- Samples frame p50/p95/max, JavaScript heap, Three.js textures/geometries, long tasks, draw calls, triangles, entity counts, and runtime errors every five waves.
- Forces a WebGL context loss at wave 50 and requires a matched restore plus resumed rendering.
- Rejects growth by both absolute delta and per-10-wave slope through a reusable runtime assurance model.
- Compares current source raw/gzip measurements with the approved v1.0.44 package and fails unexplained growth above 5%.
- Classifies all 53 runtime assets into 13 boot and 40 deferred assets with 74 explicit reachability edges.
- Advances the service-worker cache to `1.0.45-b24.45` and keeps the v1.0.44 complete-build foundation forward-compatible.

## Commands

```bash
npm run verify:residency:v145
npm run verify:trend:v145
npm run verify:model:v145
npm run verify:release:v145
npm run build
REQUIRE_BROWSER_V144=1 REQUIRE_BROWSER_V145=1 npm run verify:dist:all
npm run stage:package:v145
npm run verify:package:v145
npm run create:patch:v145
npm run verify:patch:v145
```

The 100-wave browser harness requires the complete Vite output (`dist/assets/game.js` and `dist/assets/game.css`). Evidence is written to `logs/qa/v145/`; browser absence or loopback policy blocking is a hard failure when `REQUIRE_BROWSER_V145=1` is set. Static fallback remains recovery-only and is not accepted as the v1.0.45 target.

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
- v1.0.45 100-wave runtime trends, WebGL recovery, 5% source regression gate, and explicit asset residency

> Current release: **v1.0.48 / b24.48** — comprehensive integrity audit, safe persistence, bounded runtime diagnostics, and background performance protection.


## 결과 전달 규칙

모든 패치 결과는 **1. 작업한 내역 → 2. 전체 프로젝트 ZIP과 direct-overlay 패치 ZIP → 3. 다음 예정 내역** 순서로 제공한다. 상세 계약은 `docs/DELIVERY_RESULT_RULE.md`를 따른다.
## v1.0.48 Identity Synchronization Hotfix

- 부분 적용으로 package/runtime 버전이 갈라지는 문제를 차단합니다.
- `npm run verify:identity:v148`가 package, lock, main, policy, HTML, service worker, public version을 비교합니다.
- `preverify`와 `prebuild`에서 본 검증보다 먼저 실행됩니다.
