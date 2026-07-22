# 도깨비 운빨 수호대 3D

- 게임 버전: **3.7.5**
- 엔진 버전: **2.7.3**
- 아트 잠금: **DD-AAA-CASUAL-SD-PBR-3.0**

## v3.7.5 핵심

이번 핫픽스는 패치 덮어쓰기 이후 일부 전투 GLB가 저장소에 복구되지 않아 CI가 `ENOENT`로 중단되던 문제를 해결합니다.

- 패치 ZIP에 플레이어·수호대·요괴·보스 GLB **14종 전부** 강제 포함
- 14종의 파일 크기와 SHA-256을 기록한 런타임 자산 인벤토리 추가
- 검증 시작 단계에서 누락 파일, Git LFS 포인터, 잘못된 GLB 헤더, 길이·해시 불일치를 일괄 검사
- `verify-asset-readiness.mjs`가 첫 누락 파일에서 스택 오류로 죽지 않고 전체 누락 목록을 출력
- v3.7.4의 PNG 전용 PWA manifest 마이그레이션과 절대 SVG 금지 정책 유지
- v3.7.0의 named export 계약, 공용 리그 적 2종, 모바일 UI 스트레스 계약 유지

## 설치·검증

```bash
npm ci
npm run verify
npm run build
```

패키지 저장소를 사용할 수 없는 환경에서는 고정 Three.js import map 기반 정적 ESM 배포본을 생성할 수 있습니다.

```bash
npm run build:static
node scripts/verify-static-dist.mjs
```

## 자산 복구 확인

검증 시작 부분에 다음 결과가 표시되어야 합니다.

```text
PASS required combat GLB contract · 14/14 files, headers, sizes and hashes
```

누락된 모델이 있으면 파일명과 복구 안내가 GitHub Actions 주석 및 실패 요약에 함께 표시됩니다.

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
- `docs/RUNTIME_ASSET_INVENTORY_v3.7.5.json`
- `docs/PATCH_NOTES_v3.7.5.md`
- `docs/UI_SYSTEM_v3.6.md`
- `docs/UI_STRESS_CONTRACT_v3.7.md`
- `docs/RIGGED_ENEMY_CANDIDATES_v3.7.md`
- `docs/BUILD_CONTRACT_v3.7.md`
- `docs/GOLDEN_SAMPLE_PRODUCTION_SPEC.md`
- `docs/CODE_ARCHITECTURE_v3.5.md`
- `docs/CURRENT_ASSET_AUDIT.md`
- `PROJECT_HANDOFF.md`
