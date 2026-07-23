# Dokkaebi Luck Defense 3D

## v13.0.0 Transparent Arsenal

사용자가 제공한 10장의 에셋 시트를 415개 개별 투명 PNG로 분리하고, 주요 스프라이트를 실제 게임 UI에 연결한 업데이트입니다.

- 게임 버전: **13.0.0**
- 엔진 버전: **10.0.0**
- 세이브 스키마: **11**
- 입력 시트: **10장**
- 개별 크롭: **415개**
- 직접 검수·연결: **42개**
- 2D 사용 가능: **124개**
- 추가 검수 대기: **291개**
- 런타임 수직 슬라이스: **6/6**
- 최종 3D 제작 아트: **0/6**

### 실제 적용

- 대장 깨비 직업 카드 5종
- 달빛 도감의 수호대·요괴·보스·전장·VFX 초상
- 장비 가방 및 결과 보상 아이콘 9종
- `asset-library-v13.html` Sprite Forge 리뷰 OS

원본 PNG는 RGBA였지만 알파가 전부 255이고 체크무늬가 배경에 구워져 있었습니다. v13 파이프라인은 테두리와 연결된 밝은 무채색 영역을 제거하고, 행·열 경계를 자동 보정한 뒤 256×256 투명 캔버스로 정규화합니다.

시트 크롭은 2D UI·도감·아이콘·VFX 참조용입니다. 최종 3D GLB, 리깅, 턴어라운드, 애니메이션 승인을 대신하지 않습니다.

## 검증

```bash
npm run verify
npm run build:static
node scripts/verify-static-dist.mjs
```

크롭 재생성 시에만:

```bash
pip install pillow opencv-python-headless
python scripts/generate-asset-sheets-v13.py
```

## v13 주요 문서

- `docs/TRANSPARENT_ARSENAL_v13.0.0.md`
- `docs/SPRITE_SHEET_IMPORT_REPORT_v13.0.0.json`
- `docs/ASSET_SHEET_CUT_PREVIEW_v13.0.0.jpg`
- `docs/PATCH_NOTES_v13.0.0.md`
- `docs/PATCH_APPLY_v13.0.0.md`
- `docs/NEXT_PATCH_LINEUP_v13.x.md`

---

## v12.0.0 Golden Dominion

v11의 수호 의회·4막 캠페인·보스 BREAK·장비 단조를 유지하면서, 기본 카메라를 더 넓은 전장 조망형으로 변경하고 플레이 가능한 골든 수직 슬라이스를 6/6 런타임 인증한 업데이트입니다.

- 게임 버전: **12.0.0**
- 엔진 버전: **10.0.0**
- 세이브 스키마: **10**
- 기본 카메라 거리: **19.5**
- 기본 FOV: **52**
- 카메라 프리셋: **3종**
- 런타임 수직 슬라이스 인증: **6/6**
- 최종 제작 아트 승인: **0/6**
- 런타임 전투 GLB: **19종**
- 11클립·6소켓 공용 Skin GLB: **8종**

`6/6`은 플레이 가능한 런타임 수직 슬라이스의 코드·파일·해시·레이아웃·성능 계약이 통과했다는 뜻입니다. 기존 리뷰 파생본이나 기술 후보 GLB를 최종 제작 아트로 자동 승격하지 않습니다.

## 카메라

- 기본: 전장 조망 `19.5 / pitch 0.73 / FOV 52`
- 웨이브와 보스전에서 자동으로 조금 더 넓게 프레이밍
- F5: 전장 조망 → 균형 시야 → 근접 시야
- 설정 화면에서 프리셋과 줌 범위 조절

## 검증

```bash
npm ci
npm run verify
npm run build
```

패키지 설치가 제한된 환경:

```bash
npm run build:static
node scripts/verify-static-dist.mjs
```

## 개발 진단

- `F3`: 렌더 통계
- `F4`: Golden Dominion Production Console
- `F5`: 카메라 프리셋 순환
- `?stats=1`: 렌더 통계 활성화
- `?director=1`: 제작 콘솔 활성화

## 주요 문서

- `docs/GOLDEN_DOMINION_v12.0.0.md`
- `docs/GOLDEN_SLICE_RUNTIME_CERTIFICATION_v12.0.0.json`
- `docs/GOLDEN_SLICE_RUNTIME_BOARD_v12.0.0.jpg`
- `docs/ART_ASSET_APPROVAL_REGISTRY_v12.0.0.json`
- `docs/PATCH_NOTES_v12.0.0.md`
- `docs/PATCH_APPLY_v12.0.0.md`
- `docs/NEXT_PATCH_LINEUP_v12.x.md`
- `PROJECT_HANDOFF.md`
