# Release Assurance v1.0.45

## 목표

v1.0.45는 짧은 부트·레이아웃 검사를 넘어 완성 Vite 게임을 결정적 100웨이브 세션으로 실행하며 프레임 시간, JavaScript heap, Three.js texture·geometry, long task, 런타임 오류와 WebGL 복구 상태를 추적한다.

## 100웨이브 완성 게임 하네스

`scripts/run-long-session-v145.mjs`는 `dist/assets/game.js`와 `dist/assets/game.css`가 있는 정식 Vite 배포만 허용한다. 실제 게임의 `startWave → completeWave → 보상 선택` 흐름을 100회 통과하고 전투 대기 시간만 QA 전용 API로 단축한다. 5웨이브마다 10프레임 창을 측정하고 wave 50에서 `WEBGL_lose_context`를 사용해 컨텍스트 손실·복원·렌더 재개를 확인한다.

결과는 `logs/qa/v145/long-session-report.json`과 wave 100 PNG에 기록한다. 브라우저 콘솔 예외, 네트워크 실패, 부트 상태, Chromium stderr도 함께 보존한다.

## 런타임 추세 계약

`src/runtime/long-session-assurance-v145.js`는 다음을 독립적으로 판정한다.

- 100웨이브 도달과 5웨이브 단위 표본 커버리지
- 런타임 오류 0건
- frame p95 상한과 10웨이브당 증가 기울기
- heap 증가량과 10웨이브당 증가 기울기
- texture·geometry 증가량과 기울기
- long task 증가량
- WebGL context loss와 restore 균형 및 강제 복구 성공

## 이전 승인본 대비 5% 회귀 차단

`docs/PERFORMANCE_BASELINE_v1.0.44.json`은 승인된 v1.0.44 정리 소스 패키지의 raw·gzip 측정값이다. `scripts/verify-performance-trend-v145.mjs`는 main, style, 전체 source JS, runtime JS, engine JS를 다시 측정하여 설명되지 않은 5% 초과 증가를 실패시킨다. Vite 배포의 절대 상한은 기존 `docs/DIST_BUDGETS_v1.0.44.json`을 계속 적용한다.

## 초기·지연 에셋 경계

`docs/generated/asset-residency-v145.json`은 53개 런타임 에셋을 13개 boot와 40개 deferred로 한 번씩만 분류하고, title·combat·hero·guardian·monster·boss 카탈로그에서 각 에셋으로 이어지는 74개 명시적 도달성 edge를 기록한다. 문자열 추정 후보가 아니라 런타임 카탈로그의 승인 경계를 직접 검증한다.

## 환경 경계

로컬에 Chromium 또는 완성 Vite dist가 없으면 브라우저 하네스는 명시적으로 SKIP할 수 있다. 정식 CI는 `REQUIRE_BROWSER_V145=1`을 사용하므로 SKIP이 실패가 된다. loopback HTTP가 관리 정책으로 차단되면 프로젝트 성공으로 오인하지 않고 탐색 오류를 보고한다.
## Patch hygiene assurance

The release migrates localized patch instructions such as `APPLY_KO.txt` out of the repository root before hygiene verification. Patch metadata is generated beside, never inside, the direct overlay. GitHub Actions QA evidence uploads use the Node 24 artifact action and treat absent optional evidence as a quiet no-op when an earlier gate fails.

