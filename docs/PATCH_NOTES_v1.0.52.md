# Patch Notes v1.0.52 — Event Timing & Runtime Guard

## 수정된 문제

- 캐릭터 표현 잔상 기록이 상태 전환, 비가시화, 순간이동 뒤에도 남아 다음 액션에서 과거 위치가 잠깐 재사용될 수 있던 문제를 수정했다.
- 캐릭터마다 매 프레임 `Vector3.clone()`과 잔상 샘플 객체를 생성하던 경로를 고정 버퍼로 교체해 장기 세션 GC 압력을 줄였다.
- 궁수·마법사처럼 실제 release/impact 이벤트가 기존 원샷 호출 시간보다 늦은 경우 이벤트가 실행되기 전에 상태가 종료될 수 있던 문제를 수정했다.
- 기존 GLB 재질의 emissive map, emissive color, emissive intensity를 표현 보강기가 덮어쓸 수 있던 위험을 제거했다.
- 결과 화면의 동적 이름·기호·시드·칙령 문자열을 HTML 이스케이프하고 비정상 점수를 0으로 정규화했다.
- 런타임 폐기 뒤 지연 에셋 작업과 전역 테스트/공개 API가 남을 수 있던 경계를 보강했다.

## 추가된 기능

- 전사·궁수·마법사·도사·무당과 수호대·몬스터·보스에 절대 초 단위 액션 이벤트 타임라인을 추가했다.
- WebGL2 `EXT_disjoint_timer_query_webgl2`가 사용 가능한 환경에서 프레임 GPU 시간을 수집한다.
- 캐릭터 표현 CPU/GPU/frame p95가 지속적으로 예산을 넘으면 cinematic에서 balanced로 한 번만 자동 강등한다.
- GPU disjoint, pending query overflow, 미지원 환경을 실패 없이 진단한다.

## 승인 경계

- 신규 최종 캐릭터 원화 승인 수는 0이다.
- 기존 승인·파생·격리 상태를 그대로 유지한다.
- GPU 타이머는 전체 렌더 프레임을 측정하며 캐릭터 계층만의 독립 GPU 비용으로 과장하지 않는다.

## CI chain hotfix R1

- `sync:generated:ci`가 v1.0.52에서 v1.0.51 bootstrap을 호출해 중단되던 문제를 수정했다.
- v1.0.51 bootstrap의 허용 버전을 확장하지 않았다. 과거 릴리스 복구 도구는 그대로 보존하고 활성 v1.0.52 체인에서만 분리했다.
- `preverify`와 `prebuild`를 v1.0.52 루트 준비 경로로 통일했다.
- v1.0.52 전용 repository-root 검증과 활성 체인 회귀 검사를 추가했다.
- CI source manifest는 동기화 중 재생성하지 않고 검증만 수행해 커밋된 서명 경계를 유지한다.


### R1 추가 수정 범위

- `scripts/verify-project.mjs`의 직접 v1.0.51 bootstrap 호출을 현재 릴리스 identity check로 교체했다.
- 골든 모션 검증기가 v1.0.52 상대 import와 클래스별 실제 authored timeline 종료 시간을 사용하도록 수정했다.
- 생성 identity가 `index.html`, `src/version-policy.js`, `src/main.js`, `public/sw.js`, `public/static-bootstrap.js`의 호환 마커까지 멱등적으로 동기화한다.
- 오래된 `dist/`와 `dist-pages/`는 source verification 전에 정리하고, 새 빌드 뒤 `verify:dist:all`에서만 엄격 검증한다.
- v1.0.45·v1.0.48 역사 성능 게이트는 기준을 완화하지 않고 v1.0.49~v1.0.52 forward-tagged 모듈과 v1.0.52 `main.js` 계측 추가분만 측정 범위에서 분리한다.
- v1.0.48 identity preflight가 `preverify → prepare:repo-root:v152`처럼 중첩된 lifecycle 명령을 해석한다.
- CI source revision은 위 회귀 방지 파일까지 포함해 28개 파일을 SHA-256 서명한다.

## CI chain hotfix R2

- `verify-dist-v146.mjs`가 현재 v1.0.52 dist 체인 안에서 `verify-ci-source-revision-v151.mjs`를 중복 호출해 `1.0.52/b24.52`를 거부하던 문제를 수정했다.
- v146의 장시간 브라우저·재질·런타임 오류 계약은 그대로 유지하고, 소스 정체성 preflight만 활성 v1.0.52 서명으로 교체했다.
- `verify-release-v152.mjs`가 활성 dist 체인에 v1.0.51 전용 preflight가 다시 들어오면 실패하도록 회귀 검사를 추가했다.
- v1.0.52 CI source 서명 범위에 `verify-dist-chain-v140.mjs`와 `verify-dist-v146.mjs`를 추가했다.
- R2 패치 ZIP은 `overlay/` 포장 폴더와 패치 메타데이터를 포함하지 않는다. ZIP의 모든 경로는 전체 통파일의 동일 경로에 존재하고 동일 SHA-256을 가져야 한다.



## CI chain hotfix R3

- v147 오프라인/재접속 브라우저 러너의 무제한 `navigator.serviceWorker.ready` 대기를 제거했다.
- 서비스 워커 등록·활성화는 `getRegistration()` 기반 제한 시간 폴링으로 확인한다.
- v146과 동일한 백그라운드 타이머·가려진 창·렌더러 스로틀 방지 플래그를 v147에도 적용했다.
- 장기 세션 준비와 각 웨이브 진행을 독립된 CDP 단계로 분리하고, 각 단계에 브라우저 내부 제한 시간과 외부 CDP 제한 시간을 적용했다.
- 실패 보고서에 `failedPhase`, 단계별 상태·소요 시간, 적용 플래그와 제한 시간을 기록한다.
- CDP 소켓 종료와 HTTP keep-alive 연결이 남아도 러너가 무기한 종료 대기하지 않도록 정리 경계를 추가했다.

## CI chain hotfix R4

- R3 진단으로 확인된 서비스 워커 `installing` 정체를 수정했다.
- 기존 설치 이벤트는 169개 경로를 동시에 fetch/cache했고 21개가 중복이었다. 대부분의 `./src/...` 원본 모듈은 complete Vite dist에 배포되지 않는다.
- 설치 전용 목록을 실제 배포 셸 11개로 분리했다. `assets/game.js`, `assets/game.css`, HTML, manifest, version, release identity, icons, static bootstrap만 포함한다.
- 설치 캐시 동시성을 4개로 제한하고 요청별 12초 `AbortController` 경계를 추가했다.
- 하나라도 필수 배포 셸 캐시에 실패하면 서비스 워커 설치를 명확히 실패시키며 무기한 `installing`으로 남지 않는다.
- 역사적 136개 source-module 목록은 v1.0.35 해시 무결성 장부로 유지하지만 install fetch에는 사용하지 않는다.
- 설치 상태 메시지에 phase, 완료/실패 수, 현재 경로와 실패 경로를 제공한다.
- 성공·지연 fetch를 모두 실행하는 서비스 워커 설치 시뮬레이션 검증을 v1.0.52 릴리스 체인에 추가했다.


## CI chain hotfix R5

- R4 이후 서비스 워커 설치·오프라인 부트·중간 웨이브 재접속은 모두 통과했지만 `saveContinuity`만 실패하던 문제를 수정했다.
- 원인은 실제 저장 손실이 아니라 v147 러너가 모든 `dokkaebi-*` localStorage 값을 원문 그대로 비교한 것이었다.
- `dokkaebi-browser-reliability-v19`는 부트마다 `generatedAt`, 이벤트, 메모리 표본이 갱신되고 `dokkaebi-wave-checkpoint-v18`도 heartbeat의 `savedAt`이 갱신된다. 이 정상 진단 변경이 플레이어 저장 손실로 오판됐다.
- 엄격 비교 대상을 플레이어 지속 상태로 한정했다: 실행 모드, 직업, 시드 모드, 조작 설정, HUD 설정, 점수, 영구 성장, 장비, 숙련, 도감, 수호 회의, 로컬 아트 검토 결정, 원자 저장 복구 스냅샷.
- 브라우저 진단, rolling wave checkpoint, transactional journal은 volatile namespace로 분리했다. 이 값들은 보고서에 fingerprint로 남지만 save continuity 합격 여부에는 사용하지 않는다.
- 오프라인 reload 전에 `guardian/warrior/daily`의 유효한 저장 sentinel을 기록하고 reload 뒤 반드시 동일하게 남는지 확인한다.
- JSON 저장값은 객체 키 순서를 정규화해 의미가 같은 재직렬화를 허용하지만, 실제 값 변경·누락·추가는 정확한 키 이름과 함께 실패한다.
- 결정론 검증은 진단 키만 변경되는 정상 사례가 통과하고 `dokkaebi-guardian-growth-v1` 또는 직업 값이 변경되는 실제 손실 사례가 실패하는지 검사한다.


## CI chain hotfix R6

- v147은 서비스 워커 설치, 오프라인 부트, 저장 연속성, 재접속까지 모두 통과했다.
- 다음 v148 실패는 런타임 마커가 누락된 것이 아니라 검증기가 `assets/game.js` 하나만 검사한 오탐이었다.
- 실제 엔트리 `src/bootstrap.js`는 `import('./main.js')`를 사용하므로 Vite는 부트스트랩을 `assets/game.js`에 두고 게임 런타임을 `assets/chunks/main-*.js`에 분리한다.
- `scripts/lib/dist-bundle-markers.mjs`를 추가해 `assets/game.js`에서 시작하는 실제 JavaScript 참조 그래프만 순회한다.
- `/Defense/assets/chunks/...` 절대 base-path 참조와 상대 chunk 참조를 모두 해석한다.
- 연결되지 않은 고아 chunk의 마커는 통과 근거로 인정하지 않는다.
- v148, v149, v150, v151, v152 dist 마커 검사를 모두 같은 도달 가능 번들 방식으로 교체했다.
- v149와 v150의 역사적 정체성 검사를 `patchRevision >= 49/50`, `buildId=b24.<patch>`, 정확한 cache revision 계약으로 전진 호환화했다.
- v149 책임 분리 검증은 과거 `checkpoint('finish-run')`뿐 아니라 v150의 `PersistentRewardOrchestratorV150 → AtomicSaveSnapshotV150.commit('finish-run-rewards')` 경로도 정상 저장 계약으로 인정한다.
- v1.0.49 소스 바이트 상한 1,700,000은 그대로 유지하고, 해당 버전 이후 승인된 `-v150.js`, `-v151.js`, `-v152.js` 모듈 62,708바이트만 역사 예산에서 제외한다.
- 합성 Vite fixture는 엔트리에 마커가 없고 동적 chunk에만 마커가 있는 실제 구조를 재현하며, 고아 chunk 마커 거부까지 검증한다.


## CI chain hotfix R7

- v148은 통과했고 v149 production-default 브라우저 노출 검사에서 `testApi:true`가 확인됐다.
- 원인은 런타임 정책과 브라우저 러너의 계약 불일치였다. 정책은 production에서도 정확한 localhost/127.0.0.1이면 QA API를 자동 허용했지만, 러너는 동일한 127.0.0.1 기본 URL에서 QA API가 숨겨져야 한다고 요구했다.
- production 빌드는 호스트가 localhost여도 QA API를 자동 노출하지 않는다. 개발 모드 또는 명시적인 `?qa=...` 쿼리만 허용한다.
- v144~v147의 브라우저 자동화는 이미 모두 명시적 QA 쿼리를 사용하므로 기능 검증 경로는 유지된다.
- v149 브라우저 보고서는 숨겨진 boot-error 템플릿의 텍스트를 실제 오류로 기록하지 않고, 화면에 표시된 경우에만 오류로 판정한다.
- v149 headless 실행에도 백그라운드 타이머·occluded window·renderer 스로틀 방지 플래그를 적용했다.


## CI chain hotfix R8

- 온라인 순위표가 익명 인증 사용자마다 `addDoc()`로 문서를 무제한 생성할 수 있던 무결성 문제를 수정했다.
- 점수 문서 ID를 Firebase Auth UID에 고정해 사용자당 활성 최고 기록을 1개로 제한했다.
- 점수 저장을 Firestore transaction으로 변경하고 기존 최고 점수보다 높은 경우에만 갱신한다.
- 클라이언트 입력을 Firestore 규칙과 동일한 정수 범위로 정규화한다: 점수 0~99,999,999, 웨이브 0~100, 처치 0~100,000, 최고 등급 1~5, 이름 1~12자.
- Firestore 규칙은 문서 ID·`uid`·인증 UID 일치, 정확한 필드 집합, 서버 타임스탬프, 생성 시각 보존, 점수 비감소를 강제한다.
- `scripts/verify-leaderboard-integrity-v152.mjs`를 추가해 무제한 `addDoc` 재도입, UID 미결합, 낮은 점수 덮어쓰기, 규칙 스키마 회귀를 차단한다.
- 정리 패키지에서 `__pycache__`, `.pyc`, `.pyo`를 제외하고 패키지 검증기가 재유입을 차단한다.
- 이 패치는 리더보드 문서 수와 무결성을 보강하지만, 클라이언트 단독 게임의 점수 조작을 서버 권위 방식으로 완전히 방지하는 안티치트는 아니다.


## CI chain hotfix R9

- 전체 `renderer.render()` timer-query 표본을 캐릭터 표현 전용 GPU 비용으로 오인하던 집계를 수정했다.
- GPU 표본은 `whole-frame-gpu` scope로 기록하고 `presentationGpuP95Ms`와 `wholeFrameGpuP95Ms`를 별도로 유지한다.
- 전체 프레임 GPU 과부하는 캐릭터 전용 GPU 강등 근거로 사용하지 않으며, 명시적인 캐릭터 GPU/CPU 표본만 cinematic → balanced 강등을 발생시킨다.
- WebGL context loss 시 active/pending query를 폐기하고 타이머를 suspend한다.
- context restore 시 renderer context와 `EXT_disjoint_timer_query_webgl2`를 재획득한다.
- query begin/end/poll 예외, disjoint, overflow, dispose 경계를 fail-closed로 처리하고 진단 카운터를 제공한다.
- `scripts/verify-gpu-frame-timer-v152.mjs`가 미지원·overflow·disjoint·stale query·context loss/restore·dispose 행렬을 검사한다.


## CI chain hotfix R10

- R9의 `observeWholeFrameCostV152` 변경을 v145 역사 성능 trend isolation이 인식하지 못해 CI가 중단되던 문제를 수정했다.
- R8 `observePresentationCostV152`와 R9 `observeWholeFrameCostV152` 중 정확히 하나만 허용하고 제거한다.
- 허용 블록이 없거나 중복되면 실패하므로 문자열 완화로 인한 거짓 통과를 방지한다.
- v1.0.44 성능 기준값과 5% 회귀 상한은 변경하지 않았다.
