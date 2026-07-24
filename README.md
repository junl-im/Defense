# Dokkaebi Luck Defense 3D

## 현재 공개 버전

- 게임: **1.0.11**
- 내부 개발 계보: **23.1.0**
- 빌드 ID: **b24.11**
- 엔진: **21.0.0**
- 세이브 스키마: **21**
- 패치: **IP Knowledge Megaforge v4**

## 이번 업데이트

도깨비 디펜스의 실제 그래픽 제작을 단계적으로 확대할 수 있도록 초초대규모 IP 지식 자산 메가베이스를 추가했습니다.

- 베이스 IP 자산: **8,192개**
- 11방향 액션 레코드: **89,232개**
- 수호성·타워 상태 액션: **10,560개**
- PC·모바일 HUD 계약: **480개**
- 10웨이브 비주얼 QA: **5,040개**
- 장시간 성능 회귀 프로필: **960개**
- IP 관계 그래프: **32,768개**
- **총 지식 레코드: 147,232개**

브라우저 검토 화면: `public/ip-mega-library-v4.html`

상세 제작 규격: `docs/IP_KNOWLEDGE_MEGAFORGE_v4.0.0.md`

## 상태 구분

이번 업데이트는 제작용 지식, 프롬프트, 기술 계약을 생성했습니다. 최종 원화·스프라이트·GLB가 자동 승인된 것은 아닙니다.

- 지식 상태: `generated`
- 최종 아트 상태: `planned`
- 최종 제작 승인: `false`
- 최종 아트 승인: **0**

## 버전 순서

- 일반 개선: `1.0.1 → 1.0.2 → ... → 1.0.99`
- 초대규모 호환성 개편: `1.1.0 → 1.2.0`
- 캐시와 배포 순서는 별도 빌드 ID로 관리

상세 정책: `docs/VERSION_POLICY_v1.0.md`

## 프로젝트 기본 골격

```text
/
├─ src/          게임 소스와 런타임 계약
├─ public/       공개 런타임 에셋, IP 라이브러리, 서비스 워커
├─ production/   제작 데이터, IP 메가베이스, 마스터 목록
├─ scripts/      생성·검증·패키징 스크립트
├─ docs/         정식 문서와 그래픽 기준선
├─ logs/         검증·빌드·시뮬레이션·패치 결과
├─ dist/         정적 배포 결과
├─ README.md
└─ PROJECT_HANDOFF.md
```

## 주요 명령

```bash
npm ci
npm run generate:ip-mega:v4
npm run verify:ip-mega:v4
npm run verify:release:v111
npm run build:static
node scripts/verify-static-dist.mjs
```

전체 회귀 검증:

```bash
npm run verify
```

v1.0.10 기준 증분 패치:

```bash
npm run create:patch:v111
npm run verify:patch:v111
```

## 현재 제작 상태

- 런타임 수직 슬라이스: **6/6**
- 10웨이브 상태 시뮬레이션: **10/10**
- 전투 GLB: **19종**
- v13 개별 스프라이트: **415개**
- v15 런타임 아틀라스: **154프레임**
- IP 지식 메가베이스: **147,232 레코드**
- 최종 제작 아트 승인: **0**
- 대량 최종 아트 생산: **P0 골든 세트부터 단계적 진행**
