# Dokkaebi Luck Defense 3D

> Current release: **v1.0.52 / b24.52 CI HOTFIX R12** — reachable Vite chunk verification, durable-save offline assurance, bounded service-worker installation, and event-timed character presentation.

## v1.0.51 CI cleanup repair R3

The dependency-free release bootstrap removes stale root patch metadata and any root-level `overlay/` before repository verification. The standalone cleaner repeats the same non-merging deletion, so a stale `package.json@1.0.46` can never overwrite the already repaired v1.0.51 package identity.

## v1.0.51 verification

```bash
npm run verify:character:v151
npm run verify:foundation:v150:v151
npm run verify:release:v151
npm run verify:ci
VITE_BASE_PATH=/Defense/ npm run build
REQUIRE_BROWSER_V144=1 REQUIRE_BROWSER_V145=1 REQUIRE_BROWSER_V146=1 REQUIRE_BROWSER_V147=1 REQUIRE_BROWSER_V149=1 REQUIRE_BROWSER_V150=1 REQUIRE_BROWSER_V151=1 npm run verify:dist:all
```

## v1.0.51 key changes

- Preserves all approved character source art and explicitly adds zero new final-art approvals.
- Adds quality-tiered contact shadows, depth silhouettes, directional key lighting, action rims, and up to two motion afterimages.
- Adds distance and combat-density LOD so secondary character layers collapse first on low-power devices and crowded monster waves.
- Hardens transparent atlas sampling with premultiplied alpha, anisotropy, dithering, and stricter alpha thresholds.
- Enhances imported hero, guardian, monster, and boss PBR materials with bounded roughness/metalness, environment response, and a soft view-dependent rim shader.
- Keeps the v1.0.50 atomic save and production recovery foundation unchanged.

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

## v1.0.52 CI HOTFIX R2

R2 fixes the v146 dist gate's nested v1.0.51 source-identity preflight. The R2 patch archive is a true project-root overlay: it contains only project paths that also exist in the R2 full package, with no `overlay/` wrapper or patch metadata entries.



## v1.0.52 CI HOTFIX R3

R3 fixes the v1.0.47 offline/reconnect browser harness timeout. The old runner waited on the unbounded `navigator.serviceWorker.ready` promise and omitted the foreground scheduling flags already used by the passing v1.0.46 100-wave harness. The repaired runner polls service-worker activation with a fixed deadline, disables background timer/renderer throttling, separates each browser operation into a labeled phase, and writes `failedPhase` plus per-step durations to the v147 report.

## v1.0.52 CI HOTFIX R4

R4 fixes the confirmed service-worker install stall exposed by R3 diagnostics. The install event no longer fetches the 169-entry historical source ledger. It caches only 11 deployable Vite shell files with four workers and a 12-second per-request abort boundary. Source-module hashes remain in the v1.0.35 integrity ledger but `./src/...` paths are not requested from complete Vite dist. The v147 browser report now includes precache progress and failed asset paths.


## v1.0.52 CI HOTFIX R5

R5 fixes the false `saveContinuity` failure exposed after the offline service worker and reconnect path completed successfully. The v147 browser harness no longer compares every `dokkaebi-*` localStorage entry byte-for-byte. Boot diagnostics (`dokkaebi-browser-reliability-v19`), rolling wave checkpoints, and the transient persistence journal are classified as volatile. Strict continuity remains enforced for player-facing mode, class, controls, HUD, scores, growth, equipment, mastery, codex, council, review decisions, and the atomic recovery snapshot. The harness seeds valid durable sentinels before the offline reload and reports exact missing, added, changed, or lost-sentinel keys on failure.


## v1.0.52 CI HOTFIX R6

R6 fixes the v1.0.48+ dist verifiers' incorrect assumption that every runtime marker must be inside `assets/game.js`. The actual entry is `src/bootstrap.js`, which dynamically imports `src/main.js`; Vite therefore emits the runtime into reachable `assets/chunks/*.js` files. The repaired verifier starts at `assets/game.js`, follows emitted JavaScript references including `/Defense/` base-path URLs, accepts markers only from reachable chunks, and rejects orphan chunks. The same correction is applied proactively to v148-v152, and the v149/v150 historical identity gates now accept forward-compatible `1.0.52 / b24.52` output. R6 also teaches the v149 responsibility gate about v150 atomic finish-run commits and keeps the original v1.0.49 source-byte ceiling while excluding only approved v150-v152 modules.


## v1.0.52 CI HOTFIX R7

R7 resolves the v1.0.49 feature-exposure contract conflict. A production bundle no longer exposes `window.__DOKKAEBI_TEST_API__` merely because it is served from localhost. QA automation must use an explicit `?qa=...` token, while development mode remains enabled. The v149 browser report now distinguishes a hidden boot-recovery template from a visible boot failure and runs with foreground scheduling flags.


## v1.0.52 CI HOTFIX R9

R9 separates whole-frame GPU timer-query diagnostics from character-presentation GPU cost so unrelated scene load cannot be mislabeled as character rendering pressure. The GPU timer now suspends on WebGL context loss, discards stale queries, reacquires the context and extension on restore, and fails closed on query errors. Run `npm run verify:gpu-timer:v152` and `npm run verify:presentation-budget:v152` before the full release chain.


## CI chain hotfix R11

- production minification에서 사라질 수 있는 로컬 변수명 `authoredDurationV152`를 dist 마커로 사용하던 오류를 수정했다.
- 액션 타이밍 동결 계약의 `DD-AUTHORED-DURATION-GUARD-V152` 안정 마커를 확인한다.
- authored event timeline이 one-shot 지속시간 하한에 반영되는 실제 소스 로직 검증은 그대로 유지한다.
- reachable chunk fixture가 minified 형태에서도 안정 마커를 찾고 고아 chunk는 거부하는지 검사한다.


## CI chain hotfix R12

- v144 dist-budget producer가 성공 보고서에 top-level `passed`를 기록하지 않아 v150 baseline capture가 성공 결과를 거부하던 계약 불일치를 수정했다.
- 보고서는 모든 개별 check를 계산한 뒤 `passed: true|false`를 JSON에 기록한다.
- R11 형식의 과거 보고서는 정확한 report ID와 전 check 통과가 확인될 때만 호환 수용한다.
- CI는 baseline capture 직전에 dist budget을 다시 생성해 stale evidence를 사용하지 않는다.
