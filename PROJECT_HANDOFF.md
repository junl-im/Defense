## 2026-07-30 — v1.0.51 CI overlay downgrade repair R3

- 재현 오류: bootstrap이 루트 `package.json`을 v1.0.51로 확인한 뒤 `clean-obsolete-assets.mjs`가 과거 `overlay/`를 자동 병합하면서, 오버레이의 `package.json@1.0.46`이 다시 루트를 덮어썼다.
- 직접 원인: `root-output-policy.mjs`의 `recoverAccidentalRootOverlay()`가 오버레이 내부 파일을 신뢰하고 프로젝트 루트로 복사했다.
- 수정: bootstrap과 standalone cleaner 양쪽에서 루트 `overlay/` 자동 병합을 영구 비활성화하고, 내용물을 읽거나 복사하지 않은 채 오래된 추출 잔재로 삭제한다.
- 회귀 방지: `verify-ci-root-cleanup-v151.mjs`가 임시 저장소에 루트 v1.0.51과 오버레이 v1.0.46을 동시에 만들고 bootstrap과 standalone cleaner를 각각 실행해, 루트 버전 유지와 비복사를 모두 검증한다.
- 패치 필수 파일: `scripts/root-output-policy.mjs`를 direct-root 패치 목록과 패치 검증 계약에 추가했다.



## 2026-07-30 — v1.0.51 CI cleanup repair R2

- 재현 오류: GitHub Actions의 dependency-free preflight가 `clean:obsolete`보다 먼저 `verify-repository-root-v151.mjs`를 실행해, 삭제 가능한 `PATCH_SUMMARY.md`, `PATCH_MANIFEST.json`, `PATCH_MANIFEST_v1.0.23.json`, `README_PATCH.txt`, `APPLY_KO.txt`를 치명 오류로 처리했다.
- 수정: bootstrap 단계에서 6개 stale metadata를 선제 삭제하고, workflow에서 cleaner를 root verifier보다 먼저 실행하며, root verifier는 해당 6개 파일만 경고 처리한다.
- 회귀 방지: `scripts/verify-ci-root-cleanup-v151.mjs`가 workflow 명령 순서와 임시 저장소의 실제 삭제 결과를 검증한다.
- 적용 후 필수 확인: `node scripts/bootstrap-release-package-v151.mjs`, `node scripts/clean-obsolete-assets.mjs`, `node scripts/verify-repository-root-v151.mjs`, `npm run verify:ci`.
- 릴리스 식별자는 그대로 `v1.0.51 / b24.51`, repair revision은 2다.
> Current improvement patch: **v1.0.51 / b24.51** - MODERN CHARACTER PRESENTATION RELEASE

# PROJECT HANDOFF - RELEASE 1.0.51

- Project: `DokkaebiLuckDefense3D_FULL_v1.0.51_MODERN_CHARACTER_PRESENTATION`
- Public game version: `1.0.51`
- Lineage version: `23.12.0`
- Build ID: `b24.51`
- Base: `Defense_v1.0.50_FULL.zip` / SHA-256 `24566db7b5479b6e0af3b19c51c554592f5587f4228bc11ec8e3e683033384b8`

## 절대 규칙

1. 최종 보고 첫 항목은 **결과 정보 나열**로 작성한다.
2. 최종 보고 둘째 항목은 **전체 통파일 ZIP**과 **압축 해제 후 프로젝트 루트에 붙여넣는 패치 ZIP** 두 개를 반드시 제공한다.
3. 최종 보고 셋째 항목은 **다음 업데이트 패치 예정 라인**을 작성한다.
4. **모든 개선 작업 종료 전 `PROJECT_HANDOFF.md`의 `인수인계 내역`을 반드시 작성·갱신한다.**
5. **인수인계 내역 작성 필수**이며, 미작성 상태는 검증 성공 여부와 관계없이 릴리스 미완료로 간주한다.
6. 인수인계 내역에는 버전, 작업 목표, 변경 파일, 검증 명령, 검증 결과, 잔여 위험, 다음 예정 라인을 남긴다.
7. 생성 로그·검증 결과·패치 메타데이터는 프로젝트 루트에 두지 않는다.

## 현재 승인 상태

- 푸푸도깨비 11방향 원본: 최종 승인 유지
- v1.0.29 파생 아틀라스: 런타임 파생 승인 유지
- 독립 공격·기술·피격 원화: 파생 임시 승인
- 보스 식별 프로필 3종: 런타임 승인 유지
- 이무기/왕 실루엣 유사 쌍: 사람 검토 유지, 런타임 구분 승인
- 장난 요괴 폭탄병 후보: 교체 대기, 런타임 격리
- 신규 최종 캐릭터 원화 승인: 0종

## 검증 명령

```bash
npm run verify:model:v145
npm run verify:release:v145
npm run verify:release:v146
npm run verify:release:v148
npm run verify:foundation:v149:v150
npm run verify:release:v150
npm run verify:ci
VITE_BASE_PATH=/Defense/ npm run build
REQUIRE_BROWSER_V144=1 REQUIRE_BROWSER_V145=1 REQUIRE_BROWSER_V146=1 REQUIRE_BROWSER_V147=1 REQUIRE_BROWSER_V149=1 REQUIRE_BROWSER_V150=1 npm run verify:dist:all
npm run hygiene:check
```

## PERMANENT ROOT HYGIENE CONTRACT

- 생성 로그·검증 결과·패치 메타데이터는 프로젝트 루트에 두지 않는다.
- 패치 산출물 메타데이터는 `logs/patch/<version>/` 아래에 기록한다.
- 작성 문서는 `docs/`, 실행 로그는 `logs/`, 배포 결과는 `dist/`에만 둔다.
- 컴팩트 패키지 안내는 `docs/`, dist 재생성 도구는 `scripts/`에 둔다.
- 루트에 `COMPACT_PACKAGE_NOTE.txt` 또는 `REBUILD_DIST_WINDOWS.bat`를 다시 만들지 않는다.

## PERMANENT NATIVE KEY CONTRACT

- 브라우저 F1~F12, 새로고침, 개발자 도구 등 기본 단축키를 게임이 가로채지 않는다.
- 전역 키보드 입력은 이동키만 처리한다.
- 공격·기술·일시정지·제작 콘솔은 화면 버튼과 명시적 UI를 사용한다.

## v1.0.36 Storage Hygiene & Clean Source Packaging

- Measure exact path-and-hash duplicates between `public/` and generated `dist/`.
- Exclude `dist/`, `node_modules/`, and generated logs from the full source ZIP.
- Preserve runtime assets, production knowledge data, source code, documentation, and release history.
- Stage and verify the clean source package before compression.
- Delete generated `dist/` during patch cleanup instead of shipping another duplicate asset tree.
- Keep the mandatory handoff history rule as a release gate.

## v1.0.35 Runtime Stability & Release Integrity

- `FrameScope`로 전투 이펙트 RAF를 런타임 수명주기에 편입한다.
- 링·소환 빔·번개 이펙트를 런 전환·폐기 시 즉시 정리한다.
- 모바일 HUD `23.3.0`에서 주소창·키보드·핀치 줌을 구분한다.
- 14개 UI 프로필에서 겹침·클리핑·판정 기대값을 검사한다.
- 보스 배지를 헤더 직후 읽기 순서로 배치하고 비활성 ARIA 상태를 제거한다.
- 보스 체력과 파훼 게이지에 실시간 progressbar 값을 제공한다.
- `src/bootstrap.js` 도달 가능 import 그래프를 서비스워커 핵심 캐시와 자동 동기화한다.
- 100웨이브 자원 상한과 에셋 승인·격리 경계를 자동 검증한다.

## 인수인계 내역

### 2026-07-30 — v1.0.51 / b24.51 modern character presentation

- 작업 목표: 기존 승인 캐릭터 에셋을 교체하거나 신규 최종 원화로 과장하지 않고, 엔진 렌더링 계층에서 접지감·깊이·방향성 조명·액션 잔상·PBR 재질 반응을 강화해 최근 게임에 가까운 전투 캐릭터 표현을 만든다.
- 주요 변경 파일: `src/runtime/character-presentation-policy-v151.js`, `src/runtime/character-presentation-director-v151.js`, `src/engine/character-material-enhancer-v151.js`, `src/engine/asset-pipeline.js`, `src/main.js`, v151 릴리스·dist·패키지·패치 검증기, 버전·CI·README와 릴리스 문서.
- 수정 내용: 캐릭터마다 접지 그림자, 어두운 깊이 실루엣, 방향성 키라이트, 기존 액션 림 계보, 최대 2단 모션 애프터이미지를 품질 단계별로 적용한다. 몬스터는 거리와 지속 고밀도 전투 압력에서 보조 레이어를 먼저 줄이고 영웅·수호대·보스 가독성을 우선한다. 투명 아틀라스는 premultiplied alpha, anisotropy, sRGB, dithering과 강화된 alpha threshold를 사용한다. GLB 캐릭터 재질은 roughness·metalness·환경광 범위를 제한하고 저전력 기기를 제외한 경로에 부드러운 view-dependent PBR 림 셰이더를 설치한다.
- 승인 경계: 신규 최종 캐릭터 원화 승인 수는 0이다. 기존 승인·파생·격리 상태를 유지하며 이번 버전은 엔진 표현 강화로만 기록한다.
- 검증 명령: `npm run verify:character:v151`, `npm run verify:foundation:v150:v151`, `npm run verify:release:v151`, `npm run verify`, `npm run stage:package:v151`, `npm run verify:package:v151`, `npm run create:patch:v151`, `npm run verify:patch:v151`, `npm run hygiene:check`, CI의 `npm ci → VITE_BASE_PATH=/Defense/ npm run build → REQUIRE_BROWSER_V151=1 npm run verify:dist:all`.
- 현재 검증 결과: v1.0.1~v1.0.50 누적 보존 계약과 v1.0.51 캐릭터 표현·재질·릴리스 검증을 통과했다. 전체 `npm run verify` 결합 실행은 마지막 v1.0.51 중복 구간 직전까지 2,408줄을 통과한 뒤 25분 실행 제한으로 종료됐고, 남은 `verify:foundation:v150:v151`, `verify:release:v151`, 루트 위생, 패키지·패치 검증은 각각 별도 실행하여 모두 종료 코드 0을 확인했다. 로컬 Vite/WebGL 빌드는 내부 npm 저장소에서 고정 의존성 `vite@8.1.5`와 `three@0.185.1`을 제공하지 않아 실행하지 못했으며, 이를 통과로 간주하지 않고 GitHub Actions의 `npm ci → build → verify:dist:all → v151 character evidence upload` 필수 게이트로 남겼다.
- 잔여 위험: 현재 전달 환경의 내부 npm 저장소에는 고정된 `vite@8.1.5` 패키지가 없어 로컬 WebGL 셰이더 컴파일과 실제 Vite 화면 캡처를 실행할 수 없다. CI에서 의존성 설치·번들 생성·dist 마커·실브라우저 계측을 필수로 유지한다. 독립 공격/기술 원화는 여전히 파생 임시 승인이다.
- 다음 예정: `docs/NEXT_UPDATE_v1.0.52.md`의 애니메이션 이벤트 기반 클래스별 타이밍, GPU 비용 자동 강등, 실제 WebGL 전후 캡처, 나머지 직업 11방향 승인 검토.


### 2026-07-30 — v1.0.50 / b24.50 atomic checkpoints and safe recovery

- 작업 목표: 남은 점수·영구 보상 저장 책임을 `src/main.js`에서 분리하고, 여러 저장 키를 하나의 검증 가능한 스냅샷으로 커밋하며, 치명적 런타임 오류에서 사용자에게 내부 정보를 노출하지 않고 마지막 안전 지점을 복구한다.
- 입력 패키지 점검: 업로드 ZIP은 v1.0.49 전체 루트와 별도 `overlay/` 핫픽스가 함께 들어 있었다. 오버레이의 `package.json`은 v1.0.46으로 회귀하고 v147~v149 스크립트 47개를 제거했으며, 오버레이 워크플로도 v147~v149 브라우저·증거 게이트를 삭제했다. 소스 핫픽스는 병합하되 두 파일은 정식 v1.0.49 루트를 보존한 뒤 v1.0.50으로 승격했다.
- 주요 변경 파일: `src/runtime/atomic-save-snapshot-v150.js`, `src/runtime/persistent-reward-orchestrator-v150.js`, `src/runtime/production-error-boundary-v150.js`, `src/main.js`, `index.html`, `src/style.css`, 저장 스키마, v150 검증·패키징·패치·성능 기준선 스크립트, CI 워크플로, 릴리스 문서와 버전 파일.
- 수정 내용: 스냅샷은 현재 전체 저장 집합과 최대 두 개 롤백 슬롯, 체크섬, 세대 번호를 유지한다. 원정 종료 시 혼불·숙련·장비·도감을 한 트랜잭션으로 커밋하고 동일 런 토큰의 중복 지급을 차단한다. 점수는 로컬 원자 저장 성공 후에만 온라인 제출을 시도한다. 치명적 오류 화면은 고정된 한국어 복구 문구만 표시하며 원문 오류는 제한된 개발자 진단에만 남긴다.
- 성능 기준선: 실제 수치를 로컬에서 승인하지 않는다. GitHub Actions의 통과한 v145 장기 세션 보고서와 v144 Vite dist 예산 보고서에서 CPU p95/기울기, long-task 비율, JS heap, draw call, texture residency 후보를 생성하고 승인자·티켓·승인 시각이 있어야 승격한다.
- 검증 명령: `npm run verify:atomic:v150`, `npm run verify:rewards:v150`, `npm run verify:error-boundary:v150`, `npm run verify:performance-baseline:v150`, `npm run verify:structure:v150`, `npm run verify:release:v150`, `npm run verify:ci`, `VITE_BASE_PATH=/Defense/ npm run build`, `npm run verify:dist:all`, `npm run stage:package:v150`, `npm run verify:package:v150`, `npm run create:patch:v150`, `npm run verify:patch:v150`.
- 현재 검증 결과: `npm run verify` 전체 누적 체인 2,423줄이 종료 코드 0으로 통과했고, v1.0.50 저장·보상·오류 경계·성능 승격 모델과 v1.0.1~v1.0.49 보존 계약, 루트 위생 검사를 모두 통과했다. `npm run stage:package:v150`과 `npm run verify:package:v150`도 통과했다. 로컬 Vite 빌드는 전달본의 `node_modules`에 Vite 실행 파일이 없어 `vite: Permission denied`로 실행되지 않았으며, 통과로 간주하지 않고 GitHub Actions의 `npm ci → build → verify:dist:all → capture:baseline:v150` 필수 게이트로 남겼다.
- 잔여 위험: 승인된 실제 하드웨어 기준값은 GitHub Actions 후보 생성 후 사람 승인 절차가 필요하다. 실제 iOS Safari 독립 PWA와 Android 제조사별 장기 세션은 계속 실기기 증거가 필요하다.
- 다음 예정: `docs/NEXT_UPDATE_v1.0.51.md`의 실기기 기준선 승인·부분 저장 장애 주입·복구 UI 접근성 브라우저 행렬.


### 2026-07-29 — v1.0.49 / b24.49 v145 CI measurement calibration hotfix

- 작업 목표: GitHub Actions의 SwiftShader 소프트웨어 렌더러에서 100웨이브 장기 세션이 실제 누수·추세 회귀 없이도 `frameP95=216.6ms`, `longTaskGrowth=556`으로 실패한 오탐을 제거하고, 실제 하드웨어 성능 회귀는 기존 절대 기준으로 계속 차단한다.
- 주요 변경 파일: `src/runtime/long-session-assurance-v145.js`, `src/runtime/failure-digest-v146.js`, `src/main.js`, `scripts/run-long-session-v145.mjs`, `scripts/run-release-assurance-v146.mjs`, v145/v146 모델·릴리스 검증기, 런타임 셸·시스템 감사·빌드 입력 매니페스트, README와 v145 보증 문서.
- 수정 내용: WebGL renderer/vendor를 수집해 SwiftShader·llvmpipe 등 소프트웨어 렌더러를 명시적으로 구분한다. 하드웨어·미확인 환경은 `maxFrameP95Ms=34`와 누적 long-task 상한을 그대로 적용한다. 소프트웨어 렌더러는 wave 0 기준 대비 frame p95 비율·증가량·정규화 기울기와 프레임당 long-task 비율 추세를 판정한다. 프레임 창 요청 수·완료·timeout을 기록하고 불완전 측정은 `measurementCoverage`로 실패시킨다. Chromium 백그라운드 throttling 방지 플래그와 장기 세션 기본 DPR 1을 적용하며 환경 변수로 1~3 배율을 재지정할 수 있다.
- 검증 명령: `node scripts/verify-long-session-model-v145.mjs`, `node scripts/verify-long-session-harness-v145.mjs`, `node scripts/verify-failure-digest-v146.mjs`, `node scripts/verify-release-v145.mjs`, `node scripts/verify-release-v146.mjs`, `node scripts/generate-runtime-shell-v135.mjs --check`, `npm run verify:release:v148`, `npm run verify:release:v149`, `npm run verify:ci`, GitHub Actions의 실제 `npm ci → build → verify:dist:all`.
- 검증 결과: 제공 로그와 같은 200ms급 소프트웨어 렌더링·누적 long-task 픽스처는 안정 추세일 때 통과했고, 동일 수치를 하드웨어 프로필로 실행하면 절대 frame 기준으로 실패했다. 소프트웨어 환경에서도 p95 비율·기울기·long-task rate가 악화되거나 프레임 창이 timeout되면 실패한다. failure digest는 최종 실패 체크만 위치 추적하며 통과 보고서에 거짓 `firstRegression`을 남기지 않는다.
- 예외사항: 현재 작업 환경의 내부 npm 레지스트리에 `vite@8.1.5`가 없어 실제 Vite 번들을 로컬 생성하지 못했다. 이 제한은 통과로 간주하지 않으며, 실제 브라우저 dist 검증은 GitHub Actions 필수 게이트로 남긴다.
- 잔여 위험: 소프트웨어 렌더러 보정은 장기 추세 검증용이며 사용자 기기의 절대 FPS 승인을 대체하지 않는다. 실제 Android/iOS와 하드웨어 가속 Chrome의 승인 기준선 수집이 필요하다.
- 다음 예정: `docs/NEXT_UPDATE_v1.0.50.md`의 승인 Vite CPU/long-task/heap 기준선 승격과 실제 기기 장기 세션 계측.

### 2026-07-28 — v1.0.45 / b24.45

- 작업 목표: 실제 완성 게임의 웨이브·보상·UI·렌더러 경로를 100회 결정적으로 통과시키고, 프레임·heap·texture·geometry 추세와 WebGL 컨텍스트 복구를 CI 승인 계약으로 고정한다.
- 주요 변경 파일: `src/runtime/long-session-assurance-v145.js`, `src/main.js`, `scripts/run-long-session-v145.mjs`, `scripts/verify-performance-trend-v145.mjs`, `scripts/generate-asset-residency-v145.mjs`, v145 릴리스·배포·패키지·패치 검증기, `docs/PERFORMANCE_BASELINE_v1.0.44.json`, `docs/generated/asset-residency-v145.*`, 버전·서비스워커·워크플로·README 및 v1.0.45 문서.
- 수정 내용: QA 전용 API가 실제 `startWave`, `completeWave`, 보상 선택과 진행 시스템을 유지한 채 전투 대기 시간만 단축해 100웨이브를 실행한다. 5웨이브마다 10프레임 창과 heap·renderer·long-task·오류 상태를 기록하고 누적 증가량과 10웨이브당 기울기를 모두 판정한다. 50웨이브에서 `WEBGL_lose_context` 손실·복원·렌더 재개를 요구한다. 승인된 v1.0.44 정리 패키지의 main/style/source/runtime/engine raw·gzip 수치를 기준으로 5% 초과 증가를 차단한다. 53개 런타임 에셋은 13 boot / 40 deferred로 단일 분류하고 title·combat·hero·guardian·monster·boss 경로의 74개 명시적 edge를 생성한다.
- 검증 명령: `npm run verify:residency:v145`, `npm run verify:trend:v145`, `npm run verify:model:v145`, `npm run verify:release:v145`, `npm run verify`, `npm run build`, `REQUIRE_BROWSER_V144=1 REQUIRE_BROWSER_V145=1 npm run verify:dist:all`, `npm run stage:package:v145`, `npm run verify:package:v145`, `npm run create:patch:v145`, `npm run verify:patch:v145`, `npm run hygiene:check`.
- 검증 결과: 장시간 추세 모델의 정상·실패 픽스처가 통과했고, 현재 소스는 v1.0.44 기준 대비 main raw +1.98%, main gzip +1.97%, 전체 JS raw +1.33%, runtime JS raw +2.63%로 모두 5% 이내다. 에셋 residency 생성기는 53/53 단일 분류와 74개 edge 동일성 검사를 통과했다. v144 릴리스·dist 검증기는 고정 1.0.44 비교를 제거하고 1.0.44 이상 전진 호환 기반 계약으로 변경했다. 전체 누적 소스·정적 배포·패치 검증 결과는 최종 패키징 로그에 기록한다.
- 예외사항: 현재 작업 환경의 npm 레지스트리는 Vite 패키지 요청에 HTTP 503을 반환하고 저장된 `node_modules`에는 실행 본문이 없어 실제 완성 Vite 번들을 재생성할 수 없다. 또한 관리 Chromium 정책이 loopback HTTP를 차단할 수 있다. 따라서 브라우저 100웨이브 성공은 GitHub Actions의 `npm ci → build → REQUIRE_BROWSER_V145=1`에서 필수 실행하며, 로컬 미실행을 성공으로 보고하지 않는다.
- 잔여 위험: 빠른 100웨이브 경로는 시스템 수명주기·보상·렌더 프레임을 통과하지만 각 웨이브의 실제 적 전투 시간을 유지하지 않는다. v1.0.46에서 지정 웨이브에 실전 적·투사체·파티클·보스 텔레그래프 관찰 구간을 추가한다. iOS Safari 독립 PWA와 Android 제조사별 viewport trace도 실기기 수집이 필요하다.
- 다음 예정: `docs/NEXT_UPDATE_v1.0.46.md`.

### 2026-07-28 — v1.0.44 / b24.44

- 작업 목표: v1.0.43 모바일 입력 복구와 소환 시인성 계약을 격리 HTML이 아니라 실제 Vite 완성 빌드에서 검증하고, 배포 용량·초기 텍스처 업로드 상한과 24개 에셋 검토 후보의 보존 결정을 CI 계약으로 고정한다.
- 주요 변경 파일: `scripts/run-built-game-mobile-matrix-v144.mjs`, `scripts/verify-dist-budget-v144.mjs`, `scripts/generate-asset-review-v144.mjs`, v144 릴리스·배포·패키지·패치 검증기, `docs/DIST_BUDGETS_v1.0.44.json`, `docs/generated/asset-review-v144.*`, 버전·서비스워커·워크플로·README 및 v1.0.44 문서.
- 수정 내용: Chromium DevTools Protocol로 완성 게임을 부팅하고 실제 전투 진입 후 세로·가로·왼손·150% 확대 화면을 캡처한다. 소환 버튼의 최소 44px 판정, 뷰포트 경계, 터치 액션, 라벨 비차단, 맵 터치 상태와 왼손 도크 반전을 검사한다. Vite JS 청크·초기 요청·JS/CSS gzip·초기 텍스처 RGBA 추정 업로드 예산을 추가했다. 24개 도달성 후보는 런타임 카탈로그 14, 제작 후보 UI 6, 승인 계보 2, 준비도 자산 1, 런타임 셸 1로 분류하고 삭제 승인을 0으로 고정했다. v143 CSS 배포 검증은 주석 문자열 대신 실제 선언을 확인하도록 수정했다.
- 검증 명령: `npm run verify:asset-review:v144`, `npm run verify:release:v144`, `npm run verify`, `npm run build`, `REQUIRE_BROWSER_V144=1 npm run verify:dist:all`, `npm run stage:package:v144`, `npm run verify:package:v144`, `npm run create:patch:v144`, `npm run verify:patch:v144`, `npm run hygiene:check`.
- 검증 결과: v144 신규 스크립트 전체 구문 검사, 24/24 에셋 검토 보고서 재생성·동일성 검사, v143 도달성 1,951개 중 1,927개 직접 도달 및 런타임 미해결 참조 0개를 확인했다. 기존 v143 CSS 오탐 조건은 주석 제거와 `transparent` 최소화 표현에 독립적인 선언 검사로 교체했다. 현재 작업 환경에는 Vite 패키지 본문이 없어 완성 번들을 재생성할 수 없으므로, 실제 네 장의 게임 스크린샷과 수치 예산은 GitHub Actions의 `npm ci && npm run build` 이후 `REQUIRE_BROWSER_V144=1` 게이트에서 필수 실행한다. 합성 완성 번들로 CDP 연결·탐색 실패 경로·프로필 정리를 실행해 보았고, 이 컨테이너의 Chromium 관리 정책 `URLBlocklist: ["*"]`가 loopback HTTP를 `net::ERR_BLOCKED_BY_ADMINISTRATOR`로 차단함을 확인했다. 실행기는 이를 즉시 명시하고 콘솔·네트워크·부트·탐색 진단을 보고서에 남기며, 종료 후 프로필 삭제 경쟁 조건을 재시도로 처리한다.
- 예외사항: 정적 fallback은 복구 배포 수단으로 유지하지만 v144 완성 빌드 검증 대상으로 인정하지 않는다. 브라우저가 없는 개발 환경은 명확히 SKIP할 수 있으나 CI에서는 환경 변수로 SKIP을 실패 처리한다. 관리 브라우저 정책이 localhost를 차단하는 환경도 성공으로 간주하지 않고 구체적 정책 오류로 실패한다.
- 잔여 위험: iOS Safari 독립 PWA 복원과 Android 제조사별 키보드·주소창 시퀀스는 실기기 데이터가 필요하다. 초기 텍스처 추정은 문자열 기반 도달성이라 실제 GPU residency와 차이가 있을 수 있다.
- 다음 예정: `docs/NEXT_UPDATE_v1.0.45.md`.

### 2026-07-27 — v1.0.43 / b24.43

- 작업 목표: 모바일 백그라운드 복귀·페이지 복원·화면 회전·가상 키보드·핀치 줌 뒤 남은 포인터 캡처가 바닥 터치 이동을 막지 않도록 입력 수명주기를 복구하고, 랜덤 소환 버튼의 밝은 화면·손가락 가림·왼손 배치 시인성을 보강한다.
- 주요 변경 파일: `src/runtime/mobile-input-recovery-v143.js`, `src/main.js`, `src/style.css`, `index.html`, 브라우저 회귀 픽스처와 실행기, 프레젠테이션 스냅샷 생성기, 런타임 에셋 도달성 생성기, v143 릴리스·배포·패키지·패치 검증기, 버전 파일, README와 v1.0.43 문서.
- 수정 내용: visibility/page/orientation/visualViewport 이벤트에서 활성 맵 포인터·핀치·조이스틱 상태를 해제한다. 작은 주소창 변화는 무시하고 키보드·확대·오프셋·회전 수준의 변화만 리셋한다. 소환 버튼에는 상단 `소환` 비콘, 고대비·forced-colors, 왼손 티켓 반전, 좁은 가로 화면 배치를 추가했다. 부트·타이틀·전투 도크 DOM 해시와 동적 JSON 카탈로그를 포함한 보수적 에셋 도달성 보고서를 생성한다.
- 검증 명령: `npm run verify:mobile-input:v143`, `npm run verify:browser:v143`, `npm run verify:reachability:v143`, `npm run verify:presentation:v143`, `npm run verify:release:v143`, `npm run verify`, `npm run build:static`, `npm run verify:dist:all`, `npm run stage:package:v143`, `npm run verify:package:v143`, `npm run create:patch:v143`, `npm run verify:patch:v143`, `npm run hygiene:check`.
- 검증 결과: 전체 누적 `npm run verify`와 모바일 HUD 14/14가 통과했다. 결정론적 입력 복구 계약에서 주소창 소폭 변화는 유지하고 키보드 높이 변화·핀치 배율·회전·백그라운드 전환은 포인터를 정리했다. 런타임 에셋 1,951개 중 1,927개를 직접 도달 가능으로 분류했고 런타임 미해결 리터럴 참조는 0개였다. 24개 항목은 자동 삭제하지 않는 수동 검토 후보로 남겼다. 정적 배포에서 v117~v143 총 26개 게이트가 연속 통과했다. 35개 파일의 루트 직접 덮어쓰기 패치를 깨끗한 v1.0.42 복제본에 적용한 뒤 v143 릴리스·정적 빌드·전체 dist 체인·루트 위생을 재통과했다. 설치된 Chromium은 현재 컨테이너에서 headless 시작이 시간 초과되어 실브라우저 픽스처는 건너뛰었고 결정론적 계약과 기존 100웨이브 상한 검증을 필수 게이트로 유지한다.
- 예외사항: 브라우저 실행기가 Chrome/Chromium을 정상 시작할 수 있는 CI·개발 환경에서는 실제 PointerEvent와 WebGL 100회 생성·삭제 픽스처를 실행한다. 브라우저 자체가 시작되지 않는 환경에서는 명확한 SKIP을 기록하며 브라우저 성공으로 보고하지 않는다. 현재 컨테이너에서는 `npm ci` 실행도 도구 계층 오류로 완료되지 않아 실제 Vite 번들은 재생성하지 못했고, 정적 fallback과 GitHub Actions의 `npm ci && npm run build` 게이트를 유지한다.
- 잔여 위험: 실제 iOS Safari 독립 PWA와 Android 제조사별 키보드의 visualViewport 시퀀스는 실기기 확인이 계속 필요하다. 에셋 검토 후보는 동적 명명·제작 계보 승인 전까지 삭제하지 않는다.
- 다음 예정: `docs/NEXT_UPDATE_v1.0.44.md`.


### 2026-07-27 — v1.0.42 / b24.42

- 작업 목표: 랜덤 소환 버튼이 다른 액션 버튼에 묻혀 보이지 않는 문제를 개선하고, 전용 에셋의 모서리·끝부분 잘림과 상태 표현을 정리한다.
- 주요 변경 파일: `src/assets/ui-v142/random-summon-emblem-v142.png`, `src/runtime/summon-button-presentation-v142.js`, `src/main.js`, `src/style.css`, `index.html`, 서비스워커·버전 파일, `scripts/verify-summon-button-v142.mjs`, v1.0.42 릴리스·배포·패키징·패치 스크립트, README와 v1.0.42 문서.
- 수정 내용: 도깨비 얼굴·강림 원형·주사위 표식을 결합한 256×256 전용 문양을 추가했다. 외곽 2픽셀은 완전 투명하며 버튼 내부에는 금색 베벨, 청록 발광, 보라색 깊이, 눌림 피드백을 적용했다. 엽전 충분·부족·강림 봉인·선택권 상태를 색과 ARIA 문구로 구분하고 PC는 가로형, 모바일은 세로형 레이아웃을 사용한다.
- 검증 명령: `npm run verify:summon:v142`, `npm run verify:release:v142`, `npm run verify`, `npm run build:static`, `npm run verify:dist:all`, `npm run stage:package:v142`, `npm run verify:package:v142`, `npm run create:patch:v142`, `npm run verify:patch:v142`, `npm run hygiene:check`.
- 검증 결과: 전용 PNG의 크기·RGBA·외곽 알파 0·가시 영역 51,626픽셀·89,727바이트 용량 예산을 검사하고 ready/short/sealed 상태와 ARIA 동기화를 통과했다. 전체 누적 `npm run verify`, 모바일 HUD 14/14, 정적 배포 v117~v142 25개 게이트, 정리 패키지, 루트 직접 덮어쓰기 패치 검증을 통과했다. 깨끗한 v1.0.41 전체본에 33개 파일을 그대로 붙여넣은 뒤 v1.0.42 릴리스·정적 빌드·전체 dist 체인·루트 위생을 재통과했다.
- 예외사항: 이미지 생성 도구 대신 기존 승인 마스코트 원본을 기반으로 프로젝트 내 생성 스크립트에서 합성·다운샘플링했으며 신규 캐릭터 원화 승인으로 간주하지 않는다.
- 잔여 위험: 실제 기기에서 밝은 야외 화면과 손가락 가림 상황의 체감 시인성은 다음 실기기 회귀에서 추가 확인한다.
- 다음 예정: `docs/NEXT_UPDATE_v1.0.43.md`.


### 2026-07-27 — v1.0.41 / b24.41

- 작업 목표: 바닥 터치 이동이 전투 중에도 비활성화되는 문제와 구형 보라색 로딩 화면이 초기 실행·전투 진입 때 반복 노출되는 문제를 수정한다.
- 주요 변경 파일: `src/runtime/app-state-surface-v141.js`, `src/main.js`, `src/style.css`, `index.html`, `public/sw.js`, 버전 파일, `scripts/verify-release-v141.mjs`, `scripts/verify-dist-v141.mjs`, 패키징·패치 스크립트, README와 v1.0.41 문서.
- 수정 내용: 앱 상태 전환을 `body.dataset.appState`, `data-map-touch-ready-v141`, 호환 `playing` 클래스에 동기화한다. 전투 상태에서만 전체 맵 `.look-zone` 입력을 활성화하고, 포인터 캡처가 손실되는 브라우저를 위해 window pointerup/pointercancel 복구를 추가한다. 구형 `#loading` 시각 구성과 전투 진입 오버레이를 제거하고 진단용 숨김 노드만 유지한다. 타이틀은 전투 준비가 끝날 때까지 표시한다. 서비스워커 캐시는 `1.0.41-b24.41`로 갱신한다.
- 검증 명령: `npm run verify:release:v141`, `npm run verify`, `npm run build:static`, `npm run verify:dist:all`, `npm run stage:package:v141`, `npm run verify:package:v141`, `npm run create:patch:v141`, `npm run verify:patch:v141`, `npm run hygiene:check`.
- 검증 결과: 상태 동기화 단위 회귀에서 playing은 맵 입력을 활성화하고 paused는 비활성화했다. 소스·배포본에서 구형 로딩 아트와 전투 진입 문구가 제거됐으며, v117~v141 전체 dist 체인과 모바일 HUD 14개 프로필을 통과했다. 깨끗한 v1.0.40 복제본에 루트 직접 덮어쓰기 패치를 적용한 뒤 릴리스·정적 빌드·dist 체인을 재통과했다.
- 예외사항: 실제 모바일 브라우저의 손가락 입력은 정적 검사만으로 완전 재현할 수 없으므로, 다음 버전에서 Playwright/WebDriver 기반 실브라우저 탭 이동 회귀를 추가한다.
- 잔여 위험: 사용자가 기존 탭을 계속 열어둔 경우 새 서비스워커가 활성화되기 전까지 구 HTML이 유지될 수 있다. 배포 후 새로고침 또는 탭 재실행으로 `b24.41` 셸이 적용된다.
- 다음 예정: `docs/NEXT_UPDATE_v1.0.42.md`.

### 2026-07-27 — v1.0.39 / b24.39

- 작업 목표: 실제 Vite 빌드가 성공한 뒤 `verify:dist:v134`가 존재하지 않는 `dist/src/main.js`·`dist/src/style.css`를 강제해 실패한 CI 오탐을 수정하고, 남은 구형 dist 검증기의 소스 경로 의존성을 전수 확인한다.
- 주요 변경 파일: `scripts/lib/verify-dist-v134-foundation.mjs`, `scripts/verify-dist-v134.mjs`, `scripts/verify-dist-v135.mjs`, `scripts/verify-dist-v136.mjs`, `scripts/audit-dist-verifier-portability-v139.mjs`, `scripts/verify-release-v138.mjs`, `scripts/verify-dist-v138.mjs`, `scripts/verify-release-v139.mjs`, `scripts/verify-dist-v139.mjs`, 버전 파일, CI 워크플로, README와 v1.0.39 문서.
- 수정 내용: v1.0.34 배포 검증을 정적 fallback과 Vite emitted bundle 이중 모드로 분리했다. Vite 모드에서는 `dist/assets/**/*.js`와 `dist/assets/**/*.css`의 안정 마커·CSS 변수·터치 접근성 계약을 검사하며 `dist/src/**`를 요구하지 않는다. `DIST_DIR` 회귀 픽스처에는 소스 트리가 전혀 없으며 동일 검증을 통과해야 한다.
- 검증 명령: `npm run audit:dist-portability:v139`, `npm run verify:release:v138`, `npm run verify:release:v139`, `npm run build:static`, `npm run verify:dist:v117`부터 `npm run verify:dist:v139`까지, `npm run hygiene:check`.
- 검증 결과: 전체 누적 `npm run verify`와 모바일 HUD 14/14가 통과했다. 정적 fallback 배포와 `dist/src`가 전혀 없는 합성 Vite 배포 양쪽에서 v117~v139 전체 게이트가 연속 통과했다. 이 과정에서 v135·v136이 캐시 문자열 두 종류를 동시에 요구하던 추가 오탐도 발견해 단일 유효 표현만 있어도 통과하도록 수정했다. 깨끗한 v1.0.38 전체본에 29개 파일의 루트 직접 덮어쓰기 패치를 적용하고 기존 `dist/`를 삭제한 뒤 v139 릴리스·정적 빌드·v117~v139·루트 위생 검증을 재통과했다. 정리 패키지는 288,986,172바이트로 스테이징됐다.
- 예외사항: 현재 작업 환경에는 설치된 Vite 실행 의존성이 없어 GitHub-hosted 실제 번들을 직접 재생성하지 못한다. 제공된 CI 실패 구조와 Vite emitted 구조를 동일하게 재현하는 픽스처로 검증하며, GitHub Actions는 `npm ci && npm run build` 결과에 v139 게이트를 실행한다.
- 잔여 위험: 번들러 버전 변경으로 안정 문자열까지 제거되는 경우가 있으므로 신규 검증은 가능한 경우 파일 해시·공개 CSS 변수·실제 자산 참조를 우선 사용한다.
- 다음 예정: `docs/NEXT_UPDATE_v1.0.40.md`.


### 2026-07-27 — v1.0.38 / b24.38

- 작업 목표: 실제 Vite 빌드 뒤 `verify:dist:v123`이 제목 교정 런타임에 정상적으로 포함된 구 제목 문자열을 현재 노출 브랜딩으로 오인해 실패한 CI 오탐을 수정한다.
- 주요 변경 파일: `scripts/lib/verify-dist-presentation-surface.mjs`, `scripts/verify-dist-v123.mjs`, `scripts/verify-release-v137.mjs`, `scripts/verify-dist-v137.mjs`, `scripts/verify-release-v138.mjs`, `scripts/verify-dist-v138.mjs`, 버전·패키징·패치 스크립트, CI 워크플로, README와 v1.0.38 문서.
- 수정 내용: 구 제목 금지 검사를 전체 JS 번들이 아니라 실제 표시 표면인 `dist/index.html`과 `dist/manifest.webmanifest`로 제한한다. `DD-TITLE-PRESENTATION-V123` 교정 런타임은 구 문자열을 치환 키로 보존하며, 합성 회귀 픽스처에서 번들 내 구 문자열은 허용하고 HTML 노출은 거부한다.
- 검증 명령: `npm run verify:release:v137`, `npm run verify:release:v138`, `npm run build:static`, `npm run verify:dist:v123`, `npm run verify:dist:v124`, `npm run verify:dist:v135`, `npm run verify:dist:v136`, `npm run verify:dist:v137`, `npm run verify:dist:v138`, `npm run stage:package:v138`, `npm run verify:package:v138`, `npm run create:patch:v138`, `npm run verify:patch:v138`, `npm run hygiene:check`.
- 검증 결과: 전체 누적 `npm run verify`가 통과했고 모바일 HUD 14/14와 루트 위생 계약을 유지했다. 정적 fallback 배포에서 v1.0.17~v1.0.38 연속 검증을 진행하며 발견된 `v133` 고정 버전 오탐도 전진 호환 방식으로 수정했다. Vite 형태의 합성 `assets/game.js`에 `도깨비 운빨 수호대` 교정 문자열을 포함한 상태에서 `verify:dist:v123`, `v137`, `v138`이 모두 통과했다. 깨끗한 v1.0.37 전체본에 27개 파일의 직접 덮어쓰기 패치를 적용하고 기존 `dist/`를 삭제한 뒤 릴리스·정적 빌드·v123/v124/v133~v138·루트 위생 검사를 재통과했다. 정리 패키지는 288,957,049바이트로 스테이징됐다.
- 예외사항: 현재 작업 환경에는 설치된 Vite 실행 의존성이 없어 실제 GitHub-hosted Vite 빌드를 로컬에서 재실행하지 못한다. 제공된 CI 로그의 정확한 실패 조건을 합성 픽스처로 재현했으며, GitHub Actions에서 실제 `npm ci && npm run build` 결과를 `verify:dist:v138`까지 연속 검증한다.
- 잔여 위험: 과거 dist 검증기 중 전체 번들 문자열을 현재 UI 상태로 간주하는 스크립트가 더 있을 수 있어 v1.0.39에서 전수 감사한다.
- 다음 예정: `docs/NEXT_UPDATE_v1.0.39.md`.


### 2026-07-27 — v1.0.37 / b24.37

- 작업 목표: GitHub Actions의 실제 Vite 빌드는 성공했지만 `verify:dist:v123`이 소스 원본 경로를 `dist/index.html`에서 요구해 실패한 오탐을 수정하고, 뒤이어 실패할 동일 계열 검증을 선제 보완한다.
- 주요 변경 파일: `scripts/lib/verify-dist-asset-reference.mjs`, `scripts/verify-dist-v123.mjs`, `scripts/verify-dist-v124.mjs`, `scripts/verify-dist-v135.mjs`, `scripts/verify-dist-v136.mjs`, `scripts/verify-release-v137.mjs`, `scripts/verify-dist-v137.mjs`, 패키징·패치 스크립트, 버전 파일, CI 워크플로, README와 v1.0.37 문서.
- 수정 내용: 원본 마스코트와 배포 마스코트를 바이트 크기와 SHA-256으로 대조하고 실제 emitted 경로가 활성 HTML/CSS/JS에서 참조되는지 검사한다. 정적 fallback의 `dist/src/...`와 Vite의 `dist/assets/...`를 모두 허용한다.
- 검증 명령: `npm run verify:release:v137`, `npm run build:static`, `npm run verify:dist:v123`, `npm run verify:dist:v124`, `npm run verify:dist:v135`, `npm run verify:dist:v136`, `npm run verify:dist:v137`, `npm run stage:package:v137`, `npm run verify:package:v137`, `npm run create:patch:v137`, `npm run verify:patch:v137`, `npm run hygiene:check`.
- 검증 결과: 전체 누적 `npm run verify`와 루트 위생 검사를 통과했다. 정적 fallback 구조와 합성 Vite emitted 구조 모두에서 v1.0.23/v1.0.24 마스코트 해시·참조 검사, v1.0.35/v1.0.36 이중 배포 모드, v1.0.37 최종 배포 계약을 통과했다. 깨끗한 v1.0.36 통파일 복제본에 27개 변경 파일을 실제 덮어쓰고 기존 `dist/`를 삭제한 뒤 릴리스·정적 빌드·대상 dist 검증 5종·루트 위생 검사를 재통과했다. 정리 패키지는 288,934,890바이트로 스테이징됐다.
- 예외사항: 현재 작업 환경에는 npm 패키지 캐시가 없어 실제 `npm ci && npm run build`를 로컬 재현하지 못했다. 제공된 GitHub Actions 로그와 Vite 설정에 맞춰 emitted 경로 계약을 구현했고, CI에서 실제 Vite 결과를 `verify:dist:v137`로 재검증한다.
- 잔여 위험: 다른 과거 검증 스크립트가 미래 번들 구조 변경에 민감할 수 있으므로 신규 검증은 원본 URL 문자열 대신 파일 해시·마커·실제 참조를 사용해야 한다.
- 다음 예정: `docs/NEXT_UPDATE_v1.0.38.md`.


### 2026-07-27 — v1.0.36 / b24.36

- 작업 목표: 통파일 용량 증가 원인을 파일·폴더·해시 단위로 확인하고, 실제 실행 원본은 보존하면서 재생성 가능한 중복 산출물만 제거한다.
- 주요 변경 파일: `package.json`, `package-lock.json`, `README.md`, `PROJECT_HANDOFF.md`, 버전 파일 6종, `scripts/*v136*`, `docs/*v1.0.36*`, `.github/workflows/deploy.yml`.
- 정리 대상: `dist/` 생성 배포본, 로컬 `node_modules/`, `logs/README.md`를 제외한 생성 로그. 전체 통파일 패키징 단계에서 자동 제외한다.
- 보존 대상: `public/` 런타임 에셋, `production/` 제작·지식 데이터, `src/`, `scripts/`, `docs/`, 기존 승인·계보·패치 기준.
- 검증 명령: `npm run audit:storage:v136`, `npm run verify:release:v136`, `npm run stage:package:v136`, `npm run verify:package:v136`, `npm run build:static`, `npm run verify:dist:v136`, `npm run create:patch:v136`, `npm run verify:patch:v136`, `npm run hygiene:check`.
- 검증 결과: `public`→`dist` 경로·크기·SHA-256 일치 중복 1,965개 / 116,196,506바이트를 확인했다. 누적 릴리스 v1.0.12~v1.0.36, 모바일 UI 14/14, 100웨이브, 에셋 1,961개, 정적 배포, 루트 위생 검증을 통과했다. 정리 패키지는 288,905,605바이트로 스테이징되었고, 패치는 25개 변경·1개 생성 경로(`dist/`) 삭제로 검증됐다. 깨끗한 v1.0.35 복제본에 패치를 실제 적용한 뒤 릴리스·정적 빌드·dist·정리 패키지 검증을 모두 재통과했다.
- 예외사항: `dist/`는 배포가 필요할 때 다시 생성하므로 통파일에는 포함하지 않는다. `production/`은 게임 런타임 직접 참조 여부와 별개로 제작·검증 이력에 사용되므로 이번 정리에서 삭제하지 않는다.
- 잔여 위험: 구버전 원화·아틀라스의 동적 경로 참조는 단순 문자열 검색만으로 완전히 판정할 수 없어, 다음 업데이트에서 매니페스트 인식형 도달성 감사를 진행한다.
- 다음 예정: `docs/NEXT_UPDATE_v1.0.37.md`.

### 2026-07-27 — v1.0.35 / b24.35

- 작업 목표: 시스템·성능·기술·기능·엔진·오류·예외·에셋·UI 겹침을 항목별 감사하고 실제 재현 결함을 수정한다.
- 주요 변경 파일:
  - `src/runtime-lifecycle.js`, `src/main.js`
  - `src/runtime/mobile-hud-director-v23.js`
  - `src/runtime/boss-identity-assurance-director-v133.js`
  - `src/style.css`, `index.html`
  - `public/sw.js`, `public/assets/system-v135/runtime-module-shell-v135.json`
  - `scripts/generate-runtime-shell-v135.mjs`, `scripts/simulate-mobile-hud-v23.mjs`
  - `scripts/audit-build-toolchain-v135.mjs`, `scripts/verify-release-v133.mjs`
  - `scripts/verify-release-v135.mjs`, `scripts/verify-dist-v135.mjs`
  - `scripts/create-patch-v135.mjs`, `scripts/verify-patch-v135.mjs`
  - `README.md`, `PROJECT_HANDOFF.md`, `docs/*v1.0.35*`, `docs/NEXT_UPDATE_v1.0.36.md`
  - `.github/workflows/deploy.yml`의 v1.0.34·v1.0.35 정적 배포 게이트
- 검증 명령: `npm run audit:toolchain:v135`, `npm run verify`, `npm run verify:release:v135`, `npm run build:static`, `npm run verify:dist:v134`, `npm run verify:dist:v135`, `npm run create:patch:v135`, `npm run verify:patch:v135`, `npm run hygiene:check`.
- 검증 결과: 누적 검증 v1.0.12~v1.0.35 통과, 모바일 UI 14/14, 100웨이브 자원 상한, 런타임 모듈 110개 해시, 에셋 1,961개 무결성·SVG·승인 경계, v1.0.34 호환, 정적 배포 v1.0.34·v1.0.35, 루트 위생 검증 통과. 패치 44개 변경·삭제 0개이며, 깨끗한 v1.0.34 복제본에 실제 덮어쓴 뒤 동일 릴리스·빌드·배포 검증을 재통과했다.
- 예외사항: 전달된 `node_modules/vite`는 필수 파일이 없는 불완전 설치다. 로컬 정적 배포 검증은 통과했으며, GitHub Actions에서는 `npm ci` 후 실제 Vite 빌드와 프로덕션 번들 검증을 강제한다.
- 잔여 위험: 실제 브라우저의 GPU 메모리 수치와 iOS Safari 장시간 백그라운드 복귀는 정적·합성 검사만으로 완전 재현할 수 없어 실기기 자동화가 계속 필요하다.
- 다음 예정: `docs/NEXT_UPDATE_v1.0.36.md`.

### 2026-07-27 — v1.0.34 / b24.34

- 작업 목표: v1.0.33 터치 HUD 핫픽스를 정식 인수인계 상태로 승격하고 동적 마운트·가상 키보드·노치·터치 접근성 회귀를 차단한다.
- 검증 결과: 모바일 화면 프로필 10/10, 릴리스·정적 배포·패치·위생 검증 통과.
- 잔여 위험: 실제 iOS Safari/Android Chrome의 `visualViewport` 차이.
- 다음 예정: `docs/NEXT_UPDATE_v1.0.35.md`.

## 보존된 릴리스 기반

v1.0.12 크로스 플랫폼 기반, v1.0.17 승인 경계, v1.0.20 주인공 11방향 적용, v1.0.29 파생 아틀라스, v1.0.31 에셋 계보 감사, v1.0.32 실루엣 검증, v1.0.33 보스 식별 검증, v1.0.34 모바일 HUD 복구를 유지한다.

### 2026-07-27 — v1.0.40 / b24.40

- 작업 목표: 실제 Vite 빌드가 `public/assets/ip-v13/sheets`의 감사 전용 원본 10개를 `dist`로 복사해 `verify:dist:v135`가 실패한 문제를 근본 수정한다.
- 주요 변경 파일: `scripts/generate-asset-sheets-v13.py`, `scripts/clean-obsolete-assets.mjs`, `scripts/verify-v1300.mjs`, `scripts/verify-audit-asset-boundary-v140.mjs`, `scripts/verify-release-v140.mjs`, `scripts/verify-dist-v140.mjs`, `scripts/verify-dist-chain-v140.mjs`, 버전 파일, CI 워크플로, README와 v1.0.40 문서.
- 수정 내용: 원본 시트 10개를 `production/DokkaebiDefense/15_Source_Archives/ip-v13/sheets`로 이동했다. 런타임 크롭 415개는 기존 공개 경로에 유지한다. 붙여넣기 패치 후 남은 구 공개 폴더는 `preverify`·`prebuild`의 `clean:obsolete`가 자동 삭제한다.
- 검증 결과: 전체 누적 `npm run verify`, 모바일 HUD 14/14, 원본 시트 10개와 매니페스트 SHA-256, 크롭 415개, 루트 위생 검사를 통과했다. 정적 배포에서 v117~v140 총 23개 게이트가 연속 통과했다. 깨끗한 v1.0.39 복제본에 48개 파일을 루트 직접 덮어쓴 뒤 `clean:obsolete`가 구 `public/assets/ip-v13/sheets`를 삭제했으며, 런타임 셸·v140 릴리스·정적 빌드·전체 dist 체인을 재통과했다.
- 예외사항: 직접 파일 붙여넣기만 하고 npm 명령을 한 번도 실행하지 않으면 이전 공개 시트 폴더가 디스크에 남을 수 있다. CI·검증·빌드는 시작 전에 자동 제거한다.
- 잔여 위험: 다른 제작 원본이 `public` 아래에 남아 있을 가능성은 v1.0.41 도달성 감사에서 분류한다.
- 다음 예정: `docs/NEXT_UPDATE_v1.0.41.md`.
### 2026-07-28 — v1.0.45 CI patch-metadata hygiene hotfix
- GitHub Actions failure reproduced: root `APPLY_KO.txt` survived the v1.0.44 overlay and failed `verify-root-hygiene.mjs`.
- `root-output-policy.mjs` now migrates localized apply guides before hygiene; the v1.0.1 migration fixture covers `APPLY_KO.txt`.
- v1.0.45 patch metadata is separated from `overlay/`, and `verify-patch-v145.mjs` rejects metadata leakage.
- QA artifact uploads moved from `actions/upload-artifact@v4` to `@v7`; missing optional QA folders are ignored after earlier gate failures.



## 2026-07-28 — v1.0.46 / b24.46

- Added real-device viewport trace replay for iOS standalone resume, Android browser chrome collapse, and virtual keyboard cycles.
- Added two-cache service-worker upgrade simulation and activation evidence while preserving client save namespaces.
- Added deterministic combat-load observation windows at waves 10, 25, 50, 75, and 100.
- Added machine-readable first-regression digests and an honest provisional Vite dist measurement promotion boundary.

## 2026-07-28 — v1.0.46 v144 모바일 매트릭스 핫픽스

- 세로 HUD의 legacy 78px 소환 버튼 폭이 63px grid track을 넘던 문제를 `width:100%!important`로 수정했다.
- cross-platform shell의 `!important` 우측 고정이 왼손 배치를 무효화하던 문제를 action dock/joystick 명시적 반전 규칙으로 수정했다.
- Chromium mobile emulation에서 무시되던 150% page scale을 좁은 desktop page-scale + touch emulation으로 재현하도록 변경했다.
- v144 실패 로그에 실패 체크명과 viewport/control geometry를 기록하고 `verify:matrix-contract:v144` 회귀 계약을 추가했다.
- 런타임 shell v135 해시를 새 `src/style.css` 기준으로 재생성했으며 전체 `verify:ci`가 통과했다.


## 2026-07-29 — v1.0.47 / b24.47

- Added controlled offline launch and mid-wave reconnect browser scenarios.
- Added 600-case save-schema byte-preservation fuzzing across v1.0.42–v1.0.46.
- Added identifier-stripping trace ingestion with source digest and approval provenance.
- Added compact pass evidence and full failed-report retention.
- Added exact v1.0.45 Vite baseline promotion tooling; the supplied packages did not contain the candidate artifact, so the approved v1.0.44 envelope remains active without fabricated values.
- Next: `docs/NEXT_UPDATE_v1.0.48.md`.


## 2026-07-29 — v1.0.48 / b24.48

- 작업 목표: 시스템, 성능, 기술, 기능, 엔진, 오류, 버그, 예외사항을 전면 감사하고 저장소 차단·장시간 오류 누적·백그라운드 비용 문제를 실제 코드에서 수정한다.
- 주요 수정: `SafeStorageV148`, `RuntimeHealthAssuranceV148`, 백그라운드 프레임 조기 중단, 소스/import/package-script/성능 예산 종합 감사.
- 고정 전달 규칙: 이후 모든 결과는 **1. 작업한 내역, 2. 전체 ZIP 및 direct-overlay 패치 ZIP, 3. 다음 예정 내역** 순서로 제공한다. `docs/DELIVERY_RESULT_RULE.md`가 단일 기준이다.
- 검증 명령: `npm run verify:release:v148`, `npm run verify:ci`, `npm run stage:package:v148`, `npm run verify:package:v148`, `npm run create:patch:v148`, `npm run verify:patch:v148`.
- 잔여 위험: `src/main.js` 책임 분리와 실제 Vite/브라우저 성능 기준선 승격은 v1.0.49에서 계속한다.
- 다음 예정: `docs/NEXT_UPDATE_v1.0.49.md`.
## v1.0.48 Identity Synchronization Hotfix

- 부분 적용으로 package/runtime 버전이 갈라지는 문제를 차단합니다.
- `npm run verify:identity:v148`가 package, lock, main, policy, HTML, service worker, public version을 비교합니다.
- `preverify`와 `prebuild`에서 본 검증보다 먼저 실행됩니다.


## 2026-07-29 — v1.0.49 / b24.49

- 작업 목표: 버전 식별자를 package 단일 기준으로 생성하고, 저장·복구·결과·QA 노출 책임을 `src/main.js`에서 분리하며, 부분 패치와 빌드 입력 차이를 해시로 차단한다.
- 주요 변경: generated release identity, transactional persistence queue/journal, user recovery state, run-state coordinator, pure result presenter, production QA exposure policy, sorted build-input SHA-256 manifest.
- 누적 결함 수정: v1.0.45 성능 범위의 forward-module 오판, package-lock top-level metadata 미갱신, v1.0.48 감사기의 고정 버전/SW 문자열 의존을 수정했다.
- 부분 적용 대응: v1.0.46 이상 혼합 상태에 직접 덮어쓸 cumulative patch를 제공하며, CI는 npm 설치 전에 identity generator를 실행한다. generator는 package가 1.0.49가 아니면 적용 누락을 명확히 실패시킨다.
- 검증: 전체 누적 소스 체인(도구 시간 상한 이후 후반 게이트 연속 완료), 모바일 HUD 14/14, 600-case 저장 퍼징, v1.0.45~v1.0.49 릴리스 계약, clean package staging, patch hash/application 검증.
- 예외사항: 현재 실행 환경에는 Vite 8.1.5가 없어 실제 Vite dist와 Chromium feature-exposure 시나리오는 GitHub Actions 필수 게이트로 남긴다.
- 다음 예정: `docs/NEXT_UPDATE_v1.0.50.md`.

## Repository-root repair revision

The repaired delivery is archive-root flat, removes stale root patch metadata, deletes any legacy root `overlay/` without merging it, and adds `verify:repo-root:v151` to stop nested or stale repository layouts before verification.


## v1.0.51 R4 CI long-session repair

A complete GitHub Actions Vite build reached `verify-dist-v146` and exposed two issues that static/local packaging verification could not see: repeated optional character-presentation update exceptions under SwiftShader and a stale QA assumption that at least three of waves 10/25/50/75/100 were campaign boss waves. R4 adds per-record presentation fail-open behavior, a QA-only deterministic boss load profile (`tiger`, `serpent`, `king`, `tiger`, `king`), and detailed runtime error reporting. The normal campaign boss table remains 4/7/10.

## v1.0.51 R5 CI source revision guard

The R5 repair does not relax v1.0.46 long-session thresholds. It prevents stale pre-R4 source from reaching the five-minute browser gate. A valid run prints `DD-V151-LONG-SESSION-R5`, repair revision 5, and the current runner SHA-256.

## v1.0.51 R6 enemy material lifecycle repair

The R5 GitHub Actions run proved that the current source was executing and exposed the exact remaining exception: `source=enemies`, wave 10, `Cannot read properties of null (reading 'material')`. The affected path was the release-critical enemy emissive update, not the optional character-presentation fail-open layer.

R6 adds `src/runtime/enemy-body-material-v151.js`. Imported and procedural enemies resolve a primary renderable before combat presentation attaches. Resolution accepts common node-name variants and falls back to the first mesh with a usable material. Material arrays are handled as a set. The enemy update, boss stagger, boss phase transition, hit flash, and pool reset paths no longer directly access `enemy.group.userData.body.material`.

A valid R6 run prints `DD-V151-ENEMY-MATERIAL-R6`, repair revision 6, and the signed runner SHA-256 before the browser assurance chain. The v1.0.46 gate still requires zero runtime errors.

## 2026-07-31 — v1.0.52 CI HOTFIX R2

- 보고된 CI 실패: 실제 Vite build와 v1.0.17~v1.0.45 dist 검증 통과 후 `verify-dist-v146.mjs`가 `verify-ci-source-revision-v151.mjs`를 중복 실행하여 현재 `1.0.52/b24.52` 정체성을 거부했다.
- 원인: complete dist chain의 활성 v1.0.52 preflight와 별개로 역사 v146 게이트 내부에 v1.0.51 R6 패키지 정체성 검사가 하드코딩되어 있었다.
- 수정 파일: `scripts/verify-dist-v146.mjs`, `scripts/verify-release-v152.mjs`, `scripts/generate-ci-source-revision-v152.mjs`, v1.0.52 패키징·문서 파일.
- 수정 방식: v146 기능·브라우저·장시간 세션 계약은 유지하고 내부 소스 preflight만 활성 v1.0.52 서명으로 교체했다. 활성 dist 체인에 v1.0.51 verifier가 재도입되면 릴리스 게이트가 실패한다.
- 패치 구조: R2 ZIP은 프로젝트 경로만 직접 포함한다. `overlay/` wrapper와 ZIP 내부 패치 메타데이터를 제거했으며, 모든 패치 파일은 R2 전체본의 동일 경로·동일 SHA-256이어야 한다.
- 필수 CI 확인: `npm ci`, `npm run verify:ci`, `VITE_BASE_PATH=/Defense/ npm run build`, `npm run verify:dist:all`.
- 다음 예정: v1.0.53 WebGL GPU 계측·context loss/disjoint 브라우저 행렬·모바일 화면 증거.



## 2026-07-31 — v1.0.52 CI HOTFIX R3

- 보고된 CI 실패: v146 전체 브라우저 보증 통과 후 v147 오프라인/재접속 브라우저 러너의 `Runtime.evaluate`가 120초 뒤 타임아웃됐다.
- 원인: v147 러너가 종료 보장이 없는 `navigator.serviceWorker.ready`를 직접 기다렸고, v146 러너에 있던 `--disable-background-timer-throttling`, `--disable-backgrounding-occluded-windows`, `--disable-renderer-backgrounding` 플래그가 누락됐다. 장기 세션 준비와 웨이브 진행도 한 개의 라벨 없는 CDP 평가로 묶여 정확한 정지 구간을 알 수 없었다.
- 수정 파일: `scripts/run-offline-reconnect-v147.mjs`, `scripts/verify-release-v147.mjs`, `scripts/verify-release-v152.mjs`, `scripts/generate-ci-source-revision-v152.mjs`, `scripts/v152-patch-files.mjs`, v1.0.52 문서와 생성 서명.
- 수정 방식: 서비스 워커 활성화를 `getRegistration()` 기반 45초 제한 폴링으로 변경하고, 각 탐색·부트·오프라인 전환·세션 준비·웨이브 진행을 독립된 라벨 단계로 분리했다. 브라우저 소켓 종료 시 대기 명령을 즉시 실패시키며, HTTP 서버 종료도 제한 시간 후 강제 연결 정리한다.
- 회귀 방지: v147 릴리스 게이트와 v1.0.52 릴리스 게이트가 스로틀 방지 플래그, 제한 시간 환경변수, `failedPhase`, `diagnostics.steps`, 무제한 `serviceWorker.ready` 제거를 검사한다. v1.0.52 CI source manifest는 관련 파일을 추가 서명한다.
- 로컬 검증: JavaScript 구문, v147 릴리스 계약, v1.0.52 릴리스 계약, 소스 서명 생성·검사, 브라우저 실패 단계 보고를 확인했다. 현재 실행 환경의 Chromium은 loopback HTTP를 `ERR_BLOCKED_BY_ADMINISTRATOR`로 차단했으며, 새 보고서가 `warm-navigation`을 정확히 기록하는 것을 확인했다. 실제 오프라인 성공 시나리오는 GitHub Actions에서 재확인한다.
- 다음 예정: R3 적용 후 `npm run verify:dist:all`에서 v147을 통과하고 v148~v152 후속 게이트가 실행되는지 확인한다.

## 2026-07-31 — v1.0.52 CI HOTFIX R4

- 보고된 CI 실패: R3가 타임아웃 단계를 정확히 노출한 뒤 v147에서 서비스 워커가 45초 동안 `installing` 상태에 머물렀다. 진단값은 `updateFound=true`, `installing=installing`, `active=''`였다.
- 근본 원인: `public/sw.js` 설치 이벤트가 역사적 소스 무결성 목록까지 `SHELL_ASSETS`로 처리해 169개 fetch/cache 작업을 동시에 시작했다. 21개는 중복이고 대부분은 complete Vite dist에 존재하지 않는 `./src/...` 경로였다. 각 fetch와 Cache Storage 쓰기에 제한 시간이 없어 하나만 지연돼도 install event가 끝나지 않았다.
- 수정 파일: `public/sw.js`, `scripts/run-offline-reconnect-v147.mjs`, `scripts/verify-service-worker-install-v152.mjs`, `scripts/verify-release-v147.mjs`, `scripts/verify-release-v152.mjs`, CI 서명·패키징·문서 파일.
- 수정 방식: 실제 배포 셸 11개만 `INSTALL_SHELL_ASSETS`로 설치 캐시한다. `assets/game.js`와 `assets/game.css`를 포함하고 `./src/...`는 설치 목록에서 제외한다. 동시 캐시 작업은 4개, 요청별 제한은 12초이며 실패 시 install을 명확히 거부한다. 역사적 `GENERATED_MODULE_SHELL_V135`는 해시 무결성 장부로 보존한다.
- 진단 강화: 설치 작업은 `DOKKAEBI_GET_INSTALL_STATUS` 메시지로 phase, total, completed, failed, current, failures를 반환한다. v147 러너는 활성화 대기 중 이 상태를 수집한다.
- 회귀 방지: 새 검증기는 성공 설치에서 정확히 11개 경로만 fetch/cache되고 동시성이 4 이하임을 시뮬레이션한다. 한 자산이 무한 대기하는 경우 60ms 테스트 제한으로 install이 실패하고 실패 경로가 보고되는지 검증한다. 실제 런타임 값은 12초다.
- 로컬 검증: v1.0.15 lightweight install 계약, v1.0.35 source-shell 무결성, v1.0.47 릴리스 계약, v1.0.52 bounded install 시뮬레이션과 릴리스 계약을 통과한다. 실제 GitHub Chromium 오프라인 성공 경로는 R4 Actions에서 최종 확인한다.
- 다음 예정: R4 적용 후 v147 browser assurance 통과와 v148~v152 dist 체인 완료 확인.


## 2026-07-31 — v1.0.52 CI HOTFIX R5

- 버전/빌드: `v1.0.52 / b24.52`, repair revision R5. 게임 콘텐츠 버전과 캐시 정체성은 변경하지 않는다.
- 작업 목표: R4 GitHub Actions에서 오프라인 부트와 mid-wave reconnect가 성공한 뒤 `saveContinuity:false`만 남은 원인을 분리하고, 실제 플레이어 저장 손실만 차단하는 검증으로 교체한다.
- 근본 원인: `scripts/run-offline-reconnect-v147.mjs`가 모든 `dokkaebi-*` localStorage 항목을 원문 문자열로 비교했다. `dokkaebi-browser-reliability-v19`는 부트마다 `generatedAt`/이벤트/표본을 갱신하고 `dokkaebi-wave-checkpoint-v18`은 heartbeat `savedAt`을 갱신하므로 정상 reload도 불일치했다. 로그의 다른 오프라인·재접속 검사는 모두 통과했으므로 실제 사용자 저장 손실 증거는 없었다.
- 변경 파일: `scripts/save-continuity-v147.mjs` 신규, `scripts/offline-reconnect-model-v147.mjs`, `scripts/verify-offline-reconnect-v147.mjs`, `scripts/run-offline-reconnect-v147.mjs`, `scripts/verify-release-v147.mjs`, `scripts/verify-release-v152.mjs`, CI source manifest 생성기, v1.0.52 패키징·패치 도구, README와 v1.0.52 문서.
- 수정 방식: durable namespace와 volatile namespace를 명시적으로 분리한다. durable에는 모드·직업·조작·HUD·점수·영구 성장·장비·숙련·도감·수호 회의·검토 결정·atomic recovery snapshot을 포함한다. browser reliability, wave checkpoint, persistence journal은 fingerprint 진단만 남기고 strict equality에서 제외한다. 브라우저 러너는 유효한 `guardian/warrior/daily` sentinel을 심고 reload 뒤 보존을 요구한다.
- 검증 명령/결과: `node scripts/verify-offline-reconnect-v147.mjs` PASS, `node scripts/verify-release-v147.mjs` PASS, JavaScript syntax PASS. 진단 키만 바뀌는 fixture PASS, `dokkaebi-guardian-growth-v1`/직업 변경 fixture FAIL 예상 확인. 로컬 실제 Chromium 실행은 환경 정책의 `warm-navigation: ERR_BLOCKED_BY_ADMINISTRATOR`로 차단되며 실패 단계 진단은 정상이다.
- 패키징 규칙: R5 전체본은 `dist`, `node_modules`, `.git`, 생성 로그를 제외한다. R5 패치는 ZIP 루트가 프로젝트 루트인 direct project-root 구조이며 wrapper/metadata 엔트리를 금지한다. 패치의 모든 파일은 R5 전체본 동일 경로와 SHA-256이 같아야 하며 R4 적용 결과가 R5 전체본과 정확히 일치해야 한다.
- 잔여 위험: 실제 GitHub Actions Chromium에서 v147이 최종 통과하는지는 CI 재실행이 필요하다. 새 실패가 발생하면 `saveDiff`가 실제 변경 키를 제공하므로 진단 범위가 제한된다. 런타임 게임 저장 코드 자체는 이번 R5에서 변경하지 않았다.
- 다음 예정: R5 적용 후 `npm run verify:dist:all`의 v147 통과 및 v148~v152 완료 확인. 이후 `docs/NEXT_UPDATE_v1.0.53.md`의 WebGL GPU/context-loss/mobile evidence 작업으로 이동한다.


## 2026-07-31 — v1.0.52 CI HOTFIX R6

- 버전/빌드: `v1.0.52 / b24.52`, repair revision R6. 게임 콘텐츠와 캐시 정체성은 변경하지 않는다.
- 보고된 CI 상태: v147 오프라인 부트·재접속·durable save continuity가 모두 통과한 뒤 v148이 `DD-RUNTIME-HEALTH-ASSURANCE-V148`를 `assets/game.js`에서 찾지 못해 중단됐다.
- 근본 원인: Vite 엔트리 `src/bootstrap.js`가 `src/main.js`를 동적 import한다. 따라서 `assets/game.js`는 부트스트랩이고 v148-v152 런타임은 `assets/chunks/main-*.js` 등 도달 가능한 chunk에 배치된다. 역사 dist verifier가 단일 파일만 검사했다.
- 변경 파일: `scripts/lib/dist-bundle-markers.mjs` 신규, `scripts/verify-dist-bundle-markers-v152.mjs` 신규, `scripts/verify-dist-v148.mjs`~`verify-dist-v152.mjs`, `scripts/verify-release-v152.mjs`, CI source manifest 생성기, 패키징·패치 도구, README와 v1.0.52 문서.
- 수정 방식: `assets/game.js`에서 시작해 emitted JavaScript 문자열 참조를 재귀적으로 해석한다. 상대 경로와 `/Defense/` base path를 지원하고 실제 dist 내부에 존재하는 JS만 순회한다. 고아 chunk는 인정하지 않는다. v151 SVG 금지 검사도 도달 가능한 전체 번들에 적용한다.
- 선제 수정: v149와 v150의 고정 버전 허용 목록을 전진 호환 revision 계약으로 교체했다. v149 책임 분리 검증은 v150 원자 finish-run commit을 인정하고, v1.0.49 소스 예산은 상한을 유지한 채 승인된 v150-v152 태그 모듈만 분리한다.
- 검증 명령/결과: `node scripts/verify-dist-bundle-markers-v152.mjs` PASS. 동적 main chunk와 `/Defense/` absolute chunk는 도달했고 고아 chunk marker는 거부됐다. 합성 complete dist에서 v148, v149, v150, v151, v152 게이트를 실행했으며 모두 도달 가능한 chunk 마커를 인식했다. v149 scoped source 1,664,833바이트, 제외된 v150-v152 모듈 62,708바이트로 기존 1,700,000 상한을 통과했다. 실제 Vite build는 로컬 의존성 부재로 실행하지 않았으며 GitHub Actions에서 최종 검증한다.
- 패키징 규칙: R6 전체본은 `dist`, `node_modules`, `.git`, 생성 로그를 제외한다. R6 패치는 ZIP 루트가 프로젝트 루트이며 wrapper/metadata 엔트리를 금지한다. R5 전체본에 R6 패치를 적용한 결과가 R6 전체본과 정확히 같아야 한다.
- 잔여 위험: 번들러가 미래에 JS 참조를 문자열이 아닌 다른 manifest 구조로 바꾸면 helper 확장이 필요하다. 현재 Vite 8 emitted dynamic import 구조는 fixture로 고정한다.
- 다음 예정: R6 적용 후 `verify:dist:all`의 v148-v152 연속 통과 확인. 이후 `docs/NEXT_UPDATE_v1.0.53.md`의 WebGL GPU/context-loss/mobile evidence 작업으로 이동한다.


## 2026-07-31 — v1.0.52 CI HOTFIX R7

- 버전/빌드: `v1.0.52 / b24.52`, repair revision R7. 게임 콘텐츠와 캐시 정체성은 변경하지 않는다.
- 보고된 CI 상태: v147과 v148은 통과했고 v149 production-default 브라우저 시나리오에서 `testApi:true`로 중단됐다.
- 근본 원인: `resolveFeatureExposureV149`는 production에서도 `localhost`, `127.0.0.1`, `::1`을 자동 QA 허용했지만 `run-feature-exposure-v149.mjs`는 127.0.0.1 기본 URL에서 QA API가 없어야 한다고 검사했다.
- 수정 방식: production은 호스트와 무관하게 explicit QA query 또는 build-time explicit QA가 있어야만 QA API를 노출한다. development mode는 계속 허용한다. v144~v147 브라우저 자동화는 이미 모두 명시적 `?qa=` 쿼리를 사용한다.
- 진단 보강: v149 보고서는 `#boot-error`가 실제 visible일 때만 오류 텍스트를 기록하고, Chromium foreground scheduling 플래그를 적용한다.
- 검증 범위: feature exposure 단위 계약, 모든 QA 브라우저 URL의 explicit token, v1.0.49/v1.0.52 릴리스 게이트, 전체 JS 구문·모듈·코드 무결성, R6→R7 직접 패치 적용 동일성.
- 패키징 규칙: R7 전체본은 `dist`, `node_modules`, `.git`, 생성 로그를 제외한다. R7 패치는 ZIP 루트가 프로젝트 루트이며 wrapper/metadata 엔트리를 금지한다.
- 잔여 위험: 실제 Vite Chromium v149 success path는 GitHub Actions 재실행으로 최종 확인한다.
