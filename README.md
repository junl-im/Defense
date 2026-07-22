# 도깨비 운빨 수호대 3D

- 게임 버전: **3.7.2**
- 엔진 버전: **2.7.2**
- 아트 잠금: **DD-AAA-CASUAL-SD-PBR-3.0**

## v3.7.2 핵심

이번 핫픽스는 GitHub Actions에서 실제 FAIL이 긴 PASS 로그에 묻히는 문제를 해결합니다.

- `verify-project.mjs`의 중간 종료 3곳을 제거하고 마지막 한 번만 종료
- 실패 시 `VERIFY FAILURE DIGEST`와 GitHub `::error` 주석 출력
- 워크플로가 전체 검증 로그를 보존하고 실패 원인을 스텝 마지막에 재출력
- 추가 루트 Markdown은 배포를 차단하지 않고 INFO로 처리
- SVG 금지 범위를 실제 런타임 디렉터리 `public/`, `src/`로 제한
- 구형 Vite 해시 번들을 파일명 고정 목록이 아닌 패턴으로 검사
- 버전 비교 기준을 `package.json` 단일 원본으로 정리
- CI 실패 보고 구조 자체를 검사하는 회귀 테스트 추가

v3.7.0의 named export 계약, 공용 리그 적 2종, 모바일 UI 스트레스 계약과 v3.7.1의 자동 청소 기능은 그대로 유지됩니다.

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
