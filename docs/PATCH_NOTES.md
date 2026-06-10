# Patch Notes

## v1.0 - Login/Main Menu Clean UI Reset

- 버전 네이밍을 새 기준 `v1.0`으로 초기화했습니다.
- 로그인 화면을 `배경 이미지 + 코드 UI` 구조로 재정리했습니다.
  - 배경: `public/assets/backgrounds/login_background_v1_0.png`
  - 로고/상단칩/로그인 패널/버튼/푸터: Phaser 코드 UI
- 신규 `MainMenuScene`을 추가했습니다.
  - 로그인 성공 후 바로 월드맵으로 가지 않고 메인 메뉴로 진입합니다.
  - 메인 메뉴 배경: `public/assets/backgrounds/main_menu_background_v1_0.png`
  - 메뉴 카드/하단 독/능력치 칩/토스트는 모두 코드 UI로 렌더링합니다.
- 제공된 참고 에셋 시트에서 v1.0 장식용 영웅/타워/몬스터 PNG를 분리해 적용했습니다.
- 공통 코드 UI 헬퍼 `src/game/CodeUiKit.ts`를 추가해 이후 화면도 같은 방식으로 확장할 수 있게 했습니다.

## 적용 원칙

- 배경 이미지에는 로고/버튼/로그인창/메뉴 패널 텍스트를 굽지 않습니다.
- 로고, 버튼, 패널, 칩, 토스트는 코드로 그립니다.
- 캐릭터/타워/몬스터는 장식 에셋으로 분리해 씬에서 배치합니다.

## v1.1.0 - World Map Code UI Art Pass
- 월드맵을 배경 이미지 + 코드 UI 구조로 리마스터했습니다.
- 신규 월드맵 배경 `assets/backgrounds/worldmap_background_v1_1.png`를 추가했습니다.
- 스테이지 카드, 경로 노드, 상세 패널, 하단 독을 코드 기반 UI로 정리했습니다.
- 로그인 버전 칩을 `v1.1.0 WORLD MAP ART PASS`로 갱신했습니다.
