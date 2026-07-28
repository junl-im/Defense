# Release Assurance v1.0.44

## 목표

v1.0.43에서 추가한 모바일 입력 복구를 격리 픽스처가 아니라 실제 Vite 배포본에서 검증하고, 배포 용량과 초기 텍스처 업로드 상한을 수치 계약으로 고정한다. v1.0.43 도달성 보고서의 수동 검토 후보 24개는 전수 분류하되 자동 삭제하지 않는다.

## 완성 빌드 모바일 매트릭스

`scripts/run-built-game-mobile-matrix-v144.mjs`는 `dist/assets/game.js`와 `dist/assets/game.css`가 존재하는 완성 Vite 빌드만 허용한다. Chromium DevTools Protocol로 실제 게임을 부팅하고 `__DOKKAEBI_TEST_API__.startRun()`을 호출한 뒤 다음 네 화면을 캡처한다.

- 세로 430×932
- 가로 932×430
- 왼손 조작 430×932
- 150% 페이지 확대 430×932

각 화면은 전투 상태, 숨김 처리된 구 로딩 표면, 소환 버튼 44px 이상 판정, 뷰포트 내부 배치, `touch-action: manipulation`, 비차단 라벨, 맵 터치 활성화, 왼손 도크 반전, 확대 배율을 검사한다. CI에서는 `REQUIRE_BROWSER_V144=1`로 브라우저 미실행을 실패 처리한다. 실행기는 브라우저 콘솔·런타임 예외·실패 네트워크 요청·탐색 결과·부트 상태·HTTP 요청 이력을 JSON에 남기며, 실패 화면도 가능한 경우 PNG로 보존한다. 프로필 종료 후 Chromium 프로세스 종료를 확인하고 재시도 삭제해 임시 디렉터리 정리 경쟁 조건을 방지한다.

## 배포 예산

`docs/DIST_BUDGETS_v1.0.44.json`은 JavaScript 청크 수, 초기 요청 수, 초기 JS/CSS 원본·gzip 크기, 단일 청크 크기, 초기 텍스처 수와 예상 RGBA 업로드 바이트를 제한한다. 측정 결과는 `logs/qa/v144/dist-budget-report.json`에 기록한다.

## 에셋 후보 전수 검토

`docs/generated/asset-review-v144.json`은 v1.0.43의 24개 후보를 다음 승인 경계로 분류한다.

- 런타임 카탈로그 모델 14개
- v3.9 제작 후보 UI 6개
- 제목 프레젠테이션 승인 계보 2개
- 에셋 준비도 필수 마스코트 1개
- 서비스워커 런타임 셸 계약 1개

삭제 승인 수는 0개다. 후속 패치에서 교체 근거와 명시적 `deleteApproved` 변경이 없으면 격리·삭제할 수 없다.

## v1.0.43 CI 오탐 보강

배포 CSS 검증은 빌드 시 제거되는 주석이 아니라 실제 선택자와 선언을 확인한다. v1.0.44에서도 v1.0.43 기반 계약은 전진 호환 방식으로 유지된다.


## 브라우저 실행 환경 경계

CI 기본 플래그는 Chromium 공식 SwiftShader WebGL opt-in 조합인 `--use-gl=angle --use-angle=swiftshader-webgl --enable-unsafe-swiftshader`를 사용한다. `V144_SCENARIOS`, `V144_BROWSER_BOOT_TIMEOUT_MS`, `V144_BROWSER_CDP_TIMEOUT_MS`, `V144_CHROMIUM_FLAGS`로 진단 범위를 제한할 수 있지만 정식 CI는 네 프로필 전체를 실행한다. 관리 정책이 localhost를 차단해 `net::ERR_BLOCKED_BY_ADMINISTRATOR`를 반환하면 코드 실패로 숨기지 않고 환경 차단 사유를 명시한다.
