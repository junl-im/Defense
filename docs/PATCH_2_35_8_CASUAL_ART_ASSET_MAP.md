# KingdomSeed v2.35.8 Casual Art Asset Map

## 목표

v2.35.7 실행 복구 상태를 유지하면서, 아기자기 캐주얼 2D 스타일의 타워/몬스터/영웅/발사체 아트 교체 경로를 코드 구조에 고정한다.

## 변경 요약

- `src/game/AssetMap.ts` 신규 추가
  - 전투 배경, 타워, 몬스터, 영웅, 발사체 에셋 키/경로 중앙화
  - 기본 부팅에는 로드하지 않고 GameScene 진입 뒤 비동기 로드
- `public/assets/art/v30_ocean_masterpiece.png`
  - 전장 배경용 경량 캐주얼 오션 맵 폴백
- `public/assets/art/v30_fish_silhouette_sheet.png`
  - DALL-E/스프라이트 시트 교체용 몬스터 경로 고정
- `public/assets/art/v30_fish_slime_icon.png`
  - 기존 몬스터 아트가 없을 때 쓰는 가벼운 캐주얼 몬스터 폴백
- `public/assets/ui-kit/icons/fishing_rod.png`
  - 타워 폴백 아이콘
- `public/assets/ui-kit/icons/hero_seed_knight.png`
  - 영웅 폴백 아이콘
- `public/assets/ui-kit/icons/projectile_seed.png`
  - 투사체 폴백 아이콘
- `public/assets/sprites/tower_base.png`
  - 타워 공통 베이스 폴백

## 성능 정책

- 기본 주소의 BootScene에는 새 아트를 싣지 않는다.
- 전투 씬 진입 후 40KB 이하의 소형 PNG 중심으로 조용히 로드한다.
- 로드가 늦어도 전투 시작은 막지 않고 기존 코드맵/도형 폴백으로 즉시 진행한다.
- `?casualart`, `?fullart`, `?ultraart`, `?galleryart`에서는 새 캐주얼 전장 배경을 우선 사용할 수 있다.

## DALL-E 교체 규칙

다음 파일명으로 교체하면 코드 수정 없이 반영된다.

- 타워: `public/assets/ui-kit/icons/fishing_rod.png`
- 몬스터 시트: `public/assets/art/v30_fish_silhouette_sheet.png`
- 몬스터 단일 폴백: `public/assets/art/v30_fish_slime_icon.png`
- 영웅: `public/assets/ui-kit/icons/hero_seed_knight.png`
- 발사체: `public/assets/ui-kit/icons/projectile_seed.png`
- 배경: `public/assets/art/v30_ocean_masterpiece.png`
