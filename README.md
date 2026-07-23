# 도깨비 운빨 수호대 3D

- 게임 버전: **5.0.0**
- 엔진 버전: **4.0.0**
- 아트 잠금: **DD-ABSOLUTE-ART-BIBLE-2.0**
- Character DNA: **3.0.0**
- 런타임 GLB: **19종**
- 계획 에셋: **1,130종**
- 최종 제작 승인 에셋: **0종**

## v5.0.0 Moonstone Genesis

Absolute Art Bible v2.0을 코드·에셋·UI·성능이 함께 따르는 제작 운영체제로 확장했습니다.

- 얼굴·체형·헤어·직업·희귀도·장비·애니메이션 Character DNA v3.0
- 1,130개 제작 목록 전체에 스타일 잠금·DNA·대량 생산 게이트 적용
- Cinematic / High / Balanced / Performance 4단계 자동 품질
- 평균·P95·P99·프레임 지터·부드러움 점수 계측
- HUD·그림자·월드 청크 가변 갱신 프레임 예산
- 기존 GLB 19종 런타임 재질 조화 처리
- Warm Key + Cool Blue Rim 조명
- Gold Border + Blue Glow + Rounded Depth UI 리마스터
- `F4` 또는 `?director=1` 제작 콘솔

기존 GLB는 화면 일관성을 위해 런타임 조화 처리하지만 최종 승인 에셋으로 승격하지 않습니다. 신규 골든 수직 슬라이스 6종이 모두 승인되기 전까지 1,130개 대량 생산 잠금은 유지됩니다.

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
- `F4`: Moonstone Production Console
- `?stats=1`: 렌더 통계 HUD를 켠 상태로 시작
- `?director=1`: 제작 콘솔을 켠 상태로 시작

## 주요 문서

- `docs/ABSOLUTE_ART_BIBLE_v2.0.md`
- `production/DokkaebiDefense/01_ArtBible/CHARACTER_DNA_v3.0.md`
- `docs/MOONSTONE_GENESIS_v5.0.0.md`
- `docs/ART_ASSET_APPROVAL_REGISTRY_v5.0.0.json`
- `docs/PATCH_NOTES_v5.0.0.md`
- `docs/NEXT_PATCH_LINEUP_v5.x.md`
- `production/DokkaebiDefense/ASSET_MASTERLIST_v3.8.0.json`
- `PROJECT_HANDOFF.md`
