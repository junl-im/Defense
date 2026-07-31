# Dokkaebi Luck Defense 3D

> Current release: **v1.0.52 / b24.52** — event-timed character presentation, bounded CPU/GPU degradation, stale-afterimage prevention, and a v1.0.52-only CI generated-output chain.

## v1.0.52 CI chain hotfix R1

`verify:ci`, `preverify`, and `prebuild` no longer invoke the v1.0.51 package bootstrap. The active repository lifecycle is now:

```text
clean:obsolete → hygiene:check → verify:identity:v152 → verify:repo-root:v152
```

Generated CI outputs use the v1.0.52 identity and build-input generators. The committed source revision manifest is verified, not regenerated, during `sync:generated:ci`.

R1 also removes a direct v1.0.51 bootstrap call from the project verifier, updates the golden-motion harness for v1.0.52 module imports and authored event duration, synchronizes historical identity markers from one generator, clears stale dist before source verification, and isolates only forward-release code from v1.0.45/v1.0.48 historical byte budgets.

## v1.0.52 verification

```bash
npm run prepare:repo-root:v152
npm run sync:generated:ci
npm run verify:release:v152
npm run verify:ci
VITE_BASE_PATH=/Defense/ npm run build
REQUIRE_BROWSER_V144=1 REQUIRE_BROWSER_V145=1 REQUIRE_BROWSER_V146=1 REQUIRE_BROWSER_V147=1 REQUIRE_BROWSER_V149=1 REQUIRE_BROWSER_V150=1 REQUIRE_BROWSER_V151=1 REQUIRE_BROWSER_V152=1 npm run verify:dist:all
```

## v1.0.52 key changes

- Prevents stale action-afterimage samples from leaking across state changes, invisibility, or teleports.
- Replaces per-frame afterimage allocations with fixed reusable buffers.
- Keeps one-shot states alive through class-specific release and impact events.
- Adds WebGL2 GPU timing diagnostics and one-way cinematic-to-balanced degradation under sustained budget pressure.
- Preserves authored emissive material data and hardens result-string rendering.
- Keeps the v1.0.50 atomic save foundation and v1.0.51 character presentation contracts.

## v1.0.45 key changes

- Advances the complete game through 100 deterministic wave lifecycles while preserving real wave, reward, UI, progression, and renderer code paths.
- Samples 24-frame p50/p95/max windows, JavaScript heap, Three.js textures/geometries, per-window long-task rate, draw calls, triangles, entity counts, and runtime errors every five waves.
- Forces a WebGL context loss at wave 50 and requires a matched restore plus resumed rendering.
- Keeps the 34ms absolute frame budget on hardware, while explicitly detected SwiftShader/llvmpipe CI uses baseline-relative p95, slope, and per-frame long-task-rate gates so software rasterization is not mistaken for a gameplay regression.
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


## 결과 전달 규칙

모든 패치 결과는 **1. 작업한 내역 → 2. 전체 프로젝트 ZIP과 direct-overlay 패치 ZIP → 3. 다음 예정 내역** 순서로 제공한다. 상세 계약은 `docs/DELIVERY_RESULT_RULE.md`를 따른다.
## v1.0.48 Identity Synchronization Hotfix

- 부분 적용으로 package/runtime 버전이 갈라지는 문제를 차단합니다.
- `npm run verify:identity:v148`가 package, lock, main, policy, HTML, service worker, public version을 비교합니다.
- `preverify`와 `prebuild`에서 본 검증보다 먼저 실행됩니다.

## Repository-root repair revision

The repaired delivery is archive-root flat, removes stale root patch metadata, deletes any legacy root `overlay/` without merging it, and adds `verify:repo-root:v151` to stop nested or stale repository layouts before verification.


### v1.0.51 R4 CI repair

The 100-wave browser assurance now isolates optional character-presentation failures per record and exercises a deterministic QA-only boss load sequence at its five observation windows. Normal campaign boss waves are unchanged.

### v1.0.51 R6 CI repair

R6 fixes the confirmed wave-10 enemy material null dereference while preserving the zero-error 100-wave gate. Before pushing, run `node scripts/verify-ci-source-revision-v151.mjs` and `npm run verify:enemy-material:v151`; the source marker must be `DD-V151-ENEMY-MATERIAL-R6`.
