> 현재 개선 패치: **v1.0.34 / b24.34** — MOBILE HUD RESILIENCE & HANDOFF CONTRACT

# PROJECT HANDOFF — RELEASE 1.0.34

- Project: `DokkaebiLuckDefense3D_FULL_v1.0.34_MOBILE_HUD_RESILIENCE_VERIFIED`
- Public game version: `1.0.34`
- Lineage version: `23.2.0`
- Build ID: `b24.34`
- Base: `v1.0.33 / b24.33`

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
npm run verify
npm run build:static
npm run verify:dist:v134
npm run create:patch:v134
npm run verify:patch:v134
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

## v1.0.34 Mobile HUD Resilience

- `DD-MOBILE-HUD-RESILIENCE-V134` 런타임 마커를 추가한다.
- 모바일 HUD 동적 DOM 재탐색과 관찰 대상 재연결을 지원한다.
- 가상 뷰포트 오프셋·가상 키보드 영역을 컨트롤 및 문맥 레인 위치에 반영한다.
- 비상 레이아웃 해제에 3프레임 안정 구간을 요구한다.
- 문맥 패널 숨김 상태의 접근성 속성을 원복 가능하게 관리한다.
- 주요 전투 버튼의 터치 높이와 포커스 표시를 보강한다.

## 인수인계 내역

### 2026-07-27 — v1.0.34 / b24.34

- 작업 목표: v1.0.33 터치 HUD 핫픽스를 정식 인수인계 상태로 승격하고 동적 마운트·가상 키보드·노치·터치 접근성 회귀를 차단한다.
- 주요 변경 파일:
  - `src/runtime/mobile-hud-director-v23.js`
  - `src/style.css`
  - `scripts/simulate-mobile-hud-v23.mjs`
  - `scripts/verify-release-v134.mjs`
  - `scripts/verify-dist-v134.mjs`
  - `scripts/create-patch-v134.mjs`
  - `scripts/verify-patch-v134.mjs`
  - `README.md`, `PROJECT_HANDOFF.md`, `docs/*v1.0.34*`, `docs/NEXT_UPDATE_v1.0.35.md`
- 검증 결과: 모바일 화면 프로필 10/10 통과. 전체 검증 체인은 실행 제한을 피하기 위해 동일 구성 명령을 구간별로 실행했으며 모든 구간 통과. `build:static`, `verify:dist:v134`, `create:patch:v134`, `verify:patch:v134`, `hygiene:check` 통과. v1.0.33 복제본에 패치 덮어쓰기 후 v1.0.34 릴리스·dist·위생 검증 통과.
- 잔여 위험: 실제 iOS Safari/Android Chrome 실기기의 브라우저별 `visualViewport` 고정 위치 차이는 실기기 회귀 검사가 계속 필요하다.
- 다음 예정: `docs/NEXT_UPDATE_v1.0.35.md`.

## 보존된 릴리스 기반

v1.0.12 크로스 플랫폼 기반, v1.0.17 승인 경계, v1.0.20 주인공 11방향 적용, v1.0.29 파생 아틀라스, v1.0.31 에셋 계보 감사, v1.0.32 실루엣 검증, v1.0.33 보스 식별 검증을 유지한다.
