# v1.8.0 Mobile Viewport + Art Sync Pass

## 목표
- 모바일 세로 화면에서 16:9 캔버스가 작게 보이는 문제를 해결한다.
- 로그인 첫 화면을 배경/로고/패널/버튼 에셋으로 분리해 베이크 글씨와 클릭존 불일치를 제거한다.
- 전투 구간의 배경, 타워, 몬스터, 영웅/병사 비주얼을 제공 에셋 계열의 원화풍으로 동기화한다.

## 주요 변경
- `src/style.css`
  - 모바일 세로 화면에서 `#game`을 90도 회전한 landscape-fit 표면으로 확대.
  - 모바일 가로 화면에서는 전체 뷰포트에 꽉 차도록 고정.
- `src/platform/WebShell.ts`
  - 방향/클래스 전환 후 Phaser ScaleManager가 다시 계산하도록 resize 이벤트를 보정.
- `src/scenes/MenuScene.ts`
  - 로그인 화면을 `clean background + logo + panel + button images + code text/hitzones` 구조로 재구성.
  - 빠른 시작, Google, 이메일, 회원가입, 우측 상단 유틸 버튼의 클릭존을 표시 에셋 크기와 동일하게 맞춤.
- `src/scenes/GameScene.ts`
  - v1.8 전투 버튼 에셋 우선 사용.
  - 기존 패널/타워 선택 클램프 구조 유지로 UI가 상단 HUD와 하단 독을 침범하지 않도록 유지.
- `src/game/Enemy.ts`, `src/game/Hero.ts`, `src/game/Soldier.ts`
  - v1.8 원화풍 static unit art를 우선 사용하고, 없을 경우 기존 spritesheet 애니메이션으로 fallback.
- `public/assets/sprites/tower_*.png`
  - 타워 기본/레벨/최종진화 이미지를 고해상도 원화풍 컷아웃으로 교체.
- `public/assets/maps/battle_stage_001~008.png`
  - 전체 전투 배경을 색감/선명도/비네팅 기준으로 재보정.

## 클릭존 정책
- 원화형/에셋형 UI는 보이는 에셋의 중심 좌표와 width/height를 그대로 hit-zone으로 사용한다.
- Hover/press 효과는 별도 overlay로만 처리하며, 실제 버튼 이미지 위치는 움직이지 않는다.
- 전투 오버레이는 `clampOverlayPosition()`으로 HUD/하단 독/모바일 안전영역을 피해 자동 정렬한다.
