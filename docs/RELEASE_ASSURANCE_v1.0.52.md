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

