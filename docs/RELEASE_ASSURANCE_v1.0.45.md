# Release Assurance v1.0.45

## 목표

v1.0.45는 짧은 부트·레이아웃 검사를 넘어 완성 Vite 게임을 결정적 100웨이브 세션으로 실행하며 프레임 시간, JavaScript heap, Three.js texture·geometry, long task, 런타임 오류와 WebGL 복구 상태를 추적한다.

## 100웨이브 완성 게임 하네스

`scripts/run-long-session-v145.mjs`는 `dist/assets/game.js`와 `dist/assets/game.css`가 있는 정식 Vite 배포만 허용한다. 실제 게임의 `startWave → completeWave → 보상 선택` 흐름을 100회 통과하고 전투 대기 시간만 QA 전용 API로 단축한다. 5웨이브마다 warmup 3프레임을 제외한 24프레임 창을 측정하고 wave 50에서 `WEBGL_lose_context`를 사용해 컨텍스트 손실·복원·렌더 재개를 확인한다.

결과는 `logs/qa/v145/long-session-report.json`과 wave 100 PNG에 기록한다. 브라우저 콘솔 예외, 네트워크 실패, 부트 상태, Chromium stderr도 함께 보존한다.

## 런타임 추세 계약

`src/runtime/long-session-assurance-v145.js`는 다음을 독립적으로 판정한다.

- 100웨이브 도달과 5웨이브 단위 표본 커버리지
- 런타임 오류 0건
- 하드웨어·미확인 renderer의 frame p95 절대 상한과 10웨이브당 증가 기울기
- SwiftShader·llvmpipe 등 소프트웨어 renderer의 wave 0 대비 p95 비율·증가량·정규화 기울기
- heap 증가량과 10웨이브당 증가 기울기
- texture·geometry 증가량과 기울기
- 하드웨어의 long task 누적 증가량, 소프트웨어 renderer의 프레임당 long-task 비율·추세
- 요청 프레임 수, 완료 여부, timeout을 통한 측정 창 무결성
- WebGL context loss와 restore 균형 및 강제 복구 성공

## 이전 승인본 대비 5% 회귀 차단

`docs/PERFORMANCE_BASELINE_v1.0.44.json`은 승인된 v1.0.44 정리 소스 패키지의 raw·gzip 측정값이다. `scripts/verify-performance-trend-v145.mjs`는 main, style, 전체 source JS, runtime JS, engine JS를 다시 측정하여 설명되지 않은 5% 초과 증가를 실패시킨다. Vite 배포의 절대 상한은 기존 `docs/DIST_BUDGETS_v1.0.44.json`을 계속 적용한다.

## 초기·지연 에셋 경계

`docs/generated/asset-residency-v145.json`은 53개 런타임 에셋을 13개 boot와 40개 deferred로 한 번씩만 분류하고, title·combat·hero·guardian·monster·boss 카탈로그에서 각 에셋으로 이어지는 74개 명시적 도달성 edge를 기록한다. 문자열 추정 후보가 아니라 런타임 카탈로그의 승인 경계를 직접 검증한다.

## 환경 경계

로컬에 Chromium 또는 완성 Vite dist가 없으면 브라우저 하네스는 명시적으로 SKIP할 수 있다. 정식 CI는 `REQUIRE_BROWSER_V145=1`을 사용하므로 SKIP이 실패가 된다. loopback HTTP가 관리 정책으로 차단되면 프로젝트 성공으로 오인하지 않고 탐색 오류를 보고한다.
## Patch hygiene assurance

The release migrates localized patch instructions such as `APPLY_KO.txt` out of the repository root before hygiene verification. Patch metadata is generated beside, never inside, the direct overlay. GitHub Actions QA evidence uploads use the Node 24 artifact action and treat absent optional evidence as a quiet no-op when an earlier gate fails.


## 2026-07-29 CI measurement calibration hotfix

GitHub-hosted Chromium은 `--use-angle=swiftshader-webgl` 소프트웨어 렌더러에서 실행된다. 이 환경의 절대 frame p95와 Long Task 수는 GPU 성능이 아니라 runner CPU·소프트웨어 raster 비용의 영향을 크게 받으므로, 장기 세션의 누수·악화 추세와 분리한다.

- WebGL debug renderer 정보에서 SwiftShader/llvmpipe를 명시적으로 탐지한다.
- 하드웨어 또는 식별 불가 환경은 기존 `34ms` 절대 frame p95와 long-task 누적 상한을 유지한다.
- 소프트웨어 renderer는 첫 표본 대비 p95 비율·증가량·정규화 기울기, 초기 3개 창 중앙값 대비 long-task/frame 비율을 사용한다.
- 절대 수치가 높아도 안정 추세만 통과하며, 비율·기울기 악화나 불완전/timeout frame window는 실패한다.
- Chromium background timer/renderer throttling을 비활성화하고 장기 안정성 검사의 기본 device scale factor를 1로 낮춘다. 고밀도 스트레스는 `V145_DEVICE_SCALE_FACTOR` 또는 `V146_DEVICE_SCALE_FACTOR`로 재지정한다.
