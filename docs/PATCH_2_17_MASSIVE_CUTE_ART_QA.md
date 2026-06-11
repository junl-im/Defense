# v2.17.0 Massive Cute Fantasy Art Kit + QA Stability Sweep

## 목표
- v2.16의 작은 장식 기반을 확장해, 로그인/로비/월드맵/전투에 모두 적용되는 대량 말랑 판타지 UI 에셋 세트를 추가한다.
- 대화가 길어지기 전에 한 번에 체감되는 디자인 분량을 확보하고, 이후 패치에서 캐릭터/타워/몬스터 원화형 에셋을 더 붙일 수 있는 구조를 만든다.
- 모바일 QA 관점에서 터치 영역은 그대로 두고, 장식 레이어와 텍스트/히트존을 분리한다.
- 자주 보이는 메시지/토스트가 서로 덮어쓰며 빨리 사라지는 문제와 씬 전환 뒤 오디오 재활성화 콜백이 남을 수 있는 부분을 정리한다.

## 추가 에셋
신규 경로: `public/assets/ui/v2_17/`

총 34종 PNG + WebP 세트, 합계 68개 파일을 추가했다.

### 공통 UI
- `dreamy_panel_wide_v2_17.png/webp`
- `dreamy_panel_small_v2_17.png/webp`
- `checklist_card_v2_17.png/webp`
- `title_banner_v2_17.png/webp`
- `soft_banner_blue_v2_17.png/webp`
- `button_gold_squish_v2_17.png/webp`
- `button_blue_squish_v2_17.png/webp`
- `nav_pill_v2_17.png/webp`
- `resource_chip_v2_17.png/webp`
- `shop_tag_v2_17.png/webp`
- `toast_bubble_v2_17.png/webp`

### 월드맵
- `stage_frame_v2_17.png/webp`
- `stage_lock_v2_17.png/webp`
- `stage_route_dot_v2_17.png/webp`
- `stage_selected_halo_v2_17.png/webp`

### 전투 HUD
- `battle_top_badge_v2_17.png/webp`
- `battle_bottom_cushion_v2_17.png/webp`
- `wave_hint_panel_v2_17.png/webp`
- `spell_card_meteor_v2_17.png/webp`
- `spell_card_guard_v2_17.png/webp`
- `spell_card_hero_v2_17.png/webp`

### 귀여운 장식/마스코트
- `mascot_fairy_v2_17.png/webp`
- `mascot_slime_v2_17.png/webp`
- `mascot_tower_v2_17.png/webp`
- `sparkle_cluster_v2_17.png/webp`
- `flower_corner_v2_17.png/webp`
- `leaf_vine_v2_17.png/webp`
- `gem_cluster_v2_17.png/webp`
- `soft_divider_v2_17.png/webp`
- `alert_badge_v2_17.png/webp`
- `badge_coin_v2_17.png/webp`
- `badge_star_v2_17.png/webp`
- `badge_heart_v2_17.png/webp`
- `badge_leaf_v2_17.png/webp`

## 코드 변경

### `src/game/CuteFantasyArtV217.ts` 추가
- v2.17 아트 레이어를 한 파일에 분리했다.
- 로그인/로비/월드맵/전투 전용 함수를 제공한다.
- 에셋이 누락돼도 fallback 그래픽으로 안전하게 동작한다.
- 장식은 클릭 가능한 객체가 아니므로 기존 모바일 히트존을 침범하지 않는다.

### `src/scenes/BootScene.ts`
- `assets/ui/v2_17` 프리로드를 추가했다.
- WebP 최적화 패턴에 `v2_17`을 추가했다.

### `src/scenes/MenuScene.ts`
- 로그인 화면에 요정/슬라임 마스코트, 꽃 코너, 하단 덩굴, 보석 장식, 반짝이 레이어를 추가했다.
- 버전 칩을 `v2.17.0 CUTE MEGA ART QA`로 갱신했다.

### `src/scenes/MainMenuScene.ts`
- 로비 중앙에 말랑 패널과 마스코트 레이어를 추가했다.
- 재화 영역 주변에 배지/젬 장식을 추가했다.
- 토스트 hide 타이머를 하나로 관리해, 새 토스트가 이전 토스트 타이머 때문에 즉시 꺼지는 문제를 줄였다.

### `src/scenes/WorldMapScene.ts`
- 스테이지 노드 뒤에 말랑 프레임을 추가했다.
- 노드 사이에 작은 경로 점 장식을 배치했다.
- 미리보기 카드 뒤쪽 패널과 월드맵 마스코트/장식을 보강했다.
- 월드맵 토스트 hide 타이머를 하나로 관리한다.

### `src/scenes/GameScene.ts`
- 전투 HUD 상단/하단에 v2.17 말랑 프레임을 추가했다.
- 스킬 버튼 아래에 메테오/가드/영웅 스킬 카드를 추가했다.
- 전투 메시지 hide 타이머를 하나로 관리해, 빠르게 연속 메시지가 뜰 때 새 메시지가 조기 종료되는 문제를 완화했다.
- 씬 종료 시 메시지 타이머도 같이 정리한다.

### `src/game/AudioManager.ts`
- `playMusicWhenReady`를 추가했다.
- 씬별 음악 재생 요청이 유저 액션 이후 다시 실행되도록 하되, 씬 shutdown/destroy 시 이벤트 콜백을 제거해 씬 전환 후 남는 오디오 콜백을 줄였다.

## QA 결과
- `npx tsc --noEmit --pretty false` 통과.
- `npm run build` 통과.
- Vite의 큰 chunk 경고는 기존 Phaser/Firebase 단일 번들 구조에서 발생하는 경고이며 이번 패치로 인한 신규 오류는 아니다.

## 적용 방법
1. 이 zip을 프로젝트 루트에 덮어쓴다.
2. GitHub Desktop에서 변경 파일을 확인한다.
3. `npm install`이 이미 되어 있다면 바로 `npm run dev` 또는 `npm run build`를 실행한다.
4. 브라우저 캐시가 남아 이전 이미지가 보이면 강력 새로고침 또는 dev 서버 재시작을 한다.

## 다음 추천 대량 패치
- v2.18.0: 타워 4종 SD 리마스터 + 업그레이드 단계별 외형 변화를 코드에 연결.
- v2.19.0: 몬스터 초상화/감정 말풍선/웨이브 카드 리마스터.
- v2.20.0: 전투 결과 화면과 보상 상자 연출을 귀여운 애니메이션 중심으로 재작업.
