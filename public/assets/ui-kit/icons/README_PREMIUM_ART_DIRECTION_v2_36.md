# KingdomSeed v2.36.0 Premium Battle Art Direction

## 핵심 원칙

`Single isolated on solid white background, vector, thick outlines` 이미지는 **아이콘 원본/검수용**입니다.
본 게임 전투 화면의 기본 오브젝트로 바로 쓰지 않습니다.

기본 전투 화면은 다음 우선순위를 사용합니다.

1. 기존 원화풍/스프라이트 전투 에셋
2. 직업/종족별 패밀리 아트
3. Phaser 스프라이트시트
4. 코드 도형 폴백

DALL-E isolated 아이콘은 아래 URL 옵션에서만 켜집니다.

- `?casualart`
- `?iconmock`
- `?stickerart`

배경 아트 검수는 아래 옵션에서만 켜집니다.

- `?fullart`
- `?ultraart`
- `?galleryart`

## 왜 이렇게 분리했나?

isolated 아이콘은 흰 배경, 중앙 정렬, 작은 썸네일 가독성에 맞춰져 있습니다.
전투 화면에 그대로 올리면 오브젝트가 스티커처럼 보이고, 몬스터/타워/영웅의 스케일감이 무너집니다.

따라서 본 게임 기본값은 더 큰 전투 발자국, 기존 스프라이트 애니메이션, 원화풍 패밀리 아트를 우선합니다.

## 본 게임용 DALL-E 재생성 방향

전투용으로 새 에셋을 만들 때는 아래처럼 요청하세요.

- isolated icon이 아니라 transparent background sprite
- full body, 3/4 top-down view
- no white background
- readable at 64px to 128px
- grounded shadow separate or transparent

예시:

`Cute premium 2D mobile tower defense enemy sprite, full body, 3/4 top-down view, transparent background, thick clean outline, detailed but readable at 64px, soft painterly vector hybrid, no white background, no text, no UI`
