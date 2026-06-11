# v2.16.0 Cute Fantasy Art Foundation + Mobile QA

## 목표
- v2.15.0 디자인/모바일 QA 베이스 위에 `아기자기하고 예쁜 판타지 디펜스` 방향의 첫 그래픽 자산 세트를 추가한다.
- 대형 배경을 다시 굽지 않고, 기존 코드 UI 위에 가벼운 PNG/WebP 스티커 레이어를 얹어 추후 에셋 확장이 쉽도록 만든다.
- 모바일 터치 영역과 기존 히트존은 유지하고, 장식은 비상호작용 레이어로만 배치한다.

## 추가 에셋
신규 경로: `public/assets/ui/v2_16/`

- `cute_panel_v2_16.png/webp` : 말랑한 파스텔 패널
- `cute_ribbon_v2_16.png/webp` : 로비/로그인/전투용 리본 배너
- `cute_star_v2_16.png/webp` : 귀여운 별 스티커
- `cute_heart_v2_16.png/webp` : 하트 스티커
- `cute_cloud_v2_16.png/webp` : 구름 마스코트 장식
- `cute_gem_v2_16.png/webp` : 보석 스티커
- `cute_stage_pin_v2_16.png/webp` : 월드맵 스테이지 핀
- `cute_tower_badge_v2_16.png/webp` : 타워 배지
- `cute_monster_badge_v2_16.png/webp` : 몬스터 배지
- `cute_leaf_v2_16.png/webp` : 자연 장식 스티커

## 코드 변경
- `src/game/CuteFantasyPolishV216.ts` 추가
  - 로그인, 로비, 월드맵, 전투 화면에 공통으로 사용할 귀여운 장식 레이어 유틸을 분리했다.
  - 에셋이 없을 경우에도 안전하게 그래픽 fallback을 사용한다.
- `src/scenes/BootScene.ts`
  - v2.16 에셋 프리로드 추가.
  - WebP 최적화 대상에 `assets/ui/v2_16` 추가.
- `src/scenes/MenuScene.ts`
  - 로그인 화면에 구름/리본/스티커 레이어 추가.
  - 버전 칩을 `v2.16.0 CUTE ART QA`로 갱신.
- `src/scenes/MainMenuScene.ts`
  - 로비 상단에 말랑 리본과 타워/몬스터 배지를 추가.
  - 시작 토스트가 중복 호출되던 부분을 1회로 정리.
- `src/scenes/WorldMapScene.ts`
  - 스테이지 노드 뒤에 귀여운 핀 레이어 추가.
  - 미리보기 카드 뒤에 파스텔 패널 배치.
- `src/scenes/GameScene.ts`
  - 전투 HUD 주변에 방해되지 않는 장식 배지/참 스티커 추가.

## QA
- `npx tsc --noEmit --pretty false` 통과.
- `npm run build` 통과.
- 빌드 시 Vite 대형 chunk 경고는 기존 번들 구조에 따른 경고이며 이번 패치 기능에는 영향 없음.

## 적용 방법
1. 이 패치 zip의 내용을 기존 프로젝트 루트에 덮어쓴다.
2. GitHub Desktop에서 변경 파일을 확인한다.
3. 로컬에서 `npm install` 후 `npm run dev` 또는 `npm run build`로 확인한다.

## 다음 추천 패치
- v2.17.0: 타워 4종을 더 귀여운 SD 아이콘/실루엣으로 리마스터.
- v2.18.0: 몬스터 초상화와 웨이브 카드에 말풍선/감정표현 추가.
