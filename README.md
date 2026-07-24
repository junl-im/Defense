> v23.1.0 Native Input Shell: 브라우저 기본 키를 보존하고 PC 타이틀을 좌우 분리했습니다.

# Dokkaebi Luck Defense 3D

## v23.1.0 입력·타이틀 원칙

- F1~F12 브라우저 기본 동작 보존
- 게임 전역 액션 단축키 없음
- PC 키보드 이동은 WASD·방향키만 지원
- PC 타이틀: 마스코트 좌측, 접속 패널 우측
- 모바일 타이틀: 중앙형 흐름 유지

## 현재 버전

- 게임: **23.1.0**
- 엔진: **21.0.0**
- 세이브 스키마: **21**
- 기준 버전: **v23.0.1 Boot Recovery**
- 구조 계약: **Project Structure Rules v1.0**

## 프로젝트 기본 골격

```text
/
├─ src/          게임 소스
├─ public/       공개 런타임 에셋과 서비스 워커
├─ production/   제작 데이터와 마스터 목록
├─ scripts/      생성·검증·패키징 스크립트
├─ docs/         정식 문서와 승인된 기준선
├─ logs/         검증·빌드·시뮬레이션·감사 생성 결과
├─ dist/         정적 배포 결과
├─ README.md
└─ PROJECT_HANDOFF.md
```

### 영구 규칙

- 루트에 임의의 로그, 감사 JSON, 시뮬레이션 JSON, 미리보기 이미지, ZIP을 만들지 않습니다.
- 검증과 빌드 결과는 `logs/verify/`, `logs/build/`에 기록합니다.
- 시뮬레이션과 자동 감사는 `logs/simulations/`, `logs/audits/`에 기록합니다.
- 패치 관리 파일은 `logs/patch/<version>/`에만 둡니다.
- `docs/` 기준선은 `--refresh-baseline`을 명시한 경우에만 갱신합니다.
- 새 루트 파일이나 디렉터리가 생기면 `npm run hygiene:check`가 실패합니다.

상세 규칙: `docs/PROJECT_STRUCTURE_RULES_v1.0.md`

## 자주 사용하는 명령

```bash
npm run hygiene:check
npm run hygiene:organize
npm run verify:logged
npm run build:logged
```

일반 검증:

```bash
npm run verify
npm run simulate:v2300
npm run simulate:v2200
npm run simulate:v1800
npm run build:static
node scripts/verify-static-dist.mjs
```

시뮬레이션 기준선을 의도적으로 갱신할 때만:

```bash
node scripts/simulate-mobile-hud-v23.mjs --refresh-baseline
node scripts/simulate-autonomous-moonfront-v22.mjs --refresh-baseline
node scripts/simulate-ten-wave-run-v18.mjs --refresh-baseline
```

## 현재 제작 상태

- 런타임 수직 슬라이스: **6/6**
- 10웨이브 상태 시뮬레이션: **10/10**
- 전투 GLB: **19종**
- v13 개별 스프라이트: **415개**
- v15 런타임 아틀라스: **154프레임**
- 최종 제작 아트: **0/6**
- 1,130개 대량 생산: **잠금 유지**

Absolute Art Bible v2.0과 Character DNA v3.0은 최상위 제작 계약입니다. 기존 후보 GLB와 자동 처리 2D 자산은 최종 제작 아트로 승인하지 않습니다.
