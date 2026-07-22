# 도깨비 운빨 수호대 3D

- 게임 버전: **3.9.0**
- 엔진 버전: **2.9.0**
- 아트 잠금: **DD-AAA-CASUAL-SD-PBR-3.0**
- IP 제작 계획: **1,130개 시각 에셋**

## v3.9.0 핵심

- 시작 영웅 선택: 도깨비 전사, 도깨비 궁수, 도깨비 법사
- 궁수 장거리 관통 공격과 다중 화살 기술
- 법사 광역 공격과 둔화 기술
- 유물 선택 시 무기·관·후광이 영웅 소켓에 즉시 장착
- 신규 일반 적: 달그림자 귀신, 백골 무사, 먹구름 까마귀
- 신규 적 3종의 약점 연구와 전리품 도감 연결
- 보스 공격 의도를 타격·소환·제어 PNG 아이콘과 진행 게이지로 표시
- 직업·적·보스 UI 아이콘 9종을 256×256 PNG로 추가
- 전투 GLB 19종의 파일 크기·GLB2 헤더·SHA-256 계약
- 절대 SVG 금지 유지

신규 궁수·법사·일반 적 3종은 공용 리그와 7개 AnimationClip을 사용하는 **기술 검수 후보**입니다. 런타임 실루엣 키트로 역할을 구분하지만, 최종 전용 조형과 손그림 텍스처의 아트 디렉터 승인은 아직 완료되지 않았습니다.

## 설치·검증

```bash
npm ci
npm run verify
npm run build
```

패키지 저장소를 사용할 수 없는 환경에서는 정적 ESM 배포본을 생성합니다.

```bash
npm run build:static
node scripts/verify-static-dist.mjs
```

## 제작 자동화

```bash
npm run generate:ip-masterlist
npm run verify:ip
npm run generate:v390-candidates
```

## 주요 문서

- `docs/P0_RUNTIME_EXPANSION_v3.9.0.md`
- `docs/PATCH_NOTES_v3.9.0.md`
- `docs/RUNTIME_ASSET_INVENTORY_v3.9.0.json`
- `docs/CURRENT_ASSET_AUDIT.md`
- `docs/IP_PRODUCTION_INDEX_v3.8.0.md`
- `production/DokkaebiDefense/ASSET_MASTERLIST_v3.8.0.json`
- `PROJECT_HANDOFF.md`
