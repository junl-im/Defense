# 도깨비 운빨 수호대 3D

- 게임 버전: **4.0.0**
- 엔진 버전: **2.9.0**
- 아트 잠금: **DD-AAA-CASUAL-SD-PBR-3.0**
- 전투 모델 계약: **GLB 19종**
- IP 제작 계획: **1,130개 시각 에셋**

## v4.0.0 핵심

- 영구 장비 가방: 무기·부적·신발 3슬롯
- 장비 9종과 등급별 전투 보정
- 원정 종료 장비 드롭과 중복 장비 정수 변환
- 전사·궁수·법사별 직업 숙련 레벨과 영구 보정
- 타이틀·전투 HUD·일시정지에서 장비 창 접근
- 도깨비마을 4구역 진행 HUD
- 보스 공격 임박 화면 테두리 경고
- 모바일 장비 모달·결과 보상 카드 반응형 재배치
- 전투 GLB 19종 파일·크기·헤더·SHA-256 계약 유지
- 래스터/CSS UI만 사용하며 벡터 이미지 금지 유지

장비와 숙련은 기기 로컬 저장소에 보존됩니다. 장비 변경은 다음 원정부터 적용되고, 직업 숙련은 선택한 직업에만 누적됩니다.

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
```

## 주요 문서

- `docs/PERSISTENT_PROGRESSION_v4.0.0.md`
- `docs/UI_HUD_v4.0.0.md`
- `docs/PATCH_NOTES_v4.0.0.md`
- `docs/RUNTIME_ASSET_INVENTORY_v4.0.0.json`
- `docs/P0_RUNTIME_EXPANSION_v3.9.0.md`
- `docs/CURRENT_ASSET_AUDIT.md`
- `docs/IP_PRODUCTION_INDEX_v3.8.0.md`
- `production/DokkaebiDefense/ASSET_MASTERLIST_v3.8.0.json`
- `PROJECT_HANDOFF.md`
