# 도깨비 운빨 수호대 3D

- 게임 버전: **3.6.0**
- 엔진 버전: **2.6.0**
- 아트 잠금: **DD-AAA-CASUAL-SD-PBR-3.0**

## v3.6.0 핵심

이번 버전은 전투 HUD와 모바일 UI를 **Moonstone HUD** 구조로 전면 재편한 패치입니다.

- 상단 기본 HUD, 상황 칩, 전투 게이지, 좌우 정보, 하단 조작을 독립 레일로 분리
- 실제 표시 요소의 `getBoundingClientRect()`를 이용한 런타임 겹침 감사
- HUD 표시 밀도 `자동 / 전체 / 간소` 3단계
- 보스전에서 좌우 정보 레일 자동 하강
- 충돌 감지 시 저우선 설명만 자동 축약
- 5개 전투 버튼의 잘못된 4열 그리드 수정
- 모바일 하단 조작을 3+2 배열로 변경
- 320px 화면에서 조이스틱과 액션 도크 사이 26px 안전 간격
- 제목 화면과 모달을 밝고 두꺼운 캐주얼 모바일 UI 계층으로 재설계
- 골든 샘플 Skin·7 AnimationClip·소켓·PBR 경로 유지
- 전투 GLB 14종과 도감·약점·전리품 시스템 회귀 검증 유지

## HUD 조작

전투 화면 우측 상단 `▦/◫/▤` 버튼으로 정보 표시를 순환합니다.

- **자동:** 화면 크기와 보스전 상태에 따라 자동 압축
- **전체:** 모든 보조 정보를 유지
- **간소:** 핵심 수치만 표시

카메라·조작 설정의 `HUD 자동 정리`에서도 자동 모드를 켜거나 끌 수 있습니다.

## 검증

```bash
npm ci
npm run verify
npm run build
```

패키지 저장소를 사용할 수 없는 환경에서는 고정 Three.js import map 기반 정적 ESM 배포본을 생성합니다.

```bash
npm run build:static
node scripts/verify-static-dist.mjs
```

## 제작 명령

```bash
npm run generate:golden-hero
npm run generate:prompt-catalog
npm run generate:prototype-assets
npm run audit:art
```

## 주요 문서

- `docs/ASSET_BIBLE.md`
- `docs/UI_SYSTEM_v3.6.md`
- `docs/GOLDEN_SAMPLE_PRODUCTION_SPEC.md`
- `docs/CODE_ARCHITECTURE_v3.5.md`
- `docs/CURRENT_ASSET_AUDIT.md`
- `docs/AAA_ASSET_PROMPT_CATALOG.json`
- `PROJECT_HANDOFF.md`
