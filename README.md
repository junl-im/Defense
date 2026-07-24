> 현재 개선 패치: **v1.0.15 / b24.15** — 시작 화면 문구 노출 제거, 필수 자산 우선 로딩, 승인형 아트 파이프라인

# Dokkaebi Luck Defense 3D

## 현재 공개 버전

- 게임: **1.0.12**
- 내부 개발 계보: **23.1.0**
- 빌드 ID: **b24.12**
- 엔진: **21.0.0**
- 세이브 스키마: **21**
- 패치: **Cross-Platform Visual Polish**

## v1.0.12 핵심 업데이트

컨셉 보드를 곧바로 전 자산의 최종 완성본이라고 처리하지 않고, 실제 게임에서 검증할 수 있는 P0 그래픽 수직 슬라이스부터 적용했습니다.

- 데스크톱·모바일 별도 타이틀 배경 및 투명 마스코트 재보정
- 스토어/공유 커버 이미지 재제작
- 영웅·수호대·몬스터·보스 대표 4개체의 11방향 × 6상태 아틀라스
- 총 **264 P0 방향·액션 프레임**
- High·Medium·Low 품질 변형 12장
- P0 개체 좌우 반전 금지
- 보호막·브레이크·상태 이상 통합 월드 HP 바
- PC·태블릿·모바일 독립 HUD 셸
- 실제 화면 사각형 기반 HUD 겹침 감지와 안전 레이아웃
- 브라우저 11방향 검토 페이지

브라우저 검토 화면:

```text
public/p0-directional-library-v112.html
public/ip-mega-library-v4.html
```

상세 문서:

```text
docs/PATCH_NOTES_v1.0.12.md
docs/CROSS_PLATFORM_VISUAL_POLISH_v1.0.12.md
docs/P0_DIRECTIONAL_ATLAS_v1.0.12.md
```

## IP 지식 메가베이스

v1.0.11에서 추가한 제작 지식은 그대로 유지됩니다.

- 베이스 IP 자산: **8,192개**
- 11방향 액션 레코드: **89,232개**
- 수호성·타워 상태 액션: **10,560개**
- PC·모바일 HUD 계약: **480개**
- 10웨이브 비주얼 QA: **5,040개**
- 장시간 성능 회귀 프로필: **960개**
- IP 관계 그래프: **32,768개**
- **총 지식 레코드: 147,232개**

## 상태 구분

이번 패치의 264프레임은 실제 런타임에서 사용하는 P0 제작본입니다. 그러나 모든 캐릭터와 모션의 최종 상업 원화 승인을 의미하지는 않습니다.

- P0 런타임 적용: `true`
- P0 최종 제작 아트 승인: `false`
- 전체 최종 아트: 단계적 교체 중
- 자동 생성물의 무조건 승인: 없음

## 주요 명령

```bash
npm ci
npm run generate:visual-polish:v112
npm run generate:p0-directional:v112
npm run verify:release:v112
npm run build:static
node scripts/verify-static-dist.mjs
```

전체 회귀 검증:

```bash
npm run verify
```

v1.0.11 기준 증분 패치:

```bash
npm run create:patch:v112
npm run verify:patch:v112
```

## 버전 순서

- 일반 개선: `1.0.1 → 1.0.2 → ... → 1.0.99`
- 초대규모 호환성 개편: `1.1.0 → 1.2.0`
- 캐시와 배포 순서는 별도 빌드 ID로 관리

상세 정책: `docs/VERSION_POLICY_v1.0.md`

## 프로젝트 기본 골격

```text
/
├─ src/          게임 소스, 런타임 계약, 타이틀 이미지
├─ public/       공개 런타임 에셋, 11방향 아틀라스, 서비스 워커
├─ production/   제작 데이터와 IP 지식 메가베이스
├─ scripts/      생성·검증·패키징 스크립트
├─ docs/         정식 문서와 그래픽 기준선
├─ logs/         검증·빌드·시뮬레이션·패치 결과
├─ dist/         정적 배포 결과
├─ README.md
└─ PROJECT_HANDOFF.md
```
