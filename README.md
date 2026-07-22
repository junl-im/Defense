# 도깨비 운빨 수호대 3D

- 게임 버전: **3.8.0**
- 엔진 버전: **2.8.0**
- 아트 잠금: **DD-AAA-CASUAL-SD-PBR-3.0**
- IP 제작 계획: **1,130개 시각 에셋**

## v3.8.0 핵심

이번 업데이트는 게임을 단순 에셋 모음이 아니라 장기 IP 제작 프로젝트로 운영하기 위한 기반을 추가합니다.

- `production/DokkaebiDefense` 아래 13개 제작 영역 구성
- 게임 기획서, 아트 바이블, UI/UX 설계서, 애니메이션 바이블, 에셋 마스터리스트 완성
- 캐릭터 50, 몬스터 60, 보스 20, 무기 100, 스킬 아이콘 120, UI 250, VFX 180, 타일 70, 배경 30, 오브젝트 250 등록
- 사용자가 제시한 약 1,100개 수량의 정확한 합계 **1,130개** 고정
- 11개 시작 직업, 7등급, 7스테이지, 10개 메인 화면, 99개 시작 직업 핵심 모션 행 계약화
- 미래 Unity 이관용 Assets 구조, 사운드 96개 큐, 수익화·라이브 운영 원칙 추가
- 마스터리스트 생성기와 CI 검증기 추가
- 2.3등신 비율을 머리 42%, 몸 35%, 다리 23%로 동기화
- 절대 SVG 금지, PNG 전용 PWA manifest, 전투 GLB 14종 해시 계약 유지

현재 1,130개 항목은 제작 계획이며 완성 에셋으로 표시하지 않습니다. 기존 런타임 GLB 14종의 승인 상태도 별도 감사 규칙을 그대로 유지합니다.

## 설치·검증

```bash
npm ci
npm run verify
npm run build
```

패키지 저장소를 사용할 수 없는 환경에서는 정적 ESM 배포본을 생성할 수 있습니다.

```bash
npm run build:static
node scripts/verify-static-dist.mjs
```

## IP 제작 명령

```bash
npm run generate:ip-masterlist
npm run verify:ip
```

## 주요 문서

- `docs/IP_PRODUCTION_INDEX_v3.8.0.md`
- `production/DokkaebiDefense/GAME_DESIGN_DOCUMENT_v3.8.0.md`
- `production/DokkaebiDefense/01_ArtBible/ART_BIBLE_v3.8.0.md`
- `production/DokkaebiDefense/05_UI/UI_UX_SPEC_v3.8.0.md`
- `production/DokkaebiDefense/10_Animation/ANIMATION_BIBLE_v3.8.0.md`
- `production/DokkaebiDefense/ASSET_MASTERLIST_v3.8.0.json`
- `docs/RUNTIME_ASSET_INVENTORY_v3.8.0.json`
- `PROJECT_HANDOFF.md`
