> 현재 개선 패치: **v1.0.35 / b24.35** — RUNTIME STABILITY & RELEASE INTEGRITY

# PROJECT HANDOFF — RELEASE 1.0.35

- Project: `DokkaebiLuckDefense3D_FULL_v1.0.35_RUNTIME_STABILITY_VERIFIED`
- Public game version: `1.0.35`
- Lineage version: `23.3.0`
- Build ID: `b24.35`
- Base: `v1.0.34 / b24.34`

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
npm run audit:toolchain:v135
npm run verify
npm run verify:release:v135
npm run build:static
npm run verify:dist:v135
npm run create:patch:v135
npm run verify:patch:v135
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
