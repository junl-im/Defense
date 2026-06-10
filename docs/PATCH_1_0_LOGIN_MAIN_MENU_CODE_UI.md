# v1.0 Login + Main Menu Code UI Patch

## 변경 파일

- `src/game/CodeUiKit.ts`
- `src/scenes/MenuScene.ts`
- `src/scenes/MainMenuScene.ts`
- `src/scenes/BootScene.ts`
- `src/main.ts`
- `public/assets/backgrounds/*_v1_0.png`
- `public/assets/v1_0/decor/*_v1_0.png`
- `docs/PATCH_NOTES.md`
- `docs/VISUAL_GUIDE.md`
- `docs/ASSET_MANIFEST.json`

## 흐름

1. `BootScene`에서 v1.0 배경/장식 에셋을 로드합니다.
2. `MenuScene`은 로그인 화면만 담당합니다.
3. 로그인 성공 후 `MainMenuScene`으로 이동합니다.
4. `MainMenuScene`에서 월드맵, 빠른 전투, 영웅, 임무, 연구소, 제작소, 도감으로 이동합니다.

## 디자인 분리

- 배경: PNG 이미지
- UI: Phaser Graphics/Text 코드
- 캐릭터/타워/몬스터: 별도 PNG 장식 에셋
