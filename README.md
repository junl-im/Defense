# Dokkaebi Luck Defense 3D

## v8.0.0 Mythic Convergence

This build upgrades the combat engine with ten elemental reactions, Mythic Momentum Overdrive, boss escalation, combat telemetry v2 and save schema v7. Absolute Art Bible v2.0 and Character DNA v3.0 remain immutable; all 19 existing runtime GLBs remain unapproved legacy candidates.

### v7 controls and diagnostics

- `F3`: render statistics
- `F4`: production console
- `?stats=1`: boot with statistics visible
- `?director=1`: boot with production console visible

### v7 documents

- `docs/MYTHIC_CONVERGENCE_v8.0.0.md`
- `docs/PATCH_NOTES_v8.0.0.md`
- `docs/PATCH_APPLY_v8.0.0.md`
- `docs/NEXT_PATCH_LINEUP_v7.x.md`
- `docs/ART_ASSET_APPROVAL_REGISTRY_v8.0.0.json`

# 도깨비 운빨 수호대 3D

- 게임 버전: **6.0.0**
- 엔진 버전: **5.0.0**
- 아트 잠금: **DD-ABSOLUTE-ART-BIBLE-2.0**
- Character DNA: **3.0.0**
- 세이브 스키마: **6**
- 런타임 GLB: **19종**
- 계획 에셋: **1,130종**
- 최종 제작 승인 에셋: **0종**

## v6.0.0 Battlefront Ascension

전투 흐름과 성능 예산을 하나의 런타임 디렉터로 통합한 초대규모 시스템 업데이트입니다.

- 웨이브별 6개 공세 교리와 보스 전용 교리를 선택하는 Encounter Director
- 신목 체력과 직전 클리어 속도를 반영하는 적응형 난이도 압력
- 연소·빙결·풍인·균열·공명·감전 6종 상태이상
- 적 수와 프레임 상태에 따라 생성 상한을 조절하는 Runtime Budget Manager
- 웨이브 시간·피해원·상태이상·처치 기록 Combat Telemetry
- 세이브 스키마 v6 마이그레이션과 자동 로컬 백업
- F4 제작 콘솔에 공세 교리·전투 피해·상태이상·런타임 예산 진단 추가
- Engine 5.0과 Battlefront UI 아이덴티티 적용

기존 GLB 19종은 계속 레거시 런타임 후보이며 신규 아트 승인으로 승격하지 않습니다. 골든 수직 슬라이스 6종이 모두 최종 승인되기 전까지 1,130개 대량 생산 잠금은 유지됩니다.

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

## 개발 진단

- `F3`: 렌더 통계 HUD
- `F4`: Battlefront Production Console
- `?stats=1`: 렌더 통계 HUD를 켠 상태로 시작
- `?director=1`: 제작 콘솔을 켠 상태로 시작

## 주요 문서

- `docs/ABSOLUTE_ART_BIBLE_v2.0.md`
- `production/DokkaebiDefense/01_ArtBible/CHARACTER_DNA_v3.0.md`
- `docs/BATTLEFRONT_ASCENSION_v6.0.0.md`
- `docs/ART_ASSET_APPROVAL_REGISTRY_v6.0.0.json`
- `docs/PATCH_NOTES_v6.0.0.md`
- `docs/NEXT_PATCH_LINEUP_v6.x.md`
- `production/DokkaebiDefense/ASSET_MASTERLIST_v3.8.0.json`
- `PROJECT_HANDOFF.md`


Open `asset-library-v8.html` for the IP asset library.
