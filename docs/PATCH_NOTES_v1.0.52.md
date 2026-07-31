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
