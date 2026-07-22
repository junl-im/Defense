# 도깨비 운빨 수호대 3D

- 게임 버전: **3.7.1**
- 엔진 버전: **2.7.1**
- 아트 잠금: **DD-AAA-CASUAL-SD-PBR-3.0**

## v3.7.1 핵심

이번 핫픽스는 GitHub Actions에서 검증 전에 이전 패치 잔여물을 자동 정리합니다. `PATCH_README.md`, `public/assets/index-*`, `public/icon.svg`, `public/cover.svg`가 남아 있어도 `preverify`가 제거한 뒤 동일 검증기가 깨끗한 상태를 재확인합니다.

이번 버전은 GitHub Actions의 `MISSING_EXPORT` 빌드 실패를 막고, 공용 리그 적 2종과 모바일 UI 스트레스 계약을 추가한 안정화·확장 패치입니다.

- `BOSS_ASSET_IDS`를 배럴 모듈이 아닌 `asset-catalog.js`에서 직접 import
- 모든 상대 모듈의 named import/export 계약 자동 검사
- 돌갑옷 귀수·저주 무당을 Skin 1개, 7 AnimationClip, 공용 소켓, PBR 맵이 포함된 기술 리뷰 후보로 승격
- 에셋 상태: 기술 리뷰 3종 / 프로토타입 11종 / 최종 승인 0종
- 320×568, 360×640, 390×844, 430×932, 짧은 가로, 큰 글자 모드 UI 계약 검사
- ResizeObserver 기반 HUD 크기 변화 감지
- 긴 한국어 문구 overflow 검사와 긴급 축약 레이아웃
- 모달을 실제 visual viewport 안에 고정하고 내부 스크롤 허용
- 원거리 임포스터 6개를 768×576으로 최적화
- 텍스처 예산 **53.19MB / 64MB**

## 검증

```bash
npm ci
npm run verify
npm run build
```

`npm run verify`에는 Vite 빌드 전에 이름 있는 import/export 불일치를 잡는 `verify-module-exports.mjs`가 포함됩니다.

패키지 저장소를 사용할 수 없는 환경에서는 고정 Three.js import map 기반 정적 ESM 배포본을 생성합니다.

```bash
npm run build:static
node scripts/verify-static-dist.mjs
```

## 제작 명령

```bash
npm run generate:golden-hero
npm run generate:rigged-enemy-candidates
npm run generate:prompt-catalog
npm run generate:prototype-assets
npm run audit:art
```

## 주요 문서

- `docs/ASSET_BIBLE.md`
- `docs/UI_SYSTEM_v3.6.md`
- `docs/UI_STRESS_CONTRACT_v3.7.md`
- `docs/RIGGED_ENEMY_CANDIDATES_v3.7.md`
- `docs/BUILD_CONTRACT_v3.7.md`
- `docs/GOLDEN_SAMPLE_PRODUCTION_SPEC.md`
- `docs/CODE_ARCHITECTURE_v3.5.md`
- `docs/CURRENT_ASSET_AUDIT.md`
- `docs/AAA_ASSET_PROMPT_CATALOG.json`
- `PROJECT_HANDOFF.md`
