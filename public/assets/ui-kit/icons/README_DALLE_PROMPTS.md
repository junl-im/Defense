# KingdomSeed v2.35.9 Casual 2D Icon Prompt Guide

이 폴더와 `public/assets/art` 폴더의 PNG는 DALL-E/외부 생성 에셋으로 교체해도 코드 수정 없이 연결되도록 매핑되어 있습니다.

공통 스타일 키워드:

`Single isolated on solid white background, vector illustration, thick outlines, soft pastel colors, mobile game asset, clean silhouette, no text, no UI`

## Tower Icon
Target file: `public/assets/ui-kit/icons/fishing_rod.png`

Prompt:

`Cute cozy 2D casual defense game tower icon, tiny wooden fishing-rod tower with a round stone base, cheerful fantasy kingdom style, single isolated object on solid white background, vector illustration, thick outlines, soft pastel colors, mobile game asset, clean silhouette, no text, no UI, high readability at small size`

## Monster Icon
Target file: `public/assets/art/v30_fish_slime_icon.png`

Prompt:

`Cute chubby fish-slime monster for a mobile tower defense game, friendly but mischievous expression, ocean fantasy theme, simple rounded body, tiny fins, single isolated character on solid white background, vector illustration, thick outlines, soft pastel colors, mobile game sprite asset, no text, no UI, clean silhouette`

## Hero Icon
Target file: `public/assets/ui-kit/icons/hero_seed_knight.png`

Prompt:

`Cute brave young kingdom seed knight hero for a casual 2D mobile defense game, small cape, tiny wooden sword, warm smile, storybook fantasy style, single isolated character on solid white background, vector illustration, thick outlines, soft pastel colors, mobile game hero icon, no text, no UI, clean silhouette`

## Projectile Icon
Target file: `public/assets/ui-kit/icons/projectile_seed.png`

Prompt:

`Cute magical seed-shaped projectile icon for a casual 2D tower defense game, glowing golden seed arrow with sparkles and tiny motion trail, fantasy kingdom style, single isolated object on solid white background, vector illustration, thick outlines, soft pastel colors, mobile game asset, no text, no UI, clean silhouette`

## Runtime Notes

- 원본 PNG가 256px, 512px, 1024px이어도 `CasualArtDirector.ts`가 전투 내 표시 크기를 정규화합니다.
- 기본 부팅에는 이 에셋들을 싣지 않습니다. `GameScene` 진입 후 비동기로 로드됩니다.
- 로드 실패 시 기존 스프라이트/도형 폴백이 유지되어 전투 실행은 막히지 않습니다.
- `?artmapdebug`를 붙이면 전투 화면 좌측 상단에서 캐주얼 아트 로드 개수를 확인할 수 있습니다.
