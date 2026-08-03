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


## CI chain hotfix R6 검증

R5 GitHub Actions에서 v147 전체 브라우저 보증은 통과했고 v148의 `DD-RUNTIME-HEALTH-ASSURANCE-V148` 검사에서 중단됐다. 소스에는 해당 마커가 존재하고 실제 런타임에서 사용되지만, `index.html`의 엔트리인 `src/bootstrap.js`가 `src/main.js`를 동적 import하므로 Vite complete build에서는 마커가 `assets/game.js`가 아닌 `assets/chunks/main-*.js`에 배치된다.

R6 검증 항목:

- `assets/game.js`를 루트로 실제 `.js` 참조를 재귀 순회한다.
- 상대 chunk URL과 `/Defense/` base-path 절대 URL을 모두 dist 내부 경로로 정규화한다.
- 존재하지 않는 참조, 외부 URL, dist 밖 경로는 통과 근거로 사용하지 않는다.
- 연결되지 않은 고아 chunk에만 있는 마커는 실패한다.
- v148-v152 모든 런타임 마커 검증이 공통 도달 가능 번들 helper를 사용한다.
- v151 SVG 금지 검사도 `game.js` 하나가 아니라 도달 가능한 전체 JavaScript 번들에 적용한다.
- v149/v150 정체성 게이트가 현재 `1.0.52 / b24.52 / 1.0.52-b24.52`를 허용한다.
- v149 책임 분리 게이트는 v150 원자 보상 commit을 finish-run persistence로 검증한다.
- v1.0.49의 `sourceJsCssBytes=1,700,000` 상한은 변경하지 않고 v150-v152 태그 모듈만 역사 측정 범위에서 제외한다. 현재 v149 scoped source는 1,664,833바이트다.
- CI source manifest가 helper, fixture, v148-v152 dist verifier를 SHA-256 서명한다.

로컬 환경에는 Vite 실행 의존성이 없어 GitHub와 동일한 실제 번들을 생성하지 못했다. 대신 `assets/game.js → dynamic main chunk → base-path runtime chunk` 구조의 합성 fixture에서 마커 탐색과 고아 chunk 거부를 종료 코드 0으로 확인한다. 실제 complete Vite dist의 v148-v152 연속 통과는 GitHub Actions에서 최종 확인한다.


## CI chain hotfix R7 검증

R6 GitHub Actions는 v147과 v148을 통과한 뒤 v149 production-default에서 `testApi:true`로 실패했다. 페이지는 `127.0.0.1`에서 실행됐고 기존 정책은 production localhost를 QA 허용 예외로 처리했으므로, 실패는 실제 무단 노출 탐지이자 동시에 테스트와 정책의 상충이었다.

R7 검증 항목:

- production + 일반 호스트: QA API 숨김
- production + localhost/127.0.0.1: QA API 숨김
- production + 명시적 `?qa=v149`: frozen QA API 노출
- development mode: QA API 노출
- v144, v145, v146, v147 자동화 URL에 명시적 `?qa=` 토큰 존재
- 숨겨진 `#boot-error` 템플릿 텍스트는 오류 보고에서 제외
- 실제 visible boot recovery 화면은 production/default와 explicit-QA 시나리오 모두 실패
- v149 Chromium foreground scheduling 플래그 3종 유지

실제 Vite/Chromium 성공 경로는 GitHub Actions에서 최종 확인한다. 이번 변경은 게임 저장·전투·서비스 워커 코드에는 영향을 주지 않고 전역 QA API 노출 경계만 강화한다.


## CI chain hotfix R8 검증

R8은 온라인 순위표의 문서 생성 경계를 보강한다. 기존 구현은 익명 인증만 통과하면 자동 문서 ID로 반복 생성할 수 있어 동일 브라우저에서도 순위표 문서 수를 제한하지 못했다.

R8 검증 항목:

- `firestore.addDoc()` 점수 생성 경로 제거
- `dokkaebiScores/{auth.uid}` 단일 문서 경로 사용
- transaction에서 현재 최고 점수를 읽고 더 높은 점수만 쓰기
- 이름·점수·웨이브·처치·등급의 클라이언트 정규화와 Firestore 규칙 범위 일치
- 규칙에서 `scoreId == request.auth.uid` 및 `uid == request.auth.uid` 강제
- 생성 시 `createdAt == request.time`, 업데이트 시 생성 시각 보존과 `updatedAt == request.time` 강제
- 업데이트 점수가 기존 점수보다 낮아지는 쓰기 거부
- 삭제 금지와 공개 TOP 10 읽기 호환 유지

로컬에서 `npm run verify:leaderboard:v152`와 `npm run verify:release:v152`를 통과했다. Firestore rules emulator를 사용한 실제 허용/거부 행렬과 배포 후 익명 인증 쓰기는 CI 또는 Firebase 프로젝트에서 추가 확인해야 한다. 이 변경은 문서 스팸과 최고 점수 롤백을 줄이지만, 서버 권위 점수 계산이 아니므로 조작된 클라이언트의 고득점 제출 자체를 완전히 증명하지는 않는다.


## CI chain hotfix R9 검증

R9는 전체 프레임 GPU 비용과 캐릭터 표현 전용 비용의 측정 scope를 분리하고 WebGL context lifecycle에서 stale query가 남지 않도록 한다.

검증 항목:

- 정상 WebGL2 timer-query의 밀리초 변환과 `whole-frame-gpu` scope
- extension 미지원 환경의 안전한 no-op
- pending query 상한과 overflow 폐기
- GPU disjoint 시 같은 generation의 pending query 전량 폐기
- stale query poll 예외의 외부 전파 차단
- `webglcontextlost`의 suspend 및 query 폐기
- `webglcontextrestored`의 context/extension 재획득
- dispose 후 event listener 비활성
- whole-frame GPU p95와 presentation GPU p95의 독립 집계
- whole-frame GPU 과부하의 캐릭터 오강등 방지
- 명시적인 presentation GPU/CPU 과부하의 1회 강등

결정론 fixture와 정적 릴리스 계약은 통과했다. 실제 WebGL2 extension 동작, GPU disjoint, context loss/restore와 하드웨어 예산은 Vite complete build 및 실기기 브라우저에서 추가 확인해야 한다.

## CI chain hotfix R11 검증

보고된 실패는 실제 빌드 실패가 아니라 production minification 후 로컬 변수명이 사라져 발생한 dist 문자열 계약 오류였다.

R11 검증 항목:

- 액션 타이밍 계약의 `DD-AUTHORED-DURATION-GUARD-V152` 안정 마커 존재
- 클래스별 authored event timeline 및 완료 이벤트 순서 유지
- one-shot 지속시간이 요청 duration과 authored 마지막 이벤트 시간의 최댓값을 사용하는 소스 계약 유지
- reachable dynamic chunk에서 안정 마커 탐색
- 고아 chunk의 마커는 인정하지 않음
- `verify-dist-v152.mjs`가 로컬 식별자 `authoredDurationV152`를 dist 마커로 다시 요구하지 않음

실제 Vite build와 전체 dist chain의 최종 결과는 GitHub Actions에서 확인한다.



## CI chain hotfix R12 검증

R12는 dist-budget report 생산자와 runtime baseline 소비자의 pass/fail schema를 일치시킨다.

검증 항목:

- 성공 보고서가 저장 전에 `passed: true`를 갖는다.
- 하나라도 실패한 check가 있으면 `passed: false`로 저장되고 프로세스는 실패한다.
- R11 legacy 보고서는 `DD-DIST-BUDGET-V144` ID와 1개 이상의 전부 통과한 check가 있을 때만 허용된다.
- 명시적 `passed: false`, failed check, ID 없는 legacy 보고서는 baseline 후보 생성에서 거부된다.
- CI workflow가 capture 직전에 `verify:budget:v144`를 실행한다.
- R11 minification-stable marker, R10 trend isolation, R9 GPU scope 계약을 유지한다.

실제 GitHub Actions에서 `capture:baseline:v150` 이후 artifact upload와 Pages deploy까지 완료되는지 최종 확인한다.
