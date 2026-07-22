# 도깨비 운빨 수호대 3D

- 게임 버전: **4.1.0**
- 엔진 버전: **3.0.0**
- 아트 잠금: **DD-AAA-CASUAL-SD-PBR-3.0**
- 전투 모델 계약: **GLB 19종**
- IP 제작 계획: **1,130개 시각 에셋**

## v4.1.0 핵심

- 플레이어·수호대·적 공격 방향과 목표 정렬 개선
- 공격 애니메이션 중 방향 잠금으로 뒤돌아 발사하는 현상 방지
- 모델 `WeaponSocket` 기준 발사 위치
- 속성별 베기·초승달·폭발·빙정·충격파·문양·번개 임팩트
- 치명타·보스·궁극기 히트스톱, 화면 플래시, 흔들림 계층
- 저사양 모바일 VFX 수량 제한
- 웨이브 보상 처리 후 10초 자동 다음 습격
- 버튼을 통한 즉시 시작과 마지막 3초 카운트 강조
- 기존 장비·숙련·도감·19종 GLB·SVG 금지 계약 유지

이번 버전은 신규 작가급 모델을 추가한 버전이 아니라, 기존 모델과 애니메이션이 실제 전투에서 더 정확하고 강하게 보이도록 만든 전투 프레젠테이션 패치입니다.

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
npm run verify:v400
npm run verify:v410
```

## 주요 문서

- `docs/COMBAT_PRESENTATION_v4.1.0.md`
- `docs/PATCH_NOTES_v4.1.0.md`
- `docs/PERSISTENT_PROGRESSION_v4.0.0.md`
- `docs/UI_HUD_v4.0.0.md`
- `docs/PATCH_NOTES_v4.0.0.md`
- `docs/RUNTIME_ASSET_INVENTORY_v4.0.0.json`
- `docs/P0_RUNTIME_EXPANSION_v3.9.0.md`
- `docs/CURRENT_ASSET_AUDIT.md`
- `docs/IP_PRODUCTION_INDEX_v3.8.0.md`
- `production/DokkaebiDefense/ASSET_MASTERLIST_v3.8.0.json`
- `PROJECT_HANDOFF.md`
