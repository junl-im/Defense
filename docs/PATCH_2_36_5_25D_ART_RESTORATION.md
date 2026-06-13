# KingdomSeed v2.36.5 - 2.5D Art Restoration Patch

## 왜 2.5D 에셋이 안 보였나

에셋 파일은 삭제되지 않았다. v2.35.4 이후 빠른 시작 구조가 들어가면서 BootScene이 로그인 최소 에셋만 올리도록 바뀌었고, v2.35.6 이후 모바일 안전 모드에서는 전투용 고급 아트 로딩이 대부분 차단됐다.

그 결과 다음 에셋들이 프로젝트 안에는 남아 있었지만 기본 전투 화면에서는 거의 사용되지 않았다.

- `public/assets/maps/v2_15/battle_stage_001_v2_15.webp` ~ `battle_stage_012_v2_15.webp`
- `public/assets/maps/battle_depth_overlay_v41.png`
- `public/assets/towers/v2_1/tower_*.png`
- `public/assets/units/v2_1/enemy_*_v2_1.png`
- `public/assets/units/v2_4/hero_knight_v2_4.png`
- `public/assets/ui/v2_27/battle_*_v2_27.png`

## 이번 수정

- `src/game/BattleDepthArtBridge.ts` 추가
  - 첫 부팅에는 관여하지 않는다.
  - GameScene 진입 후 현재 스테이지 배경 1장만 WebP 우선으로 로드한다.
  - `battle_depth_overlay_v41.png`를 함께 얹어 2.5D 깊이감을 복구한다.
  - 타워/몬스터/영웅 핵심 아트는 한 박자 뒤에 로드한다.

- `src/scenes/GameScene.ts`
  - 전투 씬 진입 후 2.5D 복구 브리지 설치.
  - 아트 로드 완료 후 이미 설치된 타워는 `refreshArt()`로 다시 연결.

- `src/scenes/BootScene.ts`
  - 전투 HUD/건설 지점용 초소형 v2.15 UI 에셋만 빠른 부팅 허용 목록에 복구.
  - 큰 전투 배경/갤러리 아트는 여전히 BootScene에 싣지 않는다.

## 옵션

- 기본 주소: 현재 스테이지 2.5D 배경 + 깊이 오버레이 지연 복구
- `?flatbattle` 또는 `?nodepthart` 또는 `?no25d`: 2.5D 복구 끄기
- `?maponly25d`: 맵/깊이만 복구, 타워/몬스터/영웅 핵심 아트 지연 로드 생략
- `?instant25d`: 검수용. 지연 시간을 줄여 빠르게 복구
- `?restore25d` 또는 `?combatart`: 전투 핵심 아트 복구 강제

## 성능 기준

- 첫 로그인 부팅에는 큰 배경을 올리지 않는다.
- 전투 진입 후에도 전체 스테이지 12장을 로드하지 않고 현재 스테이지 1장만 로드한다.
- WebP 지원 브라우저에서는 `v2_15` WebP 배경을 우선 사용한다.
- 런타임 락다운/오프라인/데이터 절약 환경에서는 맵과 깊이 레이어까지만 복구한다.
