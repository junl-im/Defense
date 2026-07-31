# Release Assurance v1.0.52

## 통과한 로컬 검증

- 전체 JavaScript/MJS 구문 검사
- 클래스별 액션 이벤트 프로필 순서·완료 마커·절대 시간 검증
- 정상 부하 유지와 지속 과부하 1회 강등 모델 검증
- 잔상 고정 버퍼, 상태·비가시화·순간이동 초기화 정적 계약
- authored emissive 보존 계약
- 결과 화면 HTML 이스케이프·비정상 점수 정규화 회귀
- v1.0.50 원자 저장·보상·오류 복구 기반 보존
- v1.0.51 캐릭터 표현·재질·장기 세션 핫픽스 보존
- 런타임 import shell 재생성 및 동일성 검사
- 루트 위생, 정리 패키지, direct-overlay 패치 해시 검증

## 실행하지 못한 검증

전달 환경의 `node_modules`에는 Vite 실행 본문과 `.bin`이 없고 내부 패키지 저장소는 고정된 `vite@8.1.5`를 제공하지 않는다. 따라서 실제 Vite 번들 생성, WebGL 셰이더 컴파일, GPU timer-query 실측, 실제 화면 캡처는 로컬 통과로 기록하지 않는다.

CI에서는 다음을 필수로 유지한다.

```bash
npm ci
VITE_BASE_PATH=/Defense/ npm run build
npm run verify:dist:all
```

실브라우저에서는 WebGL2 timer-query 지원/미지원 양쪽, disjoint 발생, cinematic→balanced 강등, 모바일 장기 세션을 확인해야 한다.

## CI chain hotfix R1 검증

보고된 실패 명령 `npm run verify:ci`의 첫 중단 지점이 `bootstrap:identity:v151`임을 확인했다. 활성 v1.0.52 체인에서 다음 과거 mutator 호출을 제거했다.

- `bootstrap:identity:v151`
- `generate:identity:v151`
- `generate:build-input:v151`

`preverify`, `prebuild`, `sync:generated:ci`, v1.0.52 루트 검증과 릴리스 회귀 계약을 함께 수정했다. v1.0.51 스크립트는 과거 패키지 검증용으로 보존하지만 현재 릴리스 수명주기에서는 호출하지 않는다.


### R1 재현 검증 결과

다음 활성 단계는 종료 코드 0을 확인했다.

```bash
npm run prepare:repo-root:v152
npm run sync:generated:ci
npm run verify:trend:v145
npm run verify:performance:v148
npm run verify:release:v148
npm run verify:foundation:v149:v150
npm run verify:release:v150
npm run verify:release:v152
npm run hygiene:check
```

`npm run verify:ci` 단일 로컬 실행은 검증 실패 없이 v1.0.50 후반 게이트까지 진행했으나, 이 작업 환경의 장시간 명령 실행 상한으로 프로세스가 종료됐다. 동일 명령의 후반 구간인 v1.0.48→v1.0.52 릴리스 체인은 분할 실행으로 모두 통과했다. 따라서 보고된 v1.0.51 bootstrap 오류와 이후 드러난 source-contract 회귀는 제거됐지만, `npm ci`, 실제 Vite build, 브라우저 필수 dist 게이트의 최종 녹색 상태는 GitHub Actions에서 확인해야 한다.

## CI chain hotfix R2 검증

GitHub Actions의 실제 Vite 빌드와 v1.0.17~v1.0.45 dist 게이트가 모두 통과한 뒤, v146 게이트 내부의 중첩된 v1.0.51 소스 서명 검사에서 실패했다. 이는 번들 또는 브라우저 실행 오류가 아니라 역사 게이트가 현재 패키지 정체성을 다시 검사한 결합 오류다.

R2는 `scripts/verify-dist-v146.mjs`의 내부 preflight를 `verify-ci-source-revision-v152.mjs`로 교체한다. v1.0.51의 `DD-V151-ENEMY-MATERIAL-R6` 런타임·장시간 세션 마커와 기능 보존 검사는 제거하거나 완화하지 않는다.

회귀 방지 항목:

- v146 dist gate와 complete dist chain은 활성 v1.0.52 source verifier만 호출한다.
- 활성 dist 체인에서 `verify-ci-source-revision-v151.mjs` 문자열이 발견되면 v1.0.52 릴리스 검증이 실패한다.
- 두 dist orchestration 파일을 v1.0.52 CI source manifest에 SHA-256 서명한다.
- R2 직접 덮어쓰기 ZIP에는 전체 통파일에 없는 포장 폴더·메타데이터 엔트리가 없어야 한다.



## CI chain hotfix R3 검증

CI 로그의 `CDP Runtime.evaluate timed out after 120000ms`는 기존 러너가 단계명을 기록하지 않아 정확한 평가식을 구분할 수 없었다. 코드 감사 결과 기본 120초 평가 중 종료 보장이 없는 호출은 `navigator.serviceWorker.ready`였고, 프레임 기반 장기 세션 호출은 v146과 달리 스로틀 방지 플래그 없이 실행되고 있었다.

R3 검증 항목:

- `navigator.serviceWorker.ready` 문자열이 활성 v147 러너에 없음
- 서비스 워커 등록·활성화에 독립된 제한 시간 적용
- 백그라운드 타이머·occluded window·renderer 스로틀 방지 플래그 3종 적용
- 세션 준비와 6개 웨이브 진행을 단계별 평가로 분리
- `failedPhase`와 `diagnostics.steps` 보고 계약
- CDP WebSocket 종료 시 pending 명령 즉시 거부
- 서버 종료 최대 대기 후 keep-alive 연결 강제 정리
- `verify-release-v147.mjs`, `verify-release-v152.mjs` 회귀 검사 통과

로컬 Chromium은 플랫폼 정책상 loopback 탐색이 `ERR_BLOCKED_BY_ADMINISTRATOR`로 차단됐지만, R3 러너가 이를 `failedPhase=warm-navigation`으로 즉시 기록하고 종료하는 것은 확인했다. 실제 서비스 워커 오프라인 성공 경로는 GitHub Actions에서 필수 브라우저 게이트로 확인한다.

## CI chain hotfix R4 검증

R3 로그는 서비스 워커가 등록 실패가 아니라 install event 내부에서 45초 이상 `installing` 상태였음을 확인했다. 소스 감사 결과 설치 함수가 136개 generated source modules와 33개 shell entries를 한꺼번에 처리했으며, 합계 169개 중 21개가 중복이었다. complete Vite dist에는 원본 `./src/...` 모듈이 없으므로 이 목록은 설치 캐시가 아니라 무결성 장부로만 사용해야 한다.

R4 검증 항목:

- 설치 목록은 정확히 11개 deployable paths이며 `./src/` 경로가 없음
- `assets/game.js`와 `assets/game.css` 포함
- 중복 설치 경로 0개
- Cache Storage 동시 작업 최대 4개
- fetch별 `AbortController` 12초 경계
- 설치 실패 시 service worker install 명시적 거부
- `DOKKAEBI_GET_INSTALL_STATUS` 진단 응답
- 정상 fetch 시 11개 전부 fetch/cache되는 VM 시뮬레이션
- `game.css` fetch가 종료되지 않는 경우 제한 시간 후 실패 경로가 기록되는 VM 시뮬레이션
- v1.0.15 lightweight shell, v1.0.35 source integrity, v1.0.47 offline runner, v1.0.52 release gate 보존

로컬 Chromium의 loopback 정책 제한 때문에 실제 service-worker navigation은 GitHub Actions에서 최종 확인한다. 다만 정체를 만든 무제한 169개 동시 install 경로는 제거됐고, 동일 유형의 지연은 제한 시간과 자산별 진단으로 종료된다.


## CI chain hotfix R5 검증

R4 GitHub Actions는 서비스 워커 설치, 오프라인 부트, 중간 웨이브 오프라인 진행, 재접속 이벤트를 모두 통과했다. 마지막 실패는 플레이어 저장 손실이 아니라 volatile 진단 저장소를 엄격 비교에 포함한 v147 QA 모델의 범위 오류였다.

R5 검증 항목:

- `DURABLE_SAVE_KEYS_V147`은 플레이어 선택·진행·복구 상태만 포함한다.
- `VOLATILE_STORAGE_KEYS_V147`은 browser reliability report, wave checkpoint, transactional journal을 포함하며 엄격 save equality에서 제외된다.
- 오프라인 reload 전에 유효한 실행 모드·직업·시드 모드 sentinel을 기록하고 reload 뒤 보존을 요구한다.
- JSON 값은 recursive key-order canonicalization 뒤 비교한다.
- missing, added, changed, sentinelMissing 키를 개별 보고한다.
- 진단값만 바뀌는 회귀 fixture는 통과하고 영구 성장 또는 직업 값 변경 fixture는 실패한다.
- v147 및 v152 릴리스 게이트와 CI source SHA-256 manifest가 이 계약 파일들을 고정한다.

실제 GitHub Chromium에서 R5의 최종 v147 통과와 v148~v152 dist chain 완료를 확인해야 한다. 로컬 Chromium은 loopback navigation을 `ERR_BLOCKED_BY_ADMINISTRATOR`로 차단하므로 실제 네트워크 전환 성공 경로는 CI 필수 확인으로 남는다.
